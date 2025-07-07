import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import style from "./styles/sidebarFooter.scss"

const SidebarFooter: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "sidebar-footer")}>
      <p class="powered">
        <img src="static/quartz_icon.svg" alt="Quartz logo" style="width: 28px; height: 28px; margin-right: 0;"/>
        Powered by Quartz 4
      </p>
      {/* <ul class="social-links">
        <li>
          <a href="https://github.com/yhsure" aria-label="GitHub" target="_blank" rel="noopener">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0.297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385 0.6 0.113 0.82-0.258 0.82-0.577 0-0.285-0.010-1.040-0.015-2.040-3.338 0.726-4.042-1.61-4.042-1.61-0.546-1.387-1.333-1.757-1.333-1.757-1.089-0.744 0.084-0.729 0.084-0.729 1.205 0.085 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492 0.998 0.108-0.776 0.418-1.305 0.762-1.605-2.665-0.305-5.466-1.332-5.466-5.931 0-1.31 0.469-2.381 1.236-3.221-0.123-0.303-0.535-1.523 0.117-3.176 0 0 1.008-0.322 3.301 1.23 0.957-0.266 1.984-0.399 3.003-0.404 1.018 0.005 2.045 0.138 3.003 0.404 2.291-1.552 3.297-1.23 3.297-1.23 0.653 1.653 0.242 2.873 0.119 3.176 0.77 0.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.624-5.479 5.921 0.43 0.372 0.823 1.105 0.823 2.229 0 1.609-0.014 2.905-0.014 3.301 0 0.321 0.216 0.694 0.825 0.576 4.765-1.587 8.199-6.084 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </li>
        <li>
          <a href="https://twitter.com/yhsure" aria-label="Twitter" target="_blank" rel="noopener">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M24 4.557c-0.883 0.392-1.832 0.656-2.828 0.775 1.017-0.609 1.798-1.574 2.165-2.723-0.951 0.564-2.005 0.974-3.127 1.195-0.897-0.957-2.178-1.555-3.594-1.555-2.719 0-4.924 2.206-4.924 4.924 0 0.386 0.043 0.762 0.127 1.124-4.092-0.205-7.719-2.165-10.148-5.144-0.424 0.729-0.666 1.577-0.666 2.476 0 1.708 0.87 3.213 2.19 4.096-0.807-0.026-1.566-0.248-2.228-0.616v0.062c0 2.386 1.697 4.374 3.95 4.828-0.413 0.112-0.849 0.171-1.296 0.171-0.317 0-0.626-0.030-0.928-0.087 0.627 1.956 2.444 3.379 4.598 3.419-1.68 1.318-3.808 2.105-6.115 2.105-0.398 0-0.79-0.023-1.175-0.069 2.179 1.397 4.768 2.213 7.557 2.213 9.054 0 14.009-7.504 14.009-14.009 0-0.213-0.004-0.426-0.014-0.637 0.961-0.693 1.797-1.562 2.457-2.549z" />
            </svg>
          </a>
        </li>
      </ul> */}
    </div>
  )
}

SidebarFooter.css = style

export default (() => SidebarFooter) satisfies QuartzComponentConstructor 