/* ============================================================
   中秋 · 花好月圆 交互
   纯原生 JS，无依赖
   ============================================================ */
(function () {
    "use strict";

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- 进场撒桂 ---------- */
    window.setTimeout(function () {
        burst(window.innerWidth / 2, window.innerHeight * 0.4, 90);
    }, 800);

    /* ---------- 夜空：星子 + 常驻落桂 ---------- */
    var canvas = document.getElementById("sky");
    var ctx = canvas.getContext("2d");
    var stars = [];
    var petals = [];
    var w = 0,
        h = 0,
        dpr = 1,
        t = 0;

    function sizeCanvas() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildStars();
        buildPetals();
    }

    function buildStars() {
        stars = [];
        var count = Math.min(Math.round((w * h) / 10000), 170);
        for (var i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h * 0.85,
                r: Math.random() * 1.45 + 0.3,
                a: Math.random() * 0.6 + 0.16,
                sp: Math.random() * 0.018 + 0.004,
                ph: Math.random() * Math.PI * 2
            });
        }
    }

    function buildPetals() {
        petals = [];
        var count = Math.min(Math.round(w / 26), 42);
        for (var i = 0; i < count; i++) {
            petals.push(makePetal(Math.random() * -h));
        }
    }

    function makePetal(y) {
        return {
            x: Math.random() * w,
            y: y,
            r: Math.random() * 2.6 + 1.9,
            vy: Math.random() * 0.34 + 0.16,
            sway: Math.random() * 1.3 + 0.5,
            ph: Math.random() * Math.PI * 2,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.012,
            a: Math.random() * 0.22 + 0.1,
            c: Math.random() < 0.32 ? "#F6F1E2" : "#E3B84B"
        };
    }

    /* 一朵五瓣桂花 */
    function drawPetal(c, x, y, r, rot, color, alpha) {
        c.save();
        c.globalAlpha = alpha;
        c.translate(x, y);
        c.rotate(rot);
        c.fillStyle = color;
        for (var k = 0; k < 5; k++) {
            c.beginPath();
            c.ellipse(0, -r * 0.62, r * 0.42, r * 0.68, 0, 0, Math.PI * 2);
            c.fill();
            c.rotate((Math.PI * 2) / 5);
        }
        c.beginPath();
        c.arc(0, 0, r * 0.2, 0, Math.PI * 2);
        c.fill();
        c.restore();
    }

    function drawSky() {
        ctx.clearRect(0, 0, w, h);

        // 星子
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            var alpha = s.a * (0.55 + 0.45 * Math.sin(t * s.sp * 60 + s.ph));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(246,241,226," + alpha.toFixed(3) + ")";
            ctx.fill();
        }

        // 落桂
        for (var j = 0; j < petals.length; j++) {
            var p = petals[j];
            p.y += p.vy;
            p.ph += 0.014;
            p.x += Math.sin(p.ph) * p.sway * 0.35;
            p.rot += p.vr;
            if (p.y - 20 > h) {
                petals[j] = makePetal(-20);
            }
            drawPetal(ctx, p.x, p.y, p.r, p.rot, p.c, p.a);
        }

        t += 1;
        requestAnimationFrame(drawSky);
    }

    sizeCanvas();
    if (!reduced) {
        drawSky();
    } else {
        // 静态帧：画出星子与落桂，不留空
        for (var si = 0; si < stars.length; si++) {
            ctx.beginPath();
            ctx.arc(stars[si].x, stars[si].y, stars[si].r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(246,241,226," + stars[si].a + ")";
            ctx.fill();
        }
        for (var pi = 0; pi < petals.length; pi++) {
            var pp = petals[pi];
            drawPetal(ctx, pp.x, pp.y, pp.r, pp.rot, pp.c, pp.a);
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

    /* ---------- 阅读进度 · 导航高亮 · 月亮升起 ---------- */
    var readBar = document.getElementById("readBar");
    var moon = document.querySelector(".moon-halo");
    var dots = Array.prototype.slice.call(document.querySelectorAll(".dot"));
    var sections = dots.map(function (d) {
        return document.getElementById(d.getAttribute("data-target"));
    });

    function onScroll() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? window.scrollY / max : 0;
        readBar.style.width = (p * 100).toFixed(2) + "%";

        // 月随阅读缓缓升起、渐近（减弱动效时保持静止）
        if (moon && !reduced) {
            moon.style.setProperty("--moon-y", (-p * window.innerHeight * 0.3).toFixed(1) + "px");
            moon.style.setProperty("--moon-scale", (1 + p * 0.14).toFixed(3));
        }

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

    /* ---------- 口令复制 ---------- */
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

    /* ---------- 桂花迸发 ---------- */
    var cc = document.getElementById("petals");
    var cx = cc.getContext("2d");
    var parts = [];
    var animating = false;

    function sizePetals() {
        cc.width = Math.floor(window.innerWidth * Math.min(window.devicePixelRatio || 1, 2));
        cc.height = Math.floor(window.innerHeight * Math.min(window.devicePixelRatio || 1, 2));
        cc.style.width = window.innerWidth + "px";
        cc.style.height = window.innerHeight + "px";
    }
    sizePetals();
    window.addEventListener("resize", sizePetals);

    var COLORS = ["#E3B84B", "#F4D97E", "#F6F1E2", "#E8755C", "#C1503F"];

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
                r: (Math.random() * 3.2 + 1.6) * dpr,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * 0.24,
                c: COLORS[(Math.random() * COLORS.length) | 0],
                life: 1
            });
        }
        if (!animating) {
            animating = true;
            tickPetals();
        }
    }

    function tickPetals() {
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
            cx.beginPath();
            cx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2);
            cx.fill();
            cx.restore();
        }

        if (parts.length) {
            requestAnimationFrame(tickPetals);
        } else {
            animating = false;
            cx.clearRect(0, 0, cc.width, cc.height);
        }
    }

    /* ---------- 页面隐藏时停掉迸发 ---------- */
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            parts.length = 0;
            cx.clearRect(0, 0, cc.width, cc.height);
            animating = false;
        }
    });
})();
