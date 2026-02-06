/** Token list schema types for chaindefuser / Near Intents */

export interface Deployment {
  address?: string;
  type?: 'native';
  decimals: number;
  chainName: string;
  bridge: string;
  stellarCode?: string;
}

export interface GroupedToken {
  defuseAssetId: string;
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  originChainName: string;
  deployments: Deployment[];
  tags?: string[];
}

/** Grouped token entry (unified asset with multiple chain variants) */
export interface GroupedTokenEntry {
  unifiedAssetId: string;
  symbol: string;
  name: string;
  icon: string;
  groupedTokens: GroupedToken[];
  tags?: string[];
}

/** Flat token entry (single defuse asset) */
export interface FlatTokenEntry {
  defuseAssetId: string;
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  originChainName: string;
  deployments: Deployment[];
  tags?: string[];
}

export type TokenListEntry = GroupedTokenEntry | FlatTokenEntry;

export function isGroupedEntry(e: TokenListEntry): e is GroupedTokenEntry {
  return 'groupedTokens' in e && Array.isArray((e as GroupedTokenEntry).groupedTokens);
}

export function isFlatEntry(e: TokenListEntry): e is FlatTokenEntry {
  return 'defuseAssetId' in e && 'deployments' in e;
}

export interface TokenListSchema {
  $schema?: string;
  tokens: TokenListEntry[];
}

/** One supported pair: symbol + chain */
export interface SupportedPair {
  symbol: string;
  name: string;
  chainName: string;
  defuseAssetId: string;
  decimals: number;
  address?: string;
  type?: 'native';
  bridge: string;
  originChainName: string;
}
