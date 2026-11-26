(() => {
  "use strict";

  if (window.__vsChatbotInitialized || document.getElementById("vs-chatbot")) return;
  window.__vsChatbotInitialized = true;

  const scriptUrl = document.currentScript?.src || window.location.href;
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("chatbot.css", scriptUrl).href;
  stylesheet.dataset.vsChatbotStyle = "true";
  document.head.appendChild(stylesheet);

  const root = document.createElement("div");
  root.id = "vs-chatbot";
  root.innerHTML = `
    <button class="vs-chat-launcher" type="button" aria-label="Chat with us" aria-controls="vs-chat-panel" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M5 18.5 3.8 21l3.6-1.1c1.3.7 2.8 1.1 4.4 1.1 5 0 9-3.8 9-8.5S16.8 4 11.8 4s-9 3.8-9 8.5c0 2.3.8 4.4 2.2 6Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7.5 12.5h.01m4.29 0h.01m4.29 0h.01" stroke="#E0B454" stroke-width="2.6" stroke-linecap="round"/>
      </svg>
      <span class="vs-chat-launcher__dot" aria-hidden="true"></span>
      <span class="vs-chat-launcher__tooltip" aria-hidden="true">Chat with us</span>
    </button>
    <section class="vs-chat-panel" id="vs-chat-panel" role="dialog" aria-modal="false" aria-labelledby="vs-chat-title" hidden>
      <header class="vs-chat-header">
        <img class="vs-chat-header__logo" src="./assets/images/optimized/vishal-logo.png" alt="Vishal Steel Products">
        <div class="vs-chat-header__identity">
          <strong class="vs-chat-header__name" id="vs-chat-title">V STEEL Assistant</strong>
          <span class="vs-chat-header__subtitle">Here to help you</span>
          <span class="vs-chat-header__status">Online</span>
        </div>
        <div class="vs-chat-header__actions">
          <button type="button" data-chat-minimize aria-label="Minimize chat" title="Minimize">−</button>
          <button type="button" data-chat-close aria-label="Close chat" title="Close">×</button>
        </div>
      </header>
      <div class="vs-chat-body">
        <div class="vs-chat-messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Chat messages"></div>
        <form class="vs-chat-composer" data-chat-form>
          <label class="vs-chat-sr-only" for="vs-chat-input">Write your message</label>
          <input class="vs-chat-input" id="vs-chat-input" type="text" maxlength="1000" autocomplete="off" placeholder="Type your message...">
          <button class="vs-chat-send" type="submit" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="m4 4 17 8-17 8 3-8-3-8Zm3 8h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </form>
        <footer class="vs-chat-footer">
          <span class="vs-chat-sr-only" data-chat-status role="status" aria-live="polite"></span>
          <button type="button" data-chat-restart>Restart conversation</button>
          <span>Vishal Steel Products</span>
        </footer>
      </div>
    </section>
  `;
  document.body.appendChild(root);

  const launcher = root.querySelector(".vs-chat-launcher");
  const panel = root.querySelector(".vs-chat-panel");
  const messages = root.querySelector(".vs-chat-messages");
  const input = root.querySelector(".vs-chat-input");
  const form = root.querySelector("[data-chat-form]");
  const status = root.querySelector("[data-chat-status]");
  const minimizeButton = root.querySelector("[data-chat-minimize]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const productChoices = [
    { label: "Office Furniture", route: "./Industry-Steel-Furniture.html", summary: "commercial office furniture and workspace solutions" },
    { label: "Storage Solutions", route: "./products.html", summary: "steel storage and space-efficient storage systems" },
    { label: "Tool Trolleys", route: "./trolleys.html", summary: "tool trolleys for industrial, medical and logistics applications" },
    { label: "Industrial Workbenches", route: "./workbench.html", summary: "industrial and laboratory workbenches" },
    { label: "Office Lockers", route: "./lockers.html", summary: "steel lockers for office and operational storage" },
    { label: "Custom Steel Solutions", route: "./custom-steel.html", summary: "custom steel solutions developed around your requirements" }
  ];

  const mainChoices = [
    { label: "Explore Our Products", value: "products" },
    { label: "Manufacturing Services", value: "services" },
    { label: "Design Consultation", value: "design" },
    { label: "Request a Quote", value: "quote" },
    { label: "Contact Our Team", value: "contact" },
    { label: "About V STEEL", value: "about" }
  ];

  let welcomed = false;
  let productMode = false;
  let quoteStep = -1;
  let quoteData = {};
  let conversationVersion = 0;
  let replyQueue = Promise.resolve();
  const quoteFields = ["name", "company", "interest", "requirement", "email", "phone"];
  const quotePrompts = [
    "What is your name?",
    "What is your company name? (Optional — choose Skip if you prefer not to share.)",
    "What product or service are you interested in?",
    "What is your requirement?",
    "What is your email address?",
    "What is your contact number? (Optional — choose Skip if you prefer not to share.)"
  ];

  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  function scrollToLatest() {
    messages.scrollTo({
      top: messages.scrollHeight,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
  }

  function appendMessage(role, text, options = {}) {
    const row = document.createElement("div");
    row.className = `vs-chat-message vs-chat-message--${role}`;

    const bubble = document.createElement("div");
    bubble.className = "vs-chat-bubble";
    bubble.textContent = text;
    row.appendChild(bubble);

    if (options.links?.length) {
      const links = document.createElement("div");
      links.className = "vs-chat-links";
      options.links.forEach((item) => {
        const anchor = document.createElement("a");
        anchor.className = "vs-chat-link";
        anchor.href = item.href;
        anchor.textContent = item.label;
        if (item.href.startsWith("http")) {
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";
        }
        links.appendChild(anchor);
      });
      row.appendChild(links);
    }

    if (options.replies?.length) {
      const replies = document.createElement("div");
      replies.className = "vs-chat-replies";
      options.replies.forEach((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `vs-chat-reply${index === 0 && item.primary ? " vs-chat-reply--primary" : ""}`;
        button.textContent = item.label;
        button.dataset.chatChoice = item.value;
        replies.appendChild(button);
      });
      row.appendChild(replies);
    }

    messages.appendChild(row);
    scrollToLatest();
    return row;
  }

  function assistant(text, options = {}) {
    const version = conversationVersion;
    replyQueue = replyQueue.then(async () => {
      if (version !== conversationVersion) return;
      const typing = document.createElement("div");
      typing.className = "vs-chat-message vs-chat-message--assistant";
      typing.setAttribute("aria-label", "V STEEL Assistant is typing");
      typing.innerHTML = '<div class="vs-chat-typing" aria-hidden="true"><span></span><span></span><span></span></div>';
      messages.appendChild(typing);
      scrollToLatest();
      await wait(reducedMotion.matches ? 100 : 420);
      typing.remove();
      if (version === conversationVersion) appendMessage("assistant", text, options);
    });
    return replyQueue;
  }

  function replyChoices(choices, primaryFirst = false) {
    return choices.map((choice, index) => ({
      label: choice.label,
      value: choice.value,
      primary: primaryFirst && index === 0
    }));
  }

  function openPanel() {
    panel.hidden = false;
    panel.classList.remove("is-minimized");
    minimizeButton.setAttribute("aria-label", "Minimize chat");
    minimizeButton.title = "Minimize";
    launcher.setAttribute("aria-expanded", "true");
    root.querySelector(".vs-chat-launcher__dot").hidden = true;
    input.focus();
    if (!welcomed) {
      welcomed = true;
      assistant("Hello! Welcome to V STEEL.\n\nI'm your virtual assistant. How can I help you today?", {
        replies: replyChoices(mainChoices, true)
      });
    }
  }

  function closePanel() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  function normalizeInput(value, maxLength = 1000) {
    return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength);
  }

  function showProducts() {
    productMode = true;
    assistant("What type of product are you looking for?", {
      replies: replyChoices(productChoices.map((product) => ({
        label: product.label,
        value: `product:${product.label}`
      })))
    });
  }

  function showServices() {
    assistant("V STEEL can help with fabrication, design coordination, manufacturing and delivery support. Explore the relevant service:", {
      links: [
        { label: "Custom Fabrication", href: "./custom-fabrication.html" },
        { label: "Design Consultation", href: "./design-consultant.html" },
        { label: "Manufacturing Services", href: "./service.html" },
        { label: "Delivery & Support", href: "./global-shipping.html" }
      ]
    });
  }

  async function startQuote() {
    quoteData = {};
    quoteStep = 0;
    await assistant("I can help you prepare an enquiry. I’ll ask one question at a time. Your details will stay in this browser unless you choose to open an email draft after reviewing them.");
    askQuoteQuestion();
  }

  function askQuoteQuestion(errorText = "") {
    const replies = [];
    if (quoteStep === 2) {
      productChoices.forEach((product) => replies.push({ label: product.label, value: `quote-interest:${product.label}` }));
    }
    if (quoteStep === 1 || quoteStep === 5) replies.push({ label: "Skip", value: "quote-skip" });
    assistant(`${errorText ? `${errorText}\n\n` : ""}${quotePrompts[quoteStep]}`, { replies });
  }

  function quoteSummary() {
    const summary = [
      `Name: ${quoteData.name}`,
      `Company: ${quoteData.company || "Not provided"}`,
      `Interested in: ${quoteData.interest}`,
      `Requirement: ${quoteData.requirement}`,
      `Email: ${quoteData.email}`,
      `Contact number: ${quoteData.phone || "Not provided"}`
    ].join("\n");
    quoteStep = -2;
    assistant(`Please review your enquiry details:\n\n${summary}\n\nIs this information correct?`, {
      replies: [
        { label: "Yes, continue", value: "quote-confirm" },
        { label: "Start over", value: "quote-restart" }
      ]
    });
  }

  function processQuoteAnswer(rawValue) {
    const field = quoteFields[quoteStep];
    const value = normalizeInput(rawValue, field === "requirement" ? 1000 : field === "email" ? 254 : field === "company" ? 120 : 120);
    const optionalSkip = value.toLowerCase() === "skip" && (field === "company" || field === "phone");

    if (field === "name" && (value.length < 2 || value.length > 100)) {
      askQuoteQuestion("Please enter a name between 2 and 100 characters.");
      return;
    }
    if (field === "company" && value.length > 120) {
      askQuoteQuestion("Please keep the company name under 120 characters, or choose Skip.");
      return;
    }
    if (field === "interest" && value.length < 2) {
      askQuoteQuestion("Please tell me which product or service you’re interested in.");
      return;
    }
    if (field === "requirement" && value.length < 5) {
      askQuoteQuestion("Please add a little more detail about your requirement (at least 5 characters).");
      return;
    }
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      askQuoteQuestion("That email address doesn’t look valid. Please enter it in a name@example.com format.");
      return;
    }
    if (field === "phone" && !optionalSkip) {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15 || !/^[+\d().\-\s]+$/.test(value)) {
        askQuoteQuestion("Please enter a phone number with 7–15 digits, or choose Skip.");
        return;
      }
    }

    quoteData[field] = optionalSkip ? "" : value;
    quoteStep += 1;
    if (quoteStep === quoteFields.length) quoteSummary();
    else askQuoteQuestion();
  }

  function emailDraftLink() {
    const subject = "V STEEL project enquiry";
    const body = [
      "Hello V STEEL,",
      "",
      "I would like to discuss the following requirement:",
      `Name: ${quoteData.name}`,
      `Company: ${quoteData.company || "Not provided"}`,
      `Product or service: ${quoteData.interest}`,
      `Requirement: ${quoteData.requirement}`,
      `Email: ${quoteData.email}`,
      `Contact number: ${quoteData.phone || "Not provided"}`
    ].join("\n");
    return `mailto:sales@vishalsteelproducts.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function showContactOptions() {
    assistant("You can contact the team directly. Nothing has been sent from this chat.", {
      links: [
        { label: "Contact page", href: "./contact.html" },
        { label: "Call +91 8828991702", href: "tel:+918828991702" },
        { label: "Email V STEEL", href: "mailto:sales@vishalsteelproducts.com" }
      ]
    });
  }

  function answerProduct(label) {
    const product = productChoices.find((item) => item.label === label);
    if (!product) {
      assistant("I couldn’t match that product. Please choose one of the product categories below, or contact the team for help.", {
        replies: replyChoices(productChoices.map((item) => ({ label: item.label, value: `product:${item.label}` })))
      });
      return;
    }
    productMode = false;
    assistant(`I can help you explore ${product.summary}.`, {
      links: [{ label: `Explore ${product.label}`, href: product.route }, { label: "Request a Quote", href: "./contact.html" }]
    });
  }

  function handleGeneralMessage(value) {
    const message = value.toLowerCase();
    if (/\b(40\+?|forty|experience|founded|established|history|year)\b/.test(message)) {
      assistant("Vishal Steel Products was established in 1986 and brings 40+ years of industry experience.", {
        links: [{ label: "About V STEEL", href: "./about.html" }]
      });
    } else if (/\b(product|products|category|categories|furniture|locker|trolley|workbench|storage)\b/.test(message)) {
      showProducts();
    } else if (/\b(manufactur|fabricat|service|delivery|support)\b/.test(message)) {
      showServices();
    } else if (/\b(design|consult|planning)\b/.test(message)) {
      assistant("The design consultation team can discuss your space, application and product requirements.", {
        links: [{ label: "Design Consultation", href: "./design-consultant.html" }, { label: "Contact Our Team", href: "./contact.html" }]
      });
    } else if (/\b(quote|quotation|enquir|project|requirement|price|cost)\b/.test(message)) {
      startQuote();
    } else if (/\b(contact|phone|call|email|address|team)\b/.test(message)) {
      showContactOptions();
    } else if (/\b(about|company|v steel|vishal|chameza)\b/.test(message)) {
      assistant("Vishal Steel Products is part of Chameza Group and serves commercial, laboratory, healthcare and industrial environments with steel furniture and related solutions. The business was established in 1986.", {
        links: [{ label: "About V STEEL", href: "./about.html" }]
      });
    } else {
      assistant("I’m not sure I understood that. I can help you explore products, find a service, start a quote request or contact the V STEEL team.", {
        replies: replyChoices(mainChoices)
      });
    }
  }

  function resetConversation() {
    conversationVersion += 1;
    replyQueue = Promise.resolve();
    messages.replaceChildren();
    welcomed = true;
    productMode = false;
    quoteStep = -1;
    quoteData = {};
    assistant("Hello! Welcome to V STEEL.\n\nI'm your virtual assistant. How can I help you today?", {
      replies: replyChoices(mainChoices, true)
    });
    status.textContent = "Conversation restarted.";
  }

  async function handleChoice(value, label) {
    appendMessage("user", label);

    if (value === "quote-restart") {
      startQuote();
      return;
    }
    if (value === "quote-confirm") {
      quoteStep = -3;
      assistant("May I place these details in a prefilled email draft to V STEEL? Nothing is sent until you review and send the email.", {
        replies: [
          { label: "Yes, open email draft", value: "quote-consent-yes", primary: true },
          { label: "No, show contact options", value: "quote-consent-no" }
        ]
      });
      return;
    }
    if (value === "quote-consent-yes") {
      quoteStep = -1;
      assistant("Your email draft is ready. It has not been sent; please review it and choose Send in your email app.", {
        links: [{ label: "Open prefilled email draft", href: emailDraftLink() }, { label: "Contact page", href: "./contact.html" }]
      });
      return;
    }
    if (value === "quote-consent-no") {
      quoteStep = -1;
      quoteData = {};
      showContactOptions();
      return;
    }
    if (value === "products") {
      showProducts();
      return;
    }
    if (value === "services") {
      showServices();
      return;
    }
    if (value === "design") {
      assistant("Our design consultation service can help discuss your space, product application and project requirements.", {
        links: [{ label: "Design Consultation", href: "./design-consultant.html" }, { label: "Contact Our Team", href: "./contact.html" }]
      });
      return;
    }
    if (value === "quote") {
      startQuote();
      return;
    }
    if (value === "contact") {
      showContactOptions();
      return;
    }
    if (value === "about") {
      assistant("Vishal Steel Products was established in 1986 and has 40+ years of industry experience. It is part of Chameza Group.", {
        links: [{ label: "About V STEEL", href: "./about.html" }]
      });
      return;
    }
    if (value.startsWith("product:")) {
      answerProduct(value.slice("product:".length));
      return;
    }
    if (value.startsWith("quote-interest:") && quoteStep === 2) {
      processQuoteAnswer(value.slice("quote-interest:".length));
      return;
    }
    if (quoteStep >= 0) {
      processQuoteAnswer(value === "quote-skip" ? "Skip" : label);
      return;
    }

    handleGeneralMessage(label);
  }

  launcher.addEventListener("click", openPanel);
  root.querySelector("[data-chat-close]").addEventListener("click", closePanel);
  minimizeButton.addEventListener("click", () => {
    const minimized = panel.classList.toggle("is-minimized");
    minimizeButton.setAttribute("aria-label", minimized ? "Restore chat" : "Minimize chat");
    minimizeButton.title = minimized ? "Restore" : "Minimize";
    if (!minimized) input.focus();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = normalizeInput(input.value);
    if (!value) return;
    input.value = "";
    appendMessage("user", value);
    if (quoteStep >= 0) processQuoteAnswer(value);
    else if (productMode && productChoices.some((product) => value.toLowerCase().includes(product.label.toLowerCase()))) answerProduct(value);
    else if (productMode) {
      productMode = false;
      handleGeneralMessage(value);
    }
    else handleGeneralMessage(value);
    input.focus();
  });

  messages.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chat-choice]");
    if (!button) return;
    button.parentElement.querySelectorAll("button").forEach((choice) => { choice.disabled = true; });
    handleChoice(button.dataset.chatChoice, button.textContent.trim());
    input.focus();
  });

  root.querySelector("[data-chat-restart]").addEventListener("click", resetConversation);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closePanel();
  });

  function updateBackToTopOffset() {
    root.classList.toggle("is-backtop-visible", window.scrollY > 400);
  }
  window.addEventListener("scroll", updateBackToTopOffset, { passive: true });
  updateBackToTopOffset();
})();
