import React from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  CreditCard,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CamtFile, CamtStatementData } from '../types';
import { formatMoney } from '../utils/exportUtils';

interface ReportViewProps {
  file: CamtFile;
  onExportReport: () => void;
  onExportCSV: () => void;
  onSwitchToVisor: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  file,
  onExportReport,
  onExportCSV,
  onSwitchToVisor,
}) => {
  const d: CamtStatementData = file.data;
  const saldoNeto = d.totCredit - d.totDebit;
  const calculatedSaldoFinal = d.saldoInicial + saldoNeto;
  const balanceMatched = Math.abs(calculatedSaldoFinal - d.saldoFinal) < 0.01;

  const feesList = d.movimientos.filter((m) => m.esComision);

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-12 print:p-0 print:max-w-none">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#146ef5] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#146ef5] animate-pulse" />
            <span>Informe Ejecutivo de Flujo de Caja & Conciliación</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Extracto Bancario: {d.banco || file.name}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Período analizado: <strong className="text-slate-900 dark:text-white">{d.fechaInicio || 'Inicio'}</strong> al{' '}
            <strong className="text-slate-900 dark:text-white">{d.fechaFin || 'Fin'}</strong> ({d.diasPeriodo} días de actividad)
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#181e2e] border border-slate-200 dark:border-[#222733] transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>

          <button
            type="button"
            onClick={onExportReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#146ef5] text-white shadow-xs hover:bg-[#0f55d9] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Informe CSV</span>
          </button>
        </div>
      </div>

      {/* Verification & Mathematical Integrity Card */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
          balanceMatched
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
        }`}
      >
        {balanceMatched ? (
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
        )}
        <div className="text-xs flex-1">
          <div className="font-bold text-sm">
            {balanceMatched
              ? 'Conciliación Matemática Cuadrada (100% Verificado)'
              : 'Discrepancia en Cuadre de Saldos'}
          </div>
          <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-sans">
            Saldo Inicial ({formatMoney(d.saldoInicial, d.moneda)}) + Ingresos ({formatMoney(d.totCredit, d.moneda)}) - Gastos ({formatMoney(d.totDebit, d.moneda)}) ={' '}
            <strong className="text-slate-900 dark:text-white font-mono">{formatMoney(calculatedSaldoFinal, d.moneda)}</strong> (Saldo Final registrado:{' '}
            <strong className="text-slate-900 dark:text-white font-mono">{formatMoney(d.saldoFinal, d.moneda)}</strong>)
          </p>
        </div>
      </div>

      {/* Financial Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] p-3.5 rounded-2xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Saldo Inicial</div>
          <div className="font-mono text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">
            {formatMoney(d.saldoInicial, d.moneda)}
          </div>
        </div>

        <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] p-3.5 rounded-2xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Ingresos</div>
          <div className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            +{formatMoney(d.totCredit, d.moneda)}
          </div>
        </div>

        <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] p-3.5 rounded-2xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Gastos</div>
          <div className="font-mono text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
            -{formatMoney(d.totDebit, d.moneda)}
          </div>
        </div>

        <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] p-3.5 rounded-2xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Saldo Final</div>
          <div className="font-mono text-lg font-bold text-[#146ef5] mt-1">
            {formatMoney(d.saldoFinal, d.moneda)}
          </div>
        </div>
      </div>

      {/* Account Details & Structure */}
      <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 shadow-xs">
        <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <div className="w-1.5 h-3.5 bg-[#146ef5] rounded-full" />
          <span>Ficha Técnica y Datos de la Cuenta</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-[#181e2e]/60 p-2.5 rounded-xl border border-slate-100 dark:border-transparent">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Entidad Financiera</span>
            <span className="font-semibold text-slate-900 dark:text-white">{d.banco || 'No identificada'}</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#181e2e]/60 p-2.5 rounded-xl border border-slate-100 dark:border-transparent">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Código BIC / SWIFT</span>
            <span className="font-mono text-[#146ef5] font-bold">{d.bic || '—'}</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#181e2e]/60 p-2.5 rounded-xl border border-slate-100 dark:border-transparent">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">IBAN Cuenta</span>
            <span className="font-mono text-slate-900 dark:text-white font-bold">{d.iban || d.cuenta || '—'}</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#181e2e]/60 p-2.5 rounded-xl border border-slate-100 dark:border-transparent">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Titular</span>
            <span className="font-semibold text-slate-900 dark:text-white">{d.propietario || d.banco || '—'}</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#181e2e]/60 p-2.5 rounded-xl border border-slate-100 dark:border-transparent">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Moneda Base</span>
            <span className="font-mono text-slate-900 dark:text-white font-bold">{d.moneda}</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#181e2e]/60 p-2.5 rounded-xl border border-slate-100 dark:border-transparent">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Esquema XML ISO 20022</span>
            <span className="font-mono text-[#146ef5] font-bold">{d.schemaVersion || 'CAMT.053'}</span>
          </div>
        </div>
      </div>

      {/* Fee & Commission Audit */}
      <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-3.5 bg-amber-500 rounded-full" />
            <span>Auditoría de Comisiones y Gastos Bancarios</span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
            Total cargos: {formatMoney(d.totalComisionesMonto, d.moneda)} ({d.comisiones} operaciones)
          </span>
        </div>

        {feesList.length === 0 ? (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs">
            No se detectaron cargos de comisiones o gastos financieros en este extracto.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#222733]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0e121a] text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-[#222733]">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3 text-right">Importe</th>
                  <th className="py-2.5 px-3">Referencia</th>
                  <th className="py-2.5 px-3">Concepto Detectado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#222733]">
                {feesList.map((fee, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#181e2e]/50 transition-colors">
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-900 dark:text-slate-200">{fee.fecha}</td>
                    <td className="py-2 px-3 font-mono font-bold text-rose-600 dark:text-rose-400 text-right">
                      {formatMoney(fee.monto, d.moneda)}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {fee.ref || fee.refEndToEnd || '—'}
                    </td>
                    <td className="py-2 px-3 text-slate-800 dark:text-slate-200 font-mono text-[11px] max-w-xs truncate">
                      {fee.desc || fee.contra || 'Cargo bancario'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Counterparties Table */}
      <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 shadow-xs">
        <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <div className="w-1.5 h-3.5 bg-[#146ef5] rounded-full" />
          <span>Ranking de Contrapartes por Volumen Acumulado</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#222733]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0e121a] text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-[#222733]">
              <tr>
                <th className="py-2.5 px-3">Contraparte / Empresa</th>
                <th className="py-2.5 px-3 text-center">Nº Operaciones</th>
                <th className="py-2.5 px-3 text-right">Créditos (Ingresos)</th>
                <th className="py-2.5 px-3 text-right">Débitos (Gastos)</th>
                <th className="py-2.5 px-3 text-right">Volumen Neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#222733]">
              {d.topContrapartes.slice(0, 15).map((cp, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#181e2e]/50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{cp.nombre}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500 dark:text-slate-400">{cp.count}</td>
                  <td className="py-2.5 px-3 font-mono text-right text-emerald-600 dark:text-emerald-400">
                    {cp.creditoTotal > 0 ? formatMoney(cp.creditoTotal, d.moneda) : '—'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-rose-600 dark:text-rose-400">
                    {cp.debitoTotal > 0 ? formatMoney(cp.debitoTotal, d.moneda) : '—'}
                  </td>
                  <td
                    className={`py-2.5 px-3 font-mono font-bold text-right ${
                      cp.total >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatMoney(cp.total, d.moneda)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return to Visor Footer */}
      <div className="flex justify-center print:hidden pt-2">
        <button
          type="button"
          onClick={onSwitchToVisor}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#146ef5] hover:text-white bg-[#146ef5]/10 hover:bg-[#146ef5] border border-[#146ef5]/30 rounded-xl transition-all cursor-pointer"
        >
          <span>Volver a la tabla de transacciones</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
