/**
 * GPDFTools — Módulo de Compressão de PDF (Ghostscript WASM)
 */

(function () {
  const GS_WASM_URL = "https://cdn.jsdelivr.net/npm/@jspawn/ghostscript-wasm@0.0.2/gs.mjs";
  const GS_WASM_LOCATE_FILE = (file) => `https://cdn.jsdelivr.net/npm/@jspawn/ghostscript-wasm@0.0.2/${file}`;

  // Elementos da UI
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const compressPanel = document.getElementById("compressPanel");
  const fileNameDisplay = document.getElementById("fileNameDisplay");
  const fileSizeDisplay = document.getElementById("fileSizeDisplay");
  const resetBtn = document.getElementById("resetBtn");
  const processBtn = document.getElementById("processBtn");
  const loaderOverlay = document.getElementById("loaderOverlay");
  const statusUpdate = document.getElementById("statusUpdate");

  // Painel de Resultado
  const resultPanel = document.getElementById("resultPanel");
  const originalSizeResult = document.getElementById("originalSizeResult");
  const compressedSizeResult = document.getElementById("compressedSizeResult");
  const savingsPercentage = document.getElementById("savingsPercentage");
  const downloadAgainBtn = document.getElementById("downloadAgainBtn");
  const startOverBtn = document.getElementById("startOverBtn");

  // Modal de Servidor
  const serverModal = document.getElementById("serverSuggestionModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const processLocalBtn = document.getElementById("processLocalBtn");
  const processServerBtn = document.getElementById("processServerBtn");

  let selectedFile = null;
  let compressedBlob = null;
  let gsModule = null;

  // ── Eventos de Seleção de Arquivo ──

  dropZone.addEventListener("click", () => fileInput.click());
  
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
  });

  function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    if (file.type !== "application/pdf") {
      alert("Por favor, selecione um arquivo PDF válido.");
      return;
    }

    selectedFile = file;
    const sizeInMB = selectedFile.size / (1024 * 1024);

    if (sizeInMB > 30) {
      showServerSuggestion();
    } else {
      showConfigPanel();
    }
  }

  function showServerSuggestion() {
    serverModal.style.display = "flex";
  }

  closeModalBtn.addEventListener("click", () => {
    serverModal.style.display = "none";
    resetApp();
  });

  processLocalBtn.addEventListener("click", () => {
    serverModal.style.display = "none";
    showConfigPanel();
  });

  processServerBtn.addEventListener("click", () => {
    alert("O processamento em servidor está em desenvolvimento. Por favor, use o processamento local por enquanto.");
  });

  function downloadBlob() {
    if (!compressedBlob) return;
    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GPDFTools_comprimido_${selectedFile.name}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  downloadAgainBtn.addEventListener("click", downloadBlob);
  startOverBtn.addEventListener("click", resetApp);

  function showConfigPanel() {
    dropZone.style.display = "none";
    compressPanel.style.display = "block";
    resultPanel.style.display = "none";
    fileNameDisplay.textContent = selectedFile.name;
    fileSizeDisplay.textContent = `Tamanho original: ${formatBytes(selectedFile.size)}`;
  }

  function resetApp() {
    selectedFile = null;
    compressedBlob = null;
    dropZone.style.display = "flex";
    compressPanel.style.display = "none";
    resultPanel.style.display = "none";
    fileInput.value = "";
    statusUpdate.innerHTML = "";
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  resetBtn.addEventListener("click", resetApp);

  // ── Lógica de Processamento ──

  async function initGS() {
    if (gsModule) return gsModule;
    
    // Mostra loader inicial pois o download do WASM é pesado
    loaderOverlay.style.display = "flex";
    document.getElementById("loaderTitle").textContent = "Carregando motor de compressão...";
    
    try {
      const { default: initGhostscript } = await import(GS_WASM_URL);
      gsModule = await initGhostscript({
        locateFile: GS_WASM_LOCATE_FILE,
        print: (text) => console.log("GS:", text),
        printErr: (text) => console.warn("GS Error:", text),
      });
      return gsModule;
    } catch (error) {
      console.error("Erro ao carregar Ghostscript WASM:", error);
      alert("Falha ao carregar o motor de compressão. Verifique sua conexão.");
      loaderOverlay.style.display = "none";
      throw error;
    }
  }

  processBtn.addEventListener("click", async () => {
    if (!selectedFile) return;

    try {
      const module = await initGS();
      
      document.getElementById("loaderTitle").textContent = "Comprimindo seu PDF...";
      loaderOverlay.style.display = "flex";

      const arrayBuffer = await selectedFile.arrayBuffer();
      const inputData = new Uint8Array(arrayBuffer);
      
      // Escreve no sistema de arquivos virtual do WASM
      const inputName = "input.pdf";
      const outputName = "output.pdf";
      module.FS.writeFile(inputName, inputData);

      // Determina o nível de compressão com parâmetros refinados
      const level = document.querySelector('input[name="compressionLevel"]:checked').value;
      let gsArgs = [];

      if (level === "high") {
        // Alta Compressão (72 DPI + Qualidade Balanceada)
        gsArgs = [
          "-dPDFSETTINGS=/screen",
          "-dColorImageResolution=72",
          "-dGrayImageResolution=72",
          "-dColorImageDownsampleType=/Bicubic",
          "-dGrayImageDownsampleType=/Bicubic"
        ];
      } else if (level === "medium") {
        // Média Compressão (120 DPI para garantir redução em mais arquivos)
        gsArgs = [
          "-dPDFSETTINGS=/ebook",
          "-dColorImageResolution=120",
          "-dGrayImageResolution=120",
          "-dColorImageDownsampleType=/Bicubic",
          "-dGrayImageDownsampleType=/Bicubic"
        ];
      } else {
        // Baixa Compressão (300 DPI - Foco em Qualidade)
        gsArgs = [
          "-dPDFSETTINGS=/printer",
          "-dColorImageResolution=300",
          "-dGrayImageResolution=300"
        ];
      }

      const args = [
        "-dNOPAUSE",
        "-dBATCH",
        "-dQUIET",
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        ...gsArgs,
        `-sOutputFile=${outputName}`,
        inputName
      ];

      console.log("Arquivos no FS antes:", module.FS.readdir("/"));
      
      // Nota: callMain pode lançar exceção dependendo do build do WASM se houver erro interno
      await module.callMain(args);

      console.log("Arquivos no FS depois:", module.FS.readdir("/"));

      // Lê o resultado
      let outputData;
      try {
        outputData = module.FS.readFile(outputName);
      } catch (e) {
        throw new Error("O Ghostscript não conseguiu gerar o arquivo de saída. Verifique se o PDF não possui proteção por senha.");
      }
      
      compressedBlob = new Blob([outputData], { type: "application/pdf" });
      
      // Estatísticas
      const originalSize = selectedFile.size;
      const compressedSize = compressedBlob.size;
      const savings = ((originalSize - compressedSize) / originalSize) * 100;

      originalSizeResult.textContent = formatBytes(originalSize);
      compressedSizeResult.textContent = formatBytes(compressedSize);
      savingsPercentage.textContent = `${Math.max(0, savings).toFixed(0)}%`;

      // Troca de painéis
      compressPanel.style.display = "none";
      resultPanel.style.display = "block";
      loaderOverlay.style.display = "none";

      // Dispara o download inicial
      downloadBlob();

      // Limpeza do FS virtual
      module.FS.unlink(inputName);
      module.FS.unlink(outputName);

    } catch (error) {
      console.error("Erro durante a compressão:", error);
      loaderOverlay.style.display = "none";
      alert(error.message || "Ocorreu um erro ao comprimir o arquivo. Tente novamente.");
    }
  });

})();
