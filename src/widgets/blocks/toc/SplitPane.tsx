import React, { ReactNode } from "react"
import FillDownwardComponent from "react-library/lib/FillDownwardComponent"

/** Pane that is split left right */
const SplitPane = ({ left, right, theme }: { left: ReactNode, right : ReactNode, theme: "light" | "dark" }) => {
  return <FillDownwardComponent>
    <div className={`toc-split ${theme}`}>
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