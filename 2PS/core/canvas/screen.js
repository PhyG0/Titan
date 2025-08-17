class Screen {
  constructor(width = 1920, height = 1080, options = {}) {
    this.width = width
    this.height = height
    this.aspectRatio = width / height
    this.options = {
      title: 'Interactive Canvas Display',
      description:
        'This canvas provides a modern, responsive drawing surface with hardware acceleration and optimal rendering performance. Perfect for graphics, games, data visualization, and interactive applications.',
      showDescription: true,
      ...options,
    }

    // Create main container
    this.container = document.createElement('div')
    this.container.className = 'screen-container'
    this._initializeContainer()

    // Create description section if enabled
    if (this.options.showDescription) {
      this.descriptionSection = this._createDescriptionSection()
      this.container.appendChild(this.descriptionSection)
    }

    // Create canvas wrapper for better organization
    this.canvasWrapper = document.createElement('div')
    this.canvasWrapper.className = 'canvas-wrapper'
    this._initializeCanvasWrapper()

    // Create canvas
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'screen-canvas'
    this.canvas.width = width
    this.canvas.height = height
    this._initializeCanvas()

    this.canvasWrapper.appendChild(this.canvas)
    this.container.appendChild(this.canvasWrapper)
    document.body.appendChild(this.container)

    this._setupResponsive()
    this._resize()
    this._applyBodyStyles()
  }

  _createDescriptionSection() {
    const section = document.createElement('div')
    section.className = 'description-section'

    const heading = document.createElement('h1')
    heading.textContent = this.options.title
    heading.className = 'screen-title'

    const paragraph = document.createElement('p')
    paragraph.textContent = this.options.description
    paragraph.className = 'screen-description'

    section.appendChild(heading)
    section.appendChild(paragraph)

    // Style the description section
    Object.assign(section.style, {
      padding: '16px 20px 12px', // Reduced padding for mobile
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.02)',
      flexShrink: '0', // Prevent shrinking
    })

    Object.assign(heading.style, {
      margin: '0 0 6px 0',
      fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', // Responsive font size
      fontWeight: '600',
      color: '#ffffff',
      letterSpacing: '-0.025em',
      lineHeight: '1.2',
    })

    Object.assign(paragraph.style, {
      margin: '0',
      fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', // Responsive font size
      lineHeight: '1.4',
      color: 'rgba(255, 255, 255, 0.7)',
      maxWidth: 'none',
    })

    return section
  }

  _initializeContainer() {
    Object.assign(this.container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh', // Use full viewport initially
      border: 'none', // Remove border on mobile for more space
      borderRadius: '0',
      boxShadow: 'none', // Remove shadow on mobile
      background:
        'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
      backdropFilter: 'blur(10px)',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
    })

    // Apply desktop styles only on larger screens
    if (window.innerWidth > 768) {
      Object.assign(this.container.style, {
        top: '50%',
        left: '50%',
        width: 'auto',
        height: 'auto',
        transform: 'translate(-50%, -50%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, 0.25),
          0 0 0 1px rgba(255, 255, 255, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
      })
    }
  }

  _initializeCanvasWrapper() {
    Object.assign(this.canvasWrapper.style, {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: this.options.showDescription
        ? window.innerWidth > 768
          ? '16px'
          : '8px'
        : '0',
      minHeight: '0',
      overflow: 'hidden', // Prevent overflow
    })
  }

  _initializeCanvas() {
    Object.assign(this.canvas.style, {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      display: 'block',
      borderRadius: this.options.showDescription
        ? window.innerWidth > 768
          ? '8px'
          : '4px'
        : '0',
      backgroundColor: '#000000',
      objectFit: 'contain',
    })
  }

  _applyBodyStyles() {
    Object.assign(document.body.style, {
      margin: '0',
      padding: '0',
      overflow: 'hidden',
      background:
        'radial-gradient(ellipse at center, #1a1a1a 0%, #000000 100%)',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      touchAction: 'none', // Prevent touch scrolling/zooming
      userSelect: 'none', // Prevent text selection
      webkitUserSelect: 'none',
    })

    // Ensure html also has proper styles
    Object.assign(document.documentElement.style, {
      height: '100%',
      backgroundColor: '#000000',
      overflow: 'hidden',
    })

    // Add viewport meta tag if it doesn't exist
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta')
      viewport.name = 'viewport'
      viewport.content =
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      document.head.appendChild(viewport)
    }
  }

  _setupResponsive() {
    let resizeTimeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => this._resize(), 16)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this._resize(), 200) // Increased delay for mobile orientation
    })

    // Handle mobile viewport changes
    window.addEventListener(
      'scroll',
      (e) => {
        e.preventDefault()
      },
      { passive: false }
    )
  }

  _resize() {
    const isMobile = window.innerWidth <= 768
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (isMobile) {
      // Mobile-specific layout
      this.container.style.position = 'fixed'
      this.container.style.top = '0'
      this.container.style.left = '0'
      this.container.style.width = '100vw'
      this.container.style.height = '100vh'
      this.container.style.transform = 'none'
      this.container.style.border = 'none'
      this.container.style.borderRadius = '0'
      this.container.style.boxShadow = 'none'

      // Calculate available space for canvas
      const descriptionHeight = this.options.showDescription
        ? this.descriptionSection
          ? this.descriptionSection.offsetHeight
          : 70
        : 0
      const padding = 16 // Minimal padding on mobile
      const availableWidth = viewportWidth - padding
      const availableHeight = viewportHeight - descriptionHeight - padding

      // Ensure canvas wrapper uses available space properly
      Object.assign(this.canvasWrapper.style, {
        padding: this.options.showDescription ? '8px' : '4px',
        width: '100%',
        height: `${availableHeight + (this.options.showDescription ? 8 : 4)}px`,
      })
    } else {
      // Desktop layout
      const padding = 40
      const maxWidth = viewportWidth - padding
      const maxHeight = viewportHeight - padding
      const descriptionHeight = this.options.showDescription ? 80 : 0
      const availableHeight = maxHeight - descriptionHeight

      let newWidth, newHeight

      if (maxWidth / availableHeight > this.aspectRatio) {
        newHeight = availableHeight
        newWidth = newHeight * this.aspectRatio
      } else {
        newWidth = maxWidth
        newHeight = newWidth / this.aspectRatio
      }

      // Minimum size for desktop
      const minSize = 400
      if (newWidth < minSize || newHeight < minSize) {
        if (this.aspectRatio > 1) {
          newWidth = minSize
          newHeight = newWidth / this.aspectRatio
        } else {
          newHeight = minSize
          newWidth = newHeight * this.aspectRatio
        }
      }

      const totalHeight = newHeight + descriptionHeight

      Object.assign(this.container.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: `${newWidth}px`,
        height: `${totalHeight}px`,
        transform: 'translate(-50%, -50%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, 0.25),
          0 0 0 1px rgba(255, 255, 255, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
      })

      // Reset canvas wrapper
      Object.assign(this.canvasWrapper.style, {
        padding: this.options.showDescription ? '16px' : '0',
        width: 'auto',
        height: 'auto',
      })
    }

    // Smooth transition
    this.container.style.opacity = '0.95'
    requestAnimationFrame(() => {
      this.container.style.opacity = '1'
    })
  }

  getContext(type = '2d', options = {}) {
    const defaultOptions = {
      alpha: false,
      desynchronized: true,
      ...options,
    }
    return this.canvas.getContext(type, defaultOptions)
  }

  setTitle(title) {
    document.title = title
    if (this.options.showDescription) {
      const titleElement = this.container.querySelector('.screen-title')
      if (titleElement) {
        titleElement.textContent = title
      }
    }
  }

  setDescription(description) {
    this.options.description = description
    if (this.options.showDescription) {
      const descElement = this.container.querySelector('.screen-description')
      if (descElement) {
        descElement.textContent = description
      }
    }
  }

  toggleDescription(show = !this.options.showDescription) {
    this.options.showDescription = show
    if (this.descriptionSection) {
      this.descriptionSection.style.display = show ? 'block' : 'none'
      this._resize()
    }
  }

  setFullscreen() {
    if (this.container.requestFullscreen) {
      this.container.requestFullscreen()
    }
  }

  getCanvasDimensions() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
      displayWidth: this.canvas.offsetWidth,
      displayHeight: this.canvas.offsetHeight,
    }
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    window.removeEventListener('resize', this._resize)
    window.removeEventListener('orientationchange', this._resize)
  }
}

export default Screen
