(() => {
  const root = document.querySelector(".vpr-page");
  if (!root) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const products = Array.from(root.querySelectorAll("[data-vpr-product]"));
  const filterButtons = Array.from(root.querySelectorAll("[data-vpr-filter]"));
  const productCount = root.querySelector("[data-vpr-product-count]");
  const feature = root.querySelector("[data-vpr-feature]");
  const featureStage = root.querySelector("[data-vpr-feature-stage]");
  const featureTrack = root.querySelector("[data-vpr-feature-track]");
  const featureSlides = Array.from(root.querySelectorAll("[data-vpr-feature-slide]"));
  const featureProgress = root.querySelector("[data-vpr-feature-progress]");
  const featureProgressFill = root.querySelector("[data-vpr-feature-progress-fill]");
  const featureCurrent = root.querySelector("[data-vpr-feature-current]");

  const setFeatureActive = (activeIndex) => {
    featureSlides.forEach((slide, index) => {
      const active = index === activeIndex;
      slide.setAttribute("aria-hidden", String(!active));
      slide.inert = !active;
    });
    featureCurrent.textContent = String(activeIndex + 1).padStart(2, "0");
  };

  const clearFeatureAccessibility = () => {
    featureSlides.forEach((slide) => {
      slide.removeAttribute("aria-hidden");
      slide.inert = false;
    });
  };

  const setProductFilter = (category) => {
    const previousVisible = products.filter((product) => !product.hidden);
    if (gsap) {
      gsap.killTweensOf(products);
      gsap.set(products, { clearProps: "transform,opacity,visibility" });
    }

    const previousPositions = new Map(previousVisible.map((product) => [product, product.getBoundingClientRect()]));
    const matches = products.filter((product) => {
      const categories = product.dataset.vprCategories.split(/\s+/);
      return category === "all" || categories.includes(category);
    });
    const matchingSet = new Set(matches);

    products.forEach((product) => {
      product.hidden = !matchingSet.has(product);
    });

    filterButtons.forEach((button) => {
      const active = button.dataset.vprFilter === category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    productCount.textContent = `${matches.length} ${matches.length === 1 ? "product" : "products"}`;

    if (gsap && !reducedMotion) {
      matches.forEach((product) => {
        const previous = previousPositions.get(product);
        if (!previous) {
          gsap.fromTo(product, { y: 20, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.42,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility"
          });
          return;
        }

        const current = product.getBoundingClientRect();
        const x = previous.left - current.left;
        const y = previous.top - current.top;
        if (Math.abs(x) > 1 || Math.abs(y) > 1) {
          gsap.fromTo(product, { x, y }, {
            x: 0,
            y: 0,
            duration: 0.46,
            ease: "power2.out",
            clearProps: "transform"
          });
        }
      });
    }

    window.requestAnimationFrame(() => {
      if (ScrollTrigger) {
        ScrollTrigger.refresh();
      }
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setProductFilter(button.dataset.vprFilter));
  });

  const setupPointerParallax = () => {
    if (!gsap || reducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 901px)").matches) {
      return;
    }

    root.querySelectorAll(".vpr-photo-slot").forEach((slot) => {
      const image = slot.querySelector("img");
      if (!image) {
        return;
      }

      let frame = 0;
      let moveX = 0;
      let moveY = 0;

      slot.addEventListener("pointermove", (event) => {
        if (event.pointerType && event.pointerType !== "mouse") {
          return;
        }
        const bounds = slot.getBoundingClientRect();
        const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
        const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
        moveX = `${(relativeX * -12).toFixed(2)}px`;
        moveY = `${(relativeY * -12).toFixed(2)}px`;
        if (!frame) {
          frame = window.requestAnimationFrame(() => {
            gsap.to(image, {
              "--vpr-photo-x": moveX,
              "--vpr-photo-y": moveY,
              duration: 0.35,
              ease: "power2.out",
              overwrite: "auto"
            });
            frame = 0;
          });
        }
      });

      slot.addEventListener("pointerleave", () => {
        if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
        gsap.to(image, {
          "--vpr-photo-x": "0px",
          "--vpr-photo-y": "0px",
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto"
        });
      });
    });
  };

  setupPointerParallax();

  if (reducedMotion || !gsap || !ScrollTrigger) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const animationContext = gsap.context(() => {
    const heroLines = root.querySelectorAll("[data-vpr-hero-line]");
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .fromTo(heroLines, { yPercent: 110, clipPath: "inset(0 0 100% 0)" }, {
        yPercent: 0,
        clipPath: "inset(0 0 0 0)",
        duration: 0.85,
        stagger: 0.13
      })
      .fromTo(".vpr-hero h2, .vpr-hero__description, .vpr-hero .vpr-link", {
        y: 22,
        autoAlpha: 0
      }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.62,
        stagger: 0.1
      }, 0.55);

    gsap.fromTo(".vpr-hero__visual", { clipPath: "inset(0 0 0 100%)" }, {
      clipPath: "inset(0 0 0 0)",
      duration: 1.15,
      ease: "power2.inOut"
    });
    const heroImage = root.querySelector(".vpr-hero__visual > img");
    if (heroImage) {
      gsap.fromTo(heroImage, { "--vpr-photo-scale": 1.12 }, {
        "--vpr-photo-scale": 1,
        duration: 1.15,
        ease: "power2.inOut"
      });
    }
    gsap.to(".vpr-hero__visual", {
      yPercent: 5,
      ease: "none",
      scrollTrigger: { trigger: ".vpr-hero", start: "top top", end: "bottom top", scrub: true }
    });

    gsap.fromTo(".vpr-expertise .vpr-section-heading > *", { y: 26, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.62,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vpr-expertise", start: "top 75%", once: true }
    });
    gsap.fromTo(".vpr-expertise__item", { clipPath: "inset(0 0 100% 0)", y: 28 }, {
      clipPath: "inset(0 0 0 0)",
      y: 0,
      duration: 0.75,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vpr-expertise__grid", start: "top 78%", once: true }
    });

    const featureMedia = gsap.matchMedia();
    featureMedia.add("(min-width: 1001px)", () => {
      feature.classList.add("is-pinned");
      gsap.set(featureTrack, { x: 0 });
      setFeatureActive(0);

      const setFeatureSlideWidths = () => {
        const slideWidth = featureStage.clientWidth;
        featureSlides.forEach((slide) => {
          slide.style.width = `${slideWidth}px`;
          slide.style.flexBasis = `${slideWidth}px`;
        });
      };
      setFeatureSlideWidths();
      ScrollTrigger.addEventListener("refreshInit", setFeatureSlideWidths);

      const horizontalDistance = () => Math.max(0, (featureSlides.length - 1) * featureStage.clientWidth);
      const updateFeatureState = (fallbackProgress = 0) => {
        const distance = horizontalDistance();
        const translatedDistance = Math.min(distance, Math.abs(Number(gsap.getProperty(featureTrack, "x")) || 0));
        const progressValue = distance ? translatedDistance / distance : fallbackProgress;
        featureProgress.setAttribute("aria-valuenow", String(Math.round(progressValue * 100)));
        gsap.set(featureProgressFill, { scaleX: progressValue });
        setFeatureActive(Math.min(featureSlides.length - 1, Math.floor((translatedDistance + featureStage.clientWidth / 2) / featureStage.clientWidth)));
      };

      const featureTimeline = gsap.timeline({
        onUpdate() {
          updateFeatureState(this.progress());
        },
        scrollTrigger: {
          trigger: feature,
          pin: feature,
          pinSpacing: true,
          start: "top top",
          end: () => `+=${Math.max(horizontalDistance(), window.innerHeight * 1.6)}`,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: featureSlides.map((slide, index) => index / (featureSlides.length - 1)),
            duration: { min: 0.16, max: 0.42 },
            delay: 0.08,
            ease: "power1.inOut",
            inertia: false
          },
          onRefresh(self) {
            updateFeatureState(self.progress);
          }
        }
      });
      featureTimeline.to(featureTrack, {
        x: () => -horizontalDistance(),
        duration: featureSlides.length - 1,
        ease: "none"
      }, 0);

      featureSlides.slice(1).forEach((slide, offset) => {
        const visual = slide.querySelector(".vpr-feature__visual");
        const copy = slide.querySelector(".vpr-feature__copy");
        const image = visual.querySelector("img");
        gsap.set(visual, { clipPath: "inset(0 100% 0 0)", autoAlpha: 0 });
        gsap.set(copy, { x: 36, autoAlpha: 0 });
        const index = offset + 1;
        const start = index - 0.45;
        featureTimeline.fromTo(visual, { clipPath: "inset(0 100% 0 0)", autoAlpha: 0 }, {
          clipPath: "inset(0 0 0 0)",
          autoAlpha: 1,
          duration: 0.4,
          ease: "power2.inOut",
          immediateRender: false
        }, start);
        if (image) {
          gsap.set(image, { "--vpr-photo-scale": 1.12 });
          featureTimeline.fromTo(image, { "--vpr-photo-scale": 1.12 }, {
            "--vpr-photo-scale": 1,
            duration: 0.4,
            ease: "power2.out",
            immediateRender: false
          }, start);
        }
        featureTimeline.fromTo(copy, { x: 36, autoAlpha: 0 }, {
          x: 0,
          autoAlpha: 1,
          duration: 0.32,
          stagger: 0.08,
          ease: "power3.out",
          immediateRender: false
        }, start + 0.06);
      });

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", setFeatureSlideWidths);
        feature.classList.remove("is-pinned");
        clearFeatureAccessibility();
        gsap.set(featureTrack, { clearProps: "transform" });
        featureSlides.forEach((slide) => {
          slide.style.removeProperty("width");
          slide.style.removeProperty("flex-basis");
        });
        gsap.set(featureSlides.flatMap((slide) => [
          slide.querySelector(".vpr-feature__visual"),
          slide.querySelector(".vpr-feature__copy")
        ]), { clearProps: "transform,opacity,visibility,clipPath" });
      };
    });

    gsap.fromTo(".vpr-catalog__heading > *", { y: 26, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.62,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vpr-catalog", start: "top 78%", once: true }
    });
    gsap.fromTo(".vpr-filters button", { y: 12, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.42,
      stagger: 0.06,
      ease: "power2.out",
      scrollTrigger: { trigger: ".vpr-filters", start: "top 86%", once: true }
    });
    gsap.fromTo(".vpr-product__visual", { clipPath: "inset(0 0 100% 0)", scale: 1.04 }, {
      clipPath: "inset(0 0 0 0)",
      scale: 1,
      duration: 0.78,
      stagger: 0.05,
      ease: "power2.inOut",
      scrollTrigger: { trigger: ".vpr-products", start: "top 76%", once: true }
    });
    root.querySelectorAll(".vpr-product__visual > img").forEach((image) => {
      gsap.fromTo(image, { "--vpr-photo-scale": 1.12 }, {
        "--vpr-photo-scale": 1,
        ease: "none",
        scrollTrigger: {
          trigger: image,
          start: "top 90%",
          end: "center 55%",
          scrub: true
        }
      });
    });
    gsap.fromTo(".vpr-product__copy", { y: 24, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.56,
      stagger: 0.06,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vpr-products", start: "top 76%", once: true }
    });

    gsap.fromTo(".vpr-cta h2", { clipPath: "inset(0 0 100% 0)", y: 20 }, {
      clipPath: "inset(0 0 0 0)",
      y: 0,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vpr-cta", start: "top 78%", once: true }
    });
    gsap.fromTo(".vpr-cta__actions", { y: 25, autoAlpha: 0 }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.6,
      delay: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: ".vpr-cta", start: "top 78%", once: true }
    });

    window.addEventListener("pagehide", () => featureMedia.revert(), { once: true });
  }, root);

  const refreshScrollTriggers = () => {
    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  document.addEventListener("vs:components-loaded", refreshScrollTriggers);
  window.addEventListener("load", refreshScrollTriggers, { once: true });
  window.addEventListener("pagehide", () => {
    document.removeEventListener("vs:components-loaded", refreshScrollTriggers);
    animationContext.revert();
  }, { once: true });
})();
