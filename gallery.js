(() => {
  "use strict";

  const grid = document.querySelector("[data-gallery-grid]");
  const filters = document.querySelector("[data-gallery-filters]");
  const status = document.querySelector("[data-gallery-status]");
  const emptyState = document.querySelector("[data-gallery-empty]");
  const hero = document.querySelector(".gallery-hero");
  if (!grid || !filters || grid.dataset.initialized === "true") return;
  grid.dataset.initialized = "true";

  const collections = [
    {
      filter: "industrial",
      label: "Industrial steel furniture",
      description: "Steel furniture and storage shown across industrial workplace applications.",
      href: "./Industry-Steel-Furniture.html",
      images: [
        ["industry1.png", "Industrial steel furniture"],
        ["industry2.png", "Industrial storage cabinet"],
        ["industry3.png", "Industrial work table"],
        ["industry4.png", "Industrial shelving unit"],
        ["industry5.png", "Workshop tool cabinet"],
        ["industry6.png", "Workbench with drawers"],
        ["industry7.png", "Metal locker"],
        ["Steel filing cabinet.png", "Steel filing cabinet"],
        ["industry9.png", "Mobile industrial cart"]
      ]
    },
    {
      filter: "storage",
      label: "Steel cabinets",
      description: "Steel filing, office, industrial, and laboratory cabinets from the V STEEL range.",
      href: "./cabinets.html",
      images: [
        ["Filing cabinet drawer.png", "Filing cabinet drawer detail"],
        ["Office storage cabinet.png", "Office storage cabinet"],
        ["contact3.png", "Industrial steel storage cabinet"],
        ["industry4.png", "Industrial cabinet shelving detail"],
        ["Laboratory and Technical Cabinets.png", "Laboratory steel cabinet", "laboratory"],
        ["hospita5.png", "Laboratory cabinet detail", "laboratory"],
        ["steelcab.png", "Steel storage cabinet"],
        ["steelalmari.png", "Steel almirah"]
      ]
    },
    {
      filter: "storage",
      label: "Lockers",
      description: "Steel locker designs and installations for office, educational, and industrial spaces.",
      href: "./lockers.html",
      images: [
        ["locker1.png", "Steel locker manufacturing"],
        ["locker2.png", "Multiple-compartment steel lockers"],
        ["locker3.png", "Modern office locker installation"],
        ["locker4.png", "Industrial heavy-duty lockers"],
        ["locker5.png", "School and educational lockers"],
        ["locker6.png", "Customized steel locker solutions"]
      ]
    },
    {
      filter: "laboratory",
      label: "Laboratory furniture and equipment",
      description: "Laboratory equipment, furniture, storage, and fume hood applications.",
      href: "./laboratory-essentials.html",
      images: [
        ["Equipment1.png", "Laboratory equipment"],
        ["Equipment2.png", "Stainless steel laboratory equipment"],
        ["Equipment3.png", "Laboratory workstation"],
        ["Equipment4.png", "Laboratory safety equipment and fume hood"]
      ]
    },
    {
      filter: "industrial",
      label: "Industrial workbenches",
      description: "Workbench solutions for industrial precision, laboratory research, and technical assembly.",
      href: "./workbench.html",
      images: [
        ["workbe1.png", "Industrial precision workbench"],
        ["workbe2.png", "Laboratory research workbench", "laboratory"],
        ["workbe3.png", "Electronics assembly workbench"],
        ["workbe4.png", "Industrial steel workbench"],
        ["workbe5.png", "Laboratory research workbench", "laboratory"],
        ["workbe6.png", "Electronics and assembly workbench"]
      ]
    },
    {
      filter: "industrial",
      label: "Trolleys and mobile solutions",
      description: "Mobile trolley imagery for industrial, healthcare, and scientific applications.",
      href: "./trolleys.html",
      images: [
        ["trolly1.png", "Scientific mobility trolley"],
        ["trolly2.png", "Healthcare equipment trolley"],
        ["trolly3.png", "Industrial steel trolley"],
        ["trolly4.png", "Steel trolley solution"],
        ["trolly5.png", "Mobile product trolley"]
      ]
    },
    {
      filter: "furniture",
      label: "Healthcare furniture",
      description: "Hospital beds, patient furniture, medical storage, and equipment carts.",
      href: "./hospital-essentials.html",
      images: [
        ["hospital1.png", "Medical equipment trolley"],
        ["hospital2.png", "Adjustable hospital bed"],
        ["hospital3.png", "Surgical instrument storage"],
        ["hospital4.png", "Medical storage cabinet"],
        ["hospita5.png", "Custom medical furniture"],
        ["hospital6.png", "Hospital furniture"]
      ]
    },
    {
      filter: "laboratory",
      label: "Other V STEEL products",
      description: "Laboratory furniture and fume hood solutions from the V STEEL product range.",
      href: "./laboratory-essentials.html",
      images: [["product.png", "Laboratory furniture and fume hoods"]]
    },
    {
      filter: "furniture",
      label: "Other V STEEL products",
      description: "Furniture and storage applications from the V STEEL product range.",
      href: "./products.html",
      images: [
        ["product1.png", "Hospital beds and medical equipment"],
        ["product2.png", "Office workstations and storage"]
      ]
    },
    {
      filter: "industrial",
      label: "Other V STEEL products",
      description: "Industrial rack, trolley, and mobile workstation product applications.",
      href: "./Industry-Steel-Furniture.html",
      images: [
        ["product3.png", "Industrial racks and trolleys"],
        ["product7.png", "Industrial mobile workstation"]
      ]
    },
    {
      filter: "storage",
      label: "Other V STEEL products",
      description: "High-density storage applications from the V STEEL product range.",
      href: "./products.html",
      images: [["product8.png", "High-density storage compactor"]]
    },
    {
      filter: "projects",
      label: "Other V STEEL products",
      description: "Turnkey HVAC and custom steel solutions featured in the V STEEL product range.",
      href: "./custom-steel.html",
      images: [
        ["product4.png", "HVAC turnkey solutions"],
        ["product5.png", "Custom steel fabrication"]
      ]
    },
    {
      filter: "furniture",
      label: "Office and project furniture",
      description: "Office furniture, workstations, reception, and multi-material project applications.",
      href: "./products.html",
      images: [
        ["project-executive-office-desk.png", "Executive office desks"],
        ["project-office-workstations.png", "Modern office workstations"],
        ["project-reception-desk.png", "Reception desk solutions"],
        ["project-reception-desk (1).png", "Reception desk project"],
        ["project-classroom-furniture.png", "Classroom furniture solutions"],
        ["project-student-desks.png", "Student desk solutions"]
      ]
    },
    {
      filter: "storage",
      label: "Storage systems",
      description: "Space-conscious storage solutions, shelving, cabinets, and warehouse systems.",
      href: "./products.html",
      images: [
        ["project-storgae-compactor.png", "Space-saving storage compactors"],
        ["project-industrial-storage-rack.png", "Pallet racking systems"],
        ["project-industrial-storage-bins.png", "Industrial storage bins"],
        ["project-heavy-duty-shelves.png", "Heavy-duty shelves"],
        ["project-warehouse-container-storage.png", "Warehouse container storage"],
        ["project-organized-file-cabinets.png", "Organized file cabinets"],
        ["project-Organized-File-Cabinets.png", "File cabinet project"],
        ["project-steel-shelving-units.png", "Steel shelving units"],
        ["project-fireproof-cabinets.png", "Fireproof cabinets"],
        ["project-Metal-Storage-Cabinets.png", "Metal storage cabinets"],
        ["project-steel-storage-for-schools.png", "Steel storage for schools"],
        ["Organized-File-Cabinets1.png", "Organized file cabinet range"]
      ]
    },
    {
      filter: "laboratory",
      label: "Laboratory applications",
      description: "Laboratory workbenches, fume hoods, and specialist storage shown in product and project imagery.",
      href: "./laboratory-essentials.html",
      images: [
        ["project.png", "Laboratory furniture solutions"],
        ["project-laboratory-workbenches.png", "Laboratory workbenches"],
        ["project-fume-hoods.png", "Laboratory fume hoods"],
        ["project-fume-hoods1.png", "Fume hood systems"],
        ["project-steel-lab-cabinets.png", "Steel laboratory cabinets"],
        ["project-Study-&-Research-Furniture.png", "Study and research furniture"],
        ["project-lab-storage-racks.png", "Laboratory storage racks"]
      ]
    },
    {
      filter: "industrial",
      label: "Industrial and workshop projects",
      description: "Industrial workbenches, tables, shelving, and storage project examples.",
      href: "./Industry-Steel-Furniture.html",
      images: [
        ["project-steel-workbenches.png", "Industrial steel workbenches"],
        ["project-steel-workbenches1.png", "Steel workbenches"],
        ["project-Study-&-Research-Furniture.png", "Steel tables"]
      ]
    },
    {
      filter: "furniture",
      label: "Custom steel solutions",
      description: "Customized steel furniture and storage applications for laboratories, healthcare, industry, and offices.",
      href: "./custom-steel.html",
      images: [
        ["customsteel1.png", "Laboratory furniture"],
        ["customsteel2.png", "Medical equipment"],
        ["customsteel3.png", "Industrial workbenches"],
        ["customsteel4.png", "Office storage systems"]
      ]
    },
    {
      filter: "projects",
      label: "Manufacturing and turnkey projects",
      description: "Project portfolio imagery covering custom fabrication, furniture, fume hoods, storage, and HVAC turnkey work.",
      href: "./custom-fabrication.html",
      images: [
        ["fabrication1.png", "Industrial manufacturing"],
        ["fabrication2.png", "Laboratory fume hood project", "laboratory"],
        ["fabrication3.png", "Warehouse rack project", "industrial"],
        ["fabrication4.png", "Industrial workstations and workbenches", "industrial"],
        ["fabrication5.png", "Office and commercial furniture", "furniture"],
        ["fabrication6.png", "Hospital furniture project", "furniture"],
        ["fabrication7.png", "Laboratory safety equipment project", "laboratory"],
        ["fabrication8.png", "Industrial storage project", "industrial"],
        ["fabrication9.png", "HVAC turnkey system installation"],
        ["fabrication10.png", "Industrial workstation project", "industrial"]
      ]
    },
    {
      filter: "projects",
      label: "Design consultation",
      description: "Design consultation imagery across healthcare, laboratory, warehouse, HVAC, workbench, and office applications.",
      href: "./design-consultant.html",
      images: [
        ["Design-Consultation.png", "Medical equipment design consultation", "furniture"],
        ["Design-Consultation1.png", "Fume hood safety design", "laboratory"],
        ["Design-Consultation2.png", "Warehouse storage system design", "industrial"],
        ["Design-Consultation3.png", "Climate control system design"],
        ["Design-Consultation4.png", "Ergonomic workbench design", "industrial"],
        ["Design-Consultation5.png", "Office space design solutions", "furniture"]
      ]
    },
    {
      filter: "projects",
      label: "Completed project portfolio",
      description: "Examples from the V STEEL project portfolio across office, educational, industrial, storage, and laboratory settings.",
      href: "./Project.html#projects",
      images: [
        ["project-officelocker.png", "Secure office lockers", "storage"],
        ["project-organized-file-cabinets.png", "Organized file cabinets", "storage"],
        ["project-industrial-storage-rack.png", "Pallet racking systems", "industrial"],
        ["project-industrial-storage-bins.png", "Industrial storage bins", "industrial"],
        ["project-heavy-duty-shelves.png", "Heavy-duty shelving project", "industrial"],
        ["project-warehouse-container-storage.png", "Warehouse container storage", "industrial"],
        ["project-classroom-furniture.png", "Classroom furniture solutions", "furniture"],
        ["project-library-shelving.png", "Library shelving solutions", "storage"],
        ["project-school-lockers.png", "School storage lockers", "storage"],
        ["project-steel-storage-for-schools.png", "Steel storage for schools", "storage"]
      ]
    },
    {
      filter: "projects",
      label: "Selected applications",
      description: "Product and project imagery featured across the V STEEL homepage.",
      href: "./index.html",
      images: [
        ["homepage/indeximg3.png", "Storage compactor system", "storage"],
        ["homepage/indeximg4.png", "Laboratory fume hood", "laboratory"],
        ["homepage/indeximg11.png", "Industrial warehouse rack", "industrial"],
        ["homepage/project-office-furniture.png", "Office furniture project", "furniture"],
        ["homepage/project-laboratory.png", "Laboratory project", "laboratory"],
        ["homepage/project-commercial-office.png", "Commercial office project", "furniture"]
      ]
    }
  ];

  function getGalleryFilters(file, title, collection) {
    const searchable = `${file} ${title} ${collection.label}`.toLowerCase();
    if (/almari|almirah/.test(searchable)) return ["almirahs"];
    if (/locker/.test(searchable)) return ["lockers"];
    if (/cabinet|filing|steelcab/.test(searchable)) return ["cabinets"];
    if (
      /manufacturing|fabrication|industrial workbench|industrial steel furniture|trolleys and mobile|industrial steel furniture/.test(searchable) ||
      /^(?:industry|workbe|fabrication|equipment|customsteel|product)\d*/.test(file.toLowerCase())
    ) {
      return ["manufacturing"];
    }
    return ["projects"];
  }

  const allItems = collections.flatMap((collection) =>
    collection.images.map(([file, title]) => ({
      src: `./assets/images/${file}`,
      title,
      category: collection.label,
      description: collection.description,
      filters: getGalleryFilters(file, title, collection),
      href: collection.href
    }))
  );
  const seenImages = new Set();
  const items = allItems.filter((item) => {
    if (seenImages.has(item.src)) return false;
    seenImages.add(item.src);
    return true;
  });

  function cardMarkup(item, index) {
    const shape = index % 12 === 0 || index % 12 === 7
      ? " gallery-card--wide"
      : index % 12 === 3 || index % 12 === 10
        ? " gallery-card--tall"
        : "";
    const id = `gallery-card-details-${index + 1}`;
    const safeTitle = item.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeCategory = item.category.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeDescription = item.description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeSrc = item.src.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

    return `<article class="gallery-card${shape}" data-category="${item.filters.join(" ")}" style="--reveal-delay:${(index % 8) * 35}ms">
      <button class="gallery-card__image" type="button" data-gallery-open aria-label="View ${safeTitle}">
        <img src="${safeSrc}" alt="${safeTitle}" width="800" height="600" loading="lazy" decoding="async">
      </button>
      <div class="gallery-card__caption" aria-hidden="true"><span class="gallery-card__category">${safeCategory}</span><h3 class="gallery-card__title">${safeTitle}</h3></div>
      <div class="gallery-card__details" id="${id}">
        <span class="gallery-card__category">${safeCategory}</span>
        <h3 class="gallery-card__title">${safeTitle}</h3>
        <p>${safeDescription}</p>
        <button class="gallery-card__action" type="button" data-gallery-open>View image <span aria-hidden="true">↗</span></button>
        <a class="gallery-card__action" href="${item.href}">Explore details <span aria-hidden="true">↗</span></a>
      </div>
      <button class="gallery-card__toggle" type="button" aria-expanded="false" aria-controls="${id}" aria-label="Show details for ${safeTitle}">Details <span aria-hidden="true">+</span></button>
    </article>`;
  }

  grid.innerHTML = items.map(cardMarkup).join("");
  const cards = Array.from(grid.querySelectorAll(".gallery-card"));
  const count = filters.querySelector("[data-filter-count]");
  const buttons = Array.from(filters.querySelectorAll("[data-gallery-filter]"));
  const filterNames = new Map(buttons.map((button) => [button.dataset.galleryFilter, button.textContent.trim()]));
  const lightbox = document.querySelector("[data-gallery-lightbox]");
  const lightboxImage = lightbox && lightbox.querySelector("[data-lightbox-image]");
  const lightboxTitle = lightbox && lightbox.querySelector("[data-lightbox-title]");
  const lightboxCount = lightbox && lightbox.querySelector("[data-lightbox-count]");
  const lightboxClose = lightbox && lightbox.querySelector("[data-lightbox-close]");
  const lightboxPrevious = lightbox && lightbox.querySelector("[data-lightbox-previous]");
  const lightboxNext = lightbox && lightbox.querySelector("[data-lightbox-next]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const categoryCounts = cards.reduce((totals, card) => {
    card.dataset.category.split(" ").forEach((category) => {
      totals[category] = (totals[category] || 0) + 1;
    });
    return totals;
  }, {});

  if (count) count.textContent = `(${cards.length})`;
  buttons.forEach((button) => {
    const category = button.dataset.galleryFilter;
    if (category !== "all" && categoryCounts[category]) {
      button.setAttribute("aria-label", `${filterNames.get(category)} (${categoryCounts[category]})`);
    }
  });

  let filterVersion = 0;
  let lightboxCards = [];
  let lightboxIndex = 0;
  let lightboxOrigin = null;
  let previousBodyOverflow = "";
  let lightboxCloseTimer = 0;
  const matchesFilter = (card, category) =>
    category === "all" || card.dataset.category.split(" ").includes(category);

  function renderLightboxImage() {
    const card = lightboxCards[lightboxIndex];
    if (!card || !lightboxImage) return;
    const image = card.querySelector(".gallery-card__image img");
    const title = card.querySelector(".gallery-card__title");
    const category = card.querySelector(".gallery-card__category");
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxTitle.textContent = title.textContent;
    lightboxCount.textContent = `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(lightboxCards.length).padStart(2, "0")} · ${category.textContent}`;
  }

  function openLightbox(trigger) {
    if (!lightbox || !lightboxImage) return;
    lightboxCards = cards.filter((card) => !card.hidden && card.getAttribute("aria-hidden") !== "true");
    const selectedCard = trigger.closest(".gallery-card");
    lightboxIndex = Math.max(0, lightboxCards.indexOf(selectedCard));
    lightboxOrigin = trigger;
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    renderLightboxImage();
    lightbox.showModal();
    lightboxClose.focus();
  }

  function moveLightbox(step) {
    if (!lightboxCards.length) return;
    lightboxIndex = (lightboxIndex + step + lightboxCards.length) % lightboxCards.length;
    renderLightboxImage();
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.open || lightboxCloseTimer) return;
    lightbox.classList.add("is-closing");
    lightboxCloseTimer = window.setTimeout(() => {
      lightboxCloseTimer = 0;
      if (lightbox.open) lightbox.close();
    }, reducedMotion ? 0 : 180);
  }

  if (lightbox && lightboxClose && lightboxPrevious && lightboxNext) {
    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrevious.addEventListener("click", () => moveLightbox(-1));
    lightboxNext.addEventListener("click", () => moveLightbox(1));
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeLightbox();
    });
    lightbox.addEventListener("close", () => {
      window.clearTimeout(lightboxCloseTimer);
      lightboxCloseTimer = 0;
      lightbox.classList.remove("is-closing");
      document.body.style.overflow = previousBodyOverflow;
      if (lightboxOrigin && lightboxOrigin.isConnected) lightboxOrigin.focus();
    });
    document.addEventListener("keydown", (event) => {
      if (!lightbox.open) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveLightbox(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveLightbox(1);
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      }
    });
  }

  function applyFilter(category) {
    const version = ++filterVersion;
    let visibleCount = 0;

    cards.forEach((card) => {
      if (card.classList.contains("is-filtering-out")) {
        card.hidden = true;
        card.classList.remove("is-filtering-out");
      }
    });

    cards.forEach((card) => {
      const shouldShow = matchesFilter(card, category);
      if (shouldShow) visibleCount += 1;

      card.querySelectorAll("a, button").forEach((control) => {
        if (shouldShow) control.removeAttribute("tabindex");
        else control.setAttribute("tabindex", "-1");
      });

      if (shouldShow) {
        card.hidden = false;
        card.setAttribute("aria-hidden", "false");
        card.classList.remove("is-filtering-out");
        if (!reducedMotion) {
          card.classList.add("is-entering");
          requestAnimationFrame(() => card.classList.remove("is-entering"));
        } else {
          card.classList.add("is-visible");
        }
      } else {
        card.setAttribute("aria-hidden", "true");
        card.classList.remove("is-entering");
        card.classList.add("is-filtering-out");
        window.setTimeout(() => {
          if (version === filterVersion && !matchesFilter(card, category)) {
            card.hidden = true;
            card.classList.remove("is-filtering-out");
          }
        }, reducedMotion ? 1 : 340);
      }
    });

    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.galleryFilter === category));
    });
    if (status) {
      const name = category === "all" ? "all categories" : filterNames.get(category).toLowerCase();
      status.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "image" : "images"} · ${name}`;
    }
    if (emptyState) emptyState.hidden = visibleCount > 0;
  }

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-filter]");
    if (button && filters.contains(button)) {
      applyFilter(button.dataset.galleryFilter);
      if (lightbox && lightbox.open) closeLightbox();
    }
  });

  grid.addEventListener("click", (event) => {
    const imageTrigger = event.target.closest("[data-gallery-open]");
    if (imageTrigger && grid.contains(imageTrigger)) {
      openLightbox(imageTrigger);
      return;
    }
    const toggle = event.target.closest(".gallery-card__toggle");
    if (!toggle) return;
    const card = toggle.closest(".gallery-card");
    const open = toggle.getAttribute("aria-expanded") !== "true";
    if (open) {
      grid.querySelectorAll(".gallery-card.is-active").forEach((other) => {
        other.classList.remove("is-active");
        other.querySelector(".gallery-card__toggle").setAttribute("aria-expanded", "false");
      });
    }
    card.classList.toggle("is-active", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  if (!reducedMotion && "IntersectionObserver" in window) {
    document.body.classList.add("gallery-motion");
    grid.classList.add("gallery-grid--reveal");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: "0px 0px -24px 0px" });

    document.querySelectorAll(".gallery-reveal").forEach((element) => revealObserver.observe(element));
    cards.forEach((card) => revealObserver.observe(card));
  } else {
    document.querySelectorAll(".gallery-reveal, .gallery-card").forEach((element) => element.classList.add("is-visible"));
  }

  if (hero && !reducedMotion) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
          const offset = Math.max(-18, Math.min(18, -bounds.top * .025));
          hero.style.setProperty("--gallery-parallax", `${offset}px`);
        }
        ticking = false;
      });
    }, { passive: true });
  }
})();
