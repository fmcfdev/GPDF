/**
 * GPDFTools — Componente de Navegação Global
 * Injeta o header fixo e a sidebar em todas as páginas.
 */
(function () {
  const LINKS = [
    { href: "./index.html", label: "Home", icon: "🏠", match: ["", "index.html"] },
    { href: "./pdf-merge.html", label: "Juntar PDF", icon: "📄", match: ["pdf-merge.html"] },
    { href: "./pdf-split.html", label: "Dividir PDF", icon: "✂️", match: ["pdf-split.html"] },
  ];

  // Detecta a página atual pelo nome do arquivo na URL
  const currentFile =
    window.location.pathname.split("/").pop().replace(/\/$/, "") || "index.html";

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
})();
