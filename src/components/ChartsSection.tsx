import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CamtStatementData } from '../types';
import { formatMoney } from '../utils/exportUtils';

interface ChartsSectionProps {
  data: CamtStatementData;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ data }) => {
  // Pie chart data
  const pieData = [
    { name: 'Ingresos (Créditos)', value: data.totCredit, color: '#10b981' },
    { name: 'Gastos (Débitos)', value: data.totDebit, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  // Group by month or day
  const timeBuckets: Record<string, { label: string; ingresos: number; gastos: number; neto: number }> = {};

  data.movimientos.forEach((m) => {
    const key = m.fecha ? m.fecha.substring(0, 7) : 'Sin fecha';
    if (!timeBuckets[key]) {
      timeBuckets[key] = {
        label: key,
        ingresos: 0,
        gastos: 0,
        neto: 0,
      };
    }
    if (m.monto >= 0) {
      timeBuckets[key].ingresos += m.monto;
      timeBuckets[key].neto += m.monto;
    } else {
      timeBuckets[key].gastos += Math.abs(m.monto);
      timeBuckets[key].neto -= Math.abs(m.monto);
    }
  });

  const barData = Object.keys(timeBuckets)
    .sort()
    .map((k) => timeBuckets[k]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] p-3 rounded-xl shadow-xl text-xs font-mono">
          <p className="font-bold text-slate-900 dark:text-white mb-1 font-sans">{label || payload[0]?.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color || entry.fill }}>
              {entry.name}: {formatMoney(entry.value, data.moneda)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Pie Chart: Balance Breakdown */}
      <div className="lg:col-span-5 bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            <div className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>Ingresos vs Gastos</span>
          </div>
          <span className="text-[10.5px] font-mono text-slate-500 dark:text-[#8b949e] bg-slate-100 dark:bg-[#161b22] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#30363d]">
            Volumen Global
          </span>
        </div>

        <div className="h-56 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center stats */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-500 dark:text-[#8b949e] font-semibold uppercase font-mono">Neto</span>
            <span
              className={`font-mono text-xs font-bold ${
                data.totCredit - data.totDebit >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'
              }`}
            >
              {data.totCredit - data.totDebit >= 0 ? '+' : ''}
              {formatMoney(data.totCredit - data.totDebit, data.moneda)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-[#222733] text-xs">
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-[#161b22] p-2.5 rounded-xl border border-slate-200 dark:border-[#222733]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" />
            <div className="truncate min-w-0">
              <div className="text-[10px] text-slate-500 dark:text-[#8b949e] font-mono uppercase">Ingresos</div>
              <div className="font-mono font-bold text-[#10b981] truncate">
                {formatMoney(data.totCredit, data.moneda)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-[#161b22] p-2.5 rounded-xl border border-slate-200 dark:border-[#222733]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shrink-0" />
            <div className="truncate min-w-0">
              <div className="text-[10px] text-slate-500 dark:text-[#8b949e] font-mono uppercase">Gastos</div>
              <div className="font-mono font-bold text-[#ef4444] truncate">
                {formatMoney(data.totDebit, data.moneda)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart: Cash flow by period */}
      <div className="lg:col-span-7 bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            <div className="w-2 h-2 rounded-full bg-[#146ef5]" />
            <span>Flujo de Caja por Período</span>
          </div>
          <span className="text-[10.5px] font-mono text-slate-500 dark:text-[#8b949e] bg-slate-100 dark:bg-[#161b22] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#30363d]">
            Mensual / SIPAP
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#8b949e" opacity={0.15} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#8b949e', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(139,147,167,0.2)' }}
              />
              <YAxis
                tick={{ fill: '#8b949e', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(139,147,167,0.2)' }}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#8b949e', paddingTop: 8 }}
                iconType="circle"
              />
              <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-[#222733] flex items-center justify-between text-[11px] text-slate-500 dark:text-[#8b949e]">
          <span>Comparativa de ingresos y gastos desglosados</span>
          <span className="font-mono text-slate-900 dark:text-white font-bold">{barData.length} bloques</span>
        </div>
      </div>
    </div>
  );
};
