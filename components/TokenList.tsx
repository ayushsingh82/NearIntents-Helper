'use client';

import React, { useEffect, useState } from 'react';

const TOKENS_API = '/api/tokens';

export interface TokenItem {
  assetId: string;
  decimals: number;
  blockchain: string;
  symbol: string;
  price: number;
  priceUpdatedAt: string;
  contractAddress?: string;
}

export default function TokenList() {
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTokens() {
      try {
        const res = await fetch(TOKENS_API);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: TokenItem[] = await res.json();
        setTokens(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch tokens');
      } finally {
        setLoading(false);
      }
    }
    fetchTokens();
  }, []);

  if (loading) {
    return (
      <div className="text-zinc-400 py-12 text-center">
        Loading tokens…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 py-12 text-center">
        Error: {error}
      </div>
    );
  }

  const formatPrice = (p: number) =>
    p >= 1 ? p.toLocaleString(undefined, { maximumFractionDigits: 2 }) : p.toFixed(8);

  return (
    <div className="overflow-x-auto rounded border border-zinc-700">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-700 bg-zinc-900/50">
            <th className="px-4 py-3 font-medium text-zinc-300">Symbol</th>
            <th className="px-4 py-3 font-medium text-zinc-300">Blockchain</th>
            <th className="px-4 py-3 font-medium text-zinc-300 text-right">Price (USD)</th>
            <th className="px-4 py-3 font-medium text-zinc-300">Contract</th>
          </tr>
        </thead>
        <tbody>
          {tokens.slice(0, 50).map((t) => (
            <tr key={t.assetId} className="border-b border-zinc-800 hover:bg-zinc-800/30">
              <td className="px-4 py-3">
                <span className="font-medium text-white">{t.symbol}</span>
              </td>
              <td className="px-4 py-3 text-zinc-400">{t.blockchain}</td>
              <td className="px-4 py-3 text-right text-zinc-300">
                ${formatPrice(t.price)}
              </td>
              <td className="px-4 py-3 text-zinc-500 font-mono text-xs max-w-[200px] truncate">
                {t.contractAddress || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tokens.length > 50 && (
        <p className="px-4 py-2 text-zinc-500 text-xs">
          Showing 50 of {tokens.length} tokens
        </p>
      )}
    </div>
  );
}
