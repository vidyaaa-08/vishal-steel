
(() => {
  "use strict";

  const currentScript = document.currentScript;
  const scriptUrl = currentScript?.src || window.location.href;

  /* =========================================
     LOAD SHARED HTML PARTIALS
  ========================================= */

  async function loadPartial(fileName, placeholderId) {
    const placeholder = document.getElementById(placeholderId);

    if (!placeholder) {
      console.warn(`Placeholder #${placeholderId} not found.`);
      return null;
    }

    try {
      const response = await fetch(new URL(fileName, scriptUrl), {
        cache: "no-cache"
      });

      if (!response.ok) {
        throw new Error(
          `Could not load ${fileName}: ${response.status} ${response.statusText}`
        );
      }

      placeholder.innerHTML = await response.text();
      return placeholder;

    } catch (error) {
      console.error(`Failed to load ${fileName}:`, error);
      return null;
    }
  }

  /* =========================================
     NAVIGATION INITIALIZATION
  ========================================= */

  function initializeNavigation(headerPlaceholder) {
    if (!headerPlaceholder) return;

    const header = headerPlaceholder.querySelector("[data-vs-header]");
    const navigation = headerPlaceholder.querySelector("[data-vs-navigation]");
    const menuToggle = headerPlaceholder.querySelector("[data-vs-menu-toggle]");

    if (!header || !navigation || !menuToggle) {
      console.error("Navbar is missing required navigation elements.");
      return;
    }

    if (header.dataset.vsInitialized === "true") return;
    header.dataset.vsInitialized = "true";

    const dropdowns = Array.from(
      header.querySelectorAll("[data-vs-dropdown]")
    );

    const mobileQuery = window.matchMedia("(max-width: 1100px)");

    function closeDropdowns(except = null) {
      dropdowns.forEach((dropdown) => {
        if (dropdown === except) return;

        dropdown.classList.remove("is-open");

        const toggle = dropdown.querySelector(
          "[data-vs-dropdown-toggle]"
        );

        if (toggle) {
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    function closeNavigation() {
      navigation.classList.remove("is-open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");

      closeDropdowns();
    }

    /* Mobile menu toggle */

    menuToggle.addEventListener("click", () => {
      const isOpen =
        menuToggle.getAttribute("aria-expanded") === "true";

      navigation.classList.toggle("is-open", !isOpen);

      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Open navigation menu" : "Close navigation menu"
      );

      if (isOpen) {
        closeDropdowns();
      }
    });

    /* Dropdown toggles */

    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(
        "[data-vs-dropdown-toggle]"
      );

      if (!toggle) {
        console.warn("Dropdown is missing its toggle:", dropdown);
        return;
      }

      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const isOpen =
          toggle.getAttribute("aria-expanded") === "true";

        closeDropdowns(dropdown);

        dropdown.classList.toggle("is-open", !isOpen);
        toggle.setAttribute("aria-expanded", String(!isOpen));
      });
    });

    /* Close menu after clicking a navigation link */

    navigation.addEventListener("click", (event) => {
      const link = event.target.closest("a");

      if (link) {
        closeNavigation();
      }
    });

    /* Close dropdown when clicking outside */

    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) {
        closeDropdowns();

        if (mobileQuery.matches) {
          closeNavigation();
        }
      }
    });

    /* Escape key support */

    header.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNavigation();
        menuToggle.focus();
      }
    });

    /* Close mobile menu when switching to desktop */

    mobileQuery.addEventListener("change", (event) => {
      if (!event.matches) {
        closeNavigation();
      }
    });

    /* Sticky header */

    let ticking = false;

    function updateStickyState() {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        header.classList.toggle(
          "is-scrolled",
          window.scrollY > 8
        );

        ticking = false;
      });
    }

    window.addEventListener("scroll", updateStickyState, {
      passive: true
    });

    updateStickyState();
  }

  /* =========================================
     NEWSLETTER INITIALIZATION
     Newsletter is optional
  ========================================= */

  function initializeNewsletter(footerPlaceholder) {
    if (!footerPlaceholder) return;

    const form = footerPlaceholder.querySelector(
      "[data-vs-newsletter]"
    );

    const status = footerPlaceholder.querySelector(
      "[data-vs-newsletter-status]"
    );

    // Do not stop other components if newsletter is unavailable.
    if (!form || !status) {
      console.info(
        "Newsletter form not found. Newsletter initialization skipped."
      );
      return;
    }

    if (form.dataset.vsInitialized === "true") return;
    form.dataset.vsInitialized = "true";

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      status.textContent =
        "Newsletter sign-up is not available yet.";
    });
  }

  /* =========================================
     BACK TO TOP BUTTON
  ========================================= */

  function initializeBackToTop() {
    let button = document.querySelector(
      "[data-vs-back-to-top]"
    );

    if (!button) {
      button = document.createElement("button");

      button.type = "button";
      button.className = "vs-back-to-top";

      button.setAttribute("aria-label", "Back to top");
      button.setAttribute("aria-hidden", "true");

      button.tabIndex = -1;
      button.dataset.vsBackToTop = "";

      button.innerHTML = `
        <svg viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false">
          <path
            d="M12 19V5M5.5 11.5 12 5l6.5 6.5"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
          />
        </svg>
      `;

      document.body.appendChild(button);
    }

    if (button.dataset.vsInitialized === "true") return;
    button.dataset.vsInitialized = "true";

    function updateVisibility() {
      const isVisible = window.scrollY > 400;

      if (!isVisible && document.activeElement === button) {
        button.blur();
      }

      button.classList.toggle("is-visible", isVisible);

      button.setAttribute(
        "aria-hidden",
        String(!isVisible)
      );

      button.tabIndex = isVisible ? 0 : -1;
    }

    button.addEventListener("click", () => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth"
      });
    });

    window.addEventListener("scroll", updateVisibility, {
      passive: true
    });

    updateVisibility();
  }

  /* =========================================
     INITIALIZE ALL SHARED COMPONENTS
  ========================================= */

  async function initializeSharedComponents() {
    const [headerPlaceholder, footerPlaceholder] =
      await Promise.all([
        loadPartial("navbar.html", "navbar-placeholder"),
        loadPartial("footer.html", "footer-placeholder")
      ]);

    // Initialize navbar independently of newsletter.
    initializeNavigation(headerPlaceholder);

    // Newsletter is optional and cannot interrupt navbar.
    initializeNewsletter(footerPlaceholder);

    document.dispatchEvent(
      new CustomEvent("vs:components-loaded")
    );

    console.info("V STEEL shared components initialized.");
  }

  /* =========================================
     START
  ========================================= */

  initializeBackToTop();

  initializeSharedComponents().catch((error) => {
    console.error(
      "V STEEL shared components initialization failed:",
      error
    );
  });

})();
