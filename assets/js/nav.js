/**
 * GPDFTools — Componente de Navegação Global
 * Injeta o header fixo e a sidebar em todas as páginas.
 */
(function () {
  const LINKS = [
    {
      href: "./index.html",
      label: "Home",
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      match: ["", "index.html"],
    },
    {
      href: "./pdf-merge.html",
      label: "Juntar PDF",
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
      match: ["pdf-merge.html"],
    },
    {
      href: "./pdf-split.html",
      label: "Dividir PDF",
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
      match: ["pdf-split.html"],
    },
    {
      href: "./pdf-watermark.html",
      label: "Marca d'água",
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="14" r="3"/></svg>`,
      match: ["pdf-watermark.html"],
    },
    {
      href: "./pdf-compress.html",
      label: "Comprimir PDF",
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14V4a2 2 0 0 1 2-2h10l4 4v14a2 2 0 0 1-2 2H4"/><polyline points="14 2 14 8 20 8"/><path d="M12 12v6"/><path d="M9 15l3 3 3-3"/></svg>`,
      match: ["pdf-compress.html"],
    },
  ];

  // Detecta a página atual pelo nome do arquivo na URL
  const currentFile =
    window.location.pathname.split("/").pop().replace(/\/$/, "") ||
    "index.html";

  // ── Cria os links da sidebar marcando o ativo ──
  const linksHTML = LINKS.map(({ href, label, icon, match }) => {
    const isActive = match.includes(currentFile);
    return `
      <a href="${href}" class="${isActive ? "active" : ""}">
        <span class="nav-icon">${icon}</span>
        ${label}
      </a>`;
  }).join("");

  // ── HTML do componente completo ──
  const html = `
    <nav class="main-nav" role="navigation" aria-label="Navegação principal">
      <a href="./index.html" class="nav-logo" aria-label="GPDFTools — Página inicial">
        GPDF<span>Tools</span>
      </a>
      <button
        class="menu-toggle"
        id="menuToggle"
        aria-label="Abrir menu de navegação"
        aria-expanded="false"
        aria-controls="sidebar"
      >
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
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
        <p>
          <span class="shield-icon" aria-hidden="true">🔒</span>
          Seus arquivos nunca saem do seu dispositivo. Processamento 100% local.
        </p>
      </div>
    </aside>
  `;

  // ── Injeta no placeholder ──
  const placeholder = document.getElementById("nav-placeholder");
  if (!placeholder) return;
  placeholder.innerHTML = html;

  // ── Elementos de controle ──
  const toggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const closeBtn = document.getElementById("sidebarClose");

  function openMenu() {
    sidebar.classList.add("open");
    overlay.classList.add("visible");
    toggle.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    sidebar.setAttribute("aria-hidden", "false");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeMenu() : openMenu();
  });

  closeBtn.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);

  // Fecha com Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) closeMenu();
  });

  // ── Insere o Footer global ──
  const footerHTML = `
    <footer>
      <div class="trust-badge" style="margin-bottom: 0;">
        <span>
          <span style="display: flex; justify-content: center; align-items: center; gap: 8px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Processamento 100% local
          </span>
          Seus arquivos nunca saem do dispositivo proporcionando total segurança e privacidade.
        </span>
      </div>
    </footer>
  `;

  const container = document.querySelector(".page-container, .home-container");
  if (container) {
    container.insertAdjacentHTML("beforeend", footerHTML);
  }
})();
