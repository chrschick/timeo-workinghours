/// <reference types="vite/client" />

declare module '*.svg?react' {
  import React = require('react')
  const SVGComponent: React.VFC<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >
  export const ReactComponent: typeof SVGComponent
  export default SVGComponent
}
