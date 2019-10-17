import React from "react";
/** Pane that is split left right */
declare const SplitPane: ({ left, right, removePadding }: {
    left: React.ReactNode;
    right: React.ReactNode;
    removePadding: boolean;
}) => JSX.Element;
export default SplitPane;
