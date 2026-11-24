(() => {
  const root = document.querySelector(".vsa-about");
  if (!root) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const faqItems = Array.from(root.querySelectorAll(".vsa-faq__item"));

  const closeFaqItem = (item, animate) => {
    const answer = item.querySelector(".vsa-faq__answer");
    const gsap = window.gsap;
    if (animate && gsap && !reducedMotion && item.open) {
      gsap.killTweensOf(answer);
      gsap.to(answer, {
        height: 0,
        opacity: 0,
        duration: 0.24,
        ease: "power1.inOut",
        onComplete() {
          item.open = false;
          gsap.set(answer, { clearProps: "height,opacity" });
        }
      });
      return;
    }

    item.open = false;
    if (gsap) {
      gsap.killTweensOf(answer);
      gsap.set(answer, { clearProps: "height,opacity" });
    }
  };

  faqItems.forEach((item) => {
    const summary = item.querySelector("summary");
    const answer = item.querySelector(".vsa-faq__answer");
    summary.addEventListener("click", (event) => {
      event.preventDefault();
      const shouldOpen = !item.open;
      faqItems.forEach((other) => {
        if (other !== item && other.open) {
          closeFaqItem(other, false);
        }
      });

      const gsap = window.gsap;
      if (!shouldOpen) {
        closeFaqItem(item, true);
        return;
      }

      item.open = true;
      if (gsap && !reducedMotion) {
        gsap.killTweensOf(answer);
        gsap.fromTo(answer, { height: 0, opacity: 0 }, {
          height: "auto",
          opacity: 1,
          duration: 0.32,
          ease: "power2.out",
          clearProps: "height,opacity"
        });
      }
    });
  });

  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  const context = gsap.context(() => {
    const heroLines = root.querySelectorAll("[data-vsa-hero-line]");
    const heroVisual = root.querySelector(".vsa-hero__visual");
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTimeline.fromTo(heroLines, {
      yPercent: 110,
      clipPath: "inset(0 0 100% 0)"
    }, {
      yPercent: 0,
      clipPath: "inset(0 0 0 0)",
      duration: 0.88,
      stagger: 0.13
    });
    heroTimeline.fromTo(heroVisual, {
      clipPath: "inset(0 0 0 100%)",
      autoAlpha: 0.4
    }, {
      clipPath: "inset(0 0 0 0)",
      autoAlpha: 1,
      duration: 1.1,
      ease: "power2.inOut"
    }, 0.22);
    heroTimeline.fromTo(".vsa-hero__description, .vsa-hero__scroll", {
      y: 20,
      autoAlpha: 0
    }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.65,
      stagger: 0.1
    }, 0.62);

    gsap.fromTo(".vsa-expertise__list li", { x: 28, autoAlpha: 0 }, {
      x: 0,
      autoAlpha: 1,
      duration: 0.65,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-expertise", start: "top 78%", once: true }
    });

    gsap.fromTo(".vsa-clients__heading", { y: 34, clipPath: "inset(0 0 18% 0)", autoAlpha: 0 }, {
      y: 0,
      clipPath: "inset(0 0 0 0)",
      autoAlpha: 1,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-clients", start: "top 74%", once: true }
    });
    gsap.fromTo(".vsa-clients__note", { y: 16, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.55,
      delay: 0.18,
      scrollTrigger: { trigger: ".vsa-clients", start: "top 74%", once: true }
    });

    gsap.fromTo(".vsa-commitment__word", { x: -55, autoAlpha: 0 }, {
      x: 0,
      autoAlpha: 1,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-commitment", start: "top 72%", once: true }
    });
    gsap.fromTo(".vsa-commitment__copy h2", { clipPath: "inset(0 0 100% 0)", y: 30 }, {
      clipPath: "inset(0 0 0 0)",
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-commitment", start: "top 72%", once: true }
    });
    gsap.fromTo(".vsa-commitment__underline", { scaleX: 0 }, {
      scaleX: 1,
      duration: 0.55,
      ease: "power2.out",
      scrollTrigger: { trigger: ".vsa-commitment", start: "top 72%", once: true }
    });

    gsap.fromTo(".vsa-mission__visual", { clipPath: "inset(0 100% 0 0)" }, {
      clipPath: "inset(0 0 0 0)",
      duration: 1.05,
      ease: "power2.inOut",
      scrollTrigger: { trigger: ".vsa-mission", start: "top 70%", once: true }
    });
    gsap.fromTo(".vsa-mission__letter", { scale: 0.82, autoAlpha: 0 }, {
      scale: 1,
      autoAlpha: 1,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-mission", start: "top 70%", once: true }
    });
    gsap.fromTo(".vsa-mission__copy > *", { x: 32, autoAlpha: 0 }, {
      x: 0,
      autoAlpha: 1,
      duration: 0.65,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-mission", start: "top 70%", once: true }
    });

    gsap.fromTo(".vsa-materials__heading > *", { y: 28, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.65,
      stagger: 0.11,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-materials", start: "top 72%", once: true }
    });
    gsap.fromTo(".vsa-material", { y: 42, clipPath: "inset(0 0 100% 0)", autoAlpha: 0 }, {
      y: 0,
      clipPath: "inset(0 0 0 0)",
      autoAlpha: 1,
      duration: 0.78,
      stagger: 0.13,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-materials__visuals", start: "top 78%", once: true }
    });

    gsap.fromTo(".vsa-vision__word", { scale: 0.88, x: 40, autoAlpha: 0 }, {
      scale: 1,
      x: 0,
      autoAlpha: 1,
      duration: 1.1,
      ease: "power2.out",
      scrollTrigger: { trigger: ".vsa-vision", start: "top 70%", once: true }
    });
    gsap.fromTo(".vsa-vision__copy", { clipPath: "inset(0 0 0 14%)", x: 24, autoAlpha: 0 }, {
      clipPath: "inset(0 0 0 0)",
      x: 0,
      autoAlpha: 1,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-vision", start: "top 70%", once: true }
    });
    gsap.fromTo(".vsa-vision__mark span", { scaleY: 0 }, {
      scaleY: 1,
      duration: 0.55,
      stagger: 0.1,
      transformOrigin: "bottom center",
      scrollTrigger: { trigger: ".vsa-vision", start: "top 70%", once: true }
    });

    const story = root.querySelector(".vsa-history__story");
    const rail = root.querySelector(".vsa-history__rail");
    const chapters = Array.from(root.querySelectorAll("[data-vsa-history-chapter]"));
    const current = root.querySelector("[data-vsa-history-current]");
    const progress = root.querySelector("[data-vsa-history-progress]");
    const progressFill = root.querySelector("[data-vsa-history-progress-fill]");
    const yearEntrances = [
      { x: -55, clipPath: "inset(0 100% 0 0)" },
      { y: -42, clipPath: "inset(0 0 100% 0)" },
      { x: 55, clipPath: "inset(0 0 0 100%)" }
    ];
    const copyEntrances = [{ y: 35 }, { x: -35 }, { y: 35 }];
    const setHistoryChapter = (index) => {
      current.textContent = String(index + 1).padStart(2, "0");
      progress.setAttribute("aria-valuenow", String(Math.round(((index + 1) / chapters.length) * 100)));
    };

    chapters.forEach((chapter, index) => {
      const year = chapter.querySelector(".vsa-history__year");
      const copy = chapter.querySelector(".vsa-history__copy");
      gsap.fromTo(year, { ...yearEntrances[index], autoAlpha: 0 }, {
        x: 0,
        y: 0,
        clipPath: "inset(0 0 0 0)",
        autoAlpha: 1,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: chapter, start: "top 72%", once: true }
      });
      gsap.fromTo(copy, { ...copyEntrances[index], autoAlpha: 0 }, {
        x: 0,
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: chapter, start: "top 67%", once: true }
      });
      ScrollTrigger.create({
        trigger: chapter,
        start: "top center",
        end: "bottom center",
        onEnter: () => setHistoryChapter(index),
        onEnterBack: () => setHistoryChapter(index)
      });
    });

    const historyMedia = gsap.matchMedia();
    historyMedia.add("(min-width: 761px)", () => {
      gsap.fromTo(progressFill, { scaleY: 0 }, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: story, start: "top center", end: "bottom center", scrub: true }
      });
    });
    historyMedia.add("(max-width: 760px)", () => {
      gsap.fromTo(progressFill, { scaleX: 0 }, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: story, start: "top center", end: "bottom center", scrub: true }
      });
    });

    gsap.fromTo(".vsa-insights__visual", { clipPath: "inset(0 100% 0 0)" }, {
      clipPath: "inset(0 0 0 0)",
      duration: 1,
      ease: "power2.inOut",
      scrollTrigger: { trigger: ".vsa-insights", start: "top 72%", once: true }
    });
    gsap.fromTo(".vsa-insights__copy > *", { x: 38, autoAlpha: 0 }, {
      x: 0,
      autoAlpha: 1,
      duration: 0.65,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-insights", start: "top 72%", once: true }
    });

    gsap.fromTo(".vsa-faq__heading", { y: 32, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.75,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-faq", start: "top 75%", once: true }
    });
    gsap.fromTo(".vsa-faq__item", { x: 28, autoAlpha: 0 }, {
      x: 0,
      autoAlpha: 1,
      duration: 0.55,
      stagger: 0.09,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-faq__list", start: "top 80%", once: true }
    });

    gsap.fromTo(".vsa-cta h2, .vsa-cta a", { y: 30, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vsa-cta", start: "top 78%", once: true }
    });

    historyMedia.add("(min-width: 901px)", () => {
      ScrollTrigger.create({
        trigger: story,
        start: "top top+=112",
        end: "bottom bottom",
        pin: rail,
        pinSpacing: false,
        invalidateOnRefresh: true
      });
    });

    window.addEventListener("pagehide", () => historyMedia.revert(), { once: true });
  }, root);

  const refreshScrollTriggers = () => {
    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  document.addEventListener("vs:components-loaded", refreshScrollTriggers);
  window.addEventListener("load", refreshScrollTriggers, { once: true });
  window.addEventListener("pagehide", () => {
    document.removeEventListener("vs:components-loaded", refreshScrollTriggers);
    context.revert();
  }, { once: true });
})();
