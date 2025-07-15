const userPref = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
const currentTheme = localStorage.getItem("theme") ?? userPref
document.documentElement.setAttribute("saved-theme", currentTheme)

const emitThemeChangeEvent = (theme: "light" | "dark") => {
  // Check hardware capabilities for animation decisions
  const capabilities = (window as any).getHardwareCapabilities?.()
  
  if (capabilities?.hasGoodGPU) {
    // Reset classes so the sunrise / sunset animation can play again
    document.body.classList.remove("animation-static")
    // Force reflow to ensure the browser registers the class change
    void document.body.offsetWidth
    document.body.classList.add("animation-ready")

    // Once the animation finishes, return to the static state until next toggle
    const dl = document.getElementById("dappled-light")
    if (dl) {
      dl.addEventListener(
        "animationend",
        () => {
          document.body.classList.remove("animation-ready")
          document.body.classList.add("animation-static")
        },
        { once: true },
      )
    }
  } else {
    // Poor hardware – keep instant switching
    document.body.classList.remove("animation-ready")
    document.body.classList.add("animation-static")
  }
  
  const event: CustomEventMap["themechange"] = new CustomEvent("themechange", {
    detail: { theme },
  })
  document.dispatchEvent(event)
}

document.addEventListener("nav", () => {
  // Ensure hardware classes are applied before setting up theme handlers
  const ensureHardwareDetection = () => {
    const capabilities = (window as any).getHardwareCapabilities?.()
    if (capabilities) {
      // Remove any existing hardware classes
      document.body.classList.remove('hw-accel-good', 'hw-accel-poor', 'hw-accel-poor-theme-switch')
      
      // Add appropriate classes
      document.body.classList.add(
        capabilities.hasGoodGPU ? 'hw-accel-good' : 'hw-accel-poor'
      )
      
      if (!capabilities.hasGoodGPU) {
        document.body.classList.add('hw-accel-poor-theme-switch')
      }
    }
  }
  
  // Run hardware detection check immediately
  ensureHardwareDetection()
  
  const switchTheme = () => {
    const newTheme =
      document.documentElement.getAttribute("saved-theme") === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("saved-theme", newTheme)
    localStorage.setItem("theme", newTheme)
    emitThemeChangeEvent(newTheme)
  }

  const themeChange = (e: MediaQueryListEvent) => {
    const newTheme = e.matches ? "dark" : "light"
    document.documentElement.setAttribute("saved-theme", newTheme)
    localStorage.setItem("theme", newTheme)
    emitThemeChangeEvent(newTheme)
  }

  for (const darkmodeButton of document.getElementsByClassName("darkmode")) {
    darkmodeButton.addEventListener("click", switchTheme)
    window.addCleanup(() => darkmodeButton.removeEventListener("click", switchTheme))
  }

  // Listen for changes in prefers-color-scheme
  const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  colorSchemeMediaQuery.addEventListener("change", themeChange)
  window.addCleanup(() => colorSchemeMediaQuery.removeEventListener("change", themeChange))
})

// Listen for hardware detection completion
document.addEventListener("hardwaredetected", (e: CustomEventMap["hardwaredetected"]) => {
  const capabilities = e.detail
  
  // If hardware is poor, add a class to enable instant theme switching
  if (!capabilities.hasGoodGPU) {
    document.body.classList.add("hw-accel-poor-theme-switch")
  }
})
