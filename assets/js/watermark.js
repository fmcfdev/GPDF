const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;

let srcPdfBytes = null;
let totalPages = 0;
let selectedPages = new Set();
let imageBytes = null;
let imageType = null; // 'png' or 'jpeg'

const el = {
  fileInput: document.getElementById("fileInput"),
  dropZone: document.getElementById("dropZone"),
  watermarkPanel: document.getElementById("watermarkPanel"),
  fileNameDisplay: document.getElementById("fileNameDisplay"),
  pageCountDisplay: document.getElementById("pageCountDisplay"),
  pagesGrid: document.getElementById("pagesGrid"),
  selectionStatus: document.getElementById("selectionStatus"),
  processBtn: document.getElementById("processBtn"),
  resetBtn: document.getElementById("resetBtn"),
  invertSelBtn: document.getElementById("invertSelBtn"),
  clearSelBtn: document.getElementById("clearSelBtn"),
  rangeInput: document.getElementById("rangeInput"),
  applyRangeBtn: document.getElementById("applyRangeBtn"),
  status: document.getElementById("statusUpdate"),
  loaderOverlay: document.getElementById("loaderOverlay"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),

  // Watermark configs
  tabs: document.querySelectorAll(".tab-btn"),
  tabContents: document.querySelectorAll(".tab-content"),
  wmText: document.getElementById("wmText"),
  wmFontRadios: document.querySelectorAll('input[name="wmFont"]'),
  imgSelectBtn: document.getElementById("imgSelectBtn"),
  imgInput: document.getElementById("imgInput"),
  imgNameDisplay: document.getElementById("imgNameDisplay"),
  wmOpacity: document.getElementById("wmOpacity"),
  wmRotation: document.getElementById("wmRotation"),
  wmPositionRadios: document.querySelectorAll('input[name="wmPosition"]'),
  fontPreview: document.getElementById("fontPreview"),
  wmFontSize: document.getElementById("wmFontSize"),
  wmFontSizeNumber: document.getElementById("wmFontSizeNumber"),
  fontSizeUp: document.getElementById("fontSizeUp"),
  fontSizeDown: document.getElementById("fontSizeDown"),
};

const isMobileDevice =
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent,
  );
if (isMobileDevice) {
  const selectorText = document.querySelector(".selector");
  if (selectorText) {
    selectorText.innerHTML =
      '<span style="text-decoration: underline">Clique aqui</span> para selecionar um arquivo PDF';
  }
}

// ────────────────────────────────────────────
// Tabs e Inputs da Marca d'água
// ────────────────────────────────────────────
let activeTab = "text-tab";

el.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    el.tabs.forEach((t) => t.classList.remove("active"));
    el.tabContents.forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    activeTab = tab.dataset.target;
    document.getElementById(activeTab).classList.add("active");
    validateForm();
  });
});

el.wmText.addEventListener("input", () => {
  validateForm();
  if (el.fontPreview) {
    const text =
      el.wmText.value.trim() || "O texto de marca d'água ficará assim";
    el.fontPreview.textContent = text;
  }
});

el.wmFontRadios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    if (el.fontPreview) {
      if (e.target.value === "times") {
        el.fontPreview.className = "font-preview times-preview";
      } else {
        el.fontPreview.className = "font-preview helvetica-preview";
      }
    }
  });
});

el.wmFontSize.addEventListener("input", (e) => {
  el.wmFontSizeNumber.value = e.target.value;
  validateForm();
});

function updateFontSize(val) {
  if (isNaN(val)) val = 42;
  if (val < 12) val = 12;
  if (val > 100) val = 100;
  el.wmFontSize.value = val;
  el.wmFontSizeNumber.value = val;
  validateForm();
}

el.wmFontSizeNumber.addEventListener("input", (e) => {
  let val = parseInt(e.target.value, 10);
  updateFontSize(val);
});

el.fontSizeUp.addEventListener("click", () => {
  updateFontSize(parseInt(el.wmFontSizeNumber.value, 10) + 1);
});

el.fontSizeDown.addEventListener("click", () => {
  updateFontSize(parseInt(el.wmFontSizeNumber.value, 10) - 1);
});

el.imgSelectBtn.addEventListener("click", () => el.imgInput.click());

el.imgInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("A imagem não pode ter mais de 2MB.");
    el.imgInput.value = "";
    return;
  }

  if (file.type === "image/png" || file.type === "image/jpeg") {
    el.imgNameDisplay.textContent = file.name;
    imageType = file.type === "image/png" ? "png" : "jpeg";

    const reader = new FileReader();
    reader.onload = (ev) => {
      imageBytes = ev.target.result;
      validateForm();
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("Formato de imagem inválido. Use PNG ou JPEG.");
    el.imgInput.value = "";
  }
});

function validateForm() {
  const hasPages = selectedPages.size > 0;
  let hasContent = false;

  if (activeTab === "text-tab") {
    hasContent = el.wmText.value.trim().length > 0;
  } else {
    hasContent = imageBytes !== null;
  }

  el.processBtn.disabled = !(hasPages && hasContent);
}

// ────────────────────────────────────────────
// Eventos de Upload PDF
// ────────────────────────────────────────────
el.dropZone.addEventListener("click", () => el.fileInput.click());

["dragenter", "dragover", "dragleave", "drop"].forEach((name) => {
  el.dropZone.addEventListener(name, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

el.dropZone.addEventListener("dragenter", () =>
  el.dropZone.classList.add("dragover"),
);
el.dropZone.addEventListener("dragleave", () =>
  el.dropZone.classList.remove("dragover"),
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

async function loadFile(file) {
  try {
    el.status.innerText = "Analisando o arquivo...";
    srcPdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(srcPdfBytes, {
      ignoreEncryption: true,
    });
    totalPages = pdfDoc.getPageCount();

    // Auto-select all pages by default for watermark
    selectedPages = new Set();
    for (let i = 1; i <= totalPages; i++) selectedPages.add(i);

    el.fileInput.value = "";
    el.fileNameDisplay.textContent = `📄 ${file.name}`;
    el.pageCountDisplay.textContent = `${totalPages} página(s) encontrada(s)`;
    el.rangeInput.value = "";

    el.dropZone.style.display = "none";
    el.watermarkPanel.style.display = "block";
    el.status.innerText = "";

    renderGrid();
    validateForm();
  } catch (err) {
    console.error(err);
    el.status.innerText =
      "Erro ao ler o arquivo. Verifique se ele não está corrompido.";
  }
}

// ────────────────────────────────────────────
// Grid de Páginas (Reaproveitado do Split)
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
  validateForm();
}

function updateStatus() {
  const count = selectedPages.size;
  el.selectionStatus.textContent =
    count === 0
      ? "Nenhuma página selecionada."
      : `${count} página(s) selecionada(s) para receber a marca d'água.`;
}

el.invertSelBtn.addEventListener("click", () => {
  for (let i = 1; i <= totalPages; i++) {
    if (selectedPages.has(i)) selectedPages.delete(i);
    else selectedPages.add(i);
  }
  renderGrid();
  validateForm();
});

el.clearSelBtn.addEventListener("click", () => {
  selectedPages = new Set();
  renderGrid();
  validateForm();
});

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
  validateForm();
  el.rangeInput.value = "";
}

el.resetBtn.addEventListener("click", () => {
  el.fileInput.value = "";
  el.fileInput.click();
});

// ────────────────────────────────────────────
// Processamento do PDF
// ────────────────────────────────────────────
el.processBtn.addEventListener("click", async () => {
  if (selectedPages.size === 0) return;

  try {
    el.loaderOverlay.style.display = "flex";
    updateProgress(10);

    const pdfDoc = await PDFDocument.load(srcPdfBytes, {
      ignoreEncryption: true,
    });

    // Pegar configurações
    const opacity = parseFloat(el.wmOpacity.value);
    const rotationAngle = parseInt(el.wmRotation.value);
    let position = "middle-center";
    el.wmPositionRadios.forEach((r) => {
      if (r.checked) position = r.value;
    });

    let font;
    let selectedFontType = "helvetica";
    el.wmFontRadios.forEach((r) => {
      if (r.checked) selectedFontType = r.value;
    });

    if (selectedFontType === "times") {
      font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    } else {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    let pdfImage = null;
    let imgDims = null;
    if (activeTab === "image-tab" && imageBytes) {
      if (imageType === "png") {
        pdfImage = await pdfDoc.embedPng(imageBytes);
      } else {
        pdfImage = await pdfDoc.embedJpg(imageBytes);
      }
    }

    const pages = pdfDoc.getPages();
    const pagesToProcess = [...selectedPages];
    const margin = 10;

    for (let i = 0; i < pagesToProcess.length; i++) {
      const pageIndex = pagesToProcess[i] - 1;
      const page = pages[pageIndex];
      const { width, height } = page.getSize();

      let drawWidth = 0;
      let drawHeight = 0;
      const text = el.wmText.value.trim();
      const fontSize = parseInt(el.wmFontSize.value, 10);

      if (activeTab === "text-tab") {
        drawWidth = font.widthOfTextAtSize(text, fontSize);
        drawHeight = font.heightAtSize(fontSize);
      } else if (pdfImage) {
        // Redimensionar se for muito grande (max 50% da largura/altura da pagina)
        const maxWidth = width * 0.5;
        const maxHeight = height * 0.5;
        const scale = Math.min(
          1,
          maxWidth / pdfImage.width,
          maxHeight / pdfImage.height,
        );
        drawWidth = pdfImage.width * scale;
        drawHeight = pdfImage.height * scale;
      }

      // vWidth e vHeight são as dimensões visuais da página
      const vWidth = width;
      const vHeight = height;

      // 1. Calcular o Bounding Box visual do texto rotacionado
      const vAngle = rotationAngle; // O ângulo visual escolhido pelo usuário
      const rad = (vAngle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // A âncora local do pdf-lib é o canto inferior esquerdo (0,0)
      // Os cantos da caixa em coordenadas locais são:
      const corners = [
        { x: 0, y: 0 },
        { x: drawWidth, y: 0 },
        { x: 0, y: drawHeight },
        { x: drawWidth, y: drawHeight },
      ];

      // Rotacionamos esses cantos em torno de (0,0) para descobrir a área total que vão ocupar
      const rotatedCorners = corners.map((c) => ({
        x: c.x * cos - c.y * sin,
        y: c.x * sin + c.y * cos,
      }));

      const minX = Math.min(...rotatedCorners.map((c) => c.x));
      const maxX = Math.max(...rotatedCorners.map((c) => c.x));
      const minY = Math.min(...rotatedCorners.map((c) => c.y));
      const maxY = Math.max(...rotatedCorners.map((c) => c.y));

      // 2. Calcular a coordenada visual (vx, vy) onde a âncora (0,0) deve ser colocada
      // de modo que o Bounding Box encoste perfeitamente nas margens selecionadas.
      let vx = 0;
      let vy = 0;

      if (position.includes("left")) vx = margin - minX;
      else if (position.includes("right")) vx = vWidth - margin - maxX;
      else vx = vWidth / 2 - (minX + maxX) / 2;

      if (position.includes("bottom")) vy = margin - minY;
      else if (position.includes("top")) vy = vHeight - margin - maxY;
      else vy = vHeight / 2 - (minY + maxY) / 2;

      // 3. Mapear as coordenadas visuais (vx, vy) para as coordenadas não rotacionadas do PDF (ux, uy)
      const rawRotation = page.getRotation().angle;
      const pageRotation = ((rawRotation % 360) + 360) % 360;

      let box = page.getMediaBox();
      if (!box) box = { x: 0, y: 0, width: vWidth, height: vHeight };

      const W = box.width;
      const H = box.height;
      let ux = vx;
      let uy = vy;

      if (pageRotation === 90) {
        ux = W - vy;
        uy = vx;
      } else if (pageRotation === 180) {
        ux = W - vx;
        uy = H - vy;
      } else if (pageRotation === 270) {
        ux = vy;
        uy = H - vx;
      }

      // Adicionamos o offset do MediaBox (caso a página não comece no 0,0)
      const finalX = ux + box.x;
      const finalY = uy + box.y;

      // A rotação final compensa a rotação da página para garantir o ângulo visual desejado
      const finalRotationAngle = vAngle + pageRotation;

      if (activeTab === "text-tab") {
        page.drawText(text, {
          x: finalX,
          y: finalY,
          size: fontSize,
          font: font,
          color: rgb(0.5, 0.5, 0.5), // Cinza medio
          opacity: opacity,
          rotate: degrees(finalRotationAngle),
        });
      } else if (pdfImage) {
        page.drawImage(pdfImage, {
          x: finalX,
          y: finalY,
          width: drawWidth,
          height: drawHeight,
          opacity: opacity,
          rotate: degrees(finalRotationAngle),
        });
      }

      updateProgress(10 + Math.floor((i / pagesToProcess.length) * 70));
    }

    updateProgress(90);
    await new Promise((r) => setTimeout(r, 100)); // Pequena pausa pra UI atualizar

    const finalBytes = await pdfDoc.save();
    updateProgress(100);

    const blob = new Blob([finalBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GPDF_MarcaDagua.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert(
      "Erro ao processar o PDF. Verifique se o arquivo não está corrompido.",
    );
  } finally {
    el.loaderOverlay.style.display = "none";
  }
});

function updateProgress(percent) {
  el.progressBar.style.width = percent + "%";
  el.progressText.innerText = percent + "%";
}
