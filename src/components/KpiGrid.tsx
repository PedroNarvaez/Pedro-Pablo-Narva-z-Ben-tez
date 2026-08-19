import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  CreditCard,
  Building,
  AlertTriangle,
  Wallet,
  ArrowRightLeft,
} from 'lucide-react';
import { CamtStatementData } from '../types';
import { formatMoney } from '../utils/exportUtils';

interface KpiGridProps {
  data: CamtStatementData;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ data }) => {
  const saldoNeto = data.totCredit - data.totDebit;

  const kpis = [
    {
      kicker: 'INGRESOS',
      label: 'Ingresos Totales',
      value: formatMoney(data.totCredit, data.moneda),
      icon: TrendingUp,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      sub: `${data.movimientos.filter((m) => m.tipo === 'CRDT').length} abonos recibidos`,
    },
    {
      kicker: 'EGRESOS',
      label: 'Gastos Totales',
      value: formatMoney(data.totDebit, data.moneda),
      icon: TrendingDown,
      badgeColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      valueColor: 'text-red-600 dark:text-red-400',
      sub: `${data.movimientos.filter((m) => m.tipo === 'DBIT').length} cargos emitidos`,
    },
    {
      kicker: 'FLUJO DE CAJA',
      label: 'Flujo Neto (Caja)',
      value: `${saldoNeto >= 0 ? '+' : ''}${formatMoney(saldoNeto, data.moneda)}`,
      icon: Scale,
      badgeColor: saldoNeto >= 0 ? 'bg-[#146ef5]/10 text-[#146ef5] border-[#146ef5]/20' : 'bg-red-500/10 text-red-600 border-red-500/20',
      valueColor: saldoNeto >= 0 ? 'text-[#146ef5]' : 'text-red-500',
      sub: saldoNeto >= 0 ? 'Superávit del período' : 'Déficit del período',
    },
    {
      kicker: 'POSICIÓN INICIAL',
      label: 'Saldo Inicial',
      value: formatMoney(data.saldoInicial, data.moneda),
      icon: Wallet,
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      valueColor: 'text-slate-900 dark:text-white',
      sub: data.fechaInicio ? `Fecha: ${data.fechaInicio}` : 'Apertura',
    },
    {
      kicker: 'POSICIÓN FINAL',
      label: 'Saldo Final',
      value: formatMoney(data.saldoFinal, data.moneda),
      icon: CreditCard,
      badgeColor: 'bg-[#146ef5]/10 text-[#146ef5] border-[#146ef5]/20',
      valueColor: 'text-[#146ef5] font-extrabold',
      sub: data.fechaFin ? `Fecha: ${data.fechaFin}` : 'Cierre',
    },
    {
      kicker: 'COSTOS FINANCIEROS',
      label: 'Comisiones Bancarias',
      value: data.comisiones > 0 ? formatMoney(data.totalComisionesMonto, data.moneda) : '0 ₲',
      icon: AlertTriangle,
      badgeColor: data.comisiones > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700',
      valueColor: data.comisiones > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500',
      sub: `${data.comisiones} cargos detectados`,
    },
    {
      kicker: 'OPERACIONES',
      label: 'Transacciones',
      value: data.movimientos.length.toString(),
      icon: ArrowRightLeft,
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      valueColor: 'text-slate-900 dark:text-white',
      sub: `${data.diasPeriodo > 0 ? data.diasPeriodo : '—'} días de actividad`,
    },
    {
      kicker: 'RED B2B',
      label: 'Contrapartes Únicas',
      value: data.contrapartes.length.toString(),
      icon: Building,
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      valueColor: 'text-slate-900 dark:text-white',
      sub: 'Clientes y Proveedores PYME',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 flex flex-col justify-between hover:border-[#146ef5]/50 transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-bold text-slate-500 dark:text-[#8b949e] tracking-wider uppercase truncate font-mono">
                {kpi.kicker}
              </span>
              <div className={`p-1.5 rounded-xl border ${kpi.badgeColor} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className={`font-mono text-xl lg:text-2xl font-bold tracking-tight ${kpi.valueColor}`}>
                {kpi.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#8b949e] mt-1 font-medium truncate">
                {kpi.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
