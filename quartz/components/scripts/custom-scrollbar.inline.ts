// Custom overlay scrollbar implementation
document.addEventListener("nav", () => {
  // Remove any existing custom scrollbar
  const existingScrollbar = document.querySelector('.custom-scrollbar')
  if (existingScrollbar) {
    existingScrollbar.remove()
  }

  // Create custom scrollbar elements
  const scrollbar = document.createElement('div')
  scrollbar.className = 'custom-scrollbar'
  
  const thumb = document.createElement('div')
  thumb.className = 'custom-scrollbar__thumb'
  
  scrollbar.appendChild(thumb)
  document.body.appendChild(scrollbar)

  let isDragging = false
  let startY = 0
  let startScrollTop = 0

  const updateThumb = () => {
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop

    if (scrollHeight <= clientHeight) {
      scrollbar.style.display = 'none'
      return
    }

    scrollbar.style.display = 'block'
    
    const thumbHeight = Math.max(20, (clientHeight / scrollHeight) * clientHeight)
    const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight)
    
    thumb.style.height = `${thumbHeight}px`
    thumb.style.top = `${thumbTop}px`
  }

  const handleScroll = () => {
    if (!isDragging) {
      updateThumb()
    }
  }

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true
    startY = e.clientY
    startScrollTop = document.documentElement.scrollTop || document.body.scrollTop
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const deltaY = e.clientY - startY
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    const scrollRatio = deltaY / clientHeight
    const scrollDelta = scrollRatio * (scrollHeight - clientHeight)
    
    const newScrollTop = Math.max(0, Math.min(scrollHeight - clientHeight, startScrollTop + scrollDelta))
    window.scrollTo(0, newScrollTop)
  }

  const handleMouseUp = () => {
    isDragging = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  // Event listeners
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', updateThumb)
  thumb.addEventListener('mousedown', handleMouseDown)
  
  // Initial update
  updateThumb()

  // Cleanup
  window.addCleanup(() => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', updateThumb)
    thumb.removeEventListener('mousedown', handleMouseDown)
    if (scrollbar && scrollbar.parentNode) {
      scrollbar.parentNode.removeChild(scrollbar)
    }
  })
}) 