import React, { ReactNode } from "react"
import FillDownwardComponent from "react-library/lib/FillDownwardComponent"

/** Pane that is split left right */
const SplitPane = ({ left, right }: { left: ReactNode, right : ReactNode }) => {
  return <FillDownwardComponent>
    <div style={{ height: "100%", position: "relative" }}>
      <div style={{ height: "100%", width: "25%", float: "left" }}>
        {left}
      </div>
      <div style={{ height: "100%", width: "75%", float: "left", borderLeft: "solid 1px #DDD"  }}>
        {right}
      </div>
    </div>
  </FillDownwardComponent>
}

export default SplitPane