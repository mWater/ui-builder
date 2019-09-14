/// <reference types="react" />
import { TOCBlockDef } from "./toc";
import { RenderInstanceProps, CreateBlock } from '../../blocks';
/** Instance component for TOC */
export default function TOCInstanceComp(props: {
    blockDef: TOCBlockDef;
    renderProps: RenderInstanceProps;
    createBlock: CreateBlock;
}): JSX.Element;
