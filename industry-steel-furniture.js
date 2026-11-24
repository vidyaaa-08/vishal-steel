(() => {
  const root = document.querySelector(".isf-page");
  if (!root) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const slots = Array.from(root.querySelectorAll(".isf-photo[data-image-path]"));
  const images = [];

  function scheduleScrollRefresh() {
    if (ScrollTrigger) {
      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }

  function animateLoadedImage(image, index) {
    if (!gsap || reducedMotion) {
      return;
    }

    const directions = [
      "inset(0 100% 0 0)",
      "inset(0 0 0 100%)",
      "inset(100% 0 0 0)",
      "inset(50% 50% 50% 50%)",
      "polygon(0 0, 0 0, 0 100%, 0 100%)",
      "inset(0 100% 0 0)",
      "inset(0 0 0 100%)",
      "inset(100% 0 0 0)",
      "inset(50% 50% 50% 50%)"
    ];
    const hero = image.closest(".isf-photo--hero");

    if (hero) {
      gsap.fromTo(image, {
        scale: 1.12,
        clipPath: directions[index % directions.length]
      }, {
        scale: 1,
        clipPath: "inset(0 0 0 0)",
        duration: 1.1,
        ease: "power3.out",
        onComplete() {
          gsap.set(image, { clearProps: "willChange" });
        }
      });
      gsap.to(image.closest(".isf-photo"), {
        yPercent: 4,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });
      return;
    }

    gsap.fromTo(image, {
      scale: 1.12,
      clipPath: directions[index % directions.length]
    }, {
      scale: 1,
      clipPath: "inset(0 0 0 0)",
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: image.closest(".isf-photo"),
        start: "top 88%",
        end: "top 58%",
        scrub: 0.45,
        invalidateOnRefresh: true,
        onToggle(self) {
          image.classList.toggle("isf-image-animating", self.isActive);
        }
      }
    });
  }

  function enableImagePointerMotion(image) {
    if (!gsap || reducedMotion || !window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const slot = image.closest(".isf-photo");
    const index = images.indexOf(image);
    if (!slot || index % 3 !== 0) {
      return;
    }

    const moveX = gsap.quickTo(image, "x", { duration: 0.45, ease: "power3.out" });
    const moveY = gsap.quickTo(image, "y", { duration: 0.45, ease: "power3.out" });
    const onMove = (event) => {
      const bounds = slot.getBoundingClientRect();
      moveX(((event.clientX - bounds.left) / bounds.width - 0.5) * -12);
      moveY(((event.clientY - bounds.top) / bounds.height - 0.5) * -12);
    };
    const onLeave = () => {
      moveX(0);
      moveY(0);
    };

    slot.addEventListener("pointermove", onMove);
    slot.addEventListener("pointerleave", onLeave);
  }

  function loadPhoto(slot, index) {
    const image = new Image();
    const note = slot.querySelector(".isf-photo__note");
    const path = slot.dataset.imagePath;
    image.className = "isf-photo__image";
    image.alt = slot.getAttribute("aria-label") || "";
    image.width = slot.classList.contains("isf-photo--hero") ? 1600 : 1400;
    image.height = slot.classList.contains("isf-photo--hero") ? 900 : 1050;
    image.decoding = "async";
    image.loading = slot.classList.contains("isf-photo--hero") ? "eager" : "lazy";

    if (slot.classList.contains("isf-photo--hero")) {
      image.fetchPriority = "high";
    }

    image.addEventListener("load", () => {
      if (typeof image.decode === "function") {
        image.decode().catch((error) => {
          console.warn("Industrial furniture image could not be decoded.", path, error);
        }).finally(() => {
          if (note) {
            note.hidden = true;
          }
          animateLoadedImage(image, index);
          enableImagePointerMotion(image);
          scheduleScrollRefresh();
        });
      } else {
        if (note) {
          note.hidden = true;
        }
        animateLoadedImage(image, index);
        enableImagePointerMotion(image);
        scheduleScrollRefresh();
      }
    }, { once: true });

    image.addEventListener("error", () => {
      image.remove();
      slot.dataset.photoState = "missing";
      console.warn("Industrial furniture photograph is not available; add the approved image at:", path);
    }, { once: true });

    images.push(image);
    slot.prepend(image);
    slot.dataset.photoState = "loading";
    image.src = path;
  }

  if (slots.length !== 9) {
    throw new Error(`Expected nine unique industrial furniture image placements; found ${slots.length}.`);
  }

  if ("IntersectionObserver" in window) {
    const photoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const index = slots.indexOf(entry.target);
        if (index >= 0 && !entry.target.dataset.photoState) {
          loadPhoto(entry.target, index);
        }
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "800px 0px" });

    slots.forEach((slot) => {
      if (slot.classList.contains("isf-photo--hero")) {
        loadPhoto(slot, slots.indexOf(slot));
      } else {
        photoObserver.observe(slot);
      }
    });
  } else {
    slots.forEach((slot, index) => loadPhoto(slot, index));
  }

  if (!gsap || !ScrollTrigger || reducedMotion) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  root.classList.add("isf-animations-ready");

  root.querySelectorAll("[data-isf-reveal]").forEach((element, index) => {
    const effect = element.dataset.isfReveal;
    const useHorizontalMotion = window.matchMedia("(min-width: 1101px)").matches;
    const from = !useHorizontalMotion && (effect === "left" || effect === "right")
      ? { x: 0, y: 20 }
      : effect === "left"
      ? { x: -22 }
      : effect === "right"
        ? { x: 22 }
        : effect === "clip"
          ? { clipPath: "inset(0 100% 0 0)" }
          : { y: 28 };

    gsap.fromTo(element, { ...from, autoAlpha: 0 }, {
      x: 0,
      y: 0,
      clipPath: "inset(0 0 0 0)",
      autoAlpha: 1,
      duration: 0.72,
      delay: (index % 3) * 0.04,
      ease: "power3.out",
      clearProps: "transform,opacity,visibility,clipPath",
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        once: true
      },
      onStart() {
        element.classList.add("isf-reveal-animating");
      },
      onComplete() {
        element.classList.remove("isf-reveal-animating");
        element.classList.add("isf-revealed");
      }
    });
  });

  const pinned = root.querySelector("[data-isf-pinned]");
  const track = pinned && pinned.querySelector("[data-isf-track]");
  const stage = pinned && pinned.querySelector("[data-isf-stage]");
  const slides = pinned ? Array.from(pinned.querySelectorAll("[data-isf-slide]")) : [];
  const progress = pinned && pinned.querySelector("[data-isf-progress]");
  const progressFill = pinned && pinned.querySelector("[data-isf-progress-fill]");
  const currentLabel = pinned && pinned.querySelector("[data-isf-current]");

  if (!pinned || !track || !stage || slides.length !== 3 || !progress || !progressFill || !currentLabel) {
    throw new Error("The industrial furniture pinned showcase is missing required elements.");
  }

  const media = gsap.matchMedia();
  media.add("(min-width: 901px)", () => {
    pinned.classList.add("isf-is-pinned");
    const setActiveSlide = (activeIndex) => {
      slides.forEach((slide, index) => {
        const active = index === activeIndex;
        slide.setAttribute("aria-hidden", String(!active));
        slide.inert = !active;
      });
      currentLabel.textContent = String(activeIndex + 2).padStart(2, "0");
    };

    gsap.set(track, { xPercent: 0 });
    gsap.set(progressFill, { scaleX: 0 });
    gsap.set(slides.slice(1).map((slide) => slide.querySelector(".isf-slide__copy")), {
      autoAlpha: 0,
      y: 24
    });
    setActiveSlide(0);

    const updateProgress = (value = 0) => {
      const progressValue = Math.min(1, Math.max(0, value));
      progress.setAttribute("aria-valuenow", String(Math.round(progressValue * 100)));
      gsap.set(progressFill, { scaleX: progressValue });
      const activeIndex = slides.findIndex((slide) => (
        Number(getComputedStyle(slide.querySelector(".isf-slide__copy")).opacity) > 0.5
      ));
      setActiveSlide(activeIndex < 0
        ? Math.min(slides.length - 1, Math.floor(progressValue * slides.length))
        : activeIndex);
    };

    const timeline = gsap.timeline({
      onUpdate() {
        updateProgress(this.progress());
      },
      scrollTrigger: {
        trigger: pinned,
        pin: pinned,
        pinSpacing: true,
        start: "top top",
        end: () => `+=${Math.max(stage.clientWidth * 2, window.innerHeight * 1.7)}`,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: [0, 0.5, 1],
          duration: { min: 0.15, max: 0.4 },
          delay: 0.06,
          ease: "power1.inOut",
          inertia: false
        },
        onRefresh(self) {
          updateProgress(self.progress);
        }
      }
    });

    timeline.to(track, { xPercent: -66.6667, duration: 2, ease: "none" }, 0);
    slides.forEach((slide, index) => {
      if (index === 0) {
        timeline.to(slide.querySelector(".isf-slide__copy"), {
          autoAlpha: 0,
          y: -18,
          duration: 0.38
        }, 0.55);
      } else {
        timeline.fromTo(slide.querySelector(".isf-slide__copy"), {
          autoAlpha: 0,
          y: 24
        }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
          immediateRender: false
        }, index - 0.35);
        if (index < slides.length - 1) {
          timeline.to(slide.querySelector(".isf-slide__copy"), {
            autoAlpha: 0,
            y: -18,
            duration: 0.38
          }, index + 0.55);
        }
      }
    });

    return () => {
      pinned.classList.remove("isf-is-pinned");
      slides.forEach((slide) => {
        slide.removeAttribute("aria-hidden");
        slide.inert = false;
      });
      progress.setAttribute("aria-valuenow", "0");
      currentLabel.textContent = "02";
      gsap.set(track, { clearProps: "transform" });
      gsap.set(progressFill, { clearProps: "transform" });
      gsap.set(slides.map((slide) => slide.querySelector(".isf-slide__copy")), {
        clearProps: "opacity,visibility,transform"
      });
    };
  });

  window.addEventListener("load", scheduleScrollRefresh, { once: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleScrollRefresh);
  }
  ScrollTrigger.refresh();
})();
