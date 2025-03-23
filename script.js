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

    // Function to load image for processing
    function loadImageForProcessing(index) {
        if (index >= batchImages.length) return
    
        const imageData = batchImages[index]
        const file = imageData.file
    
        const reader = new FileReader()
    
        reader.onload = (e) => {
          // Create a new image to get dimensions
          originalImage = new Image()
          originalImage.crossOrigin = "anonymous" // To avoid CORS issues with canvas
    
          originalImage.onload = () => {
            originalWidth = originalImage.width
            originalHeight = originalImage.height
            aspectRatio = originalWidth / originalHeight
    
            // Store original image in batch data
            imageData.original = originalImage
            imageData.width = originalWidth
            imageData.height = originalHeight
    
            // Set default width input value to original width
            widthInput.value = originalWidth
            widthInput.max = originalWidth * 2 // Allow up to 2x upscaling
    
            // Display original image
            originalPreview.src = e.target.result
            originalInfo.textContent = `Original size: ${originalWidth} × ${originalHeight} pixels | ${formatFileSize(file.size)}`
    
            // Reset focal point
            focalPointX = 0.5
            focalPointY = 0.5
            focalPoint.style.left = "50%"
            focalPoint.style.top = "50%"
    
            // Extract and display metadata
            extractMetadata(file)
    
            // Update format comparison
            updateFormatComparison()
    
            // Show controls and preview sections
            controlsSection.style.display = "block"
            previewSection.style.display = "block"
            presetsSection.style.display = "block"
    
            // Update presets display
            updatePresetsDisplay()
          }
    
          originalImage.src = e.target.result
        }
    
        reader.readAsDataURL(file)
      }
    
      // Function to update aspect ratio based on selection
      function updateAspectRatio() {
        if (!originalImage) return
    
        const newWidth = Number.parseInt(widthInput.value)
        if (!newWidth || newWidth <= 0) return
    
        let newHeight
    
        switch (selectedAspectRatio) {
          case "original":
            newHeight = Math.round(newWidth / aspectRatio)
            break
          case "1:1":
            newHeight = newWidth
            break
          case "4:3":
            newHeight = Math.round(newWidth * (3 / 4))
            break
          case "16:9":
            newHeight = Math.round(newWidth * (9 / 16))
            break
          default:
            newHeight = Math.round(newWidth / aspectRatio)
        }
    
        // You could display the calculated height here if desired
      }
    
      // Function to apply image enhancements
      function applyEnhancements() {
        if (!originalImage) return
    
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
    
        canvas.width = originalWidth
        canvas.height = originalHeight
    
        // Draw original image
        ctx.drawImage(originalImage, 0, 0)
    
        // Apply filter
        switch (selectedFilter) {
          case "grayscale":
            applyGrayscale(ctx, canvas.width, canvas.height)
            break
          case "sepia":
            applySepia(ctx, canvas.width, canvas.height)
            break
          case "vintage":
            applyVintage(ctx, canvas.width, canvas.height)
            break
          case "clarity":
            applyClarity(ctx, canvas.width, canvas.height)
            break
        }
    
        // Apply adjustments
        if (
          currentEnhanceSettings.brightness !== 0 ||
          currentEnhanceSettings.contrast !== 0 ||
          currentEnhanceSettings.saturation !== 0
        ) {
          applyAdjustments(ctx, canvas.width, canvas.height)
        }
    
        // Display enhanced preview
        resizedPreview.src = canvas.toDataURL("image/jpeg", 0.9)
      }
    
      // Filter functions
      function applyGrayscale(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
    
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = avg // red
          data[i + 1] = avg // green
          data[i + 2] = avg // blue
        }
    
        ctx.putImageData(imageData, 0, 0)
      }
    
      function applySepia(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
    
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
    
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
        }
    
        ctx.putImageData(imageData, 0, 0)
      }
    
      function applyVintage(ctx, width, height) {
        // First apply sepia
        applySepia(ctx, width, height)
    
        // Then add a slight blue tint to shadows
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
    
        for (let i = 0; i < data.length; i += 4) {
          // Add blue to darker areas
          if (data[i] < 150) {
            data[i + 2] = Math.min(255, data[i + 2] + 20)
          }
    
          // Reduce contrast slightly
          data[i] = 0.9 * data[i] + 15
          data[i + 1] = 0.9 * data[i + 1] + 15
          data[i + 2] = 0.9 * data[i + 2] + 15
        }
    
        ctx.putImageData(imageData, 0, 0)
    
        // Add a slight vignette effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
        ctx.fillRect(0, 0, width, height)
    
        // Clear center
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          0,
          width / 2,
          height / 2,
          Math.max(width, height) / 1.5,
        )
        gradient.addColorStop(0, "rgba(0, 0, 0, 1)")
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
    
        ctx.fillStyle = gradient
        ctx.globalCompositeOperation = "destination-out"
        ctx.fillRect(0, 0, width, height)
        ctx.globalCompositeOperation = "source-over"
      }
    
      function applyClarity(ctx, width, height) {
        // Apply unsharp masking for clarity
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
    
        // Create a blurred version
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = width
        tempCanvas.height = height
        const tempCtx = tempCanvas.getContext("2d")
    
        tempCtx.drawImage(ctx.canvas, 0, 0)
        tempCtx.filter = "blur(2px)"
        tempCtx.drawImage(tempCanvas, 0, 0)
    
        const blurredData = tempCtx.getImageData(0, 0, width, height).data
    
        // Apply unsharp mask
        const amount = 0.6 // Strength of the effect
    
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] + (data[i] - blurredData[i]) * amount)
          data[i + 1] = Math.min(255, data[i + 1] + (data[i + 1] - blurredData[i + 1]) * amount)
          data[i + 2] = Math.min(255, data[i + 2] + (data[i + 2] - blurredData[i + 2]) * amount)
        }
    
        ctx.putImageData(imageData, 0, 0)
    
        // Increase contrast slightly
        const contrastFactor = 1.2
        const contrastAdjust = 128 * (1 - contrastFactor)
    
        const contrastData = ctx.getImageData(0, 0, width, height)
        const contrastPixels = contrastData.data
    
        for (let i = 0; i < contrastPixels.length; i += 4) {
          contrastPixels[i] = contrastFactor * contrastPixels[i] + contrastAdjust
          contrastPixels[i + 1] = contrastFactor * contrastPixels[i + 1] + contrastAdjust
          contrastPixels[i + 2] = contrastFactor * contrastPixels[i + 2] + contrastAdjust
        }
    
        ctx.putImageData(contrastData, 0, 0)
      }
    
      function applyAdjustments(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
    
        // Convert adjustment values to factors
        const brightnessAdjust = currentEnhanceSettings.brightness / 100
        const contrastAdjust = 1 + currentEnhanceSettings.contrast / 100
        const saturationAdjust = 1 + currentEnhanceSettings.saturation / 100
    
        for (let i = 0; i < data.length; i += 4) {
          // Apply brightness
          data[i] = data[i] + 255 * brightnessAdjust
          data[i + 1] = data[i + 1] + 255 * brightnessAdjust
          data[i + 2] = data[i + 2] + 255 * brightnessAdjust
    
          // Apply contrast
          data[i] = (data[i] - 128) * contrastAdjust + 128
          data[i + 1] = (data[i + 1] - 128) * contrastAdjust + 128
          data[i + 2] = (data[i + 2] - 128) * contrastAdjust + 128
    
          // Apply saturation
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = avg + (data[i] - avg) * saturationAdjust
          data[i + 1] = avg + (data[i + 1] - avg) * saturationAdjust
          data[i + 2] = avg + (data[i + 2] - avg) * saturationAdjust
    
          // Ensure values are in valid range
          data[i] = Math.max(0, Math.min(255, data[i]))
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1]))
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2]))
        }
    
        ctx.putImageData(imageData, 0, 0)
      }
    
      // Function to process image (resize and optimize)
      function processImage() {
        if (!originalImage) {
          alert("Please upload an image first")
          return
        }
    
        const newWidth = Number.parseInt(widthInput.value)
    
        if (!newWidth || newWidth <= 0) {
          alert("Please enter a valid width")
          return
        }
    
        // Calculate new height based on selected aspect ratio
        let newHeight
    
        switch (selectedAspectRatio) {
          case "original":
            newHeight = Math.round(newWidth / aspectRatio)
            break
          case "1:1":
            newHeight = newWidth
            break
          case "4:3":
            newHeight = Math.round(newWidth * (3 / 4))
            break
          case "16:9":
            newHeight = Math.round(newWidth * (9 / 16))
            break
          default:
            newHeight = Math.round(newWidth / aspectRatio)
        }
    
        // Create canvas for resizing
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
    
        // Set canvas dimensions
        canvas.width = newWidth
        canvas.height = newHeight
    
        // Calculate source dimensions for cropping based on focal point
        let sourceX, sourceY, sourceWidth, sourceHeight
    
        if (selectedAspectRatio !== "original") {
          const targetRatio = newWidth / newHeight
    
          if (aspectRatio > targetRatio) {
            // Original is wider than target
            sourceHeight = originalHeight
            sourceWidth = originalHeight * targetRatio
            sourceY = 0
            sourceX = (originalWidth - sourceWidth) * focalPointX
          } else {
            // Original is taller than target
            sourceWidth = originalWidth
            sourceHeight = originalWidth / targetRatio
            sourceX = 0
            sourceY = (originalHeight - sourceHeight) * focalPointY
          }
        } else {
          // Use entire image
          sourceX = 0
          sourceY = 0
          sourceWidth = originalWidth
          sourceHeight = originalHeight
        }
    
        // Draw resized image on canvas
        ctx.drawImage(originalImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, newWidth, newHeight)
    
        // Apply enhancements
        if (
          selectedFilter !== "none" ||
          currentEnhanceSettings.brightness !== 0 ||
          currentEnhanceSettings.contrast !== 0 ||
          currentEnhanceSettings.saturation !== 0
        ) {
          // Apply filter
          switch (selectedFilter) {
            case "grayscale":
              applyGrayscale(ctx, newWidth, newHeight)
              break
            case "sepia":
              applySepia(ctx, newWidth, newHeight)
              break
            case "vintage":
              applyVintage(ctx, newWidth, newHeight)
              break
            case "clarity":
              applyClarity(ctx, newWidth, newHeight)
              break
          }
    
          // Apply adjustments
          if (
            currentEnhanceSettings.brightness !== 0 ||
            currentEnhanceSettings.contrast !== 0 ||
            currentEnhanceSettings.saturation !== 0
          ) {
            applyAdjustments(ctx, newWidth, newHeight)
          }
        }
    
        // Get quality value (0-1)
        const quality = Number.parseInt(qualitySlider.value) / 100
    
        // Convert canvas to data URL with specified quality and format
        let mimeType
        switch (selectedFormat) {
          case "png":
            mimeType = "image/png"
            break
          case "webp":
            mimeType = "image/webp"
            break
          default:
            mimeType = "image/jpeg"
        }
    
        const resizedDataUrl = canvas.toDataURL(mimeType, quality)
    
        // Display resized image
        resizedPreview.src = resizedDataUrl
    
        // Update download link
        downloadLink.href = resizedDataUrl
        downloadLink.download = `optimized-image.${selectedFormat}`
    
        // Store processed image in batch data if in batch mode
        if (batchModeToggle.checked && currentImageIndex < batchImages.length) {
          batchImages[currentImageIndex].processed = resizedDataUrl
        }
    
        // Estimate file size (this is approximate)
        estimateFileSize(resizedDataUrl).then((size) => {
          resizedInfo.textContent = `Resized: ${newWidth} × ${newHeight} pixels | Approx. ${formatFileSize(size)}`
        })
      }
    
      // Function to update format comparison
      function updateFormatComparison() {
        if (!originalImage) return
    
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
    
        canvas.width = originalWidth
        canvas.height = originalHeight
    
        ctx.drawImage(originalImage, 0, 0)
    
        // Get quality value
        const quality = Number.parseInt(qualitySlider.value) / 100
    
        // Generate different formats
        const jpegSize = estimateFileSize(canvas.toDataURL("image/jpeg", quality))
        const pngSize = estimateFileSize(canvas.toDataURL("image/png"))
        const webpSize = estimateFileSize(canvas.toDataURL("image/webp", quality))
    
        // Update size displays
        Promise.all([jpegSize, pngSize, webpSize]).then((sizes) => {
          document.getElementById("jpeg-size").textContent = formatFileSize(sizes[0])
          document.getElementById("png-size").textContent = formatFileSize(sizes[1])
          document.getElementById("webp-size").textContent = formatFileSize(sizes[2])
        })
      }

    // Function to extract metadata
    function extractMetadata(file) {
        if (!file) return
    
        // Basic file metadata
        const basicMetadata = {
          "File Name": file.name,
          "File Type": file.type,
          "File Size": formatFileSize(file.size),
          "Last Modified": new Date(file.lastModified).toLocaleString(),
        }
    
        // Display basic metadata
        let metadataHTML = "<table>"
    
        for (const [key, value] of Object.entries(basicMetadata)) {
          metadataHTML += `<tr><th>${key}</th><td>${value}</td></tr>`
        }
    
        metadataHTML += "</table>"
        metadataInfo.innerHTML = metadataHTML
    
        
      }

})