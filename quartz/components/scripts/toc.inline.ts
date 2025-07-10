let currentActiveSection: string | null = null

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const slug = entry.target.id
    // Skip popover content
    if (slug.startsWith('popover-internal-')) continue
    
    const tocEntryElements = document.querySelectorAll(`a[data-for="${slug}"]`)
    const windowHeight = entry.rootBounds?.height
    
    if (windowHeight && tocEntryElements.length > 0) {
      if (entry.boundingClientRect.y < windowHeight) {
        tocEntryElements.forEach((tocEntryElement) => tocEntryElement.classList.add("in-view"))
      } else {
        tocEntryElements.forEach((tocEntryElement) => tocEntryElement.classList.remove("in-view"))
      }
    }
  }
})

// Simple function to update the active section
function updateActiveSection() {
  // Get headers, excluding popover content
  const headers = document.querySelectorAll("h1[id]:not([id^='popover-internal-']), h2[id]:not([id^='popover-internal-']), h3[id]:not([id^='popover-internal-']), h4[id]:not([id^='popover-internal-']), h5[id]:not([id^='popover-internal-']), h6[id]:not([id^='popover-internal-'])")
  const scrollTop = window.scrollY + 100 // Offset for better UX
  
  let newActiveSection: string | null = null
  
  // Find the header that's currently at the top
  for (let i = headers.length - 1; i >= 0; i--) {
    const header = headers[i] as HTMLElement
    if (header.offsetTop <= scrollTop) {
      newActiveSection = header.id
      break
    }
  }
  
  // If no section is active (e.g., at the top of the page), highlight the first section
  if (!newActiveSection && headers.length > 0) {
    newActiveSection = (headers[0] as HTMLElement).id
  }
  
  // Only update if there's a change
  if (newActiveSection !== currentActiveSection) {
    // Remove previous active state
    if (currentActiveSection) {
      const prevActiveElements = document.querySelectorAll(`a[data-for="${currentActiveSection}"]`)
      prevActiveElements.forEach((el) => el.classList.remove("active"))
    }
    
    // Set new active section
    currentActiveSection = newActiveSection
    if (currentActiveSection) {
      const activeElements = document.querySelectorAll(`a[data-for="${currentActiveSection}"]`)
      activeElements.forEach((el) => el.classList.add("active"))
    }
  }
}

function toggleToc(this: HTMLElement) {
  this.classList.toggle("collapsed")
  this.setAttribute(
    "aria-expanded",
    this.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )
  const content = this.nextElementSibling as HTMLElement | undefined
  if (!content) return
  content.classList.toggle("collapsed")
}

function setupToc() {
  for (const toc of document.getElementsByClassName("toc")) {
    const button = toc.querySelector(".toc-header")
    const content = toc.querySelector(".toc-content")
    if (!button || !content) continue // Skip if no button (simple layout)
    button.addEventListener("click", toggleToc)
    window.addCleanup(() => button.removeEventListener("click", toggleToc))
  }
}

// Continuous scroll handler for instant highlighting
let rafId: number | null = null
function handleScroll() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
  }
  
  rafId = requestAnimationFrame(() => {
    updateActiveSection()
    rafId = null
  })
}

document.addEventListener("nav", () => {
  setupToc()

  // Reset active section tracking
  currentActiveSection = null

  // Update toc entry highlighting
  observer.disconnect()
  // Exclude popover content from observation
  const headers = document.querySelectorAll("h1[id]:not([id^='popover-internal-']), h2[id]:not([id^='popover-internal-']), h3[id]:not([id^='popover-internal-']), h4[id]:not([id^='popover-internal-']), h5[id]:not([id^='popover-internal-']), h6[id]:not([id^='popover-internal-'])")
  headers.forEach((header) => observer.observe(header))
  
  // Set up continuous scroll tracking
  document.removeEventListener("scroll", handleScroll)
  document.addEventListener("scroll", handleScroll, { passive: true })
  window.addCleanup(() => {
    document.removeEventListener("scroll", handleScroll)
    if (rafId !== null) cancelAnimationFrame(rafId)
  })
  
  // Initial update - this will highlight the first section if none is active
  updateActiveSection()
})
