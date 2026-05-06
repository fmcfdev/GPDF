/**
 * GPDFTools — Lógica de Busca de Ferramentas
 * Implementa filtragem em tempo real e atalho Ctrl + K.
 */
(function () {
  const searchInput = document.getElementById("toolSearch");
  const toolCards = document.querySelectorAll(".tool-card");

  if (!searchInput) return;

  // Função para remover acentos e normalizar o texto
  function normalizeText(text) {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // 1. Atalho Ctrl + K para focar na busca
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // 2. Lógica de Filtragem
  searchInput.addEventListener("input", (e) => {
    const query = normalizeText(e.target.value);

    toolCards.forEach((card) => {
      const title = normalizeText(card.querySelector("h3").textContent);
      const description = normalizeText(card.querySelector("p").textContent);

      if (title.includes(query) || description.includes(query)) {
        card.style.display = "flex";
        card.style.opacity = "1";
        card.style.transform = "scale(1)";
      } else {
        card.style.display = "none";
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
      }
    });
  });

  // 3. Limpar busca com Esc
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
      searchInput.blur();
    }
  });
})();
