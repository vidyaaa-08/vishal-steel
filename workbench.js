(() => {
  const root = document.querySelector(".vs-page--workbench");
  if (!root || root.dataset.workbenchInitialized) {
    return;
  }
  root.dataset.workbenchInitialized = "true";

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WHATSAPP_ENQUIRY_URL = ""; // Add the official WhatsApp URL here when it is available.
  const photoSlots = Array.from(root.querySelectorAll("[data-wb-photo]"));
  const images = Array.from(root.querySelectorAll("img[data-wb-src]"));
  const cleanups = [];
  let photoObserver;
  let refreshFrame = 0;
  let animationContext;

  root.querySelectorAll("[data-wb-whatsapp]").forEach((link) => {
    if (!WHATSAPP_ENQUIRY_URL) {
      link.removeAttribute("href");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
      return;
    }

    link.href = WHATSAPP_ENQUIRY_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.removeAttribute("aria-disabled");
    link.removeAttribute("tabindex");
  });

  const typingTarget = root.querySelector("[data-wb-typing]");
  const typingTerms = [
    "Industrial Workbenches",
    "Laboratory Workbenches",
    "Research Workbenches",
    "Electronics Workbenches",
    "Assembly Workbenches",
    "Technical Workstations",
    "Modular Workbenches"
  ];

  if (typingTarget) {
    typingTarget.textContent = typingTerms[0];
    if (!reducedMotion) {
      let wordIndex = 0;
      let characterIndex = typingTerms[0].length;
      let deleting = true;
      let typingTimer;

      const typeNextCharacter = () => {
        const currentTerm = typingTerms[wordIndex];
        if (deleting) {
          characterIndex -= 1;
          typingTarget.textContent = currentTerm.slice(0, characterIndex);
          if (characterIndex === 0) {
            wordIndex = (wordIndex + 1) % typingTerms.length;
            deleting = false;
            typingTimer = window.setTimeout(typeNextCharacter, 230);
          } else {
            typingTimer = window.setTimeout(typeNextCharacter, 42);
          }
          return;
        }

        characterIndex += 1;
        typingTarget.textContent = typingTerms[wordIndex].slice(0, characterIndex);
        if (characterIndex === typingTerms[wordIndex].length) {
          deleting = true;
          typingTimer = window.setTimeout(typeNextCharacter, 1150);
        } else {
          typingTimer = window.setTimeout(typeNextCharacter, 62);
        }
      };

      typingTimer = window.setTimeout(typeNextCharacter, 1500);
      cleanups.push(() => window.clearTimeout(typingTimer));
    }
  }

  const heroStage = root.querySelector("[data-wb-hero-stage]");
  const heroPhotos = Array.from(root.querySelectorAll("[data-wb-hero-image]"));
  const heroControls = Array.from(root.querySelectorAll("[data-wb-hero-focus]"));
  const setHeroFocus = (index) => {
    if (!Number.isInteger(index) || index < 0 || index >= heroPhotos.length) {
      return;
    }

    heroPhotos.forEach((photo, photoIndex) => {
      photo.classList.toggle("is-focus", photoIndex === index);
    });
    heroControls.forEach((control, controlIndex) => {
      const active = controlIndex === index;
      control.classList.toggle("is-active", active);
      control.setAttribute("aria-pressed", String(active));
    });
  };

  heroControls.forEach((control) => {
    const onClick = () => setHeroFocus(Number(control.dataset.wbHeroFocus));
    control.addEventListener("click", onClick);
    cleanups.push(() => control.removeEventListener("click", onClick));
  });
  setHeroFocus(0);

  const categories = Array.from(root.querySelectorAll("[data-wb-category]"));
  categories.forEach((category) => {
    const activate = () => category.classList.add("is-current");
    const deactivate = () => category.classList.remove("is-current");
    category.addEventListener("pointerenter", activate);
    category.addEventListener("pointerleave", deactivate);
    category.addEventListener("focusin", activate);
    category.addEventListener("focusout", deactivate);
    cleanups.push(() => {
      category.removeEventListener("pointerenter", activate);
      category.removeEventListener("pointerleave", deactivate);
      category.removeEventListener("focusin", activate);
      category.removeEventListener("focusout", deactivate);
    });
  });

  function scheduleScrollRefresh() {
    if (!ScrollTrigger || refreshFrame) {
      return;
    }

    refreshFrame = window.requestAnimationFrame(() => {
      refreshFrame = 0;
      ScrollTrigger.refresh();
    });
  }

  function loadPhoto(image, observer) {
    const figure = image.closest("[data-wb-photo]");
    const picture = image.closest("picture");
    const fallback = image.dataset.wbSrc.trim();
    const fallbackSet = image.dataset.wbSrcset.trim();
    const sources = picture ? Array.from(picture.querySelectorAll("source[data-wb-srcset]")) : [];
    const configuredSources = sources.filter((source) => source.dataset.wbSrcset.trim());

    if (!fallback && !fallbackSet && configuredSources.length === 0) {
      figure.dataset.wbPhotoState = "placeholder";
      observer.unobserve(image);
      return;
    }

    if (figure.dataset.wbPhotoState) {
      return;
    }

    figure.dataset.wbPhotoState = "loading";
    image.decoding = "async";
    image.loading = figure.closest(".wb-hero") ? "eager" : "lazy";

    configuredSources.forEach((source) => {
      source.sizes = source.getAttribute("sizes") || image.sizes || "100vw";
      source.srcset = source.dataset.wbSrcset.trim();
    });
    if (fallbackSet) {
      image.srcset = fallbackSet;
    }

    image.addEventListener("load", () => {
      figure.dataset.wbPhotoState = "loaded";
      const finishImageLoad = () => {
        scheduleScrollRefresh();
      };
      if (typeof image.decode === "function") {
        image.decode().then(finishImageLoad).catch((error) => {
          console.warn("Workbench image could not be decoded.", fallback, error);
          finishImageLoad();
        });
      } else {
        finishImageLoad();
      }
    }, { once: true });

    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.removeAttribute("srcset");
      sources.forEach((source) => source.removeAttribute("srcset"));
      figure.dataset.wbPhotoState = "error";
      console.warn("Workbench image is unavailable; check its configured data-wb-src path.", fallback);
      scheduleScrollRefresh();
    }, { once: true });

    if (fallback) {
      image.src = fallback;
    }
    observer.unobserve(image);
  }

  if ("IntersectionObserver" in window) {
    photoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadPhoto(entry.target, observer);
        }
      });
    }, { rootMargin: "700px 0px" });

    images.forEach((image) => {
      if (image.closest(".wb-hero")) {
        loadPhoto(image, photoObserver);
      } else {
        photoObserver.observe(image);
      }
    });
  } else {
    images.forEach((image) => loadPhoto(image, { unobserve() {} }));
  }

  if (gsap && !reducedMotion && heroStage &&
      window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) {
    const moveStage = (event) => {
      const bounds = heroStage.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      gsap.to(heroStage, {
        "--wb-pointer-x": `${(x * 18).toFixed(2)}px`,
        "--wb-pointer-y": `${(y * 14).toFixed(2)}px`,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto"
      });
    };
    const resetStage = () => {
      gsap.to(heroStage, {
        "--wb-pointer-x": "0px",
        "--wb-pointer-y": "0px",
        duration: 0.65,
        ease: "power3.out",
        overwrite: "auto"
      });
    };

    heroStage.addEventListener("pointermove", moveStage);
    heroStage.addEventListener("pointerleave", resetStage);
    cleanups.push(() => {
      heroStage.removeEventListener("pointermove", moveStage);
      heroStage.removeEventListener("pointerleave", resetStage);
    });
  }

  if (reducedMotion || !gsap || !ScrollTrigger) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  animationContext = gsap.context(() => {
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTimeline.fromTo(heroPhotos, {
      clipPath: "inset(0 0 100% 0)",
      y: 18
    }, {
      clipPath: "inset(0 0 0 0)",
      y: 0,
      duration: 0.9,
      stagger: 0.12
    });
    heroTimeline.fromTo(root.querySelectorAll(".wb-hero__copy > *, .wb-hero__controls, .wb-hero__bottom > *"), {
      y: 22,
      autoAlpha: 0
    }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.6,
      stagger: 0.07,
      clearProps: "transform,opacity,visibility"
    }, 0.18);

    const headingTargets = root.querySelectorAll(
      ".wb-showcase__copy > *, .wb-categories__heading > div > *, .wb-details__heading > *, " +
      ".wb-details__specs > *, .wb-overview__copy > *, .wb-premium__copy > *, " +
      ".wb-features__copy > *, .wb-why__copy > *, .wb-cta__inner > *"
    );
    gsap.fromTo(headingTargets, {
      y: 24,
      clipPath: "inset(0 0 100% 0)"
    }, {
      y: 0,
      clipPath: "inset(0 0 0 0)",
      duration: 0.72,
      stagger: 0.07,
      ease: "power3.out",
      clearProps: "transform,clipPath",
      immediateRender: false,
      scrollTrigger: {
        trigger: root.querySelector(".wb-showcase"),
        start: "top 82%",
        once: true
      }
    });

    const revealTargets = root.querySelectorAll(
      ".wb-showcase__photo, .wb-extra-image, .wb-category"
    );
    revealTargets.forEach((target, index) => {
      gsap.fromTo(target, {
        clipPath: index % 2 ? "inset(0 0 100% 0)" : "inset(0 100% 0 0)",
        y: index % 2 ? 18 : 0
      }, {
        clipPath: "inset(0 0 0 0)",
        y: 0,
        duration: 0.9,
        ease: "power2.inOut",
        clearProps: "clipPath,transform",
        immediateRender: false,
        scrollTrigger: {
          trigger: target,
          start: "top 88%",
          once: true
        }
      });
    });

    root.querySelectorAll(".wb-category ul").forEach((list) => {
      gsap.fromTo(list.children, { x: 12 }, {
        x: 0,
        duration: 0.46,
        stagger: 0.07,
        ease: "power2.out",
        clearProps: "transform",
        immediateRender: false,
        scrollTrigger: {
          trigger: list,
          start: "top 86%",
          once: true
        }
      });
    });

    root.querySelectorAll(".wb-spec, .wb-feature-list li, .wb-why-list li").forEach((item, index) => {
      gsap.fromTo(item, {
        x: index % 2 ? 14 : -14
      }, {
        x: 0,
        duration: 0.52,
        ease: "power2.out",
        clearProps: "transform",
        immediateRender: false,
        scrollTrigger: {
          trigger: item,
          start: "top 91%",
          once: true
        }
      });
    });

    root.querySelectorAll(".wb-showcase__photo img, .wb-extra-image img").forEach((image) => {
      gsap.fromTo(image, {
        "--wb-photo-scale": 1.14,
        yPercent: 2
      }, {
        "--wb-photo-scale": 1.03,
        yPercent: -2,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: image.closest(".wb-photo"),
          start: "top bottom",
          end: "bottom top",
          scrub: 0.55,
          invalidateOnRefresh: true
        }
      });
    });

    gsap.to(".wb-hero__drawing circle", {
      rotation: 18,
      transformOrigin: "50% 50%",
      ease: "none",
      scrollTrigger: {
        trigger: ".wb-hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.8
      }
    });
  }, root);

  const refreshScrollTriggers = () => {
    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  document.addEventListener("vs:components-loaded", refreshScrollTriggers);
  window.addEventListener("load", refreshScrollTriggers, { once: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshScrollTriggers, (error) => {
      console.warn("Workbench font readiness check failed.", error);
    });
  }
  cleanups.push(() => document.removeEventListener("vs:components-loaded", refreshScrollTriggers));
  cleanups.push(() => window.removeEventListener("load", refreshScrollTriggers));

  window.addEventListener("pagehide", () => {
    cleanups.forEach((cleanup) => cleanup());
    if (photoObserver) {
      photoObserver.disconnect();
    }
    if (refreshFrame) {
      window.cancelAnimationFrame(refreshFrame);
    }
    if (animationContext) {
      animationContext.revert();
    }
  }, { once: true });
})();
