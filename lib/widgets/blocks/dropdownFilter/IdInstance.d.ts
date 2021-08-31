import { DropdownFilterBlockDef } from "./dropdownFilter";
import { InstanceCtx } from '../../../contexts';
/** Dropdown filter that is an id */
export declare const IdInstance: (props: {
    blockDef: DropdownFilterBlockDef;
    ctx: InstanceCtx;
    value: any;
    onChange: (value: any) => void;
    locale: string;
}) => JSX.Element;
