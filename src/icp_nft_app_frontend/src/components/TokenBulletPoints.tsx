import React from 'react';
import { CheckCircleIcon, XCircleIcon } from './icons';
import { TOKEN_CATEGORY_DEFS } from '../api/tokens';
import type { TokenEntry } from '../types';

interface TokenBulletPointsProps {
  token: TokenEntry;
}

export const TokenBulletPoints: React.FC<TokenBulletPointsProps> = ({ token }) => {
  const categoryName = TOKEN_CATEGORY_DEFS.find((c) => c.id === token.category)?.name ?? token.category;

  return (
    <div>
      <h3 className="text-sm font-bold text-white mb-3">About this token</h3>

      {token.bulletPoints.length > 0 && (
        <ul className="list-disc list-inside space-y-1.5 text-sm text-os-text-secondary mb-4">
          {token.bulletPoints.map((bp, i) => (
            <li key={i}>{bp}</li>
          ))}
        </ul>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-os-text-secondary">Token Standard</span>
          <span className="text-white font-medium">{token.standard}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-os-text-secondary">Network</span>
          <span className="text-os-green font-medium">Internet Computer</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-os-text-secondary">Category</span>
          <span className="text-white font-medium">{categoryName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-os-text-secondary">Verified</span>
          {token.verified ? (
            <span className="inline-flex items-center gap-1 text-os-green font-medium">
              <CheckCircleIcon size={14} className="text-os-green" />
              Yes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-os-text-secondary font-medium">
              <XCircleIcon size={14} />
              No
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
