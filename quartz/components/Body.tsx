// @ts-ignore
import clipboardScript from "./scripts/clipboard.inline"
// @ts-ignore
import lazyLoadScript from "./scripts/lazy.inline"
// @ts-ignore
import customScrollbarScript from "./scripts/custom-scrollbar.inline"
import clipboardStyle from "./styles/clipboard.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return <div id="quartz-body">{children}</div>
}

Body.afterDOMLoaded = clipboardScript + lazyLoadScript + customScrollbarScript
Body.css = clipboardStyle

export default (() => Body) satisfies QuartzComponentConstructor
