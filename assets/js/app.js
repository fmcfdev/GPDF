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

// Detecção simples de dispositivo mobile
// Detecta se o dispositivo é móvel ou tablet
const isMobileDevice =
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );

// Altera o texto do seletor se for mobile
if (isMobileDevice) {
  const selectorText = document.querySelector(".selector");
  if (selectorText) {
    selectorText.innerHTML =
      '<span style="text-decoration: underline">Clique aqui</span> para selecionar os arquivos';
  }
}

elements.dropZone.addEventListener("click", (e) => {
  if (
    e.target.closest("button") ||
    e.target.closest("input") ||
    e.target.closest("#fileList")
  )
    return;
  elements.fileInput.click();
});

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
  elements.fileInput.value = "";
}

let dragSrcIndex = null;

function render() {
  elements.fileList.innerHTML = "";
  const term = elements.filterInput.value.toLowerCase();
  const isFiltering = term.length > 0;

  selectedFiles.forEach((file, i) => {
    if (!file.name.toLowerCase().includes(term)) return;

    const item = document.createElement("div");
    item.className = "file-item";
    item.dataset.index = i;
    item.draggable = !isFiltering;

    const handle = document.createElement("div");
    handle.className = "drag-handle";
    handle.title = isFiltering ? "Desative o filtro para reordenar" : "Arraste para reordenar";
    handle.innerHTML = "<span></span><span></span><span></span>";

    const name = document.createElement("span");
    name.className = "file-name";
    name.textContent = file.name;

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove";
    removeBtn.textContent = "×";
    removeBtn.title = "Remover arquivo";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedFiles.splice(i, 1);
      render();
    });

    item.appendChild(handle);
    item.appendChild(name);
    item.appendChild(removeBtn);

    if (!isFiltering) {
      item.addEventListener("dragstart", (e) => {
        dragSrcIndex = i;
        e.dataTransfer.effectAllowed = "move";
        setTimeout(() => item.classList.add("dragging"), 0);
      });

      item.addEventListener("dragend", () => {
        document.querySelectorAll(".file-item").forEach((el) => {
          el.classList.remove("dragging", "drag-over-top", "drag-over-bottom");
        });
        dragSrcIndex = null;
      });

      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        document.querySelectorAll(".file-item").forEach((el) =>
          el.classList.remove("drag-over-top", "drag-over-bottom")
        );
        const rect = item.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          item.classList.add("drag-over-top");
        } else {
          item.classList.add("drag-over-bottom");
        }
      });

      item.addEventListener("dragleave", () => {
        item.classList.remove("drag-over-top", "drag-over-bottom");
      });

      item.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const destIndex = parseInt(item.dataset.index);
        if (dragSrcIndex === null || dragSrcIndex === destIndex) return;

        const rect = item.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const insertBefore = e.clientY < midY;

        const moved = selectedFiles.splice(dragSrcIndex, 1)[0];
        const adjustedDest = dragSrcIndex < destIndex ? destIndex - 1 : destIndex;
        const finalIndex = insertBefore ? adjustedDest : adjustedDest + 1;
        selectedFiles.splice(finalIndex, 0, moved);

        render();
      });
    }

    elements.fileList.appendChild(item);
  });

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

    // Garante que a variável existe, caso contrário assume false (desktop)
    const mobileMode =
      typeof isMobileDevice !== "undefined" ? isMobileDevice : false;
    const pauseFrequency = mobileMode ? 2 : 5;

    for (let i = 0; i < total; i++) {
      // Verificação extra para evitar arquivos vazios no array
      if (!selectedFiles[i]) continue;

      const bytes = await selectedFiles[i].arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));

      updateProgress(Math.round(((i + 1) / total) * 100));

      if (i % pauseFrequency === 0) await new Promise((r) => setTimeout(r, 20));
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
