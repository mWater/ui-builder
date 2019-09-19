import React, { ReactNode } from "react"
import FillDownwardComponent from "react-library/lib/FillDownwardComponent"

/** Pane that is split left right */
const SplitPane = ({ left, right }: { left: ReactNode, right : ReactNode }) => {
  return <FillDownwardComponent>
    <div className="toc-split">
      <div className="toc-split-left">
        {left}
      </div>
      <div className="toc-split-right">
        {right}
      </div>
    </div>
  </FillDownwardComponent>
}

export default SplitPane