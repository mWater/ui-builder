import React, { ReactNode } from "react"
import FillDownwardComponent from "react-library/lib/FillDownwardComponent"

/** Pane that is split left right */
const SplitPane = ({ left, right, removePadding, theme }: { left: ReactNode, right : ReactNode, removePadding: boolean, theme: "light" | "dark" }) => {
  const className = removePadding ? `toc-split remove-padding ${theme}` : `toc-split ${theme}`
  return <FillDownwardComponent>
    <div className={className}>
      <div key="left" className="toc-split-left">
        {left}
      </div>
      <div key="right" className="toc-split-right">
        {right}
      </div>
    </div>
  </FillDownwardComponent>
}

export default SplitPane