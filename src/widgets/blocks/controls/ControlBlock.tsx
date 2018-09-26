import { BlockDef } from "../../blocks";

interface ControlBlockDef extends BlockDef {
  /** Row context variable */
  row: string
}

// abstract class ControlBlock extends 