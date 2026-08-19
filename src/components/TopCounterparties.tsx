import React from 'react';
import { Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CounterpartySummary } from '../types';
import { formatMoney } from '../utils/exportUtils';

interface TopCounterpartiesProps {
  counterparties: CounterpartySummary[];
  currency: string;
  onSelectCounterparty?: (name: string) => void;
}

export const TopCounterparties: React.FC<TopCounterpartiesProps> = ({
  counterparties,
  currency,
  onSelectCounterparty,
}) => {
  if (!counterparties || counterparties.length === 0) return null;

  const maxVolume = Math.max(...counterparties.map((c) => Math.abs(c.total)), 1);

  return (
    <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-[#222733]">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
          <div className="w-2 h-2 rounded-full bg-[#146ef5]" />
          <span>Top Contrapartes (Clientes & Proveedores por Volumen)</span>
        </div>
        <span className="text-[10.5px] font-mono text-slate-500 dark:text-[#8b949e] bg-slate-100 dark:bg-[#161b22] px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-[#30363d]">
          {counterparties.length} entidades
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {counterparties.slice(0, 9).map((cp, idx) => {
          const isCredit = cp.total >= 0;
          const percentage = Math.round((Math.abs(cp.total) / maxVolume) * 100);

          return (
            <div
              key={idx}
              onClick={() => onSelectCounterparty?.(cp.nombre)}
              className="bg-slate-50 dark:bg-[#161b22] hover:bg-slate-100 dark:hover:bg-[#1c232f] border border-slate-200 dark:border-[#222733] hover:border-[#146ef5]/50 p-3 rounded-xl transition-all cursor-pointer flex flex-col justify-between group shadow-xs"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div
                    className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#146ef5] transition-colors"
                    title={cp.nombre}
                  >
                    {cp.nombre || 'Sin nombre identificado'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-[#8b949e] flex items-center gap-2 mt-1">
                    <span className="bg-white dark:bg-[#080808] px-2 py-0.5 rounded-md font-mono border border-slate-200 dark:border-[#30363d]">
                      {cp.count} {cp.count === 1 ? 'operación' : 'operaciones'}
                    </span>
                    {isCredit ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center font-bold">
                        <ArrowUpRight className="w-3 h-3 inline" /> Cobro
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center font-bold">
                        <ArrowDownRight className="w-3 h-3 inline" /> Pago
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`font-mono text-xs font-bold text-right shrink-0 ${
                    isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                  }`}
                >
                  {isCredit ? '+' : ''}
                  {formatMoney(cp.total, currency)}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-[#080808] h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCredit
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                      : 'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${Math.max(percentage, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
