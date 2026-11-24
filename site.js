(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = Array.from(document.querySelectorAll("[data-reveal]"));

  function initializeCssReveals() {
    if (!("IntersectionObserver" in window)) {
      reveals.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -35px 0px" });

    reveals.forEach((element) => observer.observe(element));
  }

  function initializeCounters() {
    const counters = Array.from(document.querySelectorAll("[data-count]"));
    counters.forEach((counter) => {
      const target = Number(counter.dataset.count);
      if (!Number.isFinite(target)) {
        throw new Error("A statistic counter has an invalid numeric value.");
      }

      const renderValue = (value) => {
        counter.textContent = `${Math.round(value)}+`;
      };

      if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
        renderValue(target);
        return;
      }

      gsap.fromTo(counter, { textContent: 0 }, {
        textContent: target,
        duration: 1.3,
        ease: "power2.out",
        snap: { textContent: 1 },
        onUpdate() {
          renderValue(Number(counter.textContent));
        },
        scrollTrigger: { trigger: counter, start: "top 90%", once: true }
      });
    });
  }

  function initializeNearViewportImageLoading() {
    if (!document.body.classList.contains("vs-page--home") || !("IntersectionObserver" in window)) {
      return;
    }

    const images = Array.from(document.querySelectorAll('img[loading="lazy"]'));
    if (!images.length) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const image = entry.target;
        if (!image.complete) {
          image.loading = "eager";
        }
        observer.unobserve(image);
      });
    }, { rootMargin: "800px 0px" });

    images.forEach((image) => observer.observe(image));
  }

  function initializeHomepageImageAnimations() {
    if (!document.body.classList.contains("vs-page--home")) {
      return;
    }

    const hero = document.querySelector(".vs-hero");
    const heroImage = hero && hero.querySelector(".vs-media-image");
    if (!hero || !heroImage) {
      return;
    }

    const whenImageReady = (image, callback) => {
      if (!image) {
        return () => {};
      }

      let canceled = false;
      let initializing = false;
      let animationContext = null;
      const listeners = [];

      const removeListeners = () => {
        listeners.forEach(({ image, event, listener }) => {
          image.removeEventListener(event, listener);
        });
        listeners.length = 0;
      };

      const initialize = () => {
        if (canceled || initializing || !image.complete) {
          return;
        }

        if (image.naturalWidth === 0) {
          removeListeners();
          console.error("Homepage image could not be loaded for animation.", image.currentSrc || image.src);
          return;
        }

        initializing = true;
        removeListeners();
        const imageSource = image.currentSrc || image.src;
        const decoded = typeof image.decode === "function"
          ? image.decode().catch((error) => {
            if ((image.currentSrc || image.src) === imageSource) {
              console.error("Homepage image could not be decoded; continuing without animation.", imageSource, error);
            }
          })
          : Promise.resolve();
        decoded.then(() => {
          if (!canceled) {
            animationContext = gsap.context(callback);
          }
        }).catch((error) => {
          if (!canceled) {
            console.error("Homepage image animation initialization failed.", image.currentSrc || image.src, error);
          }
        });
      };

      ["load", "error"].forEach((event) => {
        image.addEventListener(event, initialize);
        listeners.push({ image, event, listener: initialize });
      });
      initialize();

      return () => {
        canceled = true;
        removeListeners();
        if (animationContext) {
          animationContext.revert();
        }
      };
    };

    const media = gsap.matchMedia();
    const clearImageAnimationStates = () => {
      document.querySelectorAll(".vs-image-animating").forEach((image) => {
        image.classList.remove("vs-image-animating");
      });
    };
    const revealHero = () => {
      whenImageReady(heroImage, () => {
        gsap.fromTo(heroImage, {
          scale: 1.12,
          clipPath: "inset(8% 6% 8% 6%)",
          opacity: 1
        }, {
          scale: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          immediateRender: false,
          onStart() {
            heroImage.classList.add("vs-image-animating");
          },
          onComplete() {
            heroImage.classList.remove("vs-image-animating");
          }
        });
      });
    };
    const loader = document.querySelector("#vs-loader");
    if (loader && !loader.classList.contains("is-hidden")) {
      const loaderObserver = new MutationObserver(() => {
        if (!loader.isConnected || loader.classList.contains("is-hidden")) {
          loaderObserver.disconnect();
          revealHero();
        }
      });
      loaderObserver.observe(loader, { attributes: true, attributeFilter: ["class"] });
    } else {
      revealHero();
    }

    const revealImage = (image, trigger, from, isMobile, start, end) => {
      return whenImageReady(image, () => {
        const scrollTrigger = {
          trigger: trigger || image,
          start: start || "top 88%",
          end: end || "top 58%",
          scrub: isMobile ? 0.3 : 0.45,
          invalidateOnRefresh: true,
          onToggle(self) {
            image.classList.toggle("vs-image-animating", self.isActive);
          }
        };

        gsap.fromTo(image, {
          scale: 1.12,
          x: 0,
          y: 0,
          rotationY: 0,
          opacity: 1,
          clipPath: "inset(0 0 0 0)",
          ...from
        }, {
          scale: 1,
          x: 0,
          y: 0,
          rotationY: 0,
          opacity: 1,
          clipPath: "inset(0 0 0 0)",
          ease: "none",
          immediateRender: false,
          scrollTrigger
        });
      });
    };

    const animateImageSections = (isMobile) => {
      const cleanups = [];
      cleanups.push(whenImageReady(heroImage, () => {
        gsap.to(heroImage, {
          yPercent: isMobile ? 3 : 9,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: isMobile ? 0.4 : 0.8,
            invalidateOnRefresh: true
          }
        });
      }));

      const showcaseItems = Array.from(document.querySelectorAll(".vs-showcase__item"));
      const showcaseEntrances = [
        { clipPath: "inset(0 100% 0 0)", x: -68 },
        { clipPath: "inset(100% 0 0 0)", y: 58 },
        { clipPath: "inset(50% 50% 50% 50%)" }
      ];
      showcaseItems.forEach((item, index) => {
        const image = item.querySelector(".vs-media-image");
        if (image) {
          cleanups.push(revealImage(image, item, showcaseEntrances[index], isMobile,
            `top ${88 - index * 3}%`, "top 58%"));
        }
      });

      const furniture = document.querySelector(".vs-solution--furniture");
      const furnitureImage = furniture && furniture.querySelector(".vs-media-image");
      if (furnitureImage) {
        cleanups.push(revealImage(furnitureImage, furniture, {
          clipPath: "inset(0 100% 0 0)",
          x: isMobile ? -22 : -44
        }, isMobile));
      }

      const laboratory = document.querySelector(".vs-solution--laboratory");
      const laboratoryImage = laboratory && laboratory.querySelector(".vs-media-image");
      if (laboratoryImage) {
        cleanups.push(revealImage(laboratoryImage, laboratory, {
          clipPath: "inset(100% 0 0 0)",
          y: isMobile ? 26 : 44
        }, isMobile));
      }

      const industrial = document.querySelector(".vs-solution--industrial");
      const industrialImage = industrial && industrial.querySelector(".vs-media-image");
      if (industrialImage) {
        const industrialImageEntrance = isMobile
          ? {
            clipPath: "inset(0 0 0 100%)",
            x: 34,
            rotationY: -7
          }
          : {
            clipPath: "inset(8% 10% 8% 0)",
            x: 24,
            rotationY: -5
          };
        cleanups.push(revealImage(industrialImage, industrial, industrialImageEntrance, isMobile));
      }

      const intro = document.querySelector(".vs-intro");
      const introImage = intro && intro.querySelector(".vs-intro__media .vs-media-image");
      if (introImage) {
        cleanups.push(revealImage(introImage, intro, {
          clipPath: "inset(100% 0 0 0)",
          y: 32
        }, isMobile, "top 88%", "top 58%"));
        if (!isMobile) {
          cleanups.push(whenImageReady(introImage, () => {
            gsap.fromTo(introImage, { yPercent: -8 }, {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: intro,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
                invalidateOnRefresh: true
              }
            });
          }));
        }
      }

      const serviceGrid = document.querySelector(".vs-service-grid");
      const serviceImages = serviceGrid
        ? Array.from(serviceGrid.querySelectorAll(".vs-media-image"))
        : [];
      serviceImages.forEach((image, index) => {
        const fromLeft = index % 2 === 0;
        cleanups.push(revealImage(image, image.parentElement, {
          clipPath: fromLeft ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
          x: fromLeft ? -26 : 26
        }, isMobile, `top ${88 - (index % 3) * 3}%`, "top 58%"));
      });

      const whyWarehouse = document.querySelector(".vs-why-warehouse");
      const whyWarehouseImage = whyWarehouse && whyWarehouse.querySelector(".vs-media-image");
      const whyWarehousePicture = whyWarehouse && whyWarehouse.querySelector("picture");
      if (whyWarehouse && whyWarehouseImage && whyWarehousePicture) {
        cleanups.push(revealImage(whyWarehouseImage, whyWarehouse, {
          clipPath: "inset(0 0 100% 0)",
          y: 24
        }, isMobile, "top 90%", "top 54%"));
        gsap.to(whyWarehousePicture, {
          yPercent: isMobile ? -2 : -5,
          ease: "none",
          scrollTrigger: {
            trigger: whyWarehouse,
            start: "top bottom",
            end: "bottom top",
            scrub: isMobile ? 0.35 : 0.7,
            invalidateOnRefresh: true
          }
        });
      }

      const gallery = document.querySelector(".vs-projects__gallery");
      const projectImages = gallery
        ? Array.from(gallery.querySelectorAll(".vs-media-image"))
        : [];
      projectImages.forEach((image, index) => {
        const fromLeft = index % 2 === 0;
        cleanups.push(revealImage(image, image.closest(".vs-projects__item"), {
          clipPath: fromLeft ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
          x: fromLeft ? -28 : 28
        }, isMobile, `top ${88 - (index % 2) * 4}%`, "top 58%"));
      });

      const warehouseItem = gallery && gallery.querySelector(".vs-projects__item--warehouse");
      const warehousePicture = warehouseItem && warehouseItem.querySelector("picture");
      if (warehouseItem && warehousePicture) {
        gsap.to(warehousePicture, {
          yPercent: isMobile ? -2 : -5,
          ease: "none",
          scrollTrigger: {
            trigger: warehouseItem,
            start: "top bottom",
            end: "bottom top",
            scrub: isMobile ? 0.35 : 0.7,
            invalidateOnRefresh: true
          }
        });
      }

      return () => cleanups.forEach((cleanup) => cleanup());
    };

    media.add("(min-width: 901px)", () => {
      const cleanups = [animateImageSections(false)];

      return () => {
        cleanups.forEach((cleanup) => cleanup());
        clearImageAnimationStates();
      };
    });

    media.add("(max-width: 900px)", () => {
      const cleanups = [animateImageSections(true)];
      return () => {
        cleanups.forEach((cleanup) => cleanup());
        clearImageAnimationStates();
      };
    });

    const mouseMedia = gsap.matchMedia();
    mouseMedia.add("(min-width: 901px) and (hover: hover) and (pointer: fine)", () => {
      const targets = Array.from(document.querySelectorAll(
        ".vs-intro__media"
      ));
      const cleanups = [];

      targets.forEach((target) => {
        const images = Array.from(target.querySelectorAll(".vs-media-image"));
        cleanups.push(whenImageReady(images[0], () => {
          gsap.set(target, { transformPerspective: 1000, transformOrigin: "center center" });
          const rotateX = gsap.quickTo(target, "rotationX", { duration: 0.55, ease: "power3.out" });
          const rotateY = gsap.quickTo(target, "rotationY", { duration: 0.55, ease: "power3.out" });
          const onMove = (event) => {
            const bounds = target.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            target.classList.add("vs-image-animating");
            rotateX(y * -2.2);
            rotateY(x * 2.2);
          };
          const onLeave = () => {
            rotateX(0);
            rotateY(0);
            target.classList.remove("vs-image-animating");
          };

          target.addEventListener("pointermove", onMove);
          target.addEventListener("pointerleave", onLeave);
          cleanups.push(() => {
            target.removeEventListener("pointermove", onMove);
            target.removeEventListener("pointerleave", onLeave);
            target.classList.remove("vs-image-animating");
          });
        }));
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    });
  }

  function refreshScrollTriggersOnImageLoad() {
    if (!document.body.classList.contains("vs-page--home")) {
      return;
    }

    let refreshFrame = 0;
    const scheduleRefresh = () => {
      if (refreshFrame || !window.ScrollTrigger) {
        return;
      }
      refreshFrame = window.requestAnimationFrame(() => {
        refreshFrame = 0;
        window.ScrollTrigger.refresh();
      });
    };

    const handleImageLoad = (event) => {
      if (!(event.target instanceof HTMLImageElement)) {
        return;
      }

      const image = event.target;
      if (event.type === "load" && typeof image.decode === "function") {
        const imageSource = image.currentSrc || image.src;
        image.decode().then(scheduleRefresh).catch((error) => {
          if ((image.currentSrc || image.src) === imageSource) {
            console.error("Loaded homepage image could not be decoded.", imageSource, error);
          }
          scheduleRefresh();
        });
        return;
      }
      scheduleRefresh();
    };

    document.addEventListener("load", handleImageLoad, true);
    document.addEventListener("error", handleImageLoad, true);
    document.addEventListener("vs:components-loaded", scheduleRefresh);
    window.addEventListener("load", scheduleRefresh, { once: true });

    const main = document.querySelector(".vs-page main");
    if (main && "MutationObserver" in window) {
      const contentObserver = new MutationObserver((records) => {
        const layoutChanged = records.some((record) => {
          const target = record.target instanceof Element
            ? record.target
            : record.target.parentElement;
          return target && !target.closest("[data-count]");
        });
        if (layoutChanged) {
          scheduleRefresh();
        }
      });
      contentObserver.observe(main, { childList: true, subtree: true });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleRefresh).catch((error) => {
        console.error("Homepage fonts could not be loaded.", error);
        scheduleRefresh();
      });
    }
  }

  function initializeGsapAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    const revealProperties = {
      rise: { y: 34 },
      "slide-left": { x: -20 },
      "slide-right": { x: 20 },
      "clip-left": { clipPath: "inset(0 100% 0 0)" },
      "clip-right": { clipPath: "inset(0 0 0 100%)" },
      "clip-bottom": { clipPath: "inset(100% 0 0 0)" },
      words: { y: 24 },
      lines: { y: 28 }
    };

    reveals.forEach((element) => {
      const effect = element.dataset.reveal;
      const from = revealProperties[effect] || { y: 24 };
      gsap.fromTo(element, { ...from, autoAlpha: 0 }, {
        x: 0,
        y: 0,
        clipPath: "inset(0 0 0 0)",
        autoAlpha: 1,
        duration: effect.indexOf("clip-") === 0 ? 1.1 : 0.85,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: { trigger: element, start: "top 88%", once: true }
      });
    });

    const heroContent = document.querySelector(".vs-hero__content, .vs-about-hero__copy");
    if (heroContent) {
      gsap.fromTo(heroContent, { y: 25, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 1.05,
        delay: 0.15,
        ease: "power3.out"
      });
    }

  }

  function initializeFaq() {
    document.querySelectorAll(".vs-faq__list").forEach((list) => {
      list.addEventListener("toggle", (event) => {
        const opened = event.target;
        if (!(opened instanceof HTMLDetailsElement) || !opened.open) {
          return;
        }
        list.querySelectorAll("details[open]").forEach((item) => {
          if (item !== opened) {
            item.open = false;
          }
        });
      }, true);
    });
  }

  function splitJourneyWords(element) {
    if (element.dataset.wordsSplit === "true") {
      return Array.from(element.querySelectorAll(".vs-journey__word"));
    }

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      const tokens = textNode.nodeValue.match(/\s+|[^\s]+/g) || [];
      tokens.forEach((token) => {
        if (/^\s+$/.test(token)) {
          fragment.appendChild(document.createTextNode(token));
          return;
        }

        const mask = document.createElement("span");
        mask.className = "vs-journey__word-mask";
        const word = document.createElement("span");
        word.className = "vs-journey__word";
        word.textContent = token;
        mask.appendChild(word);
        fragment.appendChild(mask);
      });
      textNode.parentNode.replaceChild(fragment, textNode);
    });

    element.dataset.wordsSplit = "true";
    return Array.from(element.querySelectorAll(".vs-journey__word"));
  }

  function initializeJourneyAnimations() {
    const journey = document.querySelector(".vs-journey");
    if (!journey) {
      return;
    }

    const track = journey.querySelector("[data-journey-track]");
    const stage = journey.querySelector("[data-journey-stage]");
    const progress = journey.querySelector("[data-journey-progress]");
    const progressFill = journey.querySelector("[data-journey-progress-fill]");
    const panels = Array.from(journey.querySelectorAll(".vs-journey__panel"));
    if (!track || !stage || !progress || !progressFill || panels.length !== 3) {
      throw new Error("The company journey section is missing required timeline elements.");
    }

    const wordsByPanel = panels.map((panel) => [
      ...splitJourneyWords(panel.querySelector("h3")),
      ...splitJourneyWords(panel.querySelector(".vs-journey__description"))
    ]);
    const progressMedia = gsap.matchMedia();
    const setProgress = (value) => progress.setAttribute("aria-valuenow", String(Math.round(value * 100)));
    const setActivePanel = (index) => {
      panels.forEach((panel, panelIndex) => {
        const active = panelIndex === index;
        panel.setAttribute("aria-hidden", String(!active));
        panel.inert = !active;
      });
    };
    const clearPanelAccessibility = () => {
      panels.forEach((panel) => {
        panel.removeAttribute("aria-hidden");
        panel.inert = false;
      });
    };

    progressMedia.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      journey.classList.add("is-pinned");
      gsap.set(track, { x: 0 });
      gsap.set(progressFill, { scaleX: 0 });
      setProgress(0);
      setActivePanel(0);

      const horizontalDistance = () => Math.max(0, track.scrollWidth - stage.clientWidth);
      const headingParts = journey.querySelectorAll(
        ".vs-journey__heading .vs-eyebrow, .vs-journey__heading h2, .vs-journey__subtitle"
      );
      gsap.fromTo(headingParts, { y: 20, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
        scrollTrigger: {
          trigger: journey,
          start: "top 84%",
          once: true
        }
      });

      const yearEntrances = [
        null,
        { scale: 1.16, clipPath: "inset(100% 0 0 0)" },
        { scale: 0.82, clipPath: "inset(0 0 0 100%)" }
      ];
      const copyEntrances = [null, { y: 44 }, { x: 48 }];
      const updateJourneyState = (fallbackProgress = 0) => {
        const distance = horizontalDistance();
        const translatedDistance = Math.min(distance, Math.abs(Number(gsap.getProperty(track, "x")) || 0));
        const progressValue = distance ? translatedDistance / distance : fallbackProgress;
        setProgress(progressValue);
        gsap.set(progressFill, { scaleX: progressValue });
        setActivePanel(Math.min(panels.length - 1, Math.floor((translatedDistance + stage.clientWidth / 2) / stage.clientWidth)));
      };

      panels.slice(1).forEach((panel, offset) => {
        const index = offset + 1;
        const year = panel.querySelector(".vs-journey__year");
        const copy = panel.querySelector(".vs-journey__copy");
        const visual = panel.querySelector(".vs-journey__visual");
        const yearMask = year.parentElement;
        gsap.set(yearMask, { clipPath: "inset(0 100% 0 0)" });
        gsap.set(year, { ...yearEntrances[index], autoAlpha: 0 });
        gsap.set(copy, { ...copyEntrances[index], autoAlpha: 0 });
        gsap.set(wordsByPanel[index], { yPercent: 110, autoAlpha: 0 });
        if (visual) {
          gsap.set(visual, {
            clipPath: index === 1 ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)",
            autoAlpha: 0,
            scale: 0.88,
            transformPerspective: 1100,
            rotationY: index === 1 ? -9 : 9
          });
        }
        const yearField = panel.querySelector(".vs-journey__year-field");
        if (yearField) {
          gsap.set(yearField, { x: 55, autoAlpha: 0 });
        }
      });

      const timeline = gsap.timeline({
        onUpdate() {
          updateJourneyState(this.progress());
        },
        scrollTrigger: {
          trigger: journey,
          pin: journey,
          pinSpacing: true,
          start: "top top",
          end: () => `+=${Math.max(horizontalDistance(), window.innerHeight)}`,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: [0, 0.5, 1],
            duration: { min: 0.15, max: 0.45 },
            delay: 0.08,
            ease: "power1.inOut",
            inertia: false
          },
          onRefresh(self) {
            updateJourneyState(self.progress);
          }
        }
      });

      timeline.to(track, { x: () => -horizontalDistance(), duration: 3, ease: "none" }, 0);

      panels.slice(1).forEach((panel, offset) => {
        const index = offset + 1;
        const start = index === 1 ? 0.56 : 1.56;
        const year = panel.querySelector(".vs-journey__year");
        const copy = panel.querySelector(".vs-journey__copy");
        const visual = panel.querySelector(".vs-journey__visual");
        const yearMask = year.parentElement;

        timeline.fromTo(yearMask, { clipPath: "inset(0 100% 0 0)" }, {
          clipPath: "inset(0 0 0 0)",
          duration: 0.68,
          ease: "power2.out",
          immediateRender: false
        }, start);
        timeline.fromTo(year, {
          ...yearEntrances[index],
          autoAlpha: 0
        }, {
          scale: 1,
          clipPath: "inset(0 0 0 0)",
          autoAlpha: 1,
          duration: 0.62,
          ease: "power3.out",
          immediateRender: false
        }, start + 0.02);
        timeline.fromTo(copy, {
          ...copyEntrances[index],
          autoAlpha: 0
        }, {
          x: 0,
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          ease: "power3.out",
          immediateRender: false
        }, start + 0.08);
        timeline.fromTo(wordsByPanel[index], { yPercent: 110, autoAlpha: 0 }, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.4,
          stagger: 0.014,
          ease: "power3.out",
          immediateRender: false
        }, start + 0.3);
        if (visual) {
          timeline.fromTo(visual, {
            clipPath: index === 1 ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)",
            autoAlpha: 0,
            scale: 0.88,
            transformPerspective: 1100,
            rotationY: index === 1 ? -9 : 9
          }, {
            clipPath: "inset(0 0 0 0)",
            scale: 1,
            rotationY: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power2.inOut",
            immediateRender: false
          }, start + 0.04);
        }

        const yearField = panel.querySelector(".vs-journey__year-field");
        if (yearField) {
          timeline.fromTo(yearField, { x: 55, autoAlpha: 0 }, {
            x: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power2.out",
            immediateRender: false
          }, start + 0.04);
        }
      });

      return () => {
        journey.classList.remove("is-pinned");
        clearPanelAccessibility();
        setProgress(1);
        gsap.set(track, { clearProps: "transform" });
        gsap.set(progressFill, { clearProps: "transform" });
      };
    });

    progressMedia.add("(max-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      clearPanelAccessibility();
      setProgress(0);

      panels.forEach((panel, index) => {
        const year = panel.querySelector(".vs-journey__year");
        const copy = panel.querySelector(".vs-journey__copy");
        const visual = panel.querySelector(".vs-journey__visual");
        const yearMask = year.parentElement;
        const yearEntrances = [
          { scale: 0.78, clipPath: "inset(0 100% 0 0)" },
          { scale: 1.12, clipPath: "inset(100% 0 0 0)" },
          { scale: 0.82, clipPath: "inset(0 0 0 100%)" }
        ];
        const copyEntrances = [{ x: -28 }, { y: 28 }, { x: 28 }];

        const reveal = gsap.timeline({
          scrollTrigger: { trigger: panel, start: "top 78%", once: true }
        });
        reveal.fromTo(yearMask, { clipPath: "inset(0 100% 0 0)" }, {
          clipPath: "inset(0 0 0 0)",
          duration: 0.55,
          ease: "power2.out",
          immediateRender: false
        }, 0);
        reveal.fromTo(year, {
          ...yearEntrances[index],
          autoAlpha: 0
        }, {
          scale: 1,
          clipPath: "inset(0 0 0 0)",
          autoAlpha: 1,
          duration: 0.65,
          ease: "power3.out",
          immediateRender: false
        }, 0);
        reveal.fromTo(copy, {
          ...copyEntrances[index],
          autoAlpha: 0
        }, {
          x: 0,
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power3.out",
          immediateRender: false
        }, 0.08);
        reveal.fromTo(wordsByPanel[index], { yPercent: 105, autoAlpha: 0 }, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.35,
          stagger: 0.012,
          ease: "power2.out",
          immediateRender: false
        }, 0.2);
        if (visual) {
          reveal.fromTo(visual, {
            clipPath: index === 1 ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)",
            autoAlpha: 0,
            scale: 0.88,
            transformPerspective: 1100,
            rotationY: index === 1 ? -9 : 9
          }, {
            clipPath: "inset(0 0 0 0)",
            scale: 1,
            rotationY: 0,
            autoAlpha: 1,
            duration: 0.65,
            ease: "power2.inOut",
            immediateRender: false
          }, 0.16);
        }
      });

      gsap.fromTo(progressFill, { scaleX: 0 }, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: journey,
          start: "top 75%",
          end: "bottom 65%",
          scrub: true,
          onUpdate(self) {
            setProgress(self.progress);
          }
        }
      });

      return () => {
        clearPanelAccessibility();
        setProgress(1);
        gsap.set(progressFill, { clearProps: "transform" });
      };
    });
  }

  initializeNearViewportImageLoading();

  if (reducedMotion) {
    reveals.forEach((element) => {
      element.classList.add("is-visible");
      element.style.opacity = "1";
      element.style.transform = "none";
      element.style.clipPath = "none";
    });
  } else {
    document.body.classList.add("vs-animations-ready");
    if (window.gsap && window.ScrollTrigger) {
      initializeGsapAnimations();
      initializeHomepageImageAnimations();
      initializeJourneyAnimations();
      refreshScrollTriggersOnImageLoad();
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    } else {
      initializeCssReveals();
    }
  }

  initializeCounters();
  initializeFaq();
})();
