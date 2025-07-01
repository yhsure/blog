import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import bannerStyle from "./styles/banner.scss"

interface BannerOpts {
  src?: string
  alt?: string
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// Use a more coherent analogous color scheme with gentle accent
function gradientFromString(seed: string): string {
  const hash = hashCode(seed)
  const baseHue = hash % 360
  // Analogous hues: base, base+20, base-20, base+40
  const hues = [
    baseHue,
    (baseHue + 20) % 360,
    (baseHue + 40) % 360,
    (baseHue + 60) % 360
  ]
  // Accent color: base+180 (complement, but only for a subtle highlight)
  const accentHue = (baseHue + 180) % 360

  // Main colors: analogous, with similar saturation and lightness
  const colors = [
    { h: hues[0], s: 70, l: 65 },
    { h: hues[1], s: 65, l: 70 },
    { h: hues[2], s: 60, l: 60 },
    { h: hues[3], s: 55, l: 75 }
  ]

  // Accent layer (subtle, more transparent)
  const accentLayer = `radial-gradient(circle at 80% 20%, hsla(${accentHue},60%,70%,0.18) 0%, transparent 60%)`

  const layers = Array.from({ length: 3 }, (_, i) => {
    const color = colors[i]
    const x = ((hash >> (i * 3)) % 70) + 15
    const y = ((hash >> (i * 5)) % 70) + 15
    const sz = ((hash >> (i * 7)) % 25) + 30
    return `radial-gradient(circle at ${x}% ${y}%, hsla(${color.h},${color.s}%,${color.l}%,0.48) 0%, transparent ${sz}%)`
  })

  // Base gradient: two analogous hues, gentle transition
  const base = `linear-gradient(135deg, hsla(${hues[0]},55%,85%,0.32) 0%, hsla(${hues[2]},50%,80%,0.38) 100%)`
  return [accentLayer, ...layers, base].join(", ")
}

export default ((opts: BannerOpts = {}) => {
  const Banner: QuartzComponent = (props: QuartzComponentProps) => {
    const fm: any = props.fileData?.frontmatter ?? {}
    const frontSrc = fm.banner ?? fm.cover
    const altText = fm.bannerAlt ?? fm.coverAlt ?? opts.alt
    const src = frontSrc ?? opts.src

    if (src) {
      return (
        <div class="banner-wrapper">
          <img class="banner-img" src={src} alt={altText ?? "Banner"} />
        </div>
      )
    }

    const seed = props.fileData?.slug ?? "default"
    const background = gradientFromString(seed)
    return <div class="banner-wrapper" style={{ background }} />
  }

  Banner.css = bannerStyle
  return Banner
}) satisfies QuartzComponentConstructor<BannerOpts>
