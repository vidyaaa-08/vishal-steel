(() => {
  "use strict";

  if (window.__vsFooterNavigationInitialized) return;

  const pageNext = {
    "index.html": "about.html",
    "about.html": "products.html",
    "products.html": "service.html",
    "service.html": "Project.html",
    "project.html": "gallery.html",
    "gallery.html": "faq.html",
    "faq.html": "contact.html",
    "contact.html": "index.html",
    "after-sales-support.html": "contact.html",
    "cabinets.html": "lockers.html",
    "client-testimonials.html": "gallery.html",
    "custom-fabrication.html": "service.html",
    "custom-steel.html": "products.html",
    "design-consultant.html": "service.html",
    "global-shipping.html": "after-sales-support.html",
    "hospital-essentials.html": "laboratory-essentials.html",
    "industry-steel-furniture.html": "lockers.html",
    "laboratory-essentials.html": "hospital-essentials.html",
    "lockers.html": "trolleys.html",
    "trolleys.html": "workbench.html",
    "workbench.html": "products.html"
  };
  const validPages = new Set([
    "about.html", "after-sales-support.html", "cabinets.html", "client-testimonials.html",
    "contact.html", "custom-fabrication.html", "custom-steel.html", "design-consultant.html",
    "faq.html", "gallery.html", "global-shipping.html", "hospital-essentials.html",
    "index.html", "industry-steel-furniture.html", "laboratory-essentials.html", "lockers.html",
    "privacy.html", "products.html", "project.html", "service.html", "terms.html",
    "trolleys.html", "workbench.html"
  ]);
  const pageTitles = {
    "about.html": "About",
    "after-sales-support.html": "After-Sales Support",
    "cabinets.html": "Cabinets",
    "client-testimonials.html": "Client Testimonials",
    "contact.html": "Contact Us",
    "custom-fabrication.html": "Custom Fabrication",
    "custom-steel.html": "Custom Steel Solutions",
    "design-consultant.html": "Design Consultation",
    "faq.html": "FAQ",
    "gallery.html": "Gallery",
    "global-shipping.html": "Global Shipping",
    "hospital-essentials.html": "Hospital Essentials",
    "index.html": "Home",
    "industry-steel-furniture.html": "Industrial Steel Furniture",
    "laboratory-essentials.html": "Laboratory Essentials",
    "lockers.html": "Lockers",
    "products.html": "Products",
    "project.html": "Projects",
    "service.html": "Services",
    "trolleys.html": "Trolleys",
    "workbench.html": "Workbenches"
  };

  function getFooter() {
    return document.querySelector("#footer-placeholder .vs-footer, .vs-footer");
  }

  function getDestination(footer) {
    const currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    let configured = document.body.getAttribute("data-next-page");
    if (configured === null) configured = footer.getAttribute("data-next-page");
    const target = configured === null ? pageNext[currentPage] : configured.trim();
    if (!target) return null;

    try {
      const destination = new URL(target, window.location.href);
      const destinationPage = destination.pathname.split("/").pop().toLowerCase();
      if (destination.origin !== window.location.origin) return null;
      if (!validPages.has(destinationPage) || destinationPage === currentPage) return null;
      return {
        href: destination.href,
        title: pageTitles[destinationPage] || destinationPage.replace(/\.html$/, "")
      };
    } catch (error) {
      console.error("Invalid V STEEL next-page destination:", error);
      return null;
    }
  }

  function initialize() {
    if (window.__vsFooterNavigationInitialized) return true;
    const footer = getFooter();
    if (!footer) return false;

    const destination = getDestination(footer);
    if (!destination) {
      window.__vsFooterNavigationInitialized = true;
      return true;
    }

    window.__vsFooterNavigationInitialized = true;
    const root = document.createElement("div");
    root.id = "vs-footer-navigation";
    root.hidden = true;
    root.innerHTML = `
      <section class="vs-footer-countdown" role="region" aria-label="Automatic next page navigation">
        <div class="vs-footer-countdown__ring" aria-hidden="true">
          <svg viewBox="0 0 56 56" focusable="false">
            <circle class="vs-footer-countdown__track" cx="28" cy="28" r="26"></circle>
            <circle class="vs-footer-countdown__progress" data-countdown-ring cx="28" cy="28" r="26"></circle>
          </svg>
          <span class="vs-footer-countdown__number" data-countdown-number>5</span>
        </div>
        <div class="vs-footer-countdown__copy">
          <strong class="vs-footer-countdown__message">Taking you to the next page...</strong>
          <span class="vs-footer-countdown__next" data-countdown-next></span>
          <span class="vs-footer-countdown__sr-only" data-countdown-status role="status" aria-live="polite"></span>
        </div>
        <button class="vs-footer-countdown__cancel" type="button" data-countdown-cancel>Cancel</button>
      </section>
    `;
    root.querySelector("[data-countdown-next]").textContent = `Next: ${destination.title}`;
    document.body.appendChild(root);

    if (!document.querySelector('link[data-vs-footer-navigation-style]')) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = new URL("footer-navigation.css", document.currentScript?.src || window.location.href).href;
      stylesheet.dataset.vsFooterNavigationStyle = "true";
      document.head.appendChild(stylesheet);
    }

    const number = root.querySelector("[data-countdown-number]");
    const ring = root.querySelector("[data-countdown-ring]");
    const liveStatus = root.querySelector("[data-countdown-status]");
    const cancelButton = root.querySelector("[data-countdown-cancel]");
    const duration = 5000;
    const circumference = 2 * Math.PI * 26;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let hasScrolledDown = false;
    let running = false;
    let endTime = 0;
    let animationFrame = 0;
    let lastScrollY = window.scrollY;
    let lastDisplayedNumber = "";

    ring.style.strokeDasharray = String(circumference);

    function atFooterBottom() {
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      const maxScroll = documentHeight - window.innerHeight;
      if (maxScroll <= 1 || window.scrollY < maxScroll - 2) return false;

      const footerRect = footer.getBoundingClientRect();
      return footerRect.top < window.innerHeight
        && footerRect.bottom > 0
        && footerRect.bottom <= window.innerHeight + 2;
    }

    function cancelCountdown(hide = true) {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      running = false;
      if (hide) root.hidden = true;
    }

    function updateCountdown(timestamp) {
      if (!running) return;
      if (!atFooterBottom()) {
        cancelCountdown();
        return;
      }

      const remaining = Math.max(0, endTime - timestamp);
      const seconds = Math.ceil(remaining / 1000);
      const progress = remaining / duration;
      if (!reducedMotion.matches || seconds !== lastDisplayedNumber) {
        ring.style.strokeDashoffset = String(circumference * (1 - progress));
      }
      if (String(seconds) !== lastDisplayedNumber) {
        lastDisplayedNumber = String(seconds);
        number.classList.remove("is-changing");
        number.textContent = lastDisplayedNumber;
        liveStatus.textContent = seconds > 0 ? `Navigating in ${seconds} seconds.` : "Opening the next page.";
        if (!reducedMotion.matches) {
          void number.offsetWidth;
          number.classList.add("is-changing");
        }
      }

      if (remaining <= 0) {
        cancelCountdown(false);
        window.location.assign(destination.href);
        return;
      }
      animationFrame = window.requestAnimationFrame(updateCountdown);
    }

    function startCountdown() {
      if (running || !hasScrolledDown || !atFooterBottom() || document.hidden) return;
      running = true;
      root.hidden = false;
      const chatLauncher = document.querySelector("#vs-chatbot .vs-chat-launcher");
      if (chatLauncher) {
        root.style.bottom = `${Math.max(90, Math.ceil(window.innerHeight - chatLauncher.getBoundingClientRect().top + 12))}px`;
      }
      endTime = performance.now() + duration;
      lastDisplayedNumber = "";
      ring.style.strokeDashoffset = "0";
      animationFrame = window.requestAnimationFrame(updateCountdown);
    }

    function onScroll() {
      const currentY = window.scrollY;
      const direction = currentY - lastScrollY;
      lastScrollY = currentY;
      if (direction > 0) hasScrolledDown = true;
      if (running && direction < 0) {
        cancelCountdown();
        return;
      }
      if (direction > 0 && !running && hasScrolledDown && atFooterBottom()) {
        startCountdown();
      }
    }

    function onPointerDown(event) {
      if (!running) return;
      if (event.target.closest("[data-countdown-cancel]")) {
        cancelCountdown(false);
        return;
      }
      cancelCountdown();
    }

    function onKeyDown(event) {
      if (!running) return;
      if (event.key === "Tab") {
        cancelCountdown(false);
        return;
      }
      if (event.target.closest?.("[data-countdown-cancel]")) {
        cancelCountdown(false);
        return;
      }
      cancelCountdown();
    }

    function onWheel() {
      if (running) cancelCountdown();
    }

    function onVisibilityChange() {
      if (document.hidden && running) cancelCountdown();
    }

    function onPageHide() {
      cancelCountdown();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("touchstart", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("wheel", onWheel, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      root.remove();
    }

    function onPageShow(event) {
      if (!event.persisted) return;
      window.__vsFooterNavigationInitialized = false;
      initialize();
    }

    cancelButton.addEventListener("click", () => cancelCountdown());
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    document.addEventListener("touchstart", onPointerDown, { capture: true, passive: true });
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("wheel", onWheel, { capture: true, passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide, { once: true });
    window.addEventListener("pageshow", onPageShow);
  }

  if (!initialize()) {
    document.addEventListener("vs:components-loaded", initialize, { once: true });
  }
})();
