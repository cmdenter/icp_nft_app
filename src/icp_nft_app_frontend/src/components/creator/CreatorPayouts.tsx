import { useCreatorStore } from '../../store/creatorStore';
import { useNotificationStore } from '../../store/notificationStore';
import { ICPTokenIcon, WalletIcon, CopyIcon } from '../icons';
import { formatNumber, formatDate } from '../../utils/format';
import type { CreatorInfo, CollectionEntry } from '../../types';

interface CreatorPayoutsProps {
  creatorId: string;
  creator: CreatorInfo;
  collections: CollectionEntry[];
}

export function CreatorPayouts({ creatorId }: CreatorPayoutsProps) {
  const payouts = useCreatorStore((s) => s.payouts).filter(
    (p) => p.creatorId === creatorId
  );
  const showToast = useNotificationStore((s) => s.showToast);

  const totalEarned = payouts.reduce((sum, p) => sum + p.amount, 0);
  const completedPayouts = payouts
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayouts = payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);
  const availableBalance = totalEarned - completedPayouts;

  function handleWithdraw() {
    showToast({
      type: 'info',
      title: 'Withdrawal requested',
      message: 'Processing may take 24-48 hours',
    });
  }

  function handleCopyTx(hash: string) {
    navigator.clipboard.writeText(hash);
    showToast({ type: 'success', title: 'Transaction hash copied' });
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="rounded-2xl bg-os-surface border border-os-border p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-os-text-secondary mb-1">Available Balance</p>
            <div className="flex items-center gap-2">
              <ICPTokenIcon size={20} />
              <span className="text-2xl font-bold text-white">
                {formatNumber(availableBalance)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-os-text-secondary mb-1">Pending</p>
            <div className="flex items-center gap-2">
              <ICPTokenIcon size={20} />
              <span className="text-2xl font-bold text-os-yellow">
                {formatNumber(pendingPayouts)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-os-text-secondary mb-1">Total Earned</p>
            <div className="flex items-center gap-2">
              <ICPTokenIcon size={20} />
              <span className="text-2xl font-bold text-os-green">
                {formatNumber(totalEarned)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <button onClick={handleWithdraw} className="btn btn-md btn-primary">
            Withdraw
          </button>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="rounded-2xl bg-os-surface border border-os-border overflow-hidden">
        <div className="px-5 py-4 border-b border-os-border">
          <h3 className="text-lg font-bold text-white">Payout History</h3>
        </div>

        {payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <WalletIcon size={40} className="text-os-text-secondary mb-4" />
            <p className="text-sm font-semibold text-white mb-1">No payouts yet</p>
            <p className="text-xs text-os-text-secondary text-center max-w-xs">
              Your payout history will appear here once you start earning
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-os-border/30">
                  <th className="text-left px-5 py-3 text-xs font-medium text-os-text-secondary">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-os-text-secondary">
                    Amount
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-os-text-secondary">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-os-text-secondary">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-os-border/20">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-os-card/30 transition-colors">
                    <td className="px-5 py-3 text-os-text-secondary whitespace-nowrap">
                      {formatDate(p.date)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <ICPTokenIcon size={14} />
                        <span className="font-semibold text-white">
                          {p.amount.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          p.status === 'completed'
                            ? 'bg-os-green/10 text-os-green border border-os-green/20'
                            : p.status === 'pending'
                              ? 'bg-os-yellow/10 text-os-yellow border border-os-yellow/20'
                              : 'bg-os-primary/10 text-os-primary border border-os-primary/20'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {p.txHash ? (
                        <button
                          onClick={() => handleCopyTx(p.txHash!)}
                          className="flex items-center gap-1.5 text-os-text-secondary hover:text-white transition-colors"
                        >
                          <span className="font-mono text-xs">
                            {p.txHash.slice(0, 8)}...{p.txHash.slice(-6)}
                          </span>
                          <CopyIcon size={12} />
                        </button>
                      ) : (
                        <span className="text-xs text-os-text-secondary/50">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
