import React, { useState } from 'react';
import { useNFTStore } from '../store/nftStore';

interface Props {
  tokenId: number;
}

export const TransferForm: React.FC<Props> = ({ tokenId }) => {
  const transfer = useNFTStore((s) => s.transfer);
  const loadTokenDetail = useNFTStore((s) => s.loadTokenDetail);

  const [transferTo, setTransferTo] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTo.trim()) return;

    setIsTransferring(true);
    setError('');
    try {
      const ok = await transfer(tokenId, transferTo.trim());
      if (!ok) setError('Transfer failed. Are you the owner?');
      else {
        setTransferTo('');
        loadTokenDetail(tokenId);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    }
    setIsTransferring(false);
  };

  return (
    <form onSubmit={handleTransfer} className="space-y-3">
      <input
        type="text"
        value={transferTo}
        onChange={(e) => setTransferTo(e.target.value)}
        placeholder="Recipient principal ID"
        className="w-full bg-os-surface border border-os-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-os-primary font-mono"
      />
      {error && <p className="text-os-red text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isTransferring || !transferTo.trim()}
        className="w-full bg-os-primary hover:bg-os-primary-hover disabled:bg-os-surface disabled:text-os-text-secondary text-white text-sm font-bold py-3 rounded-xl transition-colors"
      >
        {isTransferring ? 'Transferring...' : 'Transfer'}
      </button>
    </form>
  );
};
