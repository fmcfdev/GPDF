const { PDFDocument } = PDFLib;

let srcPdfBytes = null;
let totalPages = 0;
let selectedPages = new Set();

const el = {
  fileInput: document.getElementById("fileInput"),
  dropZone: document.getElementById("dropZone"),
  splitPanel: document.getElementById("splitPanel"),
  fileNameDisplay: document.getElementById("fileNameDisplay"),
  pageCountDisplay: document.getElementById("pageCountDisplay"),
  pagesGrid: document.getElementById("pagesGrid"),
  selectionStatus: document.getElementById("selectionStatus"),
  extractBtn: document.getElementById("extractBtn"),
  resetBtn: document.getElementById("resetBtn"),
  // selectAllBtn: comentado no HTML; descomente lá e aqui para reativar
  // selectAllBtn: document.getElementById("selectAllBtn"),
  invertSelBtn: document.getElementById("invertSelBtn"),
  clearSelBtn: document.getElementById("clearSelBtn"),
  rangeInput: document.getElementById("rangeInput"),
  applyRangeBtn: document.getElementById("applyRangeBtn"),
  status: document.getElementById("statusUpdate"),
  loaderOverlay: document.getElementById("loaderOverlay"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),
};

// Detecção de dispositivo mobile
const isMobileDevice =
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );

if (isMobileDevice) {
  const selectorText = document.querySelector(".selector");
  if (selectorText) {
    selectorText.innerHTML =
      '<span style="text-decoration: underline">Clique aqui</span> para selecionar um arquivo PDF';
  }
}

// ────────────────────────────────────────────
// Eventos de Upload
// ────────────────────────────────────────────

el.dropZone.addEventListener("click", () => el.fileInput.click());

["dragenter", "dragover", "dragleave", "drop"].forEach((name) => {
  el.dropZone.addEventListener(name, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

el.dropZone.addEventListener("dragenter", () =>
  el.dropZone.classList.add("dragover")
);
el.dropZone.addEventListener("dragleave", () =>
  el.dropZone.classList.remove("dragover")
);
el.dropZone.addEventListener("drop", (e) => {
  el.dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") loadFile(file);
});

el.fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) loadFile(file);
});

// ────────────────────────────────────────────
// Carregar e Analisar o PDF
// ────────────────────────────────────────────

async function loadFile(file) {
  try {
    el.status.innerText = "Analisando o arquivo...";
    srcPdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(srcPdfBytes, { ignoreEncryption: true });
    totalPages = pdfDoc.getPageCount();
    selectedPages = new Set();
    el.fileInput.value = "";

    el.fileNameDisplay.textContent = `📄 ${file.name}`;
    el.pageCountDisplay.textContent = `${totalPages} página(s) encontrada(s)`;
    el.rangeInput.value = "";

    el.dropZone.style.display = "none";
    el.splitPanel.style.display = "block";
    el.status.innerText = "";

    renderGrid();
  } catch (err) {
    console.error(err);
    el.status.innerText = "Erro ao ler o arquivo. Verifique se ele não está corrompido.";
  }
}

// ────────────────────────────────────────────
// Grid de Páginas
// ────────────────────────────────────────────

function renderGrid() {
  el.pagesGrid.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const card = document.createElement("div");
    card.className = "page-card" + (selectedPages.has(i) ? " selected" : "");
    card.dataset.page = i;

    card.innerHTML = `
      <div class="page-card-icon">📄</div>
      <div class="page-number">Pág. ${i}</div>
      <div class="page-check">✓</div>
    `;

    card.addEventListener("click", () => togglePage(i, card));
    el.pagesGrid.appendChild(card);
  }
  updateStatus();
}

function togglePage(pageNum, card) {
  if (selectedPages.has(pageNum)) {
    selectedPages.delete(pageNum);
    card.classList.remove("selected");
  } else {
    selectedPages.add(pageNum);
    card.classList.add("selected");
  }
  updateStatus();
}

function updateStatus() {
  const count = selectedPages.size;
  el.selectionStatus.textContent =
    count === 0
      ? "Nenhuma página selecionada."
      : `${count} página(s) selecionada(s): ${[...selectedPages].sort((a, b) => a - b).join(", ")}`;
  el.extractBtn.disabled = count === 0;
}

// ────────────────────────────────────────────
// Ações de Seleção
// ────────────────────────────────────────────

// el.selectAllBtn?.addEventListener("click", () => {
//   for (let i = 1; i <= totalPages; i++) selectedPages.add(i);
//   renderGrid();
// });

el.invertSelBtn.addEventListener("click", () => {
  for (let i = 1; i <= totalPages; i++) {
    if (selectedPages.has(i)) selectedPages.delete(i);
    else selectedPages.add(i);
  }
  renderGrid();
});

el.clearSelBtn.addEventListener("click", () => {
  selectedPages = new Set();
  renderGrid();
});

// ────────────────────────────────────────────
// Seleção por Intervalo
// ────────────────────────────────────────────

el.applyRangeBtn.addEventListener("click", applyRange);
el.rangeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") applyRange();
});

function applyRange() {
  const raw = el.rangeInput.value.trim();
  if (!raw) return;

  const parts = raw.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    const singleMatch = trimmed.match(/^(\d+)$/);

    if (rangeMatch) {
      const from = parseInt(rangeMatch[1]);
      const to = parseInt(rangeMatch[2]);
      for (let i = Math.min(from, to); i <= Math.max(from, to); i++) {
        if (i >= 1 && i <= totalPages) selectedPages.add(i);
      }
    } else if (singleMatch) {
      const num = parseInt(singleMatch[1]);
      if (num >= 1 && num <= totalPages) selectedPages.add(num);
    }
  }

  renderGrid();
  el.rangeInput.value = "";
}

// ────────────────────────────────────────────
// Trocar Arquivo (Reset)
// ────────────────────────────────────────────

el.resetBtn.addEventListener("click", () => {
  el.fileInput.value = "";
  el.fileInput.click();
});

// ────────────────────────────────────────────
// Extrair e Baixar PDF
// ────────────────────────────────────────────

el.extractBtn.addEventListener("click", async () => {
  if (selectedPages.size === 0) return;

  try {
    el.loaderOverlay.style.display = "flex";
    updateProgress(0);

    const srcPdf = await PDFDocument.load(srcPdfBytes, { ignoreEncryption: true });
    const newPdf = await PDFDocument.create();

    const sortedPages = [...selectedPages].sort((a, b) => a - b);
    const indices = sortedPages.map((p) => p - 1);

    const copiedPages = await newPdf.copyPages(srcPdf, indices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    updateProgress(80);
    await new Promise((r) => setTimeout(r, 50));

    const finalBytes = await newPdf.save();
    updateProgress(100);

    const blob = new Blob([finalBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GPDF_Extraido.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Erro ao gerar o PDF. Verifique se o arquivo não está corrompido.");
  } finally {
    el.loaderOverlay.style.display = "none";
  }
});

function updateProgress(percent) {
  el.progressBar.style.width = percent + "%";
  el.progressText.innerText = percent + "%";
}
