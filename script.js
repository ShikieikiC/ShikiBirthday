/* ============================================================
   四季大人 · 生日网站 交互
   纯原生 JS，无依赖
   ============================================================ */
(function () {
    "use strict";

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- 进场撒花 ---------- */
    window.setTimeout(function () {
        burst(window.innerWidth / 2, window.innerHeight * 0.42, 110);
    }, 700);

    /* ---------- 星空背景 ---------- */
    var canvas = document.getElementById("stars");
    var ctx = canvas.getContext("2d");
    var stars = [];
    var w = 0,
        h = 0,
        dpr = 1;

    function sizeCanvas() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildStars();
    }

    function buildStars() {
        stars = [];
        var count = Math.min(Math.round((w * h) / 9000), 190);
        for (var i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.5 + 0.35,
                a: Math.random() * 0.65 + 0.18,
                sp: Math.random() * 0.018 + 0.004,
                ph: Math.random() * Math.PI * 2
            });
        }
    }

    var t = 0;
    function drawStars() {
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            var alpha = s.a * (0.55 + 0.45 * Math.sin(t * s.sp * 60 + s.ph));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(245,241,232," + alpha.toFixed(3) + ")";
            ctx.fill();
        }
        t += 1;
        requestAnimationFrame(drawStars);
    }

    sizeCanvas();
    if (!reduced) {
        drawStars();
    } else {
        ctx.clearRect(0, 0, w, h);
        for (var si = 0; si < stars.length; si++) {
            ctx.beginPath();
            ctx.arc(stars[si].x, stars[si].y, stars[si].r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(245,241,232," + stars[si].a + ")";
            ctx.fill();
        }
    }
    window.addEventListener("resize", sizeCanvas);

    /* ---------- 滚动显现 ---------- */
    var revealEls = document.querySelectorAll(".reveal");
    revealEls.forEach(function (el) {
        var d = parseInt(el.getAttribute("data-delay") || "0", 10);
        el.style.transitionDelay = d * 0.09 + "s";
    });

    if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) {
                        en.target.classList.add("shown");
                        io.unobserve(en.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
        );
        revealEls.forEach(function (el) {
            io.observe(el);
        });
    } else {
        revealEls.forEach(function (el) {
            el.classList.add("shown");
        });
    }

    /* ---------- 阅读进度 + 导航高亮 ---------- */
    var readBar = document.getElementById("readBar");
    var dots = Array.prototype.slice.call(document.querySelectorAll(".dot"));
    var sections = dots.map(function (d) {
        return document.getElementById(d.getAttribute("data-target"));
    });

    function onScroll() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? (window.scrollY / max) * 100 : 0;
        readBar.style.width = p.toFixed(2) + "%";

        var mid = window.scrollY + window.innerHeight * 0.42;
        var idx = 0;
        for (var i = 0; i < sections.length; i++) {
            if (sections[i] && sections[i].offsetTop <= mid) idx = i;
        }
        dots.forEach(function (d, i) {
            d.classList.toggle("is-active", i === idx);
        });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    dots.forEach(function (d) {
        d.addEventListener("click", function () {
            var target = document.getElementById(d.getAttribute("data-target"));
            if (target) target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        });
    });

    /* ---------- 验证码复制 ---------- */
    var copyBtn = document.getElementById("copyCode");
    var codeValue = document.getElementById("codeValue");

    copyBtn.addEventListener("click", function () {
        var text = codeValue.textContent.trim();
        var done = function () {
            copyBtn.textContent = "已复制";
            copyBtn.classList.add("done");
            setTimeout(function () {
                copyBtn.textContent = "复制";
                copyBtn.classList.remove("done");
            }, 1600);
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(done, fallback);
        } else {
            fallback();
        }

        function fallback() {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand("copy");
                done();
            } catch (err) {
                copyBtn.textContent = text;
            }
            document.body.removeChild(ta);
        }
    });

    /* ---------- 吹蜡烛 ---------- */
    var cake = document.querySelector(".cake");
    var flame = document.getElementById("flame");
    var flameCore = document.getElementById("flameCore");
    var blowBtn = document.getElementById("blowBtn");
    var blowCount = document.getElementById("blowCount");
    var count = 0;
    var lit = true;

    blowBtn.addEventListener("click", function () {
        var rect = cake.getBoundingClientRect();

        if (lit) {
            lit = false;
            cake.classList.add("blown");
            blowBtn.textContent = "点 蜡 烛";
            count++;
            blowCount.textContent = count;
            burst(rect.left + rect.width / 2, rect.top + rect.height * 0.16, 140);
        } else {
            lit = true;
            cake.classList.remove("blown");
            blowBtn.textContent = "把 蜡 烛 吹 了";
            // 重绘一次火光动画
            [flame, flameCore].forEach(function (f) {
                f.style.animation = "none";
                void f.getBoundingClientRect();
                f.style.animation = "";
            });
        }
    });

    /* ---------- 愿望清单 ---------- */
    var STORE = "season_birthday_wishes";
    var wishInput = document.getElementById("wishInput");
    var wishSend = document.getElementById("wishSend");
    var wishList = document.getElementById("wishList");

    function loadWishes() {
        try {
            return JSON.parse(localStorage.getItem(STORE) || "[]");
        } catch (e) {
            return [];
        }
    }

    function saveWishes(list) {
        try {
            localStorage.setItem(STORE, JSON.stringify(list.slice(-30)));
        } catch (e) {
            /* 隐私模式下忽略 */
        }
    }

    function renderWishes() {
        var list = loadWishes();
        wishList.innerHTML = "";
        list.slice()
            .reverse()
            .forEach(function (text) {
                var li = document.createElement("li");
                li.textContent = text;
                wishList.appendChild(li);
            });
    }

    function addWish() {
        var text = wishInput.value.trim();
        if (!text) {
            wishInput.focus();
            wishInput.classList.add("shake");
            setTimeout(function () {
                wishInput.classList.remove("shake");
            }, 420);
            return;
        }
        var list = loadWishes();
        list.push(text);
        saveWishes(list);
        wishInput.value = "";
        renderWishes();

        var rect = wishSend.getBoundingClientRect();
        burst(rect.left + rect.width / 2, rect.top, 40);
    }

    wishSend.addEventListener("click", addWish);
    wishInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") addWish();
    });

    wishInput.classList.add("shake-ready");
    renderWishes();

    /* ---------- 撒花粒子 ---------- */
    var cc = document.getElementById("confetti");
    var cx = cc.getContext("2d");
    var parts = [];
    var animating = false;

    function sizeConfetti() {
        cc.width = Math.floor(window.innerWidth * Math.min(window.devicePixelRatio || 1, 2));
        cc.height = Math.floor(window.innerHeight * Math.min(window.devicePixelRatio || 1, 2));
        cc.style.width = window.innerWidth + "px";
        cc.style.height = window.innerHeight + "px";
    }
    sizeConfetti();
    window.addEventListener("resize", sizeConfetti);

    var COLORS = ["#C9A227", "#E8CC6A", "#F5F1E8", "#8C6A3F", "#FFF3C4"];

    function burst(x, y, n) {
        if (reduced) return;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        for (var i = 0; i < n; i++) {
            var ang = Math.random() * Math.PI * 2;
            var spd = Math.random() * 5.5 + 1.5;
            parts.push({
                x: x * dpr,
                y: y * dpr,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 2.4,
                g: 0.16,
                w: (Math.random() * 6 + 3) * dpr,
                h: (Math.random() * 4 + 2) * dpr,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * 0.24,
                c: COLORS[(Math.random() * COLORS.length) | 0],
                life: 1
            });
        }
        if (!animating) {
            animating = true;
            tickConfetti();
        }
    }

    function tickConfetti() {
        cx.clearRect(0, 0, cc.width, cc.height);

        for (var i = parts.length - 1; i >= 0; i--) {
            var p = parts[i];
            p.vy += p.g;
            p.vx *= 0.992;
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vr;
            p.life -= 0.0072;

            if (p.life <= 0 || p.y > cc.height + 60) {
                parts.splice(i, 1);
                continue;
            }

            cx.save();
            cx.globalAlpha = Math.max(p.life, 0);
            cx.translate(p.x, p.y);
            cx.rotate(p.rot);
            cx.fillStyle = p.c;
            cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            cx.restore();
        }

        if (parts.length) {
            requestAnimationFrame(tickConfetti);
        } else {
            animating = false;
            cx.clearRect(0, 0, cc.width, cc.height);
        }
    }

    /* ---------- 输入框抖动 ---------- */
    var style = document.createElement("style");
    style.textContent =
        "@keyframes shakeX{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}" +
        "40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}" +
        ".wish-input.shake{border-color:rgba(255,120,120,.75)!important;animation:shakeX .42s ease}";
    document.head.appendChild(style);

    /* ---------- 页面隐藏时停掉撒花 ---------- */
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            parts.length = 0;
            cx.clearRect(0, 0, cc.width, cc.height);
            animating = false;
        }
    });
})();
