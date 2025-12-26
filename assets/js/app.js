const { PDFDocument } = PDFLib;
let selectedFiles = [];

const elements = {
  fileInput: document.getElementById("fileInput"),
  fileList: document.getElementById("fileList"),
  mergeBtn: document.getElementById("mergeBtn"),
  clearAllBtn: document.getElementById("clearAllBtn"),
  dropZone: document.getElementById("dropZone"),
  filterInput: document.getElementById("filterInput"),
  clearFilter: document.getElementById("clearFilterBtn"),
  status: document.getElementById("statusUpdate"),
  loaderOverlay: document.getElementById("loaderOverlay"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),
};

// Faz a DropZone abrir o seletor de arquivos ao clicar
elements.dropZone.addEventListener("click", (e) => {
  // Evita abrir o seletor se clicar em botões, inputs ou na lista
  if (
    e.target === elements.dropZone ||
    e.target.tagName === "P" ||
    e.target.tagName === "H2" ||
    e.target.tagName === "STRONG"
  ) {
    elements.fileInput.click();
  }
});

// Drag and Drop
["dragenter", "dragover", "dragleave", "drop"].forEach((name) => {
  elements.dropZone.addEventListener(name, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});
elements.dropZone.addEventListener("dragenter", () =>
  elements.dropZone.classList.add("dragover")
);
elements.dropZone.addEventListener("dragleave", () =>
  elements.dropZone.classList.remove("dragover")
);
elements.dropZone.addEventListener("drop", (e) => {
  elements.dropZone.classList.remove("dragover");
  const files = Array.from(e.dataTransfer.files).filter(
    (f) => f.type === "application/pdf"
  );
  addFiles(files);
});

elements.fileInput.addEventListener("change", (e) =>
  addFiles(Array.from(e.target.files))
);
elements.filterInput.addEventListener("input", () => render());
elements.clearFilter.addEventListener("click", () => {
  elements.filterInput.value = "";
  render();
});

function addFiles(files) {
  selectedFiles = [...selectedFiles, ...files];
  render();
  elements.fileInput.value = ""; // Limpa o input para não mostrar "X arquivos"
}

function render() {
  elements.fileList.innerHTML = "";
  const term = elements.filterInput.value.toLowerCase();
  selectedFiles.forEach((file, i) => {
    if (file.name.toLowerCase().includes(term)) {
      const item = document.createElement("div");
      item.className = "file-item";
      item.innerHTML = `<span>${file.name}</span><button class="btn-remove" onclick="remove(event, ${i})">×</button>`;
      elements.fileList.appendChild(item);
    }
  });
  elements.mergeBtn.disabled = selectedFiles.length < 2;
  elements.clearAllBtn.style.display = selectedFiles.length ? "block" : "none";
  elements.status.innerText = `${selectedFiles.length} arquivo(s) na fila.`;
}

window.remove = (event, i) => {
  event.stopPropagation(); // Impede que o clique no "remover" abra o seletor de arquivos
  selectedFiles.splice(i, 1);
  render();
};

elements.clearAllBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  selectedFiles = [];
  elements.filterInput.value = "";
  render();
});

async function merge() {
  try {
    elements.loaderOverlay.style.display = "flex";
    updateProgress(0);
    const mergedPdf = await PDFDocument.create();
    const total = selectedFiles.length;

    for (let i = 0; i < total; i++) {
      const bytes = await selectedFiles[i].arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));
      updateProgress(Math.round(((i + 1) / total) * 100));
      await new Promise((r) => setTimeout(r, 0));
    }

    const finalBytes = await mergedPdf.save();
    const blob = new Blob([finalBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GPDF_Unificado.pdf";
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("Erro no processamento.");
  } finally {
    elements.loaderOverlay.style.display = "none";
  }
}

function updateProgress(percent) {
  elements.progressBar.style.width = percent + "%";
  elements.progressText.innerText = percent + "%";
}

elements.mergeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  merge();
});
