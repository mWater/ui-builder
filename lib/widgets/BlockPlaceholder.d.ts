import * as React from "react";
import { BlockDef } from "./blocks";
import { ConnectDropTarget } from 'react-dnd';
import "./BlockPlaceholder.css";
interface Props {
    isOver?: boolean;
    connectDropTarget?: ConnectDropTarget;
    onSet?: (blockDef: BlockDef) => void;
}
export default class BlockPlaceholder extends React.Component<Props> {
    render(): React.ReactElement<any>;
}
export {};
