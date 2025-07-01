import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { SimpleSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import style from "./styles/recentNotes.scss"
import { Date, getDate } from "./Date"
import { GlobalConfiguration } from "../cfg"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

// @ts-ignore
import recentNotesScript from "./scripts/recentNotes.inline"

interface Options {
  title?: string
  limit: number
  linkToMore: SimpleSlug | false
  showTags: boolean
  filter: (f: QuartzPluginData) => boolean
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

const defaultOptions = (cfg: GlobalConfiguration): Options => ({
  limit: 3,
  linkToMore: false,
  showTags: true,
  filter: () => true,
  sort: byDateAndAlphabetical(cfg),
})

export default ((userOpts?: Partial<Options>) => {
  const RecentNotes: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions(cfg), ...userOpts }
    const pages = allFiles.filter(opts.filter).sort(opts.sort)
    const remaining = Math.max(0, pages.length - opts.limit)

    // Take the first `limit` pages after filtering + sorting
    const limitedPages = pages.slice(0, opts.limit)

    // Build a mapping of year -> pages in that year
    const grouped: Record<number, typeof pages> = {}
    for (const page of limitedPages) {
      const date = getDate(cfg, page)
      // If no date is available, bucket under 0 ("Unknown")
      const year = date ? date.getFullYear() : 0
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(page)
    }

    // Sort years descending (newest first)
    const years = Object.keys(grouped)
      .map((y) => Number(y))
      .sort((a, b) => b - a)

    return (
      <div class={classNames(displayClass, "recent-notes")}> 
        {years.map((year) => (
          <div>
            {/* Year heading (use "Unknown" when year == 0) */}
            <h3>{year === 0 ? (opts.title ?? i18n(cfg.locale).components.recentNotes.title) : year}</h3>
            <ul class="recent-ul">
              {grouped[year].map((page) => {
                const title = page.frontmatter?.title
                return (
                  <li class="recent-li">
                    <div class="section">
                      <div class="desc">
                        <h3>
                          <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                            {title}
                          </a>
                        </h3>
                      </div>
                      {page.dates && (
                        <p class="meta">
                          <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
        {opts.linkToMore && remaining > 0 && (
          <p>
            <a href={resolveRelative(fileData.slug!, opts.linkToMore)}>
              {i18n(cfg.locale).components.recentNotes.seeRemainingMore({ remaining })}
            </a>
          </p>
        )}
      </div>
    )
  }

  RecentNotes.css = style
  RecentNotes.afterDOMLoaded = recentNotesScript
  return RecentNotes
}) satisfies QuartzComponentConstructor
