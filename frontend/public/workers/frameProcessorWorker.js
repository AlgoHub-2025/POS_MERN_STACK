// Frame Processor Worker for Parallel Processing

self.onmessage = function(event) {
  const { type, data, workerId } = event.data

  switch (type) {
    case 'process':
      processFrame(data, workerId)
      break
    case 'configure':
      configureWorker(data)
      break
    default:
      console.warn(`Unknown message type: ${type}`)
  }
}

let config = {
  quality: 'medium',
  enableOptimizations: true
}

function configureWorker(newConfig) {
  config = { ...config, ...newConfig }
  self.postMessage({ type: 'configured', data: { config } })
}

async function processFrame(frameData, workerId) {
  try {
    const startTime = performance.now()
    
    // Process frame based on quality setting
    let processedFrame
    switch (config.quality) {
      case 'low':
        processedFrame = await fastProcess(frameData)
        break
      case 'medium':
        processedFrame = await mediumProcess(frameData)
        break
      case 'high':
        processedFrame = await highProcess(frameData)
        break
      default:
        processedFrame = await mediumProcess(frameData)
    }

    const processingTime = performance.now() - startTime

    self.postMessage({
      type: 'processed',
      data: {
        processedFrame,
        processingTime,
        workerId
      }
    })
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: {
        error: error.message,
        workerId
      }
    })
  }
}

// Fast processing for low quality
async function fastProcess(imageData) {
  const { data, width, height } = imageData
  const processed = new Uint8ClampedArray(data)
  
  // Simple edge detection with reduced operations
  for (let y = 1; y < height - 1; y += 2) { // Skip every other row
    for (let x = 1; x < width - 1; x += 2) { // Skip every other column
      const idx = (y * width + x) * 4
      
      // Simple gradient calculation
      const centerGray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      const rightGray = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3
      const bottomGray = (data[idx + width * 4] + data[idx + width * 4 + 1] + data[idx + width * 4 + 2]) / 3
      
      const gradient = Math.abs(rightGray - centerGray) + Math.abs(bottomGray - centerGray)
      const edge = gradient > 30 ? 255 : 0
      
      processed[idx] = edge
      processed[idx + 1] = edge
      processed[idx + 2] = edge
    }
  }
  
  return new ImageData(processed, width, height)
}

// Medium processing with Sobel operator
async function mediumProcess(imageData) {
  const { data, width, height } = imageData
  const edges = new Uint8Array(width * height)
  
  // Convert to grayscale
  const gray = new Float32Array(width * height)
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3
  }
  
  // Sobel edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      
      const tl = gray[(y - 1) * width + (x - 1)]
      const tm = gray[(y - 1) * width + x]
      const tr = gray[(y - 1) * width + (x + 1)]
      const ml = gray[y * width + (x - 1)]
      const mr = gray[y * width + (x + 1)]
      const bl = gray[(y + 1) * width + (x - 1)]
      const bm = gray[(y + 1) * width + x]
      const br = gray[(y + 1) * width + (x + 1)]
      
      const gx = -tl - 2*ml - bl + tr + 2*mr + br
      const gy = -tl - 2*tm - tr + bl + 2*bm + br
      
      edges[idx] = Math.min(255, Math.sqrt(gx*gx + gy*gy))
    }
  }
  
  // Convert back to ImageData
  const result = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < edges.length; i++) {
    const idx = i * 4
    const value = edges[i] > 50 ? 255 : 0
    result[idx] = value
    result[idx + 1] = value
    result[idx + 2] = value
    result[idx + 3] = 255
  }
  
  return new ImageData(result, width, height)
}

// High processing with advanced filtering
async function highProcess(imageData) {
  // Start with medium processing
  const mediumResult = await mediumProcess(imageData)
  
  // Apply additional optimizations
  return await postProcessHighQuality(mediumResult)
}

async function postProcessHighQuality(imageData) {
  const { data, width, height } = imageData
  const processed = new Uint8ClampedArray(data)
  
  // Morphological operations to clean up edges
  // Erosion followed by dilation (opening)
  const temp = new Uint8ClampedArray(data)
  
  // Erosion
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      
      let isEdge = false
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4
          if (data[nIdx] === 255) {
            isEdge = true
            break
          }
        }
        if (isEdge) break
      }
      
      temp[idx] = isEdge ? 255 : 0
      temp[idx + 1] = isEdge ? 255 : 0
      temp[idx + 2] = isEdge ? 255 : 0
      temp[idx + 3] = 255
    }
  }
  
  // Dilation
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      
      let hasNeighborEdge = false
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4
          if (temp[nIdx] === 255) {
            hasNeighborEdge = true
            break
          }
        }
        if (hasNeighborEdge) break
      }
      
      processed[idx] = hasNeighborEdge ? 255 : 0
      processed[idx + 1] = hasNeighborEdge ? 255 : 0
      processed[idx + 2] = hasNeighborEdge ? 255 : 0
      processed[idx + 3] = 255
    }
  }
  
  return new ImageData(processed, width, height)
}

// Utility functions for image processing
function createImageData(width, height) {
  return new ImageData(width, height)
}

function cloneImageData(imageData) {
  const { data, width, height } = imageData
  return new ImageData(new Uint8ClampedArray(data), width, height)
}

// Performance monitoring
let performanceMetrics = {
  framesProcessed: 0,
  totalProcessingTime: 0,
  averageProcessingTime: 0
}

function updateMetrics(processingTime) {
  performanceMetrics.framesProcessed++
  performanceMetrics.totalProcessingTime += processingTime
  performanceMetrics.averageProcessingTime = 
    performanceMetrics.totalProcessingTime / performanceMetrics.framesProcessed
}

// Send metrics to main thread periodically
setInterval(() => {
  self.postMessage({
    type: 'metrics',
    data: {
      metrics: performanceMetrics,
      workerId: self.name || 'unknown'
    }
  })
}, 5000)
