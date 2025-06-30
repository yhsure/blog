import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import bannerStyle from "./styles/banner.scss"

interface BannerOpts {
  /**
   * Default path to a banner image if none is supplied via page front-matter.
   */
  src?: string
  /**
   * Alt text for the banner image
   */
  alt?: string
}

// Simple hash to derive deterministic hues based on a string (e.g., slug)
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash)
}

function gradientFromString(seed: string): string {
  const hash = hashCode(seed)
  // Two colors 180° apart on hue wheel for pleasing gradient
  const hue1 = hash % 360
  const hue2 = (hue1 + 180) % 360
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%) 0%, hsl(${hue2}, 70%, 60%) 100%)`
}

export default ((opts: BannerOpts = {}) => {
  const Banner: QuartzComponent = (props: QuartzComponentProps) => {
    const fm: any = props.fileData?.frontmatter ?? {}

    // Priority: front-matter banner, option src, else none
    const frontSrc: string | undefined = fm.banner ?? fm.cover
    const altText: string | undefined = fm.bannerAlt ?? fm.coverAlt ?? opts.alt
    const src: string | undefined = frontSrc ?? opts.src

    if (src) {
      return (
        <div class="banner-wrapper">
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img class="banner-img" src={src} alt={altText ?? "Banner"} />
        </div>
      )
    }

    // Fallback gradient – deterministic per slug for variety
    const seed = props.fileData?.slug ?? "default"
    const gradient = gradientFromString(seed)
    return <div class="banner-wrapper" style={{ background: gradient }} />
  }

  Banner.css = bannerStyle
  return Banner
}) satisfies QuartzComponentConstructor<BannerOpts> 