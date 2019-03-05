import React from "react";
import { TabbedBlockDef, TabbedBlockTab } from "./tabbed";
import { RenderInstanceProps } from "../../blocks";
interface Props {
    tabbedBlockDef: TabbedBlockDef;
    renderInstanceProps: RenderInstanceProps;
}
interface State {
    /** Index of currently active tab */
    activeIndex: number;
    /** List of indexes of open tabs. This is to *not* render tabs that have not been opened, as maps in particular
     * don't handle rendering when invisible.
     */
    openTabIndexes: number[];
}
export default class TabbedInstance extends React.Component<Props, State> {
    constructor(props: Props);
    handleSelectTab: (index: number) => void;
    renderTab(tab: TabbedBlockTab, index: number): JSX.Element;
    renderTabContent(tab: TabbedBlockTab, index: number): JSX.Element | null;
    render(): JSX.Element;
}
export {};
