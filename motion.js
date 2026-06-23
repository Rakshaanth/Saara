/* ====================================================
   SAARA — Motion library
   ==================================================== */

(function() {
  'use strict';

  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isMobile || prefersReducedMotion) {
    document.body.style.cursor = 'auto';
  }

  /* --------------------------------------------------
     Custom cursor
     -------------------------------------------------- */
  function initCursor() {
    if (isMobile || prefersReducedMotion) return;

    const dot = document.createElement('div');
    dot.className = 'cur-dot';
    const ring = document.createElement('div');
    ring.className = 'cur-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = 0, my = 0;
    let dx = 0, dy = 0;
    let rx = 0, ry = 0;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    function loop() {
      dx += (mx - dx) * 0.5;
      dy += (my - dy) * 0.5;
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    // Hover state on interactive elements
    document.querySelectorAll('a, button, input, .frow, .idx-cell, .ing-card, .journal-row, .origin-row').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Dark sections invert the cursor ring
    const darkObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (e.target.hasAttribute('data-dark')) {
            document.body.classList.add('cursor-dark');
          } else {
            document.body.classList.remove('cursor-dark');
          }
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-section]').forEach(s => darkObserver.observe(s));
  }

  /* --------------------------------------------------
     Nav scroll state
     -------------------------------------------------- */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let scrolled = false;
    window.addEventListener('scroll', () => {
      const isScrolled = window.scrollY > 40;
      if (isScrolled !== scrolled) {
        nav.classList.toggle('scrolled', isScrolled);
        scrolled = isScrolled;
      }
    });
  }

  /* --------------------------------------------------
     3D parallax text (hero, footer)
     Words shift in space based on cursor position
     -------------------------------------------------- */
  function initParallax() {
    if (isMobile || prefersReducedMotion) return;

    document.querySelectorAll('[data-parallax]').forEach(scope => {
      const words = scope.querySelectorAll('.word, .hero-marker');
      if (!words.length) return;

      scope.addEventListener('mousemove', (e) => {
        const r = scope.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        words.forEach(w => {
          const d = parseFloat(w.dataset.depth || 50);
          const tx = -px * d * 0.6;
          const ty = -py * d * 0.4;
          w.style.transform = `translate3d(${tx}px, ${ty}px, ${d}px)`;
        });
      });

      scope.addEventListener('mouseleave', () => {
        words.forEach(w => {
          w.style.transform = 'translate3d(0, 0, 0)';
        });
      });
    });
  }

  /* --------------------------------------------------
     Magnetic elements — pull toward cursor
     -------------------------------------------------- */
  function initMagnetic() {
    if (isMobile || prefersReducedMotion) return;

    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* --------------------------------------------------
     3D tilt cards
     -------------------------------------------------- */
  function initTiltCards() {
    if (isMobile || prefersReducedMotion) return;

    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateZ(20px)`;
        card.style.transition = 'transform 0.2s ease-out';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateY(0) rotateX(0) translateZ(0)';
        card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      });
    });
  }

  /* --------------------------------------------------
     Ghost text parallax (background type)
     -------------------------------------------------- */
  function initGhostText() {
    if (isMobile || prefersReducedMotion) return;

    document.querySelectorAll('[data-ghost-scope]').forEach(scope => {
      const ghost = scope.querySelector('[data-ghost]');
      if (!ghost) return;

      scope.addEventListener('mousemove', (e) => {
        const r = scope.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ghost.style.transform = `translate3d(${-px * 60}px, ${-py * 30}px, 0) scale(1.02)`;
      });

      scope.addEventListener('mouseleave', () => {
        ghost.style.transform = 'translate3d(0, 0, 0) scale(1)';
      });
    });
  }

  /* --------------------------------------------------
     Scroll reveals — generic .reveal and .reveal-word
     -------------------------------------------------- */
  function initReveals() {
    // Standard reveals
    const els = document.querySelectorAll('.reveal');
    const elObserver = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const delay = parseInt(e.target.dataset.delay || 0);
          setTimeout(() => e.target.classList.add('on'), delay);
          elObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(el => elObserver.observe(el));

    // Word-by-word reveal containers (data-word-reveal)
    document.querySelectorAll('[data-word-reveal]').forEach(container => {
      const words = container.querySelectorAll('.reveal-word');
      const wordObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            words.forEach((w, i) => {
              setTimeout(() => w.classList.add('on'), i * 40);
            });
            wordObs.disconnect();
          }
        });
      }, { threshold: 0.3 });
      wordObs.observe(container);
    });

    // Formula rows
    const rows = document.querySelectorAll('.frow');
    const rowObs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const idx = Array.from(rows).indexOf(e.target);
          setTimeout(() => e.target.classList.add('on'), (idx % 6) * 70);
          rowObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    rows.forEach(r => rowObs.observe(r));
  }

  /* --------------------------------------------------
     Counting numbers
     -------------------------------------------------- */
  function initCounters() {
    const countEls = document.querySelectorAll('.count-num');
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const to = parseFloat(el.dataset.to);
          const dec = parseInt(el.dataset.decimals) || 0;
          const pad = parseInt(el.dataset.pad) || 0;
          const dur = 1400;
          const start = performance.now();

          function anim(t) {
            const p = Math.min((t - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = to * eased;
            let txt = dec > 0 ? v.toFixed(dec) : Math.floor(v).toString();
            if (pad > 0) txt = txt.padStart(pad, '0');
            el.textContent = txt;
            if (p < 1) requestAnimationFrame(anim);
          }
          requestAnimationFrame(anim);
          countObs.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    countEls.forEach(el => countObs.observe(el));
  }

  /* --------------------------------------------------
     Live IST clock & ticking waitlist
     -------------------------------------------------- */
  function initLiveData() {
    const time = document.getElementById('live-time');
    if (time) {
      const update = () => {
        const now = new Date();
        time.textContent = 'IST ' + now.toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' · Kerala';
      };
      update();
      setInterval(update, 1000);
    }

    const wait = document.getElementById('waitNum');
    if (wait) {
      setInterval(() => {
        if (Math.random() > 0.6) {
          const cur = parseInt(wait.textContent.replace(/,/g, ''));
          wait.textContent = (cur + 1).toLocaleString();
        }
      }, 3500);
    }
  }

  /* --------------------------------------------------
     3D Ingredient Orbit (homepage hero)
     -------------------------------------------------- */
  function initOrbit() {
    const cv = document.getElementById('orbitCanvas');
    if (!cv) return;
    const wrap = cv.parentElement;
    const r = wrap.getBoundingClientRect();
    cv.width = (r.width || 280) * 2;
    cv.height = (r.height || 280) * 2;
    cv.style.width = (r.width || 280) + 'px';
    cv.style.height = (r.height || 280) + 'px';
    const ctx = cv.getContext('2d');
    ctx.scale(2, 2);
    const W = cv.width / 2, H = cv.height / 2;

    const labels = ['BAKUCHIOL', 'KOKUM', 'TURMERIC', 'NIACINAMIDE', 'ARBUTIN', 'CENTELLA', 'HA', 'TRANEX'];
    const dists = ['RAJASTHAN', 'KERALA', 'TAMIL NADU', 'MUMBAI', 'HYDERABAD', 'ASSAM', 'PUNE', 'HYDERABAD'];
    const nodes = [];
    const N = labels.length;
    for (let i = 0; i < N; i++) {
      const phi = Math.acos(-1 + (2 * i) / N);
      const theta = Math.sqrt(N * Math.PI) * phi;
      nodes.push({
        label: labels[i],
        dist: dists[i],
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi)
      });
    }

    let rotX = 0, rotY = 0, tarX = 0, tarY = 0;
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mousemove', (e) => {
        const b = hero.getBoundingClientRect();
        tarY = ((e.clientX - b.left) / b.width - 0.5) * 1.2;
        tarX = ((e.clientY - b.top) / b.height - 0.5) * 0.8;
      });
    }

    let auto = 0;
    function frame() {
      auto += 0.005;
      rotX += (tarX - rotX) * 0.06;
      rotY += (tarY - rotY + auto * 0.3) * 0.06;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2, rad = 92;
      const proj = nodes.map(n => {
        let x = n.x, y = n.y, z = n.z;
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        return { x: cx + x1 * rad, y: cy + y2 * rad, z: z2, label: n.label, dist: n.dist };
      }).sort((a, b) => a.z - b.z);

      ctx.strokeStyle = 'rgba(10, 10, 10, 0.06)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < proj.length; i++) {
        for (let j = i + 1; j < proj.length; j++) {
          const dx = proj[i].x - proj[j].x;
          const dy = proj[i].y - proj[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(proj[i].x, proj[i].y);
            ctx.lineTo(proj[j].x, proj[j].y);
            ctx.stroke();
          }
        }
      }

      proj.forEach(p => {
        const depth = (p.z + 1) / 2;
        const sz = 2 + depth * 2.5;
        const op = 0.35 + depth * 0.65;
        ctx.globalAlpha = op;
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.fill();
        if (depth > 0.55) {
          ctx.globalAlpha = op * 0.9;
          ctx.fillStyle = '#0A0A0A';
          ctx.font = "500 8px 'JetBrains Mono', monospace";
          ctx.textAlign = 'left';
          ctx.fillText(p.label, p.x + sz + 5, p.y + 3);
          ctx.globalAlpha = op * 0.5;
          ctx.font = "400 7px 'JetBrains Mono', monospace";
          ctx.fillText(p.dist, p.x + sz + 5, p.y + 12);
        }
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    frame();
  }

  /* --------------------------------------------------
     Product page 3D visual — ingredient molecule scene
     -------------------------------------------------- */
  function initProdScene() {
    const cv = document.getElementById('prodSceneCanvas');
    if (!cv) return;
    const wrap = cv.parentElement;
    const r = wrap.getBoundingClientRect();
    cv.width = (r.width || 600) * 2;
    cv.height = (r.height || 600) * 2;
    cv.style.width = (r.width || 600) + 'px';
    cv.style.height = (r.height || 600) + 'px';
    const ctx = cv.getContext('2d');
    ctx.scale(2, 2);
    const W = cv.width / 2, H = cv.height / 2;

    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        a: Math.random() * Math.PI * 2,
        r: 80 + Math.random() * 140,
        rs: 0.001 + Math.random() * 0.004,
        sz: 0.5 + Math.random() * 2,
        op: 0.1 + Math.random() * 0.6
      });
    }

    let mx = W / 2, my = H / 2;
    wrap.addEventListener('mousemove', (e) => {
      const b = wrap.getBoundingClientRect();
      mx = e.clientX - b.left;
      my = e.clientY - b.top;
    });

    let t = 0;
    function frame() {
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2 + (mx - W / 2) * 0.04;
      const cy = H / 2 + (my - H / 2) * 0.04;

      // Central pulsing ring
      const pulse = Math.sin(t * 1.5) * 0.5 + 0.5;
      ctx.strokeStyle = `rgba(255, 69, 0, ${0.15 + pulse * 0.1})`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, 60 + i * 35 + Math.sin(t + i) * 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Central core
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
      grad.addColorStop(0, 'rgba(255, 69, 0, 0.35)');
      grad.addColorStop(1, 'rgba(255, 69, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FF4500';
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting particles
      particles.forEach(p => {
        p.a += p.rs;
        const x = cx + Math.cos(p.a) * p.r;
        const y = cy + Math.sin(p.a) * p.r * 0.85;
        const alpha = p.op * (0.5 + Math.sin(t + p.a) * 0.5);
        ctx.fillStyle = `rgba(242, 239, 232, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.sz, 0, Math.PI * 2);
        ctx.fill();
      });

      // Text label
      ctx.fillStyle = 'rgba(255, 69, 0, 0.5)';
      ctx.font = "500 9px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText('THE 10% CONCENTRATE', cx, cy + 100);
      ctx.fillStyle = 'rgba(242, 239, 232, 0.3)';
      ctx.font = "400 8px 'JetBrains Mono', monospace";
      ctx.fillText('15 ACTIVES · pH 5.0', cx, cy + 116);

      t += 0.015;
      requestAnimationFrame(frame);
    }
    frame();
  }

  /* --------------------------------------------------
     Cart item thumb canvases (tiny abstract scenes)
     -------------------------------------------------- */
  function initCartThumbs() {
    document.querySelectorAll('.cart-item-thumb canvas').forEach((cv, i) => {
      const w = cv.parentElement.clientWidth;
      const h = cv.parentElement.clientHeight;
      cv.width = w * 2;
      cv.height = h * 2;
      cv.style.width = w + 'px';
      cv.style.height = h + 'px';
      const ctx = cv.getContext('2d');
      ctx.scale(2, 2);

      const hues = [0, 25, 50];
      let t = i * 0.5;
      function frame() {
        ctx.fillStyle = '#0A0A0A';
        ctx.fillRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2;
        for (let j = 0; j < 5; j++) {
          ctx.strokeStyle = `rgba(255, 69, 0, ${0.15 + j * 0.05})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, 8 + j * 10 + Math.sin(t + j) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
        t += 0.02;
        requestAnimationFrame(frame);
      }
      frame();
    });
  }

  /* --------------------------------------------------
     Init everything
     -------------------------------------------------- */
  function init() {
    initCursor();
    initNav();
    initParallax();
    initMagnetic();
    initTiltCards();
    initGhostText();
    initReveals();
    initCounters();
    initLiveData();
    setTimeout(() => {
      initOrbit();
      initProdScene();
      initCartThumbs();
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
