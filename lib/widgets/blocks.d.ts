import * as React from 'react';
import { Database } from '../database/Database';
import { Schema, Expr, DataSource, Variable } from 'mwater-expressions';
import { WidgetLibrary } from '../designer/widgetLibrary';
import { ActionLibrary } from './ActionLibrary';
import { PageStack } from '../PageStack';
import "./blocks.css";
import { BlockPaletteEntry } from '../designer/blockPaletteEntries';
/** Side on which another block is dropped on a block */
export declare enum DropSide {
    top = "Top",
    bottom = "Bottom",
    left = "Left",
    right = "Right"
}
/** Store which permits modification of the block tree */
export interface BlockStore {
    /** Replace block with specified id with either another block or nothing.
     * Optionally removes another id first (for dragging where block should disappear and re-appear somewhere else) */
    alterBlock(blockId: string, action: (blockDef: BlockDef) => BlockDef | null, removeBlockId?: string): void;
}
/** Store which throws on any operation */
export declare class NullBlockStore implements BlockStore {
    alterBlock(blockId: string, action: (blockDef: BlockDef) => BlockDef | null): void;
}
/** Block definition */
export interface BlockDef {
    id: string;
    type: string;
    [index: string]: any;
}
export declare type CreateBlock = (blockDef: BlockDef) => Block<BlockDef>;
/** Context variable is a variable which is available to a block and all of its children. Usually row or a rowset */
export interface ContextVar {
    id: string;
    name: string;
    type: string;
    table?: string;
}
export interface RenderInstanceProps {
    /** locale to display (e.g. "en") */
    locale: string;
    database: Database;
    schema: Schema;
    dataSource: DataSource;
    contextVars: ContextVar[];
    actionLibrary: ActionLibrary;
    widgetLibrary: WidgetLibrary;
    pageStack: PageStack;
    /** Values of context variables */
    contextVarValues: {
        [contextVarId: string]: any;
    };
    /**
     * Gets the value of an expression based off of a context variable
     * @param contextVarId id of context variable
     * @param expr expression to get value of
     */
    getContextVarExprValue(contextVarId: string, expr: Expr): any;
    /** Selection call on context var (when type = "rowset" and selectable) */
    onSelectContextVar(contextVarId: string, primaryKey: any): void;
    /** Set a filter on a rowset context variable */
    setFilter(contextVarId: string, filter: Filter): void;
    /** Get any filters set on a rowset context variable  */
    getFilters(contextVarId: string): Filter[];
    /** All sub-block elements must rendered using this function.
     * @param instanceId if more than one child element with the same id will be rendered, instanceId must be a unique string
     * per instance
     */
    renderChildBlock(props: RenderInstanceProps, childBlockDef: BlockDef | null, instanceId?: string): React.ReactElement<any> | null;
}
export interface RenderDesignProps {
    /** locale to use (e.g. "en") */
    locale: string;
    contextVars: ContextVar[];
    store: BlockStore;
    schema: Schema;
    dataSource: DataSource;
    widgetLibrary: WidgetLibrary;
    blockPaletteEntries: BlockPaletteEntry[];
    /** Selected block id as some blocks may display differently when selected */
    selectedId: string | null;
    /** All sub-block elements must rendered using this function. onSet will be called only when transitioning from null to a value */
    renderChildBlock(props: RenderDesignProps, childBlockDef: BlockDef | null, onSet?: (blockDef: BlockDef) => void): React.ReactElement<any>;
}
export interface RenderEditorProps {
    contextVars: ContextVar[];
    /** locale of the editor (e.g. "en") */
    locale: string;
    schema: Schema;
    dataSource: DataSource;
    actionLibrary: ActionLibrary;
    widgetLibrary: WidgetLibrary;
    onChange(blockDef: BlockDef): void;
}
export interface ValidateBlockOptions {
    schema: Schema;
    contextVars: ContextVar[];
    actionLibrary: ActionLibrary;
    /** Widget library that lists all available widgets */
    widgetLibrary: WidgetLibrary;
}
/** A filter that applies to a particular rowset context variable */
export interface Filter {
    id: string;
    expr: Expr;
    memo?: any;
}
/** Child of a block. Specifies the child block def and also any context variables passed to it */
export interface ChildBlock {
    blockDef: BlockDef;
    contextVars: ContextVar[];
}
export declare abstract class Block<T extends BlockDef> {
    blockDef: T;
    constructor(blockDef: T);
    readonly id: string;
    /** Render the block as it looks in design mode. This may use bootstrap */
    abstract renderDesign(props: RenderDesignProps): React.ReactElement<any>;
    /** Render a live instance of the block. This may use bootstrap for now */
    abstract renderInstance(props: RenderInstanceProps): React.ReactElement<any>;
    /** Render an optional property editor for the block. This may use bootstrap */
    renderEditor(props: RenderEditorProps): React.ReactElement<any> | null;
    /** Get any context variables expressions that this block needs (not including child blocks) */
    getContextVarExprs(contextVar: ContextVar, widgetLibrary: WidgetLibrary, actionLibrary: ActionLibrary): Expr[];
    /** Get child blocks. Child blocks or their injected context vars can depend on type of context variables passed in. */
    abstract getChildren(contextVars: ContextVar[]): ChildBlock[];
    /** Determine if block is valid. null means valid, string is error message. Does not validate children */
    abstract validate(options: ValidateBlockOptions): string | null;
    /**
     * Processes entire tree, starting at bottom. Allows
     * easy mutation of the tree
     */
    process(createBlock: CreateBlock, action: (self: BlockDef | null) => BlockDef | null): BlockDef | null;
    /**
     * Call action child blocks (if any), replacing with result. Return changed blockDef. Allows easy mutation of the tree
     */
    abstract processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef;
    /** Get initial filters generated by this block. Does not include child blocks */
    getInitialFilters(contextVarId: string, widgetLibrary: WidgetLibrary): Filter[];
    /** Canonicalize the block definition. Should be done after operations on the block are completed. Only alter self, not children */
    canonicalize(): BlockDef | null;
}
/** Implemented by rendered block instances that require validation */
export interface ValidatableInstance {
    /** Validate the instance. Returns null if correct, message if not. Empty message ("") blocks but does not show */
    validate?(): string | null;
}
export declare function dropBlock(droppedBlockDef: BlockDef, targetBlockDef: BlockDef, dropSide: DropSide): BlockDef;
/**
 * Find the entire ancestry (root first) of a block with the specified id
 *
 * @param rootBlockDef root block to search in
 * @param createBlock
 * @param blockId block to find
 * @returns array of child blocks, each with information about which context variables were injected by their parent
 */
export declare function findBlockAncestry(rootBlockDef: BlockDef, createBlock: CreateBlock, contextVars: ContextVar[], blockId: string): ChildBlock[] | null;
/** Get the entire tree of blocks from a root, including context variables for each */
export declare function getBlockTree(rootBlockDef: BlockDef, createBlock: CreateBlock, contextVars: ContextVar[]): ChildBlock[];
/** Create the variables as needed by mwater-expressions */
export declare function createExprVariables(contextVar: ContextVar[]): Variable[];
