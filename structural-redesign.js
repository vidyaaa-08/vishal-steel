(() => {
  "use strict";

  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const rebuilt = new Set(["faq.html", "contact.html", "index.html", "about.html"]);
  if (rebuilt.has(page)) return;

  const main = document.querySelector("main");
  if (!main) return;

  const preservedFormNodes = [...main.querySelectorAll("form")]
    .map(form => form);
  const originalImages = [...main.querySelectorAll("img")]
    .map(img => ({ src: img.currentSrc || img.getAttribute("src"), alt: img.getAttribute("alt") || "" }))
    .filter(item => item.src);
  const headings = [...main.querySelectorAll("h1,h2,h3")]
    .map(el => el.textContent.trim())
    .filter(Boolean);
  const links = [...main.querySelectorAll("a[href]")]
    .map(a => ({ text: a.textContent.trim(), href: a.getAttribute("href") }))
    .filter(item => item.text && item.href && !item.href.startsWith("#"));
  const title = document.querySelector("h1")?.textContent.trim()
    || document.querySelector("title")?.textContent.replace(/\s*\|.*$/, "").trim()
    || "Vishal Steel Products";

  const asset = (index = 0) => originalImages[index]?.src || "./assets/images/homepage/indexbanner1.png";
  const alt = (index = 0) => originalImages[index]?.alt || "Vishal Steel Products solution";
  const splitTitle = title.length > 24
    ? title.split(/\s+/).slice(0, Math.ceil(title.split(/\s+/).length / 2)).join(" ")
      + "<em>" + title.split(/\s+/).slice(Math.ceil(title.split(/\s+/).length / 2)).join(" ") + "</em>"
    : title + "<em>V STEEL</em>";

  const escaped = value => String(value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  document.body.dataset.srPage = page.replace(".html", "");

  function shellFor(kind) {
    const heroKicker = kind === "legal" ? "Vishal Steel Products / Document"
      : kind === "project" ? "Vishal Steel Products / Selected work"
      : kind === "product" ? "Vishal Steel Products / Product range"
      : kind === "service" ? "Vishal Steel Products / Services"
      : kind === "company" ? "Vishal Steel Products / Company"
      : "Vishal Steel Products";

    const narrative = [...main.querySelectorAll("p")]
      .map(p => p.textContent.trim())
      .find(p => p.length > 70) || "Purpose-led manufacturing solutions planned around real work, operational demands and available space.";

    const isLegal = kind === "legal";
    if (isLegal) {
      const articles = [...main.querySelectorAll("section,article")]
        .map(el => el.innerHTML)
        .filter(html => html.replace(/<[^>]+>/g, "").trim().length > 120)
        .slice(0, 8);
      main.innerHTML = `
        <section class="sr-legal-hero"><div class="sr-shell"><p class="sr-eyebrow">${heroKicker}</p><h1>${escaped(title)}</h1></div></section>
        <section class="sr-legal"><div class="sr-shell sr-legal-grid">
          <aside><strong>Document</strong><span>Official site information</span></aside>
          <article class="sr-legal-content">${articles.join("") || main.innerHTML}</article>
        </div></section>`;
      return;
    }

    const sectionTitles = headings.filter(h => h !== title).slice(0, 9);
    const visibleLinks = links.filter(l => l.href).slice(0, 8);
    const tiles = sectionTitles.map((heading, i) => `
      <article class="sr-tile sr-reveal">
        <div class="sr-tile__number">0${i + 1}</div>
        <h3>${escaped(heading)}</h3>
        <a href="${visibleLinks[i]?.href || "#enquire"}" aria-label="${escaped(heading)}">Explore <span>↗</span></a>
      </article>`).join("");

    const featureCards = [0, 1, 2, 3].map((i) => `
      <article class="sr-card sr-reveal">
        <div class="sr-card__image"><img src="${asset(i)}" alt="${escaped(alt(i))}" loading="${i ? "lazy" : "eager"}"></div>
        <div class="sr-card__body">
          <small>${String(i + 1).padStart(2, "0")} / V STEEL</small>
          <h3>${escaped(sectionTitles[i] || `Purpose-led ${kind} solution`)}</h3>
        </div>
      </article>`).join("");

    main.innerHTML = `
      <section class="sr-hero sr-hero--${kind} sr-hero--${page.replace(".html","")}">
        <div class="sr-hero__copy sr-reveal">
          <p class="sr-eyebrow">${heroKicker}</p>
          <h1>${splitTitle}</h1>
          <p class="sr-hero__copytext">${escaped(narrative)}</p>
          <a class="sr-cta" href="./contact.html">Discuss a project <span>↗</span></a>
        </div>
        <div class="sr-hero__visual sr-reveal">
          <img src="${asset(0)}" alt="${escaped(alt(0))}" fetchpriority="high">
          <span>V / S / 01</span>
        </div>
      </section>
      <section class="sr-index">
        <div class="sr-shell sr-index__grid">${tiles || `<article class="sr-tile"><h3>Made around the application</h3></article>`}</div>
      </section>
      <section class="sr-showcase">
        <header class="sr-shell sr-showcase__head sr-reveal">
          <p class="sr-eyebrow">${kind === "project" ? "Project gallery" : "Range and capability"}</p>
          <h2>${kind === "project" ? "Work, viewed as<br>real environments." : "Designed for the<br>way work happens."}</h2>
        </header>
        <div class="sr-shell sr-card-grid">${featureCards}</div>
      </section>
      <section class="sr-story">
        <div class="sr-story__image sr-reveal"><img src="${asset(1)}" alt="${escaped(alt(1))}" loading="lazy"></div>
        <div class="sr-story__copy sr-reveal">
          <p class="sr-eyebrow">Built for the brief</p>
          <h2>One clear process.<br>Every detail considered.</h2>
          <p>${escaped(narrative)}</p>
          <a class="sr-cta sr-cta--light" href="./contact.html">Request a quotation <span>↗</span></a>
        </div>
      </section>
      
    if (preservedFormNodes.length) {
      const formSlot = main.querySelector(".sr-preserved-form");
      preservedFormNodes.forEach(form => formSlot?.appendChild(form));
    }
  }

  if (/terms|privacy/.test(page)) shellFor("legal");
  else if (/project|testimonial/.test(page)) shellFor("project");
  else if (/about/.test(page)) shellFor("company");
  else if (/service|fabrication|consultant|shipping|sales/.test(page)) shellFor("service");
  else if (/lockers|cabinets|trolleys|workbench|laboratory|hospital|industry|custom-steel|products/.test(page)) shellFor("product");
  else shellFor("service");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced && "IntersectionObserver" in window) {
    document.body.classList.add("sr-motion");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.09, rootMargin: "0px 0px -22px 0px" });
    document.querySelectorAll(".sr-reveal").forEach(el => observer.observe(el));
  }
})();
