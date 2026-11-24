(() => {
  const root = document.querySelector(".vs-page--trolleys");
  if (!root) {
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WHATSAPP_ENQUIRY_URL = ""; // Add the official WhatsApp URL here when it is available.
  const images = Array.from(root.querySelectorAll("img[data-image-src]"));
  const cleanups = [];
  let refreshFrame = 0;
  let imageObserver;
  let motionMedia;

  root.querySelectorAll("[data-whatsapp-enquiry]").forEach((link) => {
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

  const typingTarget = root.querySelector("[data-typing-text]");
  if (typingTarget && !reducedMotion) {
    const terms = [
      "Industrial Trolleys",
      "Hospital Trolleys",
      "Medical Trolleys",
      "Laboratory Trolleys",
      "Research Trolleys",
      "Warehouse Trolleys",
      "Material Handling Trolleys"
    ];
    let wordIndex = 0;
    let characterIndex = terms[0].length;
    let deleting = true;
    let typingTimer;

    const typeNextCharacter = () => {
      const currentTerm = terms[wordIndex];
      if (deleting) {
        characterIndex -= 1;
        typingTarget.textContent = currentTerm.slice(0, characterIndex);
        if (characterIndex === 0) {
          wordIndex = (wordIndex + 1) % terms.length;
          deleting = false;
          typingTimer = window.setTimeout(typeNextCharacter, 230);
        } else {
          typingTimer = window.setTimeout(typeNextCharacter, 40);
        }
        return;
      }

      characterIndex += 1;
      typingTarget.textContent = terms[wordIndex].slice(0, characterIndex);
      if (characterIndex === terms[wordIndex].length) {
        deleting = true;
        typingTimer = window.setTimeout(typeNextCharacter, 1250);
      } else {
        typingTimer = window.setTimeout(typeNextCharacter, 68);
      }
    };

    typingTimer = window.setTimeout(typeNextCharacter, 1500);
    cleanups.push(() => window.clearTimeout(typingTimer));
  }

  const heroSection = root.querySelector(".trolleys-hero");
  const heroCards = heroSection ? Array.from(heroSection.querySelectorAll("[data-hero-card]")) : [];
  const heroIndicators = heroSection ? Array.from(heroSection.querySelectorAll("[data-hero-visual]")) : [];
  const selectHeroVisual = (index) => {
    if (!Number.isInteger(index) || index < 0 || index >= heroCards.length) {
      return;
    }

    heroSection.dataset.heroActiveVisual = String(index);
    heroCards.forEach((card, cardIndex) => {
      card.classList.toggle("is-active", cardIndex === index);
    });
    heroIndicators.forEach((indicator, indicatorIndex) => {
      const active = indicatorIndex === index;
      indicator.classList.toggle("is-active", active);
      indicator.setAttribute("aria-pressed", String(active));
    });
  };

  heroIndicators.forEach((indicator) => {
    const onClick = () => selectHeroVisual(Number(indicator.dataset.heroVisual));
    indicator.addEventListener("click", onClick);
    indicator.removeAttribute("disabled");
    cleanups.push(() => indicator.removeEventListener("click", onClick));
  });
  selectHeroVisual(0);

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
    const source = image.dataset.imageSrc.trim();
    const sourceSet = image.dataset.imageSrcset.trim();
    const picture = image.closest("picture");
    const pictureSources = picture
      ? Array.from(picture.querySelectorAll("source[data-image-srcset]"))
      : [];
    const hasPictureSource = pictureSources.some((pictureSource) => pictureSource.dataset.imageSrcset.trim());
    image.style.removeProperty("opacity");
    image.style.removeProperty("width");
    image.style.removeProperty("height");

    if (!source && !sourceSet && !hasPictureSource) {
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
    if (sourceSet || hasPictureSource) {
      image.dataset.imageSourceReady = "true";
    }
    image.loading = image.closest(".hero-image") ? "eager" : "lazy";
    image.decoding = "async";
    pictureSources.forEach((pictureSource) => {
      const pictureSourceSet = pictureSource.dataset.imageSrcset.trim();
      if (pictureSourceSet) {
        pictureSource.sizes = pictureSource.getAttribute("sizes") || image.sizes || "100vw";
        pictureSource.srcset = pictureSourceSet;
      }
    });
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
          console.warn("Trolley image could not be decoded.", source, error);
          afterDecode();
        });
      } else {
        afterDecode();
      }
    }, { once: true });

    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.removeAttribute("srcset");
      image.removeAttribute("data-image-source-ready");
      const failedPicture = image.closest("picture");
      if (failedPicture) {
        failedPicture.querySelectorAll("source[srcset]").forEach((pictureSource) => {
          pictureSource.removeAttribute("srcset");
        });
      }
      image.dataset.imageState = "error";
      console.warn("Trolley image is unavailable; check data-image-src:", source);
      scheduleRefresh();
    }, { once: true });

    if (source) {
      image.src = source;
    }
    if (observer) {
      observer.unobserve(image);
    }
  }

  function enableImageTilt(image) {
    if (!gsap || reducedMotion || image.dataset.tiltReady ||
        !window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const frame = image.closest(".trolleys-solution__image, .trolleys-product-details__image");
    if (!frame) {
      return;
    }

    image.dataset.tiltReady = "true";
    const rotateX = gsap.quickTo(frame, "rotationX", { duration: .45, ease: "power3.out" });
    const rotateY = gsap.quickTo(frame, "rotationY", { duration: .45, ease: "power3.out" });
    const onMove = (event) => {
      const bounds = frame.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      rotateX(y * -2.5);
      rotateY(x * 3);
    };
    const onLeave = () => {
      rotateX(0);
      rotateY(0);
    };

    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
      delete frame._trolleyTiltCleanup;
    });
    frame._trolleyTiltCleanup = cleanups[cleanups.length - 1];
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
    }, { rootMargin: "750px 0px" });

    images.forEach((image) => {
      if (image.closest(".hero-image")) {
        loadImage(image, imageObserver);
      } else {
        imageObserver.observe(image);
      }
    });
  } else {
    images.forEach((image) => loadImage(image, null));
  }

  const accordionItems = Array.from(root.querySelectorAll(".trolleys-accordion__item"));
  const setAccordionState = (item, open, animate) => {
    const content = item.querySelector(".trolleys-accordion__content");
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
        duration: .32,
        ease: "power2.out",
        clearProps: "height,opacity,overflow"
      });
    } else if (item.open) {
      gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: .23,
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

  function setupMagneticLink(link) {
    if (!gsap || reducedMotion || !link || link.getAttribute("aria-disabled") === "true" ||
        !window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const moveX = gsap.quickTo(link, "x", { duration: .35, ease: "power3.out" });
    const moveY = gsap.quickTo(link, "y", { duration: .35, ease: "power3.out" });
    const onMove = (event) => {
      const bounds = link.getBoundingClientRect();
      moveX((event.clientX - bounds.left - bounds.width / 2) * .12);
      moveY((event.clientY - bounds.top - bounds.height / 2) * .12);
    };
    const onLeave = () => {
      moveX(0);
      moveY(0);
    };
    link.addEventListener("pointermove", onMove);
    link.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      link.removeEventListener("pointermove", onMove);
      link.removeEventListener("pointerleave", onLeave);
    });
  }

  setupMagneticLink(root.querySelector(".trolleys-hero__cta"));
  setupMagneticLink(root.querySelector(".trolleys-cta__button"));

  const hero = root.querySelector(".trolleys-hero");
  const pointer = root.querySelector(".hero-pointer");
  if (hero && pointer && gsap && !reducedMotion &&
      window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) {
    const moveX = gsap.quickTo(pointer, "x", { duration: .28, ease: "power3.out" });
    const moveY = gsap.quickTo(pointer, "y", { duration: .28, ease: "power3.out" });
    const onMove = (event) => {
      const bounds = hero.getBoundingClientRect();
      moveX(event.clientX - bounds.left);
      moveY(event.clientY - bounds.top);
      gsap.to(pointer, { autoAlpha: 1, duration: .18, overwrite: "auto" });
    };
    const onLeave = () => {
      gsap.to(pointer, { autoAlpha: 0, duration: .2, overwrite: "auto" });
    };
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    });
  }

  let animationContext;
  if (gsap && ScrollTrigger && !reducedMotion) {
    gsap.registerPlugin(ScrollTrigger);
    animationContext = gsap.context(() => {
      const heroTitle = root.querySelector(".trolleys-hero__title");
      const heroSubtitle = root.querySelector(".trolleys-hero__subtitle");
      const heroCta = root.querySelector(".trolleys-hero__cta");
      const heroImage = root.querySelector(".hero-image");
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(heroTitle, { yPercent: 80, clipPath: "inset(0 0 100% 0)", autoAlpha: 0 }, {
          yPercent: 0,
          clipPath: "inset(0 0 0 0)",
          autoAlpha: 1,
          duration: .95
        })
        .fromTo([heroSubtitle, heroCta], { x: -25, autoAlpha: 0 }, {
          x: 0,
          autoAlpha: 1,
          duration: .65,
          stagger: .12
        }, .42);

      gsap.fromTo(heroImage, { clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)", scale: 1.12 }, {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        scale: 1,
        duration: 1.35,
        ease: "power2.inOut",
        delay: .08
      });
      gsap.to(heroImage, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: .7,
          invalidateOnRefresh: true
        }
      });

      root.querySelectorAll("[data-vsl-reveal]").forEach((element, index) => {
        const direction = element.dataset.vslReveal;
        const horizontalMotion = window.matchMedia("(min-width: 901px)").matches;
        const from = horizontalMotion && direction === "left" ? { x: -26 } :
          horizontalMotion && direction === "right" ? { x: 26 } : { y: 30 };
        gsap.fromTo(element, { ...from, autoAlpha: 0 }, {
          x: 0,
          y: 0,
          autoAlpha: 1,
          duration: .7,
          delay: (index % 2) * .04,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true
          }
        });
      });

      root.querySelectorAll(".trolleys-solution__image, .trolleys-product-details__image, .trolleys-overview__image, .trolleys-gallery__item").forEach((frame, index) => {
        const image = frame.querySelector("img");
        const directions = [
          "inset(100% 0 0 0)",
          "inset(0 0 0 100%)",
          "inset(0 100% 0 0)",
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
            scrub: .38,
            invalidateOnRefresh: true
          }
        });
        if (image) {
          gsap.fromTo(image, {
            scale: 1.15,
            xPercent: index % 2 === 0 ? 2 : -2
          }, {
            scale: 1,
            xPercent: 0,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: .65,
              invalidateOnRefresh: true
            }
          });
        }
      });

      gsap.fromTo(".trolleys-category", {
        y: 25,
        autoAlpha: 0,
        clipPath: "inset(0 0 14% 0)"
      }, {
        y: 0,
        autoAlpha: 1,
        clipPath: "inset(0 0 0 0)",
        duration: .62,
        stagger: .07,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility,clipPath",
        scrollTrigger: {
          trigger: ".trolleys-premium__grid",
          start: "top 83%",
          once: true
        }
      });

      gsap.fromTo(".trolleys-specs li", { x: 20, autoAlpha: 0 }, {
        x: 0,
        autoAlpha: 1,
        duration: .48,
        stagger: .07,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility",
        scrollTrigger: {
          trigger: ".trolleys-specs",
          start: "top 82%",
          once: true
        }
      });

      motionMedia = gsap.matchMedia();
      motionMedia.add("(min-width: 1001px) and (prefers-reduced-motion: no-preference)", () => {
        const story = root.querySelector(".trolleys-story");
        const inner = story && story.querySelector(".trolleys-story__inner");
        const wrapper = story && story.querySelector(".trolleys-story__wrapper");
        const panels = wrapper ? Array.from(wrapper.querySelectorAll(".trolleys-story__panel")) : [];
        if (!story || !inner || !wrapper || panels.length < 2) {
          return;
        }

        story.classList.add("is-trolleys-pinned");
        const getDistance = () => Math.max(0, wrapper.scrollWidth - inner.clientWidth);
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: story,
            pin: story,
            pinSpacing: true,
            start: "top top",
            end: () => `+=${Math.max(getDistance(), window.innerHeight * 1.45)}`,
            scrub: .65,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });
        timeline.to(wrapper, {
          x: () => -getDistance(),
          ease: "none",
          duration: 1
        });
        panels.forEach((panel, index) => {
          const heading = panel.querySelector(".trolleys-story__title");
          const description = panel.querySelector(".trolleys-story__desc");
          timeline.fromTo(heading, { y: 25, autoAlpha: .65 }, {
            y: 0,
            autoAlpha: 1,
            duration: .24,
            ease: "power2.out",
            immediateRender: false
          }, Math.min(.25 + index * .28, .8));
          timeline.fromTo(description, { y: 18, autoAlpha: .55 }, {
            y: 0,
            autoAlpha: 1,
            duration: .2,
            ease: "power2.out",
            immediateRender: false
          }, Math.min(.42 + index * .28, .92));
        });

        return () => {
          story.classList.remove("is-trolleys-pinned");
          gsap.set(wrapper, { clearProps: "transform" });
          panels.forEach((panel) => {
            gsap.set(panel.querySelectorAll(".trolleys-story__title, .trolleys-story__desc"), {
              clearProps: "transform,opacity,visibility"
            });
          });
        };
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
      console.error("Trolley page fonts could not be loaded.", error);
      refreshTriggers();
    });
  }

  window.addEventListener("pagehide", () => {
    if (imageObserver) {
      imageObserver.disconnect();
    }
    cleanups.forEach((cleanup) => cleanup());
    if (motionMedia) {
      motionMedia.revert();
    }
    document.removeEventListener("vs:components-loaded", refreshTriggers);
    if (animationContext) {
      animationContext.revert();
    }
  }, { once: true });
})();
