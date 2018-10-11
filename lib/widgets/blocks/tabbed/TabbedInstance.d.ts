import React from "react";
import { TabbedBlockDef, TabbedBlockTab } from "./tabbed";
import { RenderInstanceProps } from "../../blocks";
interface Props {
    tabbedBlockDef: TabbedBlockDef;
    renderInstanceProps: RenderInstanceProps;
}
interface State {
    activeIndex: number;
}
export default class TabbedInstance extends React.Component<Props, State> {
    constructor(props: Props);
    handleSelectTab: (index: number) => void;
    renderTab(tab: TabbedBlockTab, index: number): JSX.Element;
    renderTabContent(tab: TabbedBlockTab, index: number): JSX.Element;
    render(): JSX.Element;
}
export {};
