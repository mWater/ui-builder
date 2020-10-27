import { ReactNode } from "react";
/** Pane that is split left right */
declare const SplitPane: ({ left, right, removePadding, theme }: {
    left: ReactNode;
    right: ReactNode;
    removePadding: boolean;
    theme: "light" | "dark";
}) => JSX.Element;
export default SplitPane;
