// Optimized Frame Processing for Real-time Scanning

export interface FrameProcessorConfig {
  targetFPS: number
  processingResolution: { width: number; height: number }
  enableWebGL: boolean
  enableWorkers: boolean
  frameSkip: number
  quality: 'low' | 'medium' | 'high'
}

export interface ProcessingMetrics {
  frameTime: number
  processingTime: number
  fps: number
  droppedFrames: number
  queueSize: number
}

class FrameProcessor {
  private config: FrameProcessorConfig
  private metrics: ProcessingMetrics
  private isProcessing: boolean = false
  private frameQueue: ImageData[] = []
  private workers: Worker[] = []
  private webglContext: WebGLRenderingContext | null = null
  private offscreenCanvas: OffscreenCanvas | HTMLCanvasElement | null = null
  private processingCallback?: (frame: ImageData) => void
  private lastFrameTime: number = 0
  private frameCount: number = 0
  private droppedFrames: number = 0

  constructor(config: Partial<FrameProcessorConfig> = {}) {
    this.config = {
      targetFPS: 30,
      processingResolution: { width: 640, height: 480 },
      enableWebGL: true,
      enableWorkers: true,
      frameSkip: 1,
      quality: 'medium',
      ...config
    }

    this.metrics = {
      frameTime: 0,
      processingTime: 0,
      fps: 0,
      droppedFrames: 0,
      queueSize: 0
    }

    this.initializeWebGL()
    this.initializeWorkers()
  }

  /**
   * Initialize WebGL for hardware acceleration
   */
  private initializeWebGL(): void {
    if (!this.config.enableWebGL || typeof OffscreenCanvas === 'undefined') {
      // Fallback to regular canvas
      this.offscreenCanvas = document.createElement('canvas')
      return
    }

    try {
      this.offscreenCanvas = new OffscreenCanvas(
        this.config.processingResolution.width,
        this.config.processingResolution.height
      )

      const gl = this.offscreenCanvas.getContext('webgl2') || 
                  this.offscreenCanvas.getContext('webgl')

      if (gl) {
        this.webglContext = gl as WebGLRenderingContext
        this.setupWebGLShaders()
        console.log('WebGL acceleration enabled for frame processing')
      }
    } catch (error) {
      console.warn('WebGL initialization failed, falling back to CPU:', error)
      this.offscreenCanvas = document.createElement('canvas')
    }
  }

  /**
   * Setup WebGL shaders for edge detection
   */
  private setupWebGLShaders(): void {
    if (!this.webglContext) return

    const gl = this.webglContext

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `

    // Fragment shader for edge detection
    const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D u_image;
      varying vec2 v_texCoord;
      
      void main() {
        vec2 texelSize = 1.0 / vec2(${this.config.processingResolution.width}.0, ${this.config.processingResolution.height}.0);
        
        // Sobel edge detection
        float tl = texture2D(u_image, v_texCoord + vec2(-texelSize.x, -texelSize.y)).r;
        float tm = texture2D(u_image, v_texCoord + vec2(0.0, -texelSize.y)).r;
        float tr = texture2D(u_image, v_texCoord + vec2(texelSize.x, -texelSize.y)).r;
        float ml = texture2D(u_image, v_texCoord + vec2(-texelSize.x, 0.0)).r;
        float mm = texture2D(u_image, v_texCoord).r;
        float mr = texture2D(u_image, v_texCoord + vec2(texelSize.x, 0.0)).r;
        float bl = texture2D(u_image, v_texCoord + vec2(-texelSize.x, texelSize.y)).r;
        float bm = texture2D(u_image, v_texCoord + vec2(0.0, texelSize.y)).r;
        float br = texture2D(u_image, v_texCoord + vec2(texelSize.x, texelSize.y)).r;
        
        float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
        float gy = -tl - 2.0*tm - tr + bl + 2.0*bm + br;
        float edge = sqrt(gx*gx + gy*gy);
        
        gl_FragColor = vec4(edge, edge, edge, 1.0);
      }
    `

    // Compile shaders
    const vertexShader = this.compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
    const fragmentShader = this.compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)

    if (vertexShader && fragmentShader) {
      const program = gl.createProgram()
      if (program) {
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)

        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
          gl.useProgram(program)
          this.setupWebGLBuffers(gl, program)
        }
      }
    }
  }

  private compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader | null {
    const shader = gl.createShader(type)
    if (!shader) return null

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader
    }

    console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  private setupWebGLBuffers(gl: WebGLRenderingContext, program: WebGLProgram): void {
    // Setup vertices for full-screen quad
    const vertices = new Float32Array([
      -1, -1,  0, 1,
       1, -1,  1, 1,
      -1,  1,  0, 0,
       1,  1,  1, 0
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')

    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0)

    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8)
  }

  /**
   * Initialize worker threads for parallel processing
   */
  private initializeWorkers(): void {
    if (!this.config.enableWorkers || typeof Worker === 'undefined') {
      console.log('Worker threads disabled')
      return
    }

    const workerCount = Math.min(navigator.hardwareConcurrency || 2, 4)
    
    for (let i = 0; i < workerCount; i++) {
      try {
        const worker = new Worker('/workers/frameProcessorWorker.js')
        worker.onmessage = this.handleWorkerMessage.bind(this)
        this.workers.push(worker)
      } catch (error) {
        console.warn(`Failed to create worker ${i}:`, error)
      }
    }

    console.log(`Initialized ${this.workers.length} worker threads`)
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const { type, data, workerId } = event.data

    switch (type) {
      case 'processed':
        if (this.processingCallback) {
          this.processingCallback(data.processedFrame)
        }
        break
      case 'error':
        console.error(`Worker ${workerId} error:`, data.error)
        break
    }
  }

  /**
   * Process frame with optimizations
   */
  async processFrame(imageData: ImageData): Promise<ImageData> {
    const startTime = performance.now()

    // Frame skipping for performance
    this.frameCount++
    if (this.frameCount % (this.config.frameSkip + 1) !== 0) {
      this.droppedFrames++
      return imageData
    }

    // Resize frame for optimal processing
    const resizedFrame = await this.resizeFrame(imageData)
    
    // Apply preprocessing
    const preprocessedFrame = await this.preprocessFrame(resizedFrame)
    
    // Edge detection (WebGL or CPU)
    const edges = await this.detectEdges(preprocessedFrame)
    
    // Post-processing
    const finalFrame = await this.postprocessFrame(edges)

    const processingTime = performance.now() - startTime
    this.metrics.processingTime = (this.metrics.processingTime + processingTime) / 2

    return finalFrame
  }

  /**
   * Resize frame for optimal processing
   */
  private async resizeFrame(imageData: ImageData): Promise<ImageData> {
    const { width, height } = this.config.processingResolution
    
    if (imageData.width === width && imageData.height === height) {
      return imageData
    }

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      canvas.width = width
      canvas.height = height
      
      // Create temporary canvas for source image
      const sourceCanvas = document.createElement('canvas')
      const sourceCtx = sourceCanvas.getContext('2d')!
      sourceCanvas.width = imageData.width
      sourceCanvas.height = imageData.height
      sourceCtx.putImageData(imageData, 0, 0)
      
      // Draw scaled image
      ctx.drawImage(sourceCanvas, 0, 0, width, height)
      
      const resizedData = ctx.getImageData(0, 0, width, height)
      resolve(resizedData)
    })
  }

  /**
   * Preprocess frame with optimizations
   */
  private async preprocessFrame(imageData: ImageData): Promise<ImageData> {
    const data = imageData.data
    
    // Apply quality-based preprocessing
    switch (this.config.quality) {
      case 'low':
        this.fastPreprocess(data)
        break
      case 'medium':
        this.mediumPreprocess(data)
        break
      case 'high':
        this.highPreprocess(data)
        break
    }
    
    return imageData
  }

  private fastPreprocess(data: Uint8ClampedArray): void {
    // Simple brightness normalization
    let sum = 0
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3
    }
    const avg = sum / (data.length / 4)
    const factor = 128 / avg
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor)
      data[i + 1] = Math.min(255, data[i + 1] * factor)
      data[i + 2] = Math.min(255, data[i + 2] * factor)
    }
  }

  private mediumPreprocess(data: Uint8ClampedArray): void {
    // Histogram equalization
    const histogram = new Array(256).fill(0)
    
    // Calculate histogram
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
      histogram[Math.floor(gray)]++
    }
    
    // Calculate cumulative distribution
    const cdf = new Array(256)
    cdf[0] = histogram[0]
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i]
    }
    
    // Apply equalization
    const total = data.length / 4
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
      const equalized = (cdf[Math.floor(gray)] / total) * 255
      data[i] = equalized
      data[i + 1] = equalized
      data[i + 2] = equalized
    }
  }

  private highPreprocess(data: Uint8ClampedArray): void {
    // Advanced preprocessing with noise reduction
    this.mediumPreprocess(data)
    this.reduceNoise(data)
  }

  private reduceNoise(data: Uint8ClampedArray): void {
    const width = Math.sqrt(data.length / 4)
    const height = width
    const output = new Uint8ClampedArray(data)

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const values = []
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4 + c
              values.push(data[idx])
            }
          }
          values.sort((a, b) => a - b)
          const outputIdx = (y * width + x) * 4 + c
          output[outputIdx] = values[4] // Median filter
        }
      }
    }

    data.set(output)
  }

  /**
   * Edge detection with WebGL acceleration
   */
  private async detectEdges(imageData: ImageData): Promise<ImageData> {
    if (this.webglContext && this.offscreenCanvas) {
      return this.detectEdgesWebGL(imageData)
    } else {
      return this.detectEdgesCPU(imageData)
    }
  }

  private async detectEdgesWebGL(imageData: ImageData): Promise<ImageData> {
    if (!this.webglContext || !this.offscreenCanvas) {
      return this.detectEdgesCPU(imageData)
    }

    const gl = this.webglContext
    const { width, height } = this.config.processingResolution

    // Create texture from image data
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    // Render to texture
    gl.viewport(0, 0, width, height)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // Read result
    const result = new Uint8Array(width * height * 4)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, result)

    return new ImageData(new Uint8ClampedArray(result), width, height)
  }

  private async detectEdgesCPU(imageData: ImageData): Promise<ImageData> {
    const width = imageData.width
    const height = imageData.height
    const edges = new Uint8Array(width * height)

    // Convert to grayscale
    const gray = new Float32Array(width * height)
    for (let i = 0; i < imageData.data.length; i += 4) {
      gray[i / 4] = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3
    }

    // Sobel operator
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
    const result = new ImageData(width, height)
    for (let i = 0; i < edges.length; i++) {
      const idx = i * 4
      result.data[idx] = edges[i]
      result.data[idx + 1] = edges[i]
      result.data[idx + 2] = edges[i]
      result.data[idx + 3] = 255
    }

    return result
  }

  /**
   * Post-processing
   */
  private async postprocessFrame(imageData: ImageData): Promise<ImageData> {
    // Apply threshold and cleanup
    const data = imageData.data
    const threshold = 50

    for (let i = 0; i < data.length; i += 4) {
      const value = data[i]
      if (value < threshold) {
        data[i] = 0
        data[i + 1] = 0
        data[i + 2] = 0
      } else {
        data[i] = 255
        data[i + 1] = 255
        data[i + 2] = 255
      }
    }

    return imageData
  }

  /**
   * Start continuous processing
   */
  startProcessing(callback: (frame: ImageData) => void): void {
    this.processingCallback = callback
    this.isProcessing = true
    this.lastFrameTime = performance.now()
    this.processLoop()
  }

  /**
   * Stop processing
   */
  stopProcessing(): void {
    this.isProcessing = false
  }

  /**
   * Processing loop with FPS control
   */
  private processLoop = (): void => {
    if (!this.isProcessing) return

    const now = performance.now()
    const frameInterval = 1000 / this.config.targetFPS

    if (now - this.lastFrameTime >= frameInterval) {
      if (this.frameQueue.length > 0) {
        const frame = this.frameQueue.shift()!
        this.processFrame(frame).then(processedFrame => {
          if (this.processingCallback) {
            this.processingCallback(processedFrame)
          }
        })
      }
      this.lastFrameTime = now
    }

    requestAnimationFrame(this.processLoop)
  }

  /**
   * Add frame to processing queue
   */
  addFrame(frame: ImageData): void {
    this.frameQueue.push(frame)
    
    // Limit queue size
    if (this.frameQueue.length > 10) {
      this.frameQueue.shift()
      this.droppedFrames++
    }
    
    this.metrics.queueSize = this.frameQueue.length
  }

  /**
   * Get current metrics
   */
  getMetrics(): ProcessingMetrics {
    return {
      ...this.metrics,
      droppedFrames: this.droppedFrames,
      fps: this.config.targetFPS
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): FrameProcessorConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<FrameProcessorConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopProcessing()
    
    // Terminate workers
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
    
    // Cleanup WebGL
    if (this.webglContext) {
      this.webglContext.deleteShader(this.webglContext.createShader(this.webglContext.VERTEX_SHADER)!)
      this.webglContext.deleteShader(this.webglContext.createShader(this.webglContext.FRAGMENT_SHADER)!)
      this.webglContext.deleteProgram(this.webglContext.createProgram()!)
    }
  }
}

export { FrameProcessor }
export default FrameProcessor
