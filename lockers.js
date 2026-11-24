(() => {
  const root = document.querySelector(".vsl-page");
  if (!root) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const galleryItems = Array.from(root.querySelectorAll("[data-vsl-gallery-reveal]"));
  const galleryImages = Array.from(root.querySelectorAll(".vsl-gallery__image img"));
  let refreshFrame = 0;

  function scheduleScrollRefresh() {
    if (!ScrollTrigger || refreshFrame) {
      return;
    }

    refreshFrame = window.requestAnimationFrame(() => {
      refreshFrame = 0;
      ScrollTrigger.refresh();
    });
  }

  function loadGalleryImage(image, observer) {
    const source = image.dataset.imageSrc.trim();
    if (!source || image.dataset.imageState) {
      return;
    }

    image.dataset.imageState = "loading";
    image.loading = "lazy";
    image.decoding = "async";
    if (image.dataset.imageSrcset.trim()) {
      image.srcset = image.dataset.imageSrcset;
    }

    image.addEventListener("load", () => {
      image.dataset.imageState = "loaded";
      if (typeof image.decode === "function") {
        image.decode().then(scheduleScrollRefresh).catch((error) => {
          console.warn("Locker gallery image could not be decoded.", source, error);
          scheduleScrollRefresh();
        });
      } else {
        scheduleScrollRefresh();
      }

      if (gsap && !reducedMotion && window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) {
        enablePointerMotion(image);
      }
    }, { once: true });

    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.removeAttribute("srcset");
      image.dataset.imageState = "error";
      console.warn("Locker gallery image is unavailable; check data-image-src:", source);
    }, { once: true });

    image.src = source;
    if (observer) {
      observer.unobserve(image);
    }
  }

  function enablePointerMotion(image) {
    const frame = image.closest(".vsl-gallery__image");
    if (!frame || frame.dataset.pointerMotion === "true") {
      return;
    }

    frame.dataset.pointerMotion = "true";
    const moveX = gsap.quickTo(image, "x", { duration: 0.4, ease: "power3.out" });
    const moveY = gsap.quickTo(image, "y", { duration: 0.4, ease: "power3.out" });
    const onMove = (event) => {
      const bounds = frame.getBoundingClientRect();
      moveX(((event.clientX - bounds.left) / bounds.width - 0.5) * -10);
      moveY(((event.clientY - bounds.top) / bounds.height - 0.5) * -10);
    };
    const onLeave = () => {
      moveX(0);
      moveY(0);
      gsap.to(image, { scale: 1, duration: 0.7, ease: "power3.out", overwrite: "auto" });
    };
    const onEnter = () => {
      gsap.to(image, { scale: 1.045, duration: 0.7, ease: "power3.out", overwrite: "auto" });
    };

    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerleave", onLeave);
    frame.addEventListener("pointerenter", onEnter);
    frame._vslPointerCleanup = () => {
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
      frame.removeEventListener("pointerenter", onEnter);
      delete frame._vslPointerCleanup;
      delete frame.dataset.pointerMotion;
    };
  }
                                                                            
  function initializeGalleryImages() {
    if (!("IntersectionObserver" in window)) {
      galleryImages.forEach((image) => loadGalleryImage(image, null));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadGalleryImage(entry.target, observer);
        }
      });
    }, { rootMargin: "800px 0px" });

    galleryImages.forEach((image) => {
      if (image.dataset.imageSrc.trim()) {
        observer.observe(image);
      }
    });
  }

  function initializeAccordion() {
    if (!gsap || reducedMotion) {
      return;
    }

    root.querySelectorAll(".vsl-accordion__item").forEach((item) => {
      const answer = item.querySelector(".vsl-accordion__answer");
      item.addEventListener("toggle", () => {
        if (item.open) {
          gsap.fromTo(answer, { y: 8, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.28,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility"
          });
        }
      });
    });
  }

  initializeGalleryImages();
  initializeAccordion();

  if (gsap && ScrollTrigger && !reducedMotion) {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const cleanups = [];
      const revealDirections = {
        left: { x: -26, y: 0 },
        right: { x: 26, y: 0 },
        rise: { x: 0, y: 26 }
      };

      root.querySelectorAll("[data-vsl-reveal]").forEach((element, index) => {
        const direction = revealDirections[element.dataset.vslReveal] || revealDirections.rise;
        gsap.fromTo(element, { ...direction, autoAlpha: 0 }, {
          x: 0,
          y: 0,
          autoAlpha: 1,
          duration: 0.72,
          delay: (index % 3) * 0.035,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          immediateRender: false,
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true
          }
        });
      });

      root.querySelectorAll(".vsl-detailed-lockers [data-vsl-locker-card]").forEach((card) => {
        const features = card.querySelectorAll("[data-vsl-locker-features] li");
        const cardTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true
          }
        });

        cardTimeline.fromTo(card, {
          y: 26,
          autoAlpha: 0,
          clipPath: "inset(0 0 8% 0)"
        }, {
          y: 0,
          autoAlpha: 1,
          clipPath: "inset(0 0 0 0)",
          duration: 0.62,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility,clipPath",
          immediateRender: false
        });

        cardTimeline.fromTo(features, {
          y: 7,
          autoAlpha: 0
        }, {
          y: 0,
          autoAlpha: 1,
          duration: 0.32,
          stagger: 0.055,
          ease: "power2.out",
          clearProps: "transform,opacity,visibility",
          immediateRender: false
        }, 0.2);
      });

      const galleryTransitions = [
        { clipPath: "inset(0 100% 0 0)", xPercent: -4 },
        { clipPath: "inset(0 0 0 100%)", xPercent: 4 },
        { clipPath: "inset(100% 0 0 0)", xPercent: 0 },
        { clipPath: "inset(0 0 0 100%)", xPercent: 4 },
        { clipPath: "inset(50% 50% 50% 50%)", xPercent: 0 },
        { clipPath: "inset(100% 0 0 0)", xPercent: 0 }
      ];
      const isDesktop = window.matchMedia("(min-width: 901px)").matches;

      galleryItems.forEach((item, index) => {
        const frame = item.querySelector(".vsl-gallery__image");
        const image = frame.querySelector("img");
        const transition = galleryTransitions[index];
        gsap.fromTo(frame, {
          clipPath: transition.clipPath
        }, {
          clipPath: "inset(0 0 0 0)",
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            end: "top 48%",
            scrub: isDesktop ? 0.45 : 0.25,
            invalidateOnRefresh: true
          }
        });
        gsap.fromTo(image, {
          xPercent: isDesktop ? transition.xPercent : 0,
          scale: 1.12
        }, {
          xPercent: 0,
          scale: 1,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            end: "top 48%",
            scrub: isDesktop ? 0.45 : 0.25,
            invalidateOnRefresh: true
          }
        });
      });

      const parallaxImages = galleryImages.filter((image) => image.dataset.imageSrc.trim());
      parallaxImages.forEach((image, index) => {
        gsap.to(image, {
          yPercent: index % 2 === 0 ? 4 : -4,
          ease: "none",
          scrollTrigger: {
            trigger: image.closest(".vsl-gallery__item"),
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
            invalidateOnRefresh: true
          }
        });
      });

      root.querySelectorAll("[data-vsl-title-line]").forEach((line, index) => {
        gsap.fromTo(line, { yPercent: 105, autoAlpha: 0 }, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.85,
          delay: index * 0.1,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          immediateRender: false
        });
      });

      cleanups.push(() => {
        root.querySelectorAll(".vsl-gallery__image").forEach((frame) => {
          if (frame._vslPointerCleanup) {
            frame._vslPointerCleanup();
          }
        });
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    });
  }

  window.addEventListener("load", scheduleScrollRefresh, { once: true });
  document.addEventListener("vs:components-loaded", scheduleScrollRefresh);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleScrollRefresh).catch((error) => {
      console.error("Locker page fonts could not be loaded.", error);
      scheduleScrollRefresh();
    });
  }
})();
