/**
 * Command Pattern: Inventory Command Interface
 * Defines the contract for inventory operations
 */
export interface IInventoryCommand {
  execute(): Promise<any>;
  undo?(): Promise<void>;
}
