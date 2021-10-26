/// <reference types="react" />
import { TOCBlockDef } from "./toc";
import { CreateBlock } from "../../blocks";
import { InstanceCtx } from "../../../contexts";
/** Instance component for TOC */
export default function TOCInstanceComp(props: {
    blockDef: TOCBlockDef;
    instanceCtx: InstanceCtx;
    createBlock: CreateBlock;
}): JSX.Element;
