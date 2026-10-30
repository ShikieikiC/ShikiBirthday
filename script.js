/* ============================================================
   万圣夜 · 不给糖就捣蛋 交互
   纯原生 JS，无依赖
   ============================================================ */
(function () {
    "use strict";

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- 进场撒糖 ---------- */
    window.setTimeout(function () {
        burst(window.innerWidth / 2, window.innerHeight * 0.4, 90);
    }, 800);

    /* ---------- 夜空：星子 + 萤火 + 飘落糖屑 ---------- */
    var canvas = document.getElementById("sky");
    var ctx = canvas.getContext("2d");
    var stars = [];
    var candies = [];
    var embers = [];
    var w = 0,
        h = 0,
        dpr = 1,
        t = 0;
    var emberTimer = 40;

    function sizeCanvas() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildStars();
        buildCandies();
    }

    function buildStars() {
        stars = [];
        var count = Math.min(Math.round((w * h) / 11000), 150);
        for (var i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h * 0.85,
                r: Math.random() * 1.3 + 0.3,
                a: Math.random() * 0.5 + 0.14,
                sp: Math.random() * 0.018 + 0.004,
                ph: Math.random() * Math.PI * 2,
                // 少数星子带一点幽绿/橙的信封色调
                c: Math.random() < 0.16 ? "255,179,71" : Math.random() < 0.1 ? "142,240,176" : "244,233,216"
            });
        }
    }

    function buildCandies() {
        candies = [];
        var count = Math.min(Math.round(w / 34), 32);
        for (var i = 0; i < count; i++) {
            candies.push(makeCandy(Math.random() * -h));
        }
    }

    var CANDY_COLORS = ["#FF8A30", "#FFB347", "#F4E9D8", "#8EF0B0", "#C2333F", "#B38CFF"];

    function makeCandy(y) {
        return {
            x: Math.random() * w,
            y: y,
            r: Math.random() * 2.2 + 1.6,
            vy: Math.random() * 0.32 + 0.13,
            sway: Math.random() * 1.2 + 0.45,
            ph: Math.random() * Math.PI * 2,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.014,
            a: Math.random() * 0.22 + 0.08,
            c: CANDY_COLORS[(Math.random() * CANDY_COLORS.length) | 0]
        };
    }

    /* 小糖粒：圆身 + 两侧糖纸尖角 */
    function drawCandy(c, x, y, r, rot, color, alpha) {
        c.save();
        c.globalAlpha = alpha;
        c.translate(x, y);
        c.rotate(rot);
        c.fillStyle = color;
        // 两侧糖纸
        c.beginPath();
        c.moveTo(-r * 1.9, 0);
        c.lineTo(-r * 1.05, -r * 0.7);
        c.lineTo(-r * 1.05, r * 0.7);
        c.closePath();
        c.fill();
        c.beginPath();
        c.moveTo(r * 1.9, 0);
        c.lineTo(r * 1.05, -r * 0.7);
        c.lineTo(r * 1.05, r * 0.7);
        c.closePath();
        c.fill();
        // 糖身
        c.beginPath();
        c.arc(0, 0, r, 0, Math.PI * 2);
        c.fill();
        c.restore();
    }

    /* 萤火：橙绿色小光点缓缓上浮 */
    function spawnEmber() {
        embers.push({
            x: Math.random() * w,
            y: h + 10,
            vx: (Math.random() - 0.5) * 0.25,
            vy: -(Math.random() * 0.42 + 0.16),
            r: Math.random() * 1.8 + 0.9,
            life: 1,
            decay: Math.random() * 0.0026 + 0.0016,
            ph: Math.random() * Math.PI * 2,
            c: Math.random() < 0.6 ? "255,179,71" : "142,240,176"
        });
    }

    function drawSky() {
        ctx.clearRect(0, 0, w, h);

        // 星子
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            var alpha = s.a * (0.55 + 0.45 * Math.sin(t * s.sp * 60 + s.ph));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + s.c + "," + alpha.toFixed(3) + ")";
            ctx.fill();
        }

        // 萤火
        for (var ei = embers.length - 1; ei >= 0; ei--) {
            var em = embers[ei];
            em.ph += 0.05;
            em.x += em.vx + Math.sin(em.ph) * 0.22;
            em.y += em.vy;
            em.life -= em.decay;
            if (em.life <= 0 || em.y < -20) {
                embers.splice(ei, 1);
                continue;
            }
            var pulse = 0.6 + 0.4 * Math.sin(em.ph * 1.6);
            ctx.globalAlpha = Math.max(em.life * pulse, 0);
            ctx.beginPath();
            ctx.arc(em.x, em.y, em.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + em.c + ",.9)";
            ctx.fill();
            // 柔光
            ctx.globalAlpha = Math.max(em.life * pulse * 0.25, 0);
            ctx.beginPath();
            ctx.arc(em.x, em.y, em.r * 4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + em.c + ",.28)";
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // 飘糖
        for (var j = 0; j < candies.length; j++) {
            var p = candies[j];
            p.y += p.vy;
            p.ph += 0.014;
            p.x += Math.sin(p.ph) * p.sway * 0.35;
            p.rot += p.vr;
            if (p.y - 20 > h) {
                candies[j] = makeCandy(-20);
            }
            drawCandy(ctx, p.x, p.y, p.r, p.rot, p.c, p.a);
        }

        // 定时生萤火
        emberTimer -= 1;
        if (emberTimer <= 0) {
            spawnEmber();
            if (Math.random() < 0.4) spawnEmber();
            emberTimer = 30 + ((Math.random() * 50) | 0);
        }

        t += 1;
        requestAnimationFrame(drawSky);
    }

    sizeCanvas();
    if (!reduced) {
        drawSky();
    } else {
        // 静态帧
        for (var si2 = 0; si2 < stars.length; si2++) {
            ctx.beginPath();
            ctx.arc(stars[si2].x, stars[si2].y, stars[si2].r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + stars[si2].c + "," + stars[si2].a + ")";
            ctx.fill();
        }
        for (var pi = 0; pi < candies.length; pi++) {
            var pp = candies[pi];
            drawCandy(ctx, pp.x, pp.y, pp.r, pp.rot, pp.c, pp.a);
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

    /* ---------- 阅读进度 · 导航高亮 · 月光升起 ---------- */
    var readBar = document.getElementById("readBar");
    var halo = document.querySelector(".moon-halo");
    var dots = Array.prototype.slice.call(document.querySelectorAll(".dot"));
    var sections = dots.map(function (d) {
        return document.getElementById(d.getAttribute("data-target"));
    });

    function onScroll() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? window.scrollY / max : 0;
        readBar.style.width = (p * 100).toFixed(2) + "%";

        if (halo && !reduced) {
            halo.style.setProperty("--moon-y", (-p * window.innerHeight * 0.26).toFixed(1) + "px");
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

    /* ---------- 暗号复制 ---------- */
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

    /* ---------- 南瓜灯：视线跟随 ---------- */
    var jack = document.getElementById("jack");
    var jackHint = document.getElementById("jackHint");
    var pupils = jack ? jack.querySelectorAll(".pk-pupil") : [];
    var PUPIL_MAX = 7;

    function aimPupils(clientX, clientY) {
        if (!jack || !pupils.length || reduced) return;
        var r = jack.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = clientX - cx;
        var dy = clientY - cy;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        // 眼珠最多偏移 PUPIL_MAX 个单位（SVG 坐标系）
        var k = Math.min(len / 260, 1) * PUPIL_MAX;
        var ox = (dx / len) * k;
        var oy = (dy / len) * k;
        var tr = "translate(" + ox.toFixed(2) + "," + oy.toFixed(2) + ")";
        for (var i = 0; i < pupils.length; i++) {
            pupils[i].style.transform = tr;
        }
    }

    if (jack && pupils.length) {
        window.addEventListener(
            "pointermove",
            function (e) {
                aimPupils(e.clientX, e.clientY);
            },
            { passive: true }
        );
    }

    /* ---------- 门：给糖 / 捣蛋 双选 ---------- */
    var treatBtn = document.getElementById("treatBtn");
    var trickBtn = document.getElementById("trickBtn");
    var choiceNote = document.getElementById("choiceNote");
    var door = document.getElementById("door");
    var flash = document.getElementById("flash");

    var trickCount = 0;
    var busy = false;

    var HINTS = {
        idle: "它正看着你",
        treat: "南瓜灯笑了，眼睛弯成了月牙",
        trick: "南瓜灯瞪圆了眼——它害怕了",
        finale: "连捣三次蛋，只好把糖全交出来了"
    };

    function setFace(scared) {
        if (!jack) return;
        jack.classList.toggle("is-scared", scared);
    }

    function setHint(text) {
        if (jackHint) jackHint.textContent = text;
    }

    function setNote(text, mood) {
        if (!choiceNote) return;
        choiceNote.textContent = text;
        choiceNote.classList.remove("is-happy", "is-spooky");
        if (mood === "happy") choiceNote.classList.add("is-happy");
        if (mood === "spooky") choiceNote.classList.add("is-spooky");
    }

    function fireFlash(spooky) {
        if (!flash || reduced) return;
        flash.classList.toggle("spooky", !!spooky);
        flash.classList.remove("fire");
        // 强制回流，让动画可以连续触发
        void flash.offsetWidth;
        flash.classList.add("fire");
    }

    function jackCenter() {
        var r = jack.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height * 0.55 };
    }

    /* 捣蛋：蝙蝠群从门里炸出来 */
    function batSwarm(count) {
        if (!door || reduced) return;
        var r = door.getBoundingClientRect();
        var originX = r.left + r.width / 2;
        var originY = r.top + r.height * 0.5;

        for (var i = 0; i < count; i++) {
            (function (idx) {
                var el = document.createElement("span");
                el.className = "swarm-bat";
                var ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
                var dist = 120 + Math.random() * Math.min(r.width * 0.44, 420);
                var dx = Math.cos(ang) * dist;
                var dy = Math.sin(ang) * dist * 0.8;
                el.style.left = originX + "px";
                el.style.top = originY + "px";
                el.style.setProperty("--dx", dx.toFixed(0) + "px");
                el.style.setProperty("--dy", dy.toFixed(0) + "px");
                el.style.setProperty("--rot", ((Math.random() - 0.5) * 70).toFixed(0) + "deg");
                el.style.setProperty("--dur", (0.9 + Math.random() * 0.7).toFixed(2) + "s");
                el.style.setProperty("--delay", (idx * 0.035).toFixed(2) + "s");
                el.style.setProperty("--scale", (0.6 + Math.random() * 0.8).toFixed(2));
                document.body.appendChild(el);
                window.setTimeout(function () {
                    if (el.parentNode) el.parentNode.removeChild(el);
                }, 2200);
            })(i);
        }
    }

    function onTreat() {
        if (busy) return;
        busy = true;
        setFace(false);
        setHint(HINTS.treat);
        setNote(
            "糖接住了。南瓜灯眯起眼笑，连蝙蝠都停在了半空。",
            "happy"
        );
        var c = jackCenter();
        burst(c.x, c.y, 72);
        fireFlash(false);
        if (pupils.length) {
            // 开心时眼珠回到正中偏下
            for (var i = 0; i < pupils.length; i++) {
                pupils[i].style.transform = "translate(0,2)";
            }
        }
        window.setTimeout(function () {
            busy = false;
        }, 620);
    }

    function onTrick() {
        if (busy) return;
        busy = true;
        trickCount += 1;
        setFace(true);
        var c = jackCenter();
        burst(c.x, c.y, 34);
        fireFlash(true);
        batSwarm(9 + Math.min(trickCount, 4) * 3);

        if (door) {
            door.classList.remove("shake");
            void door.offsetWidth;
            door.classList.add("shake");
            window.setTimeout(function () {
                door.classList.remove("shake");
            }, 560);
        }

        if (trickCount >= 3) {
            setHint(HINTS.finale);
            setNote(
                "捣蛋成功。南瓜灯举手投降——糖全给你，蝙蝠归你管，今晚归你。",
                "spooky"
            );
            window.setTimeout(function () {
                burst(c.x, c.y, 90);
                fireFlash(false);
            }, 240);
        } else {
            setHint(HINTS.trick);
            setNote(
                "蝙蝠从门里扑了出来，绕着你转了两圈，又飞走了。",
                "spooky"
            );
        }

        window.setTimeout(function () {
            busy = false;
        }, 700);
    }

    if (treatBtn) treatBtn.addEventListener("click", onTreat);
    if (trickBtn) trickBtn.addEventListener("click", onTrick);

    // 鼠标离开窗口后眼珠回正
    window.addEventListener("pointerleave", function () {
        for (var i = 0; i < pupils.length; i++) {
            pupils[i].style.transform = "translate(0,0)";
        }
    });

    /* ---------- 糖雨画布 ---------- */
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

    function burst(x, y, n) {
        if (reduced) return;
        var d = Math.min(window.devicePixelRatio || 1, 2);
        for (var i = 0; i < n; i++) {
            var ang = Math.random() * Math.PI * 2;
            var spd = Math.random() * 5.6 + 1.5;
            parts.push({
                x: x * d,
                y: y * d,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 2.6,
                g: 0.17,
                r: (Math.random() * 2.6 + 1.6) * d,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * 0.2,
                c: CANDY_COLORS[(Math.random() * CANDY_COLORS.length) | 0],
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
            p.life -= 0.0074;

            if (p.life <= 0 || p.y > cc.height + 60) {
                parts.splice(i, 1);
                continue;
            }

            drawCandy(cx, p.x, p.y, Math.max(p.r, 0.6), p.rot, p.c, Math.max(p.life, 0));
        }

        if (parts.length) {
            requestAnimationFrame(tickPetals);
        } else {
            animating = false;
            cx.clearRect(0, 0, cc.width, cc.height);
        }
    }

    /* ---------- 页面隐藏时停掉动画 ---------- */
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            parts.length = 0;
            cx.clearRect(0, 0, cc.width, cc.height);
            animating = false;
        }
    });
})();
