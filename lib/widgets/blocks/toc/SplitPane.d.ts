import { ReactNode } from "react";
/** Pane that is split left right */
declare const SplitPane: ({ left, right, theme }: {
    left: ReactNode;
    right: ReactNode;
    theme: "light" | "dark";
}) => JSX.Element;
export default SplitPane;
