import { ReactNode } from "react";
/** Pane that is split left right */
declare const SplitPane: ({ left, right, removePadding }: {
    left: ReactNode;
    right: ReactNode;
    removePadding: boolean;
}) => JSX.Element;
export default SplitPane;
