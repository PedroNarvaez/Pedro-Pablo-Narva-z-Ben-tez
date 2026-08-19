import React from 'react';
import {
  Building2,
  CreditCard,
  User,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Copy,
  Check,
  FileCheck2,
  ChevronRight,
} from 'lucide-react';
import { CamtStatementData } from '../types';

interface AccountInfoCardProps {
  data: CamtStatementData;
  filename: string;
  onOpenValidationModal?: () => void;
}

export const AccountInfoCard: React.FC<AccountInfoCardProps> = ({
  data,
  filename,
  onOpenValidationModal,
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const validation = data.validation;

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const hasErrors = validation && validation.errorCount > 0;
  const hasWarnings = validation && validation.warningCount > 0;
  const isStrict = validation && validation.isValid && validation.warningCount === 0;

  return (
    <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 sm:p-5 shadow-xs transition-colors space-y-4">
      {/* Header with Title and Validation Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#222733]">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <div className="w-2 h-2 rounded-full bg-[#146ef5]" />
          <span>Información de la Cuenta & Entidad Bancaria</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Validation pill button */}
          {validation && onOpenValidationModal && (
            <button
              type="button"
              onClick={onOpenValidationModal}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-xs ${
                hasErrors
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                  : hasWarnings
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
              title="Haz clic para ver el informe detallado de auditoría XSD ISO 20022"
            >
              {hasErrors ? (
                <AlertOctagon className="w-3.5 h-3.5" />
              ) : hasWarnings ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>
                {hasErrors
                  ? `XSD: ${validation.errorCount} Error(es)`
                  : hasWarnings
                  ? `XSD: ${validation.conformanceScore}% (${validation.warningCount} Avisos)`
                  : 'ISO 20022 XSD 100%'}
              </span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          )}

          <span className="text-[11px] font-mono text-slate-600 dark:text-[#8b949e] bg-slate-100 dark:bg-[#161b22] px-2.5 py-1 rounded-full border border-slate-200 dark:border-[#30363d]">
            {filename}
          </span>
        </div>
      </div>

      {/* Structural Alert Banner if issues exist */}
      {validation && (hasErrors || hasWarnings) && onOpenValidationModal && (
        <div
          onClick={onOpenValidationModal}
          className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
            hasErrors
              ? 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/30 text-rose-900 dark:text-rose-200'
              : 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {hasErrors ? (
              <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <div className="text-xs truncate">
              <span className="font-bold">
                {hasErrors
                  ? `¡Alerta de Estructura XML! Se detectaron ${validation.errorCount} error(es) con respecto al esquema XSD.`
                  : `Aviso XSD: Se detectaron ${validation.warningCount} advertencia(s) en la estructura XML.`}
              </span>
              <span className="hidden md:inline ml-1 opacity-80">
                Haz clic para ver las discrepancias y recomendaciones de corrección.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold underline shrink-0 flex items-center gap-0.5">
            Ver auditoría <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      )}

      {/* Grid of details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Bank & BIC */}
        <div className="bg-slate-50 dark:bg-[#161b22] p-3.5 rounded-xl border border-slate-200 dark:border-[#222733] flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#146ef5]/10 text-[#146ef5] border border-[#146ef5]/20 shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-slate-500 dark:text-[#8b949e] uppercase font-bold font-mono">
              Entidad / BIC
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5" title={data.banco}>
              {data.banco || 'Entidad no especificada'}
            </div>
            <div className="text-[11px] font-mono text-[#146ef5] mt-1 flex items-center justify-between">
              <span>BIC: {data.bic || '—'}</span>
              {data.bic && (
                <button
                  type="button"
                  onClick={() => handleCopy(data.bic, 'bic')}
                  className="text-slate-400 hover:text-[#146ef5] p-0.5 cursor-pointer"
                  title="Copiar BIC"
                >
                  {copiedField === 'bic' ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* IBAN / Account */}
        <div className="bg-slate-50 dark:bg-[#161b22] p-3.5 rounded-xl border border-slate-200 dark:border-[#222733] flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-slate-500 dark:text-[#8b949e] uppercase font-bold font-mono">
              IBAN / Cuenta
            </div>
            <div
              className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate mt-0.5 flex items-center justify-between"
              title={data.iban || data.cuenta}
            >
              <span className="truncate">{data.iban || data.cuenta || 'No especificado'}</span>
              {data.iban && (
                <button
                  type="button"
                  onClick={() => handleCopy(data.iban, 'iban')}
                  className="text-slate-400 hover:text-[#146ef5] p-0.5 shrink-0 ml-1 cursor-pointer"
                  title="Copiar IBAN"
                >
                  {copiedField === 'iban' ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-[#8b949e] mt-1">
              Moneda: <span className="font-mono text-slate-900 dark:text-white font-bold">{data.moneda}</span>
            </div>
          </div>
        </div>

        {/* Owner */}
        <div className="bg-slate-50 dark:bg-[#161b22] p-3.5 rounded-xl border border-slate-200 dark:border-[#222733] flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-slate-500 dark:text-[#8b949e] uppercase font-bold font-mono">
              Titular / Empresa
            </div>
            <div
              className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5"
              title={data.propietario}
            >
              {data.propietario || data.banco || 'Empresa Titular'}
            </div>
            <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <FileCheck2 className="w-3 h-3" />
              <span>{validation?.xsdStandard ? 'Perfil ISO 20022' : 'Validado'}</span>
            </div>
          </div>
        </div>

        {/* Period */}
        <div className="bg-slate-50 dark:bg-[#161b22] p-3.5 rounded-xl border border-slate-200 dark:border-[#222733] flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-slate-500 dark:text-[#8b949e] uppercase font-bold font-mono">
              Período del Extracto
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {data.fechaInicio || '—'} <span className="text-[#146ef5]">→</span> {data.fechaFin || '—'}
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-[#8b949e] mt-1 font-medium">
              {data.diasPeriodo > 0 ? `${data.diasPeriodo} días de actividad` : 'Extracto puntual'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

