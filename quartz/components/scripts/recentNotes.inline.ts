// Highlight the current page in the Recent Notes list
;(function () {
  function updateHighlight() {
    const currentPath = window.location.pathname.replace(/\/$/, "")
    document
      .querySelectorAll<HTMLLIElement>(".recent-notes li.active")
      .forEach((el) => el.classList.remove("active"))

    const links = document.querySelectorAll<HTMLAnchorElement>(
      ".recent-notes a.internal",
    )
    links.forEach((link) => {
      const hrefPath = link.pathname.replace(/\/$/, "")
      if (hrefPath === currentPath) {
        link.closest("li")?.classList.add("active")
      }
    })

    // Ensure whole box is clickable
    addLiClickHandlers()
  }

  function addLiClickHandlers() {
    document.querySelectorAll<HTMLLIElement>(".recent-notes li").forEach((li) => {
      if (li.dataset.clickable === "true") return
      const anchor = li.querySelector<HTMLAnchorElement>("a.internal")
      if (!anchor) return

      li.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).closest("a")) return // regular link click
        anchor.click()
      })
      li.style.cursor = "pointer"
      li.dataset.clickable = "true"
    })
  }

  // Initial run
  updateHighlight()

  // Re-run on back/forward navigation
  window.addEventListener("popstate", updateHighlight)

  // Hook into pushState/replaceState to catch SPA navigations
  const hist = history as any
  ;["pushState", "replaceState"].forEach((type: string) => {
    const original = hist[type]
    hist[type] = function (...args: any[]) {
      const ret = original.apply(this, args)
      // Delay to allow DOM replacement
      setTimeout(updateHighlight, 0)
      return ret
    }
  })

  // Clean up when page is disposed (Quartz provides addCleanup)
  if (window.addCleanup) {
    window.addCleanup(() => {
      window.removeEventListener("popstate", updateHighlight)
    })
  }
})() 