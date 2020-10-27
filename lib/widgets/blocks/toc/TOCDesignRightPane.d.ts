/// <reference types="react" />
import { TOCItem } from "./toc";
import { DesignCtx } from "../../../contexts";
export declare function TOCDesignRightPane(props: {
    item: TOCItem;
    renderProps: DesignCtx;
    onItemChange: (item: TOCItem) => void;
}): JSX.Element;
