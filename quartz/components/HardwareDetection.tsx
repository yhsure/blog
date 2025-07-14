// @ts-ignore
import hardwareAccelerationScript from "./scripts/hardwareAcceleration.inline"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const HardwareDetection: QuartzComponent = (_: QuartzComponentProps) => {
  // This component doesn't render anything visible - it's just for loading the script
  return null
}

HardwareDetection.beforeDOMLoaded = hardwareAccelerationScript

export default (() => HardwareDetection) satisfies QuartzComponentConstructor 