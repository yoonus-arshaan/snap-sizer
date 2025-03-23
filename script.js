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
})