document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const imageUpload = document.getElementById("image-upload")
    const uploadLabel = document.querySelector(".upload-label")
    const controlsSection = document.getElementById("controls-section")
    const previewSection = document.getElementById("preview-section")
    const presetsSection = document.getElementById("presets-section")
    const widthInput = document.getElementById("width-input")
    const qualitySlider = document.getElementById("quality-slider")
    const qualityValue = document.getElementById("quality-value")
    const brightnessSlider = document.getElementById("brightness-slider")
    const brightnessValue = document.getElementById("brightness-value")
    const contrastSlider = document.getElementById("contrast-slider")
    const contrastValue = document.getElementById("contrast-value")
    const saturationSlider = document.getElementById("saturation-slider")
    const saturationValue = document.getElementById("saturation-value")
    const resizeButton = document.getElementById("resize-button")
    const originalPreview = document.getElementById("original-preview")
    const resizedPreview = document.getElementById("resized-preview")
    const originalInfo = document.getElementById("original-info")
    const resizedInfo = document.getElementById("resized-info")
    const downloadLink = document.getElementById("download-link")
    const savePresetBtn = document.getElementById("save-preset")
    const presetModal = document.getElementById("preset-modal")
    const presetNameInput = document.getElementById("preset-name")
    const cancelPresetBtn = document.getElementById("cancel-preset")
    const confirmPresetBtn = document.getElementById("confirm-preset")
    const presetsContainer = document.getElementById("presets-container")
    const batchModeToggle = document.getElementById("batch-mode")
    const batchInfo = document.getElementById("batch-info")
    const preserveMetadata = document.getElementById("preserve-metadata")
    const metadataInfo = document.getElementById("metadata-info")
    const focalPointOverlay = document.getElementById("focal-point-overlay")
    const focalPoint = document.getElementById("focal-point")
    const tabButtons = document.querySelectorAll(".tab-button")
    const tabContents = document.querySelectorAll(".tab-content")
    const aspectButtons = document.querySelectorAll(".aspect-button")
    const filterButtons = document.querySelectorAll(".filter-button")
    const formatButtons = document.querySelectorAll(".format-button")
  
    // Variables to store image data
    let originalImage = null
    let originalWidth = 0
    let originalHeight = 0
    let aspectRatio = 0
    let selectedAspectRatio = "original"
    let selectedFilter = "none"
    let selectedFormat = "jpeg"
    let focalPointX = 0.5
    let focalPointY = 0.5
    let batchImages = []
    let currentImageIndex = 0
    const presets = JSON.parse(localStorage.getItem("imagePresets")) || []
    const currentEnhanceSettings = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
    }
  
    // Initialize tabs
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach((btn) => {
          btn.classList.remove("active")
        })
        tabContents.forEach((content) => {
          content.classList.remove("active")
        })
  
        // Add active class to clicked button and corresponding content
        button.classList.add("active")
        const tabId = button.getAttribute("data-tab") + "-tab"
        document.getElementById(tabId).classList.add("active")
      })
    })
  
    // Initialize aspect ratio buttons
    aspectButtons.forEach((button) => {
      button.addEventListener("click", () => {
        aspectButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")
        selectedAspectRatio = button.getAttribute("data-ratio")
  
        if (originalImage) {
          updateAspectRatio()
        }
      })
    })
  
    // Initialize filter buttons
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")
        selectedFilter = button.getAttribute("data-filter")
  
        if (originalImage) {
          applyEnhancements()
        }
      })
    })
  
    // Initialize format buttons
    formatButtons.forEach((button) => {
      button.addEventListener("click", () => {
        formatButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")
        selectedFormat = button.getAttribute("data-format")
  
        if (originalImage) {
          updateFormatComparison()
        }
      })
    })

    // Handle file upload via input change
    imageUpload.addEventListener("change", handleImageUpload)
  
    // Handle drag and drop
    uploadLabel.addEventListener("dragover", (e) => {
      e.preventDefault()
      uploadLabel.classList.add("dragover")
    })
  
    uploadLabel.addEventListener("dragleave", () => {
      uploadLabel.classList.remove("dragover")
    })
  
    uploadLabel.addEventListener("drop", (e) => {
      e.preventDefault()
      uploadLabel.classList.remove("dragover")
  
      if (e.dataTransfer.files.length) {
        imageUpload.files = e.dataTransfer.files
        handleImageUpload()
      }
    })
  
    // Update slider value displays
    qualitySlider.addEventListener("input", () => {
      qualityValue.textContent = `${qualitySlider.value}%`
    })
  
    brightnessSlider.addEventListener("input", () => {
      brightnessValue.textContent = brightnessSlider.value
      currentEnhanceSettings.brightness = Number.parseInt(brightnessSlider.value)
      applyEnhancements()
    })
  
    contrastSlider.addEventListener("input", () => {
      contrastValue.textContent = contrastSlider.value
      currentEnhanceSettings.contrast = Number.parseInt(contrastSlider.value)
      applyEnhancements()
    })
  
    saturationSlider.addEventListener("input", () => {
      saturationValue.textContent = saturationSlider.value
      currentEnhanceSettings.saturation = Number.parseInt(saturationSlider.value)
      applyEnhancements()
    })
  
    // Handle width input to maintain aspect ratio
    widthInput.addEventListener("input", () => {
      if (!originalImage) return
  
      const newWidth = Number.parseInt(widthInput.value)
      if (newWidth > 0) {
        // If using custom aspect ratio, don't auto-calculate height
        if (selectedAspectRatio !== "custom") {
          updateAspectRatio()
        }
      }
    })

    // Handle resize button click
    resizeButton.addEventListener("click", processImage)
  
    // Handle focal point selection
    originalPreview.addEventListener("click", () => {
      focalPointOverlay.style.display = "block"
    })
  
    focalPointOverlay.addEventListener("click", (e) => {
      const rect = focalPointOverlay.getBoundingClientRect()
      focalPointX = (e.clientX - rect.left) / rect.width
      focalPointY = (e.clientY - rect.top) / rect.height
  
      focalPoint.style.left = `${focalPointX * 100}%`
      focalPoint.style.top = `${focalPointY * 100}%`
    })
  
    // Handle preset saving
    savePresetBtn.addEventListener("click", () => {
      presetModal.style.display = "flex"
    })
  
    cancelPresetBtn.addEventListener("click", () => {
      presetModal.style.display = "none"
    })
  
    confirmPresetBtn.addEventListener("click", savePreset)
  
    // Handle batch mode toggle
    batchModeToggle.addEventListener("change", () => {
      updateBatchInfo()
    })
  
    // Function to handle image upload
    function handleImageUpload() {
      // Add animation class to upload container
      const uploadContainer = document.getElementById("upload-container")
      uploadContainer.style.transform = "scale(0.98)"
      uploadContainer.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.03)"
  
      setTimeout(() => {
        uploadContainer.style.transform = ""
        uploadContainer.style.boxShadow = ""
      }, 200)
  
      const files = imageUpload.files
  
      if (!files.length) return
  
      // Clear previous batch if any
      if (!batchModeToggle.checked) {
        batchImages = []
      }
  
      // Add files to batch array
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
  
        // Check if file is an image
        if (!file.type.match("image.*")) continue
  
        batchImages.push({
          file: file,
          original: null,
          processed: null,
          width: 0,
          height: 0,
        })
      }
  
      // Update batch info
      updateBatchInfo()
  
      // Load the first image
      if (batchImages.length > 0) {
        currentImageIndex = 0
        loadImageForProcessing(currentImageIndex)
      }
    }

})