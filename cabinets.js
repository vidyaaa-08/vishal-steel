(() => {
  const root = document.querySelector(".vs-page--cabinets");
  if (!root) {
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const images = Array.from(root.querySelectorAll("img[data-image-src]"));
  let refreshFrame = 0;
  let imageObserver;

  function scheduleRefresh() {
    if (!ScrollTrigger || refreshFrame) {
      return;
    }

    refreshFrame = window.requestAnimationFrame(() => {
      refreshFrame = 0;
      ScrollTrigger.refresh();
    });
  }

  function loadImage(image, observer) {
    const source = (image.dataset.imageSrc || "").trim();
    const sourceSet = (image.dataset.imageSrcset || "").trim();
    image.style.removeProperty("opacity");
    image.style.removeProperty("width");
    image.style.removeProperty("height");

    if (!source) {
      image.dataset.imageState = "placeholder";
      if (observer) {
        observer.unobserve(image);
      }
      return;
    }

    if (image.dataset.imageState) {
      return;
    }

    image.dataset.imageState = "loading";
    image.loading = image.closest(".cabinets-slider__frame--main") ? "eager" : "lazy";
    image.decoding = "async";
    if (sourceSet) {
      image.srcset = sourceSet;
    }

    image.addEventListener("load", () => {
      image.dataset.imageState = "loaded";
      const afterDecode = () => {
        scheduleRefresh();
        enableImageTilt(image);
      };
      if (typeof image.decode === "function") {
        image.decode().then(afterDecode).catch((error) => {
          console.warn("Cabinet image could not be decoded.", source, error);
          afterDecode();
        });
      } else {
        afterDecode();
      }
    }, { once: true });

    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.removeAttribute("srcset");
      image.dataset.imageState = "error";
      console.warn("Cabinet image is unavailable; check data-image-src:", source);
      scheduleRefresh();
    }, { once: true });

    image.src = source;
    if (observer) {
      observer.unobserve(image);
    }
  }

  function enableImageTilt(image) {
    if (!gsap || reducedMotion || image.dataset.tiltReady ||
        !window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const frame = image.closest(".cabinets-solution__image, .cabinets-product-details__image");
    if (!frame) {
      return;
    }

    image.dataset.tiltReady = "true";
    const rotateX = gsap.quickTo(frame, "rotationX", { duration: .55, ease: "power3.out" });
    const rotateY = gsap.quickTo(frame, "rotationY", { duration: .55, ease: "power3.out" });
    const onMove = (event) => {
      const bounds = frame.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      rotateX(y * -3);
      rotateY(x * 4);
    };
    const onLeave = () => {
      rotateX(0);
      rotateY(0);
    };

    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerleave", onLeave);
    frame._cabinetTiltCleanup = () => {
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
      delete frame._cabinetTiltCleanup;
    };
  }

  images.forEach((image) => {
    image.style.removeProperty("opacity");
    image.style.removeProperty("width");
    image.style.removeProperty("height");
  });

  if ("IntersectionObserver" in window) {
    imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage(entry.target, observer);
        }
      });
    }, { rootMargin: "700px 0px" });

    images.forEach((image) => {
      const slide = image.closest("[data-cabinet-slide]");
      if (slide) {
        if (slide.classList.contains("is-active")) {
          loadImage(image, imageObserver);
        }
      } else {
        imageObserver.observe(image);
      }
    });
  } else {
    images.forEach((image) => {
      const slide = image.closest("[data-cabinet-slide]");
      if (!slide || slide.classList.contains("is-active")) {
        loadImage(image, null);
      }
    });
  }

  const slider = root.querySelector("[data-cabinet-slider]");
  const slides = slider ? Array.from(slider.querySelectorAll("[data-cabinet-slide]")) : [];
  const indicators = slider ? Array.from(slider.querySelectorAll("[data-cabinet-slide-to]")) : [];
  const progress = slider ? slider.querySelector(".cabinets-slider__progress") : null;
  const progressFill = slider ? slider.querySelector("[data-cabinet-progress-fill]") : null;
  let activeSlide = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let sliderTimeline;
  let transitioning = false;

  function showSlide(index, animate) {
    if (!slides.length || index === activeSlide || transitioning) {
      return;
    }

    const nextIndex = (index + slides.length) % slides.length;
    const previousSlide = slides[activeSlide];
    const nextSlide = slides[nextIndex];
    const nextImages = nextSlide.querySelectorAll("img[data-image-src]");
    nextImages.forEach((image) => loadImage(image, imageObserver));

    activeSlide = nextIndex;
    indicators.forEach((indicator, indicatorIndex) => {
      indicator.setAttribute("aria-current", indicatorIndex === activeSlide ? "true" : "false");
    });
    const progressValue = Math.round(((activeSlide + 1) / slides.length) * 100);
    if (progress) {
      progress.setAttribute("aria-valuenow", String(progressValue));
    }
    if (progressFill) {
      progressFill.style.width = `${progressValue}%`;
    }

    nextSlide.classList.add("is-active");
    nextSlide.removeAttribute("inert");
    nextSlide.setAttribute("aria-hidden", "false");
    previousSlide.setAttribute("aria-hidden", "true");
    previousSlide.setAttribute("inert", "");

    if (!animate || !gsap || reducedMotion) {
      previousSlide.classList.remove("is-active");
      return;
    }

    transitioning = true;
    gsap.set(nextSlide, { autoAlpha: 1, xPercent: 7, zIndex: 2 });
    gsap.set(previousSlide, { autoAlpha: 1, xPercent: 0, zIndex: 1 });
    const nextFrames = nextSlide.querySelectorAll(".cabinets-slider__frame");
    sliderTimeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete() {
        previousSlide.classList.remove("is-active");
        gsap.set(previousSlide, { clearProps: "opacity,visibility,transform,zIndex" });
        gsap.set(nextSlide, { clearProps: "transform" });
        transitioning = false;
      }
    })
      .to(nextSlide, { xPercent: 0, duration: .78 }, 0)
      .fromTo(nextFrames, { clipPath: "inset(0 100% 0 0)", scale: .96 }, {
        clipPath: "inset(0 0 0 0)",
        scale: 1,
        duration: .9,
        stagger: .08
      }, 0)
      .fromTo(nextSlide.querySelector(".cabinets-slider__meta"), {
        y: 14,
        autoAlpha: 0
      }, {
        y: 0,
        autoAlpha: 1,
        duration: .45,
        clearProps: "transform,opacity,visibility"
      }, .3)
      .to(previousSlide, { xPercent: -4, autoAlpha: 0, duration: .6 }, 0);
  }

  if (slider && slides.length > 1) {
    const previousButton = slider.querySelector("[data-cabinet-previous]");
    const nextButton = slider.querySelector("[data-cabinet-next]");
    const indicatorHandlers = [];
    const previousHandler = () => showSlide(activeSlide - 1, true);
    const nextHandler = () => showSlide(activeSlide + 1, true);
    previousButton.addEventListener("click", previousHandler);
    nextButton.addEventListener("click", nextHandler);
    indicators.forEach((indicator) => {
      const handler = () => {
        showSlide(Number(indicator.dataset.cabinetSlideTo), true);
      };
      indicator.addEventListener("click", handler);
      indicatorHandlers.push([indicator, handler]);
    });

    if (gsap && !reducedMotion &&
        window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) {
      const frames = Array.from(slider.querySelectorAll(".cabinets-slider__frame"));
      const moveX = frames.map((frame) => gsap.quickTo(frame, "x", { duration: .7, ease: "power3.out" }));
      const moveY = frames.map((frame) => gsap.quickTo(frame, "y", { duration: .7, ease: "power3.out" }));
      const onPointerMove = (event) => {
        const bounds = slider.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        frames.forEach((frame, frameIndex) => {
          const factor = frame.classList.contains("cabinets-slider__frame--main") ? 8 : -5;
          moveX[frameIndex](x * factor);
          moveY[frameIndex](y * factor);
        });
      };
      const onPointerLeave = () => {
        frames.forEach((frame, frameIndex) => {
          moveX[frameIndex](0);
          moveY[frameIndex](0);
        });
      };
      slider.addEventListener("pointermove", onPointerMove);
      slider.addEventListener("pointerleave", onPointerLeave);
      slider._cabinetParallaxCleanup = () => {
        slider.removeEventListener("pointermove", onPointerMove);
        slider.removeEventListener("pointerleave", onPointerLeave);
        delete slider._cabinetParallaxCleanup;
      };
    }

    slider._cabinetSliderCleanup = () => {
      previousButton.removeEventListener("click", previousHandler);
      nextButton.removeEventListener("click", nextHandler);
      indicatorHandlers.forEach(([indicator, handler]) => {
        indicator.removeEventListener("click", handler);
      });
      if (slider._cabinetParallaxCleanup) {
        slider._cabinetParallaxCleanup();
      }
      if (sliderTimeline) {
        sliderTimeline.kill();
      }
    };
  }

  const accordionItems = Array.from(root.querySelectorAll(".cabinets-accordion__item"));
  const setAccordionState = (item, open, animate) => {
    const content = item.querySelector(".cabinets-accordion__content");
    if (!content) {
      item.open = open;
      return;
    }

    if (!gsap || reducedMotion || !animate) {
      item.open = open;
      if (gsap) {
        gsap.set(content, { clearProps: "height,opacity,overflow" });
      }
      return;
    }

    gsap.killTweensOf(content);
    if (open) {
      item.open = true;
      gsap.fromTo(content, { height: 0, opacity: 0, overflow: "hidden" }, {
        height: "auto",
        opacity: 1,
        duration: .34,
        ease: "power2.out",
        clearProps: "height,opacity,overflow"
      });
    } else if (item.open) {
      gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: .24,
        ease: "power1.inOut",
        onComplete() {
          item.open = false;
          gsap.set(content, { clearProps: "height,opacity,overflow" });
        }
      });
    }
  };

  accordionItems.forEach((item) => {
    const summary = item.querySelector("summary");
    if (!summary) {
      return;
    }
    summary.addEventListener("click", (event) => {
      event.preventDefault();
      const shouldOpen = !item.open;
      accordionItems.forEach((other) => {
        if (other !== item && other.open) {
          setAccordionState(other, false, false);
        }
      });
      setAccordionState(item, shouldOpen, true);
    });
  });

  const typingPhrases = [
    "Industrial cabins",
    "medical cabinetsa",
    "tool cabinet",
    "security cabinets",
    "display office cabinets",
    "medical cabinet",
    "shoe cabinet",
    "file cabinet",
    "laboratory cabinet",
    "Storage cabinet",
    "Wardrobe cabinet"
  ];
  const typingElement = root.querySelector(".cabinets-typing-text");
  let typingTimer = 0;

  if (typingElement && reducedMotion) {
    typingElement.textContent = typingPhrases[0];
  } else if (typingElement) {
    let phraseIndex = 0;
    let charIndex = 0;
    const type = () => {
      const phrase = typingPhrases[phraseIndex];
      if (charIndex < phrase.length) {
        typingElement.textContent += phrase[charIndex];
        charIndex += 1;
        typingTimer = window.setTimeout(type, 80);
      } else {
        typingTimer = window.setTimeout(erase, 1500);
      }
    };
    const erase = () => {
      if (charIndex > 0) {
        charIndex -= 1;
        typingElement.textContent = typingPhrases[phraseIndex].slice(0, charIndex);
        typingTimer = window.setTimeout(erase, 50);
      } else {
        phraseIndex = (phraseIndex + 1) % typingPhrases.length;
        typingTimer = window.setTimeout(type, 80);
      }
    };
    type();
  }

  let animationContext;
  if (gsap && ScrollTrigger && !reducedMotion) {
    gsap.registerPlugin(ScrollTrigger);
    animationContext = gsap.context(() => {
      const hero = root.querySelector(".cabinets-hero");
      const heroTitleLines = root.querySelectorAll("[data-cabinet-title-line]");
      const heroEyebrow = root.querySelector(".cabinets-hero__eyebrow");
      const heroSupporting = root.querySelector(".cabinets-hero__supporting");
      const heroIntro = root.querySelector(".cabinets-hero__intro");
      const heroType = root.querySelector(".cabinets-hero__typing");
      const activeHeroSlide = root.querySelector(".cabinets-slider__slide.is-active");
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(heroEyebrow, { y: 12, autoAlpha: 0 }, {
          y: 0,
          autoAlpha: 1,
          duration: .5
        })
        .fromTo(heroTitleLines, { yPercent: 62, clipPath: "inset(0 0 100% 0)", autoAlpha: 0 }, {
          yPercent: 0,
          clipPath: "inset(0 0 0 0)",
          autoAlpha: 1,
          duration: .86,
          stagger: .12
        }, .08)
        .fromTo([heroSupporting, heroIntro, heroType], { y: 16, autoAlpha: 0 }, {
          y: 0,
          autoAlpha: 1,
          duration: .5,
          stagger: .09
        }, .42);

      if (activeHeroSlide) {
        gsap.fromTo(activeHeroSlide.querySelectorAll(".cabinets-slider__frame"), {
          clipPath: "inset(0 100% 0 0)",
          scale: 1.04
        }, {
          clipPath: "inset(0 0 0 0)",
          scale: 1,
          duration: 1.05,
          stagger: .1,
          ease: "power3.inOut",
          delay: .12
        });
      }

      gsap.to(".cabinets-slider__stage", {
        yPercent: 4,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: .6,
          invalidateOnRefresh: true
        }
      });

      root.querySelectorAll(".cabinets-solution__copy").forEach((copy, index) => {
        const direction = index === 1 ? -24 : 24;
        gsap.fromTo(copy.children, { x: direction, autoAlpha: 0 }, {
          x: 0,
          autoAlpha: 1,
          duration: .62,
          stagger: .1,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: {
            trigger: copy,
            start: "top 82%",
            once: true
          }
        });
      });

      root.querySelectorAll("[data-vsl-reveal]").forEach((element, index) => {
        if (element.classList.contains("cabinets-category") ||
            element.classList.contains("cabinets-solution__copy") ||
            element.closest(".cabinets-premium .vsl-section-heading")) {
          return;
        }
        const direction = element.dataset.vslReveal;
        const horizontalMotion = window.matchMedia("(min-width: 901px)").matches;
        const from = horizontalMotion && direction === "left" ? { x: -30 } :
          horizontalMotion && direction === "right" ? { x: 30 } : { y: 28 };
        gsap.fromTo(element, { ...from, autoAlpha: 0 }, {
          x: 0,
          y: 0,
          autoAlpha: 1,
          duration: .72,
          delay: (index % 2) * .05,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true
          }
        });
      });

      root.querySelectorAll(".cabinets-solution__image, .cabinets-product-details__image, .cabinets-description__image, .cabinets-gallery__item").forEach((frame, index) => {
        const image = frame.querySelector("img");
        const directions = [
          "inset(0 100% 0 0)",
          "inset(100% 0 0 0)",
          "inset(0 0 0 100%)",
          "inset(50% 50% 50% 50%)"
        ];
        gsap.fromTo(frame, { clipPath: directions[index % directions.length] }, {
          clipPath: "inset(0 0 0 0)",
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: frame,
            start: "top 88%",
            end: "top 48%",
            scrub: index < 3 ? .45 : .3,
            invalidateOnRefresh: true
          }
        });
        if (image) {
          gsap.fromTo(image, { scale: 1.13, yPercent: index % 2 ? 3 : -2 }, {
            scale: 1,
            yPercent: 0,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: frame,
              start: "top 90%",
              end: "bottom 20%",
              scrub: .55,
              invalidateOnRefresh: true
            }
          });
        }
      });

      gsap.fromTo(".cabinets-category", {
        y: 34,
        clipPath: "inset(0 0 12% 0)",
        autoAlpha: 0
      }, {
        y: 0,
        clipPath: "inset(0 0 0 0)",
        autoAlpha: 1,
        duration: .68,
        stagger: .08,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility,clipPath",
        scrollTrigger: {
          trigger: ".cabinets-premium__grid",
          start: "top 82%",
          once: true
        }
      });

      const premiumHeading = root.querySelector(".cabinets-premium .vsl-section-heading");
      if (premiumHeading) {
        gsap.fromTo(premiumHeading.children, { y: 24, autoAlpha: 0 }, {
          y: 0,
          autoAlpha: 1,
          duration: .6,
          stagger: .1,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: {
            trigger: premiumHeading,
            start: "top 84%",
            once: true
          }
        });
      }

      root.querySelectorAll(".cabinets-category__list").forEach((list) => {
        gsap.fromTo(list.children, { x: 10, autoAlpha: 0 }, {
          x: 0,
          autoAlpha: 1,
          duration: .36,
          stagger: .055,
          ease: "power2.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: {
            trigger: list.closest(".cabinets-category"),
            start: "top 76%",
            once: true
          }
        });
      });

      gsap.fromTo(".cabinets-specs li", { x: 18, autoAlpha: 0 }, {
        x: 0,
        autoAlpha: 1,
        duration: .5,
        stagger: .07,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility",
        scrollTrigger: {
          trigger: ".cabinets-specs",
          start: "top 82%",
          once: true
        }
      });
    }, root);
  }

  function refreshTriggers() {
    scheduleRefresh();
  }

  document.addEventListener("vs:components-loaded", refreshTriggers);
  window.addEventListener("load", refreshTriggers, { once: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshTriggers).catch((error) => {
      console.error("Cabinet page fonts could not be loaded.", error);
      refreshTriggers();
    });
  }

  window.addEventListener("pagehide", () => {
    window.clearTimeout(typingTimer);
    if (imageObserver) {
      imageObserver.disconnect();
    }
    root.querySelectorAll("[data-tilt-ready]").forEach((image) => {
      const frame = image.closest(".cabinets-solution__image, .cabinets-product-details__image");
      if (frame && frame._cabinetTiltCleanup) {
        frame._cabinetTiltCleanup();
      }
    });
    if (slider && slider._cabinetSliderCleanup) {
      slider._cabinetSliderCleanup();
    }
    document.removeEventListener("vs:components-loaded", refreshTriggers);
    if (animationContext) {
      animationContext.revert();
    }
  }, { once: true });
})();
