/* ============================================================
   国庆 · 盛世华诞 交互
   纯原生 JS，无依赖
   ============================================================ */
(function () {
    "use strict";

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- 进场撒金 ---------- */
    window.setTimeout(function () {
        burst(window.innerWidth / 2, window.innerHeight * 0.4, 100);
    }, 800);

    /* ---------- 夜空：星子 + 烟花 + 落金 ---------- */
    var canvas = document.getElementById("sky");
    var ctx = canvas.getContext("2d");
    var stars = [];
    var confetti = [];
    var rockets = [];
    var sparks = [];
    var w = 0,
        h = 0,
        dpr = 1,
        t = 0;
    var fireTimer = 70;

    function sizeCanvas() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildStars();
        buildConfetti();
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

    function buildConfetti() {
        confetti = [];
        var count = Math.min(Math.round(w / 30), 38);
        for (var i = 0; i < count; i++) {
            confetti.push(makeConfetti(Math.random() * -h));
        }
    }

    function makeConfetti(y) {
        var r = Math.random();
        return {
            x: Math.random() * w,
            y: y,
            r: Math.random() * 2.4 + 1.5,
            vy: Math.random() * 0.34 + 0.15,
            sway: Math.random() * 1.3 + 0.5,
            ph: Math.random() * Math.PI * 2,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.02,
            a: Math.random() * 0.24 + 0.1,
            c: r < 0.42 ? "#F6EFDF" : r < 0.74 ? "#E9B949" : "#E23B4E"
        };
    }

    /* 一颗小金星 */
    function drawStarShape(c, x, y, r, rot, color, alpha) {
        c.save();
        c.globalAlpha = alpha;
        c.translate(x, y);
        c.rotate(rot);
        c.fillStyle = color;
        c.beginPath();
        for (var k = 0; k < 5; k++) {
            var ao = -Math.PI / 2 + k * ((Math.PI * 2) / 5);
            var ai = ao + Math.PI / 5;
            var ox = Math.cos(ao) * r;
            var oy = Math.sin(ao) * r;
            var ix = Math.cos(ai) * r * 0.42;
            var iy = Math.sin(ai) * r * 0.42;
            if (k === 0) c.moveTo(ox, oy);
            else c.lineTo(ox, oy);
            c.lineTo(ix, iy);
        }
        c.closePath();
        c.fill();
        c.restore();
    }

    var FIRE_COLORS = ["#E9B949", "#F7DE9B", "#E23B4E", "#FFB4A2", "#F6EFDF"];

    function launchFirework() {
        var targetY = h * (0.1 + Math.random() * 0.32);
        var g = 0.12;
        var dist = h + 8 - targetY;
        rockets.push({
            x: w * (0.12 + Math.random() * 0.76),
            y: h + 8,
            vx: (Math.random() - 0.5) * 0.7,
            vy: -Math.sqrt(2 * g * dist),
            g: g,
            targetY: targetY,
            c: FIRE_COLORS[(Math.random() * FIRE_COLORS.length) | 0]
        });
    }

    function explode(x, y, color) {
        var n = 46 + ((Math.random() * 26) | 0);
        for (var i = 0; i < n; i++) {
            var ang = ((Math.PI * 2) / n) * i + Math.random() * 0.14;
            var spd = Math.random() * 3.4 + 1.6;
            sparks.push({
                x: x,
                y: y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                g: 0.028,
                r: Math.random() * 1.5 + 0.9,
                life: 1,
                decay: Math.random() * 0.012 + 0.008,
                c: Math.random() < 0.74 ? color : FIRE_COLORS[(Math.random() * FIRE_COLORS.length) | 0]
            });
        }
    }

    function drawSky() {
        ctx.clearRect(0, 0, w, h);

        // 星子
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            var alpha = s.a * (0.55 + 0.45 * Math.sin(t * s.sp * 60 + s.ph));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(246,239,223," + alpha.toFixed(3) + ")";
            ctx.fill();
        }

        // 烟花升空
        for (var ri = rockets.length - 1; ri >= 0; ri--) {
            var rk = rockets[ri];
            rk.vy += rk.g;
            rk.x += rk.vx;
            rk.y += rk.vy;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(rk.x, rk.y, 1.7, 0, Math.PI * 2);
            ctx.fillStyle = rk.c;
            ctx.fill();
            ctx.globalAlpha = 1;
            if (rk.vy >= 0 || rk.y <= rk.targetY) {
                explode(rk.x, rk.y, rk.c);
                rockets.splice(ri, 1);
            }
        }

        // 烟花绽放
        for (var si = sparks.length - 1; si >= 0; si--) {
            var sp = sparks[si];
            sp.vy += sp.g;
            sp.vx *= 0.985;
            sp.vy *= 0.985;
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.life -= sp.decay;
            if (sp.life <= 0) {
                sparks.splice(si, 1);
                continue;
            }
            ctx.globalAlpha = Math.max(sp.life, 0);
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
            ctx.fillStyle = sp.c;
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // 落金
        for (var j = 0; j < confetti.length; j++) {
            var p = confetti[j];
            p.y += p.vy;
            p.ph += 0.014;
            p.x += Math.sin(p.ph) * p.sway * 0.35;
            p.rot += p.vr;
            if (p.y - 20 > h) {
                confetti[j] = makeConfetti(-20);
            }
            drawStarShape(ctx, p.x, p.y, p.r, p.rot, p.c, p.a);
        }

        // 定时发射
        fireTimer -= 1;
        if (fireTimer <= 0) {
            launchFirework();
            if (Math.random() < 0.34) launchFirework();
            fireTimer = 96 + ((Math.random() * 120) | 0);
        }

        t += 1;
        requestAnimationFrame(drawSky);
    }

    sizeCanvas();
    if (!reduced) {
        drawSky();
    } else {
        // 静态帧：画出星子与落金，不留空
        for (var si2 = 0; si2 < stars.length; si2++) {
            ctx.beginPath();
            ctx.arc(stars[si2].x, stars[si2].y, stars[si2].r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(246,239,223," + stars[si2].a + ")";
            ctx.fill();
        }
        for (var pi = 0; pi < confetti.length; pi++) {
            var pp = confetti[pi];
            drawStarShape(ctx, pp.x, pp.y, pp.r, pp.rot, pp.c, pp.a);
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

    /* ---------- 阅读进度 · 导航高亮 · 华光升起 ---------- */
    var readBar = document.getElementById("readBar");
    var halo = document.querySelector(".star-halo");
    var dots = Array.prototype.slice.call(document.querySelectorAll(".dot"));
    var sections = dots.map(function (d) {
        return document.getElementById(d.getAttribute("data-target"));
    });

    function onScroll() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? window.scrollY / max : 0;
        readBar.style.width = (p * 100).toFixed(2) + "%";

        // 华光随阅读缓缓升起、渐近（减弱动效时保持静止）
        if (halo && !reduced) {
            halo.style.setProperty("--moon-y", (-p * window.innerHeight * 0.3).toFixed(1) + "px");
            halo.style.setProperty("--moon-scale", (1 + p * 0.14).toFixed(3));
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

    /* ---------- 金屑迸发 ---------- */
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

    var COLORS = ["#E9B949", "#F7DE9B", "#F6EFDF", "#E23B4E", "#C8102E"];

    function burst(x, y, n) {
        if (reduced) return;
        var d = Math.min(window.devicePixelRatio || 1, 2);
        for (var i = 0; i < n; i++) {
            var ang = Math.random() * Math.PI * 2;
            var spd = Math.random() * 5.8 + 1.6;
            parts.push({
                x: x * d,
                y: y * d,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 2.6,
                g: 0.17,
                r: (Math.random() * 3.4 + 1.8) * d,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * 0.22,
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

            drawStarShape(cx, p.x, p.y, Math.max(p.r, 0.5), p.rot, p.c, Math.max(p.life, 0));
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
