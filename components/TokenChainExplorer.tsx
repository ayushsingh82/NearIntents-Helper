'use client';

import React, { useMemo, useState } from 'react';
import type {
  TokenListSchema,
  TokenListEntry,
  SupportedPair,
} from '@/types/tokenlist';
import { isGroupedEntry, isFlatEntry } from '@/types/tokenlist';

// Load token list: use full tokenlist.json if present, else schema subset
const TOKENLIST_PATH = '/data/tokenlist.json';

function collectPairs(entries: TokenListEntry[]): SupportedPair[] {
  const pairs: SupportedPair[] = [];
  for (const entry of entries) {
    if (isGroupedEntry(entry)) {
      for (const gt of entry.groupedTokens) {
        for (const d of gt.deployments) {
          pairs.push({
            symbol: gt.symbol,
            name: gt.name,
            chainName: d.chainName,
            defuseAssetId: gt.defuseAssetId,
            decimals: d.decimals,
            address: d.address,
            type: d.type,
            bridge: d.bridge,
            originChainName: gt.originChainName,
          });
        }
      }
    } else if (isFlatEntry(entry)) {
        for (const d of entry.deployments) {
        pairs.push({
          symbol: entry.symbol,
          name: entry.name,
          chainName: d.chainName,
          defuseAssetId: entry.defuseAssetId,
          decimals: d.decimals,
          address: d.address,
          type: d.type,
          bridge: d.bridge,
          originChainName: entry.originChainName,
        });
      }
    }
  }
  return pairs;
}

function getUniqueTokens(entries: TokenListEntry[]): { symbol: string; label: string }[] {
  const seen = new Set<string>();
  const out: { symbol: string; label: string }[] = [];
  for (const entry of entries) {
    const symbol = isGroupedEntry(entry) ? entry.symbol : entry.symbol;
    const name = isGroupedEntry(entry) ? entry.name : entry.name;
    if (seen.has(symbol)) continue;
    seen.add(symbol);
    out.push({ symbol, label: `${symbol} (${name})` });
  }
  out.sort((a, b) => a.symbol.localeCompare(b.symbol));
  return out;
}

function getUniqueChains(pairs: SupportedPair[]): string[] {
  const set = new Set(pairs.map((p) => p.chainName));
  return Array.from(set).sort();
}

export default function TokenChainExplorer() {
  const [schema, setSchema] = useState<TokenListSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<string>('');

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(TOKENLIST_PATH);
        if (!res.ok) {
          if (res.status === 404) {
            const schemaRes = await fetch('/data/tokenlist.schema.json');
            if (!schemaRes.ok) throw new Error('Token list not found');
            const data: TokenListSchema = await schemaRes.json();
            if (!cancelled) setSchema(data);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const data: TokenListSchema = await res.json();
        if (!cancelled) setSchema(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load token list');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const { pairs, tokens, chains, filteredPairs } = useMemo(() => {
    if (!schema?.tokens?.length) {
      return { pairs: [], tokens: [], chains: [], filteredPairs: [] };
    }
    const pairs = collectPairs(schema.tokens);
    const tokens = getUniqueTokens(schema.tokens);
    const chains = getUniqueChains(pairs);
    let filtered = pairs;
    if (selectedToken) filtered = filtered.filter((p) => p.symbol === selectedToken);
    if (selectedChain) filtered = filtered.filter((p) => p.chainName === selectedChain);
    return { pairs, tokens, chains, filteredPairs: filtered };
  }, [schema, selectedToken, selectedChain]);

  if (loading) {
    return (
      <div className="text-zinc-400 py-8 text-center">
        Loading token list…
      </div>
    );
  }
  if (error || !schema) {
    return (
      <div className="text-red-400 py-8 text-center">
        {error || 'Token list not available'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded border border-zinc-700 bg-zinc-900/30 p-4">
        <h2 className="text-lg font-medium text-white mb-3">Check supported pairs</h2>
        <p className="text-zinc-400 text-sm mb-4">
          Select a token and/or chain to see which token–chain pairs are supported.
        </p>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[200px]">
            <label className="block text-xs font-medium text-zinc-400 mb-1">Token</label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-zinc-600 rounded px-3 py-2 text-white focus:border-[#CC4420] focus:outline-none"
            >
              <option value="">All tokens</option>
              {tokens.map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px]">
            <label className="block text-xs font-medium text-zinc-400 mb-1">Chain</label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-zinc-600 rounded px-3 py-2 text-white focus:border-[#CC4420] focus:outline-none"
            >
              <option value="">All chains</option>
              {chains.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedToken('');
              setSelectedChain('');
            }}
            className="px-3 py-2 border border-zinc-600 rounded text-zinc-300 hover:bg-zinc-800 text-sm"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="rounded border border-zinc-700 overflow-hidden">
        <div className="px-4 py-2 border-b border-zinc-700 bg-zinc-900/50 flex justify-between items-center">
          <span className="text-sm font-medium text-zinc-300">
            Supported pairs
            {(selectedToken || selectedChain) && (
              <span className="text-zinc-500 font-normal ml-2">
                ({filteredPairs.length} of {pairs.length})
              </span>
            )}
          </span>
          {!selectedToken && !selectedChain && (
            <span className="text-xs text-zinc-500">{pairs.length} total pairs</span>
          )}
        </div>
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-zinc-900/95 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-300">Symbol</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Chain</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Origin chain</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Bridge</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredPairs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    No pairs match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPairs.map((p, i) => (
                  <tr
                    key={`${p.defuseAssetId}-${p.chainName}-${i}`}
                    className="border-b border-zinc-800 hover:bg-zinc-800/30"
                  >
                    <td className="px-4 py-3 font-medium text-white">{p.symbol}</td>
                    <td className="px-4 py-3 text-zinc-400">{p.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{p.chainName}</td>
                    <td className="px-4 py-3 text-zinc-400">{p.originChainName}</td>
                    <td className="px-4 py-3 text-zinc-500">{p.bridge}</td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs max-w-[180px] truncate" title={p.type === 'native' ? 'native' : p.address ?? '—'}>
                      {p.type === 'native' ? 'native' : p.address ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
