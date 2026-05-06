/**
 * GPDFTools — Componente de Navegação Global
 * Injeta o header fixo, sidebar e favicon em todas as páginas.
 */
(function () {
  // ── Lógica de Tema ──
  const getTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    
    // Troca as logos dinamicamente
    const logos = document.querySelectorAll(".logo-img, .footer-logo");
    logos.forEach(img => {
      img.src = `./assets/img/logo-${theme}.webp`;
    });
  };

  // Aplica o tema inicial imediatamente
  applyTheme(getTheme());

  // Injeta o Favicon dinamicamente
  const injectFavicon = () => {
    const head = document.head || document.getElementsByTagName("head")[0];
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = "./assets/img/favicon.png";
    head.appendChild(link);

    const appleLink = document.createElement("link");
    appleLink.rel = "apple-touch-icon";
    appleLink.href = "./assets/img/favicon.png";
    head.appendChild(appleLink);
  };

  // Injeta Gradientes Globais para os ícones
  const injectGradients = () => {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.innerHTML = `
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4f7ef8" />
          <stop offset="100%" stop-color="#818cf8" />
        </linearGradient>
      </defs>
    `;
    document.body.appendChild(svg);
  };

  // Injeta Símbolos SVG para serem usados em qualquer lugar
  const injectIconSymbols = () => {
    const div = document.createElement("div");
    div.style.display = "none";
    div.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <symbol id="icon-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </symbol>
        <symbol id="icon-merge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
        </symbol>
        <symbol id="icon-split" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="14" x2="15" y2="14"/>
        </symbol>
        <symbol id="icon-watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="14" r="3"/><path d="M12 11v-1"/>
        </symbol>
        <symbol id="icon-compress" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4l4 4M20 4l-4 4M4 20l4-4M20 20l-4-4"/><path d="M8 4v4H4M16 4v4h4M8 20v-4H4M16 20v-4h4"/>
        </symbol>
        <symbol id="icon-monitor" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </symbol>
        <symbol id="icon-smartphone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 5h2M12 18h.01"/>
        </symbol>
        <symbol id="icon-tablet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M11 16h2"/>
        </symbol>
        <symbol id="icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </symbol>
      </svg>
    `;
    document.body.insertBefore(div, document.body.firstChild);
  };

  injectFavicon();
  injectGradients();
  injectIconSymbols();

  const LINKS = [
    {
      href: "./index.html",
      label: "Home",
      icon: `<svg width="18" height="18"><use xlink:href="#icon-home"/></svg>`,
      match: ["", "index.html"],
    },
    {
      href: "./pdf-merge.html",
      label: "Juntar PDF",
      icon: `<svg width="18" height="18"><use xlink:href="#icon-merge"/></svg>`,
      match: ["pdf-merge.html"],
    },
    {
      href: "./pdf-split.html",
      label: "Dividir PDF",
      icon: `<svg width="18" height="18"><use xlink:href="#icon-split"/></svg>`,
      match: ["pdf-split.html"],
    },
    {
      href: "./pdf-watermark.html",
      label: "Marca d'água",
      icon: `<svg width="18" height="18"><use xlink:href="#icon-watermark"/></svg>`,
      match: ["pdf-watermark.html"],
    },
    {
      href: "./pdf-compress.html",
      label: "Comprimir PDF",
      icon: `<svg width="18" height="18"><use xlink:href="#icon-compress"/></svg>`,
      match: ["pdf-compress.html"],
    },
  ];

  const currentFile = window.location.pathname.split("/").pop().replace(/\/$/, "") || "index.html";

  const linksHTML = LINKS.map(({ href, label, icon, match }) => {
    const isActive = match.includes(currentFile);
    return `
      <a href="${href}" class="${isActive ? "active" : ""}">
        <span class="nav-icon">${icon}</span>
        ${label}
      </a>`;
  }).join("");

  const currentTheme = getTheme();
  const logoPath = `./assets/img/logo-${currentTheme}.webp`;

  const html = `
    <nav class="main-nav" role="navigation" aria-label="Navegação principal">
      <a href="./index.html" class="nav-logo" aria-label="GPDFTools — Página inicial">
        <img src="${logoPath}" alt="GPDFTools" class="logo-img" />
      </a>
      
      <div style="display: flex; align-items: center;">
        <button class="theme-toggle" id="themeToggle" aria-label="Alternar tema claro/escuro">
          <!-- Lua (para modo dark) -->
          <svg viewBox="0 0 24 24" class="moon-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <!-- Sol (para modo light) -->
          <svg viewBox="0 0 24 24" class="sun-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>

        <button class="menu-toggle" id="menuToggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="sidebar">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
      </div>
    </nav>

    <div class="sidebar-overlay" id="sidebarOverlay" aria-hidden="true"></div>

    <aside class="sidebar" id="sidebar" aria-hidden="true">
      <div class="sidebar-header">
        <span class="sidebar-title">Menu</span>
        <button class="sidebar-close" id="sidebarClose" aria-label="Fechar menu">×</button>
      </div>
      <nav class="sidebar-links" aria-label="Links das ferramentas">
        ${linksHTML}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-trust">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Privacidade Total</span>
        </div>
      </div>
    </aside>
  `;

  const footerHTML = `
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-col brand">
            <a href="./index.html" class="footer-logo-link">
              <img src="${logoPath}" alt="GPDFTools" class="footer-logo" />
            </a>
            <p>O conjunto essencial de ferramentas PDF projetado para ser simples, rápido e respeitar a sua privacidade.</p>
          </div>
          <div class="footer-col links">
            <h4>Institucional</h4>
            <ul>
              <li><a href="terms.html">Termos de Uso</a></li>
              <li><a href="privacy.html">Política de Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-copyright">
            &copy; ${new Date().getFullYear()} GPDFTools — Todos os direitos reservados.
          </div>
          <div class="footer-legal">Privacidade e Segurança em primeiro lugar.</div>
        </div>
      </div>
    </footer>
  `;

  const placeholder = document.getElementById("nav-placeholder");
  if (!placeholder) return;
  placeholder.innerHTML = html;
  document.body.insertAdjacentHTML("beforeend", footerHTML);

  // ── Elementos de controle ──
  const menuToggle = document.getElementById("menuToggle");
  const themeToggle = document.getElementById("themeToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const closeBtn = document.getElementById("sidebarClose");

  // Toggle de Tema
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "light" ? "dark" : "light");
    });
  }

  // Controle da Sidebar
  if (menuToggle && sidebar && overlay && closeBtn) {
    const openMenu = () => {
      sidebar.classList.add("open");
      overlay.classList.add("visible");
      menuToggle.classList.add("open");
      document.body.style.overflow = "hidden";
    };

    const closeMenu = () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("visible");
      menuToggle.classList.remove("open");
      document.body.style.overflow = "";
    };

    menuToggle.addEventListener("click", () => (sidebar.classList.contains("open") ? closeMenu() : openMenu()));
    closeBtn.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("open")) closeMenu();
    });
  }
})();
