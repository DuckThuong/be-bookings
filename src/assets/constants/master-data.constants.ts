/**
 * Master Data Types
 * Shared types for master data across the application
 */

export type StatusMeta = {
  label: string;
  color: string;
  bg: string;
};

export type FilterOption = {
  value: string;
  label: string;
};

export interface MasterDataItem {
  id: number;
  type: string;
  code: string;
  name: string;
  rule?: string;
  sort: number;
}
