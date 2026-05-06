/**
 * GPDFTools — Componente de Navegação Global
 * Injeta o header fixo, sidebar e favicon em todas as páginas.
 */
(function () {
  // Injeta o Favicon dinamicamente
  const injectFavicon = () => {
    const head = document.head || document.getElementsByTagName("head")[0];
    
    // Favicon padrão
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = "./assets/img/favicon.png";
    head.appendChild(link);

    // Apple Touch Icon
    const appleLink = document.createElement("link");
    appleLink.rel = "apple-touch-icon";
    appleLink.href = "./assets/img/favicon.png";
    head.appendChild(appleLink);
  };

  injectFavicon();

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
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l4 4M20 4l-4 4M4 20l4-4M20 20l-4-4"/><path d="M8 4v4H4M16 4v4h4M8 20v-4H4M16 20v-4h4"/></svg>`,
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
        <img src="./assets/img/logo.webp" alt="GPDFTools" class="logo-img" />
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
        <div class="sidebar-trust">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Privacidade Total</span>
        </div>
      </div>
    </aside>
  `;

  // ── HTML do Rodapé Profissional ──
  const footerHTML = `
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-grid">
          <!-- Coluna 1: Marca -->
          <div class="footer-col brand">
            <img src="assets/img/logo.webp" alt="GPDFTools" class="footer-logo" />
            <p>Ferramentas de PDF 100% locais. Sua privacidade é nossa prioridade absoluta — nenhum arquivo sai do seu dispositivo.</p>
          </div>
          
          <!-- Coluna 2: Ferramentas -->
          <div class="footer-col">
            <h4>Ferramentas</h4>
            <ul>
              <li><a href="pdf-merge.html">Juntar PDF</a></li>
              <li><a href="pdf-split.html">Dividir PDF</a></li>
              <li><a href="pdf-compress.html">Comprimir PDF</a></li>
              <li><a href="pdf-watermark.html">Marca d'água</a></li>
            </ul>
          </div>
          
          <!-- Coluna 3: Segurança -->
          <div class="footer-col">
            <h4>Segurança</h4>
            <div class="footer-security-badge">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 11.08 20 9 11 18 7 14 9 12"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Processamento 100% Local</span>
            </div>
            <p class="security-desc">Processamos seus arquivos usando o seu próprio navegador. Sem uploads, sem nuvem, sem riscos.</p>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="footer-copyright">
            &copy; ${new Date().getFullYear()} GPDFTools — Todos os direitos reservados.
          </div>
          <div class="footer-legal">
            Privacidade e Segurança em primeiro lugar.
          </div>
        </div>
      </div>
    </footer>
  `;

  // ── Injeta no placeholder ──
  const placeholder = document.getElementById("nav-placeholder");
  if (!placeholder) return;
  placeholder.innerHTML = html;

  // ── Injeta o rodapé no final do body se não houver um placeholder específico ──
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  // ── Elementos de controle ──
  const toggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const closeBtn = document.getElementById("sidebarClose");

  if (toggle && sidebar && overlay && closeBtn) {
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
  }
})();
