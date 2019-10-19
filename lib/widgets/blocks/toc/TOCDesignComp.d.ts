/// <reference types="react" />
import { TOCBlockDef } from "./toc";
import { DesignCtx } from "../../../contexts";
/** Designer component for TOC */
export default function TOCDesignComp(props: {
    blockDef: TOCBlockDef;
    renderProps: DesignCtx;
}): JSX.Element;
