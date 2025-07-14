import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"

const recentNotes = [
  Component.RecentNotes({
    title: "Recent Writing",
    limit: 5,
    filter: (f) => {
      const relPath = (f as any).relativePath as string | undefined
      const isPost = relPath ? relPath.startsWith("posts/") : false
      return isPost && relPath !== "posts/index.md" && !f.frontmatter?.noindex
    },
    linkToMore: "posts/" as SimpleSlug,
  }),
  // Component.RecentNotes({
  //   title: "Recent Notes",
  //   limit: 2,
  //   filter: (f) => f.slug!.startsWith("thoughts/"),
  //   linkToMore: "thoughts/" as SimpleSlug,
  // }),
]

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.Banner({})],
  afterBody: [
    Component.HardwareDetection(),
    ...recentNotes.map((c) => Component.MobileOnly(c)),
    Component.MobileOnly(Component.SidebarFooter()),
  ],
  footer: Component.Footer(),
}

const left = [
  Component.PageTitle(),
  Component.MobileOnly(Component.Spacer()),
  Component.Flex({
    components: [
      {
        Component: Component.Search(),
        grow: true,
      },
      { Component: Component.Darkmode() },
    ],
  }),
  ...recentNotes.map((c) => Component.DesktopOnly(c)),
  Component.DesktopOnly(Component.SidebarFooter()),
]

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta(), Component.TagList()],
  left,
  right: [Component.DesktopOnly(Component.TableOfContents())],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta()],
  left,
  right: [],
}
