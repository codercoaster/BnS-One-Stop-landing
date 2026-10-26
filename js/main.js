/* B&S One Stop — animations (GSAP + ScrollTrigger + SplitText + DrawSVG + Lenis) */
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $(".year").textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------- Lenis */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = $(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.4 });
      else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* --------------------------------------------------------------- Embers */
  function createEmbers(canvas) {
    const ctx = canvas.getContext("2d");
    const colors = ["255,194,26", "255,106,19", "237,47,14"];
    let w, h, dpr, parts = [], running = true;

    const spawn = (anywhere) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: (Math.random() * 2.2 + 0.6) * dpr,
      vy: (Math.random() * 0.9 + 0.35) * dpr,
      drift: Math.random() * Math.PI * 2,
      life: Math.random() * 0.6 + 0.4,
      c: colors[(Math.random() * colors.length) | 0],
    });

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
      const count = canvas.offsetWidth < 700 ? 45 : 95;
      parts = Array.from({ length: count }, () => spawn(true));
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of parts) {
        p.y -= p.vy;
        p.drift += 0.02;
        p.x += Math.sin(p.drift) * 0.4 * dpr;
        const fade = Math.max(0, Math.min(1, p.y / h)) * p.life;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(${p.c},${fade})`);
        g.addColorStop(1, `rgba(${p.c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
        if (p.y < -10) Object.assign(p, spawn(false));
      }
    }

    resize();
    window.addEventListener("resize", resize);
    gsap.ticker.add(tick);
    return {
      play() { running = true; },
      pause() { running = false; },
    };
  }

  setupReels();

  /* ------------------------------------------------------- Reduced motion */
  if (reduceMotion) {
    document.body.classList.remove("is-loading");
    return;
  }

  /* ---------------------------------------------------------------- Init */
  document.fonts.ready.then(init);

  function init() {
    const embers = createEmbers($(".embers"));
    ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? embers.play() : embers.pause()),
    });

    const intro = gsap.timeline();
    intro.add(loader()).add(heroIntro(), "-=0.55");

    heroScroll();
    header();
    ticker();
    splitHeadings();
    trinity();
    menu();
    stand();
    capital();
    visit();

    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* --------------------------------------------------------------- Loader */
  function loader() {
    const tl = gsap.timeline();
    gsap.set(".loader", { clipPath: "inset(0% 0% 0% 0%)" });
    tl.from(".loader__crown path", { drawSVG: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.2 })
      .from(".loader__word", { yPercent: 60, autoAlpha: 0, duration: 0.6, ease: "power3.out" }, "-=0.5")
      .to(".loader__crown", { fill: "#E8B23A", duration: 0.4 }, "-=0.2")
      .to(".loader", { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" }, "+=0.2")
      .add(() => {
        document.body.classList.remove("is-loading");
        lenis && lenis.start();
      }, "-=0.4")
      .set(".loader", { display: "none" });
    return tl;
  }

  /* ----------------------------------------------------------------- Hero */
  function heroIntro() {
    const split = SplitText.create(".hero__line", { type: "chars", charsClass: "char" });
    const img = $(".hero__dog img");
    gsap.set(img, { rotation: -90 });
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.from(split.chars, {
      yPercent: 120,
      scaleY: 1.6,
      autoAlpha: 0,
      transformOrigin: "50% 100%",
      duration: 1.1,
      stagger: 0.045,
      clearProps: "transform,opacity,visibility",
    })
      .from(".hero__script", { autoAlpha: 0, y: 40, rotation: -14, duration: 0.9, ease: "back.out(2)" }, 0.35)
      .from(".hero__squiggle path", { drawSVG: 0, duration: 0.9, ease: "power2.inOut" }, 0.7)
      .from(img, { y: -window.innerHeight, rotation: -150, scale: 0.6, duration: 1.3, ease: "back.out(1.3)" }, 0.25)
      .from(".header", { autoAlpha: 0, duration: 0.8 }, 0.8)
      .add(() => {
        gsap.to(img, { y: -14, rotation: -87, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });

    // mouse parallax on the dog wrapper (vertical only, so it stays centred under B&S)
    if (window.matchMedia("(pointer: fine)").matches) {
      const dog = $(".hero__dog");
      const yTo = gsap.quickTo(dog, "y", { duration: 0.8, ease: "power3" });
      $(".hero").addEventListener("pointermove", (e) => {
        yTo((e.clientY / window.innerHeight - 0.5) * 30);
      });
    }
    return tl;
  }

  function heroScroll() {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
    });
    tl.to(".hero__dog", { yPercent: 40, scale: 1.35, rotation: 14, ease: "none" }, 0)
      .to(".hero__line--a", { xPercent: -18, autoAlpha: 0.2, ease: "none" }, 0)
      .to(".hero__line--b", { xPercent: 18, autoAlpha: 0.2, ease: "none" }, 0)
      .to(".hero__script, .hero__squiggle", { yPercent: -120, autoAlpha: 0, ease: "none" }, 0)
      .to(".hero__glow", { scale: 1.3, autoAlpha: 0.6, ease: "none" }, 0);
  }

  /* --------------------------------------------------------------- Header */
  function header() {
    const hideHeader = gsap.to(".header", { yPercent: -110, paused: true, duration: 0.35, ease: "power2.out" });
    ScrollTrigger.create({
      start: "top -120",
      end: "max",
      onUpdate: (self) => (self.direction === 1 ? hideHeader.play() : hideHeader.reverse()),
      onLeaveBack: () => hideHeader.reverse(),
    });
  }

  /* --------------------------------------------------------------- Ticker */
  function ticker() {
    const track = $(".ticker__track");
    const half = track.innerHTML.repeat(3);
    track.innerHTML = half + half;

    const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    loop.totalTime(loop.duration() * 1000); // room to run backwards

    let boostTl;
    ScrollTrigger.create({
      onUpdate(self) {
        const dir = self.direction;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 6);
        boostTl && boostTl.kill();
        boostTl = gsap.timeline()
          .to(loop, { timeScale: dir * boost, duration: 0.2 })
          .to(loop, { timeScale: dir, duration: 0.8 }, "+=0.15");
      },
    });
  }

  /* ------------------------------------------------------ Split headings */
  function splitHeadings() {
    $$(".split-lines").forEach((el) => {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1,
            ease: "power4.out",
            stagger: 0.12,
            scrollTrigger: { trigger: el, start: "top 85%" },
          }),
      });
    });
    gsap.utils.toArray(".eyebrow").forEach((el) =>
      gsap.from(el, { autoAlpha: 0, x: -20, duration: 0.7, scrollTrigger: { trigger: el, start: "top 88%" } })
    );
  }

  /* -------------------------------------------------------------- Trinity */
  function trinity() {
    const mm = gsap.matchMedia();
    const panels = gsap.utils.toArray(".panel");

    mm.add("(min-width: 900px)", () => {
      gsap.set(panels, { filter: "brightness(1)" });
      gsap.set(panels.slice(1), { yPercent: 115, rotation: 5 });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".trinity__pin", start: "top top", end: "+=220%", pin: true, scrub: 1 },
      });
      tl.from(panels[0].querySelectorAll(".panel__icon path"), { drawSVG: 0, duration: 0.4 });
      panels.slice(1).forEach((panel, i) => {
        tl.to(panel, { yPercent: 0, rotation: 0, duration: 1 })
          .to(panels[i], { scale: 0.9, filter: "brightness(.45)", duration: 1 }, "<")
          .from(panel.querySelectorAll(".panel__icon path, .panel__icon rect"), { drawSVG: 0, duration: 0.4 }, "-=0.3")
          .from(panel.querySelector(".panel__num"), { yPercent: 40, autoAlpha: 0, duration: 0.5 }, "<");
      });
      tl.to({}, { duration: 0.3 }); // short hold on the last panel
    });

    mm.add("(max-width: 899px)", () => {
      panels.forEach((panel) =>
        gsap.from(panel, { y: 80, rotation: 3, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: panel, start: "top 85%" } })
      );
    });
  }

  /* ----------------------------------------------------------------- Menu */
  function menu() {
    gsap.utils.toArray(".menu__cat").forEach((cat) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: cat, start: "top 80%" } });
      tl.from(cat.querySelectorAll("h3, .menu__tag"), { y: 30, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" })
        .from(cat.querySelectorAll(".item, .combo"), { y: 24, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, "-=0.4")
        .from(cat.querySelectorAll(".item__dots"), { scaleX: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }, "<0.2")
        .from(cat.querySelectorAll(".item__price, .combo__price"), { scale: 0, duration: 0.5, stagger: 0.08, ease: "back.out(2.5)" }, "<0.15");
    });

    gsap.from(".menu__foot", { y: 30, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: ".menu__foot", start: "top 92%" } });

    // decorative dogs drift through the section
    [
      [".menu__deco--a", -120, 18],
      [".menu__deco--b", -220, -16],
      [".menu__deco--c", -160, 10],
    ].forEach(([sel, y, rot]) =>
      gsap.to(sel, { y, rotation: `+=${rot}`, ease: "none", scrollTrigger: { trigger: ".menu", start: "top bottom", end: "bottom top", scrub: true } })
    );
  }

  /* -------------------------------------------------------- Stand (reels) */
  function embedUrl(url) {
    const ig = url.match(/instagram\.com\/(reel|reels|p)\/([\w-]+)/);
    if (ig) return { src: `https://www.instagram.com/${ig[1] === "p" ? "p" : "reel"}/${ig[2]}/embed`, site: "Instagram" };
    if (/facebook\.com|fb\.watch/.test(url)) {
      return { src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=320`, site: "Facebook" };
    }
    return null;
  }

  // Builds each reel card. Returns false when there are no reels, so the section stays hidden.
  function setupReels() {
    const reels = $$(".reel[data-reel]");
    if (!reels.length) return false;

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const reel = entry.target;
          io.unobserve(reel);
          const frame = document.createElement("iframe");
          frame.src = reel.dataset.embed;
          frame.title = reel.dataset.title;
          frame.loading = "lazy";
          frame.allow = "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";
          frame.allowFullscreen = true;
          reel.querySelector(".reel__media").prepend(frame);
        }),
      { rootMargin: "0px 600px 400px 600px" }
    );

    reels.forEach((reel, i) => {
      const info = embedUrl(reel.dataset.reel);
      if (!info) return reel.remove();
      reel.dataset.embed = info.src;
      reel.dataset.title = `B&S One Stop reel ${i + 1} on ${info.site}`;
      reel.innerHTML = `
        <div class="reel__media">
          <button class="reel__play" type="button" aria-label="Play reel ${i + 1}">Watch</button>
        </div>
        <a class="reel__link" href="${reel.dataset.reel}" target="_blank" rel="noopener">Open on ${info.site} ↗</a>`;
      // the overlay keeps wheel events on the page (smooth scroll) until the viewer opts in
      reel.querySelector(".reel__play").addEventListener("click", (e) => e.currentTarget.remove());
      io.observe(reel);
    });

    if (!$(".reel[data-reel]")) return false;
    $(".stand").hidden = false;
    $(".nav__stand").hidden = false;
    return true;
  }

  function stand() {
    if ($(".stand").hidden) return;
    const mm = gsap.matchMedia();
    const track = $(".stand__track");
    const cards = gsap.utils.toArray(".reel");

    mm.add("(min-width: 900px)", () => {
      const distance = () => track.scrollWidth - window.innerWidth;
      const scroller = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: ".stand",
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card) =>
        gsap.fromTo(
          card.querySelector(".reel__media"),
          { rotation: 8, scale: 0.82, yPercent: 8 },
          {
            rotation: 0,
            scale: 1,
            yPercent: 0,
            ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: scroller, start: "left right", end: "center 60%", scrub: true },
          }
        )
      );
    });

    mm.add("(max-width: 899px)", () => {
      gsap.from(cards, { x: 80, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".stand", start: "top 70%" } });
    });
  }

  /* -------------------------------------------------------------- Capital */
  function capital() {
    gsap.from(".capital__crown", {
      scale: 0,
      rotation: -25,
      duration: 1.2,
      ease: "elastic.out(1, 0.5)",
      scrollTrigger: { trigger: ".capital", start: "top 70%" },
    });
    gsap.from(".capital__ribbon", {
      clipPath: "polygon(50% 0, 50% 0, 50% 50%, 50% 100%, 50% 100%, 50% 50%)",
      duration: 0.9,
      ease: "power3.inOut",
      scrollTrigger: { trigger: ".capital", start: "top 65%" },
    });

    SplitText.create(".capital__statement", {
      type: "words",
      wordsClass: "word",
      autoSplit: true,
      onSplit(self) {
        const hot = self.words.slice(-3); // "wear the crown."
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".capital__statement", start: "top 80%", end: "bottom 45%", scrub: true },
        });
        tl.to(self.words, { color: "#F4DDB0", stagger: 0.1, ease: "none" }).to(hot, { color: "#FFC21A", textShadow: "0 0 30px rgba(255,106,19,.8)", stagger: 0.1, ease: "none" }, "-=0.2");
        return tl;
      },
    });
  }

  /* ---------------------------------------------------------------- Visit */
  function visit() {
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".visit", start: "top 75%" } });
    tl.from(".visit__board", { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: "expo.inOut" })
      .from(".visit__script", { autoAlpha: 0, y: 50, rotation: -12, duration: 0.9, ease: "back.out(1.8)" }, "-=0.4")
      .from(".visit__arrow", { xPercent: 120, autoAlpha: 0, duration: 1, ease: "power4.out" }, "-=0.6")
      .to(".visit__arrow svg", { x: -8, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: -1 });

    gsap.from(".visit__info > *, .visit__map", {
      y: 40,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".visit__grid", start: "top 80%" },
    });
  }
})();
