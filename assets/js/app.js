const { PDFDocument } = PDFLib;
let selectedFiles = [];

const elements = {
  fileInput: document.getElementById("fileInput"),
  fileList: document.getElementById("fileList"),
  mergeBtn: document.getElementById("mergeBtn"),
  clearAllBtn: document.getElementById("clearAllBtn"),
  dropZone: document.getElementById("dropZone"),
  filterInput: document.getElementById("filterInput"),
  filterContainer: document.getElementById("filterContainer"),
  clearFilter: document.getElementById("clearFilterBtn"),
  status: document.getElementById("statusUpdate"),
  loaderOverlay: document.getElementById("loaderOverlay"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),
};

// Abre seletor ao clicar na zona de drop (exceto se clicar em botões internos)
elements.dropZone.addEventListener("click", (e) => {
  if (
    e.target.closest("button") ||
    e.target.closest("input") ||
    e.target.closest("#fileList")
  )
    return;
  elements.fileInput.click();
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
  // Concatena os novos arquivos com os já existentes
  selectedFiles = [...selectedFiles, ...files];

  // Ordenação alfabética pelo nome do arquivo
  selectedFiles.sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  render();
  elements.fileInput.value = "";
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

  // Controle do Filtro: só aparece se houver arquivos
  if (selectedFiles.length > 0) {
    elements.filterContainer.style.display = "flex";
  } else {
    elements.filterContainer.style.display = "none";
    elements.filterInput.value = "";
  }

  elements.mergeBtn.disabled = selectedFiles.length < 2;
  elements.clearAllBtn.style.display = selectedFiles.length ? "block" : "none";
  elements.status.innerText =
    selectedFiles.length > 0
      ? `${selectedFiles.length} arquivo(s) na fila.`
      : "";
}

window.remove = (event, i) => {
  event.stopPropagation();
  selectedFiles.splice(i, 1);
  render();
};

elements.clearAllBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  selectedFiles = [];
  render();
});

async function merge() {
  try {
    elements.loaderOverlay.style.display = "flex";
    updateProgress(0);

    const mergedPdf = await PDFDocument.create();
    const total = selectedFiles.length;

    for (let i = 0; i < total; i++) {
      // LER ARQUIVO POR ARQUIVO PARA ECONOMIZAR RAM
      const bytes = await selectedFiles[i].arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });

      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));

      updateProgress(Math.round(((i + 1) / total) * 100));

      // MICRO-PAUSA: Permite que o Garbage Collector limpe a RAM e a UI atualize
      if (i % 5 === 0) await new Promise((r) => setTimeout(r, 15));
      else await new Promise((r) => setTimeout(r, 0));
    }

    const finalBytes = await mergedPdf.save();
    const blob = new Blob([finalBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GPDF_Unificado.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert(
      "Erro ao processar os arquivos. Certifique-se de que nenhum PDF está corrompido."
    );
  } finally {
    elements.loaderOverlay.style.display = "none";
  }
}

function updateProgress(percent) {
  elements.progressBar.style.width = percent + "%";
  elements.progressText.innerText = percent + "%";
}

elements.mergeBtn.addEventListener("click", merge);
