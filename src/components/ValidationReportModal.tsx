import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Copy,
  Check,
  Download,
  CodeXml,
  FileSearch,
  Scale,
  Building,
  CheckCheck,
} from 'lucide-react';
import { CamtValidationReport, CamtValidationIssue } from '../types';

interface ValidationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: CamtValidationReport;
  fileName: string;
  onOpenXmlViewer?: () => void;
}

export const ValidationReportModal: React.FC<ValidationReportModalProps> = ({
  isOpen,
  onClose,
  report,
  fileName,
  onOpenXmlViewer,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const filteredIssues = report.issues.filter((issue) => {
    if (filterSeverity === 'all') return true;
    return issue.severity === filterSeverity;
  });

  const handleCopyReport = () => {
    const textReport = `=====================================================
INFORME DE AUDITORÍA XSD ISO 20022 - CONCILIAPYME
Archivo: ${fileName}
Fecha de Auditoría: ${new Date(report.auditedAt).toLocaleString('es-PY')}
Esquema Detectado: ${report.xsdStandard}
Namespace: ${report.targetNamespace}
Puntaje de Conformidad: ${report.conformanceScore}%
Estado: ${report.isValid ? (report.isStrictCompliant ? 'CONFORME ESTRICTO' : 'VÁLIDO CON ADVERTENCIAS') : 'NO CONFORME (ERRORES XSD)'}
=====================================================

MÉTRICAS:
- Total Reglas Auditadas: ${report.totalChecks}
- Verificaciones Superadas: ${report.passedChecks}
- Errores Críticos: ${report.errorCount}
- Advertencias: ${report.warningCount}

CUADRE CONTABLE:
- Saldo Inicial: ${report.financialBalanceCheck.initialBalance}
- Ingresos (+): ${report.financialBalanceCheck.totalCredits}
- Gastos (-): ${report.financialBalanceCheck.totalDebits}
- Saldo Final Declarado: ${report.financialBalanceCheck.declaredFinalBalance}
- Saldo Final Esperado: ${report.financialBalanceCheck.expectedFinalBalance}
- Cuadre Contable: ${report.financialBalanceCheck.isBalanced ? 'CORRECTO (Diferencia = 0.00)' : `DESCUADRE (${report.financialBalanceCheck.difference})`}

DETALLE DE REGLAS Y ALERTAS:
${report.issues
  .map(
    (issue, i) =>
      `[${i + 1}] [${issue.severity.toUpperCase()}] ${issue.ruleTitle}
   Ruta: ${issue.tagPath}
   Descripción: ${issue.description}
   ${issue.recommendation ? `Recomendación: ${issue.recommendation}\n` : ''}`
  )
  .join('\n')}
=====================================================`;

    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `auditoria_iso20022_${fileName.replace('.xml', '')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#222733] bg-slate-50/80 dark:bg-[#161b22]/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
                report.errorCount > 0
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                  : report.warningCount > 0
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
              }`}
            >
              {report.errorCount > 0 ? (
                <AlertOctagon className="w-5 h-5" />
              ) : report.warningCount > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Auditoría de Esquema XSD ISO 20022
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    report.errorCount > 0
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : report.warningCount > 0
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {report.errorCount > 0
                    ? `${report.errorCount} Error(es) Crítico(s)`
                    : report.warningCount > 0
                    ? 'Conforme con Advertencias'
                    : '100% Conforme XSD'}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-[#8b949e] truncate max-w-md mt-0.5">
                {fileName} · {report.xsdStandard}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenXmlViewer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenXmlViewer();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#222733] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#30363d] transition-all cursor-pointer"
                title="Ver código XML original"
              >
                <CodeXml className="w-3.5 h-3.5" />
                <span>Ver XML</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#161b22] hover:bg-slate-200 dark:hover:bg-[#222733] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#30363d] transition-all cursor-pointer"
              title="Copiar texto de auditoría al portapapeles"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copiar Informe</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#146ef5] hover:bg-[#146ef5]/90 text-white transition-all cursor-pointer"
              title="Exportar informe en formato JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161b22] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#222733] flex items-center justify-between">
              <div>
                <div className="text-[10.5px] uppercase font-bold text-slate-500 dark:text-[#8b949e]">
                  Conformidad XSD
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {report.conformanceScore}%
                </div>
              </div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border ${
                  report.conformanceScore >= 90
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : report.conformanceScore >= 70
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                }`}
              >
                {report.conformanceScore}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#222733]">
              <div className="text-[10.5px] uppercase font-bold text-slate-500 dark:text-[#8b949e]">
                Reglas Verificadas
              </div>
              <div className="text-xl font-bold text-[#146ef5] mt-0.5 flex items-center gap-1.5">
                <span>{report.passedChecks}</span>
                <span className="text-xs font-normal text-slate-500 dark:text-[#8b949e]">
                  / {report.totalChecks} superadas
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#222733]">
              <div className="text-[10.5px] uppercase font-bold text-slate-500 dark:text-[#8b949e]">
                Errores Críticos
              </div>
              <div
                className={`text-xl font-bold mt-0.5 ${
                  report.errorCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {report.errorCount}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#222733]">
              <div className="text-[10.5px] uppercase font-bold text-slate-500 dark:text-[#8b949e]">
                Advertencias
              </div>
              <div
                className={`text-xl font-bold mt-0.5 ${
                  report.warningCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {report.warningCount}
              </div>
            </div>
          </div>

          {/* Mathematical Reconciliation Box */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              report.financialBalanceCheck.isBalanced
                ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/20 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg mt-0.5 ${
                  report.financialBalanceCheck.isBalanced
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-2">
                  <span>Conciliación Matemática de Flujo de Caja</span>
                  {report.financialBalanceCheck.isBalanced ? (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.2 rounded-full font-mono">
                      CUADRE 100% EXACTO
                    </span>
                  ) : (
                    <span className="text-[10px] bg-rose-500/15 text-rose-700 dark:text-rose-300 px-2 py-0.2 rounded-full font-mono">
                      DESCUADRE DE {report.financialBalanceCheck.difference}
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] mt-1 opacity-90 leading-relaxed font-mono">
                  Saldo Inicial ({report.financialBalanceCheck.initialBalance.toLocaleString('es-PY')}) + Ingresos (
                  +{report.financialBalanceCheck.totalCredits.toLocaleString('es-PY')}) - Gastos (-
                  {report.financialBalanceCheck.totalDebits.toLocaleString('es-PY')}) = Saldo Final (
                  {report.financialBalanceCheck.declaredFinalBalance.toLocaleString('es-PY')})
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 pt-2 border-b border-slate-200 dark:border-[#222733] pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterSeverity('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterSeverity === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-[#161b22] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas las Reglas ({report.issues.length})
            </button>

            {report.errorCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterSeverity('error')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterSeverity === 'error'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Errores ({report.errorCount})</span>
              </button>
            )}

            {report.warningCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterSeverity('warning')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterSeverity === 'warning'
                    ? 'bg-amber-500 text-slate-900 font-bold'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Advertencias ({report.warningCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setFilterSeverity('info')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterSeverity === 'info'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Conformes ({report.infoCount})</span>
            </button>
          </div>

          {/* Issues List */}
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                No hay reglas que coincidan con el filtro seleccionado.
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const isError = issue.severity === 'error';
                const isWarning = issue.severity === 'warning';
                const isInfo = issue.severity === 'info';

                return (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isError
                        ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30'
                        : 'bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#222733]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            isError
                              ? 'bg-rose-500/15 text-rose-500'
                              : isWarning
                              ? 'bg-amber-500/15 text-amber-500'
                              : 'bg-emerald-500/15 text-emerald-500'
                          }`}
                        >
                          {isError ? (
                            <AlertOctagon className="w-4 h-4" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-md font-mono ${
                                isError
                                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                  : isWarning
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {isError ? 'Error Crítico XSD' : isWarning ? 'Advertencia XSD' : 'Regla Verificada'}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {issue.ruleTitle}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                            {issue.description}
                          </div>

                          {/* Technical metadata / XPath */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-slate-500 dark:text-[#8b949e]">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">Ruta XSD:</span>
                              <span className="bg-slate-200/70 dark:bg-[#222733] px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200">
                                {issue.tagPath}
                              </span>
                            </div>

                            {issue.foundValue && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400">Valor hallado:</span>
                                <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">
                                  {issue.foundValue}
                                </span>
                              </div>
                            )}

                            {issue.expectedFormat && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400">Formato esperado:</span>
                                <span className="text-[#146ef5] font-semibold">{issue.expectedFormat}</span>
                              </div>
                            )}
                          </div>

                          {/* Actionable recommendation */}
                          {issue.recommendation && (
                            <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                              <strong className="font-semibold">Recomendación técnica:</strong>{' '}
                              {issue.recommendation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-[#222733] bg-slate-50 dark:bg-[#161b22]/50 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs text-slate-500 dark:text-[#8b949e]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Motor de validación conforme a ISO 20022 v2/v4/v8 y SIPAP Paraguay</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-[#222733] hover:bg-slate-300 dark:hover:bg-[#30363d] text-slate-800 dark:text-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar Informe
          </button>
        </div>
      </div>
    </div>
  );
};
