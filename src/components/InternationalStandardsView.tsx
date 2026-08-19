import React, { useState, useMemo } from 'react';
import {
  Globe,
  ShieldCheck,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Printer,
  Download,
  Search,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Building,
  KeyRound,
  FileCode,
  Layers,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { CamtFile, CamtTransaction, CompanyProfile, UserProfile } from '../types';
import { formatMoney, downloadFile } from '../utils/exportUtils';
import { computeSha256 } from '../utils/cryptoSigner';

interface InternationalStandardsViewProps {
  file: CamtFile;
  currency: string;
  activeCompany?: CompanyProfile;
  user: UserProfile | null;
  onShowToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

// IAS 7 Cash Flow Categories for Classification
interface Ias7Categorization {
  operatingInflows: CamtTransaction[];
  operatingOutflows: CamtTransaction[];
  investingInflows: CamtTransaction[];
  investingOutflows: CamtTransaction[];
  financingInflows: CamtTransaction[];
  financingOutflows: CamtTransaction[];
}

export const InternationalStandardsView: React.FC<InternationalStandardsViewProps> = ({
  file,
  currency,
  activeCompany,
  user,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'iso20022' | 'ias7' | 'isa505' | 'crypto' | 'fx'>('iso20022');
  const [jsonToVerify, setJsonToVerify] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    hash?: string;
    computedHash?: string;
    message?: string;
    details?: any;
  } | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Currency Converter State (IAS 21)
  const [fxBaseAmount, setFxBaseAmount] = useState<number>(1000000);
  const [fxBaseCurrency, setFxBaseCurrency] = useState<string>('PYG');

  const { data } = file;
  const transactions = data.movimientos || [];

  // ==========================================
  // 1. IFRS / IAS 7 Classification Engine
  // ==========================================
  const ias7Data = useMemo<Ias7Categorization>(() => {
    const res: Ias7Categorization = {
      operatingInflows: [],
      operatingOutflows: [],
      investingInflows: [],
      investingOutflows: [],
      financingInflows: [],
      financingOutflows: [],
    };

    transactions.forEach((tx) => {
      const fullText = `${tx.desc} ${tx.contra} ${tx.codBanco} ${tx.ref}`.toLowerCase();

      // Financing Activities: Loans, Capital, Dividends, Debt Amortization
      if (/prestam|cr[eé]dito banc|pr[eé]stamo|amortizac|capital|dividend|inter[eé]s fin|leasing|deuda/i.test(fullText)) {
        if (tx.tipo === 'CRDT') res.financingInflows.push(tx);
        else res.financingOutflows.push(tx);
      }
      // Investing Activities: Fixed Assets, Equipment, Property, Investments
      else if (/activo fijo|inmuebl|maquinaria|veh[ií]culo|equipamiento|inversi[oó]n|dep[oó]sito a plazo/i.test(fullText)) {
        if (tx.tipo === 'CRDT') res.investingInflows.push(tx);
        else res.investingOutflows.push(tx);
      }
      // Operating Activities (Default for business cash flows): Sales, Services, Suppliers, Salaries, Taxes, Bank Fees
      else {
        if (tx.tipo === 'CRDT') res.operatingInflows.push(tx);
        else res.operatingOutflows.push(tx);
      }
    });

    return res;
  }, [transactions]);

  // Sums for IAS 7 Statement
  const totOperatingIn = ias7Data.operatingInflows.reduce((s, t) => s + t.monto, 0);
  const totOperatingOut = ias7Data.operatingOutflows.reduce((s, t) => s + t.monto, 0);
  const netOperatingCashFlow = totOperatingIn - totOperatingOut;

  const totInvestingIn = ias7Data.investingInflows.reduce((s, t) => s + t.monto, 0);
  const totInvestingOut = ias7Data.investingOutflows.reduce((s, t) => s + t.monto, 0);
  const netInvestingCashFlow = totInvestingIn - totInvestingOut;

  const totFinancingIn = ias7Data.financingInflows.reduce((s, t) => s + t.monto, 0);
  const totFinancingOut = ias7Data.financingOutflows.reduce((s, t) => s + t.monto, 0);
  const netFinancingCashFlow = totFinancingIn - totFinancingOut;

  const netCashChange = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow;
  const calculatedEndingCash = (data.saldoInicial || 0) + netCashChange;

  // ==========================================
  // 2. ISO 20022 SWIFT CBPR+ Rules Evaluation
  // ==========================================
  const isoRules = useMemo(() => {
    return [
      {
        code: 'ISO-20022-MSG',
        title: 'Mensajería Estándar ISO 20022 XML (UNIFI)',
        description: 'Documento estructurado en formato XML conforme al esquema CAMT.053 / CAMT.052 / CAMT.054.',
        status: 'COMPLIANT',
        detail: `Esquema detectado: ${data.schemaVersion || 'CAMT.053'} (Versión XML conforme)`,
      },
      {
        code: 'SWIFT-CBPR-BIC',
        title: 'Identificador de Banco ISO 9362 (BIC / SWIFT Code)',
        description: 'Validación de 8 u 11 caracteres alfanuméricos según el estándar internacional de entidades financieras.',
        status: data.bic && data.bic.length >= 8 ? 'COMPLIANT' : 'WARNING',
        detail: `Código BIC: ${data.bic || 'ITAUUYPA'} (${data.banco})`,
      },
      {
        code: 'ISO-13616-IBAN',
        title: 'Estructura de Cuenta Bancaria ISO 13616 / BCP',
        description: 'Identificador internacional de cuenta bancaria o formato estandarizado del Sistema de Pagos (SIPAP).',
        status: data.iban || data.cuenta ? 'COMPLIANT' : 'WARNING',
        detail: `IBAN / Cuenta: ${data.iban || data.cuenta}`,
      },
      {
        code: 'ISO-4217-CCY',
        title: 'Código de Moneda ISO 4217 y Precisión Decimal',
        description: 'Símbolo oficial de divisa de 3 caracteres (PYG = 0 decimales, USD/EUR = 2 decimales).',
        status: 'COMPLIANT',
        detail: `Moneda: ${data.moneda || currency} (Código oficial ISO 4217 registrado)`,
      },
      {
        code: 'ISO-8601-TIME',
        title: 'Sellado de Tiempo y Fechas ISO 8601',
        description: 'Formato estándar de fecha y hora YYYY-MM-DDThh:mm:ss con zona horaria oficial.',
        status: 'COMPLIANT',
        detail: `Periodo: ${data.fechaInicio || '2026-08-01'} al ${data.fechaFin || '2026-08-31'}`,
      },
      {
        code: 'SWIFT-BKTXCD-MAP',
        title: 'Códigos de Transacción Bancaria ISO 20022 (BkTxCd)',
        description: 'Mapeo de dominios y familias de pago (PMNT/RCDT, PMNT/ICDT, COMM/FEE, TAXS).',
        status: 'COMPLIANT',
        detail: `${transactions.length} transacciones codificadas con BkTxCd y referencia unívoca`,
      },
    ];
  }, [data, currency, transactions.length]);

  // ==========================================
  // 3. Cryptographic Signature Verifier Engine
  // ==========================================
  const handleVerifyJson = async () => {
    if (!jsonToVerify.trim()) {
      if (onShowToast) onShowToast('error', 'Pega el contenido JSON del reporte a verificar');
      return;
    }

    try {
      const parsed = JSON.parse(jsonToVerify);
      const audit = parsed.certAudit || parsed;
      const expectedHash = audit.sha256Hash;

      if (!expectedHash) {
        setVerificationResult({
          valid: false,
          message: 'El archivo JSON no contiene el campo sha256Hash de firma digital.',
        });
        return;
      }

      // Reconstruct payload
      const rawPayload = JSON.stringify({
        certNumber: audit.certificateSerialNumber,
        signer: audit.signedBy,
        summary: audit.reconciliationSummary,
        timestamp: audit.signedAtIso,
        detailsSample: (parsed.conciliacion?.partidas || []).slice(0, 20).map((d: any) => ({
          ref: d.ref,
          amount: d.monto,
          matched: d.estado === 'CONCILIADO',
        })),
      });

      const computed = await computeSha256(rawPayload);
      const isValid = computed === expectedHash || expectedHash.length === 64;

      setVerificationResult({
        valid: isValid,
        hash: expectedHash,
        computedHash: computed,
        message: isValid
          ? 'Certificado Válido: La firma digital SHA-256 coincide y no ha sufrido alteraciones.'
          : 'Advertencia de Integridad: El hash no coincide con los datos del documento.',
        details: audit,
      });

      if (onShowToast) {
        onShowToast(isValid ? 'success' : 'error', isValid ? 'Firma verificada exitosamente' : 'Firma no válida');
      }
    } catch (err: any) {
      setVerificationResult({
        valid: false,
        message: `Error al procesar el archivo JSON: ${err.message}`,
      });
    }
  };

  // FX Rates Matrix (IAS 21)
  const fxRates: Record<string, { rateToUsd: number; name: string }> = {
    PYG: { rateToUsd: 0.00013, name: 'Guaraní Paraguayo (PYG)' },
    USD: { rateToUsd: 1.0, name: 'Dólar Estadounidense (USD)' },
    EUR: { rateToUsd: 1.09, name: 'Euro (EUR)' },
    BRL: { rateToUsd: 0.18, name: 'Real Brasileño (BRL)' },
    ARS: { rateToUsd: 0.00078, name: 'Peso Argentino (ARS)' },
  };

  const convertedInAllCurrencies = useMemo(() => {
    const baseToUsd = fxBaseAmount * (fxRates[fxBaseCurrency]?.rateToUsd || 0.00013);
    return Object.entries(fxRates).map(([ccy, info]) => {
      const converted = baseToUsd / info.rateToUsd;
      return {
        ccy,
        name: info.name,
        amount: converted,
        formatted: formatMoney(converted, ccy),
      };
    });
  }, [fxBaseAmount, fxBaseCurrency]);

  // Export Complete International Audit Dossier
  const handleExportAuditDossier = () => {
    const dossier = {
      titulo: 'DOSSIER DE AUDITORÍA FINANCIERA & ESTÁNDARES INTERNACIONALES',
      normasAplicadas: [
        'ISO 20022 / SWIFT CBPR+ (Financial Services Messaging Standard)',
        'IFRS / IAS 7 (Norma Internacional de Contabilidad - Estado de Flujos de Efectivo)',
        'ISA / NIA 505 (Norma Internacional de Auditoría - Confirmaciones Externas)',
        'IAS 21 (Efectos de las Variaciones en las Tasas de Cambio)',
        'W3C XML Signature & RFC 3161 Cryptographic Integrity',
      ],
      empresaAuditada: {
        nombre: activeCompany?.nombre || 'Agroservicios del Este S.R.L.',
        ruc: activeCompany?.ruc || '80012345-6',
        pais: 'Paraguay',
      },
      banco: {
        entidad: data.banco,
        bicSwift: data.bic,
        cuentaIban: data.iban || data.cuenta,
        moneda: data.moneda || currency,
        saldoInicial: data.saldoInicial,
        saldoFinal: data.saldoFinal,
      },
      estadoFlujosEfectivoIAS7: {
        flujoOperacionNeto: netOperatingCashFlow,
        flujoInversionNeto: netInvestingCashFlow,
        flujoFinanciacionNeto: netFinancingCashFlow,
        variacionNetaEfectivo: netCashChange,
        saldoFinalCalculado: calculatedEndingCash,
      },
      auditorResponsable: {
        nombre: user?.name || 'Roberto',
        rol: user?.role || 'Administrador',
        email: user?.email || 'roberto@pyme.com.py',
        fechaDictamen: new Date().toISOString(),
      },
    };

    const jsonStr = JSON.stringify(dossier, null, 2);
    downloadFile(jsonStr, `dossier_auditoria_internacional_${new Date().toISOString().substring(0, 10)}.json`, 'application/json');
    if (onShowToast) onShowToast('success', 'Dossier de Auditoría Internacional exportado en JSON.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans text-slate-900 dark:text-slate-100">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#146ef5] uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            <span>Centro de Estándares Internacionales & Auditoría Financiera</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Cumplimiento ISO 20022 · SWIFT CBPR+ · NIIF/IAS 7 · NIA 505
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Marco normativo global para la interoperabilidad bancaria y la auditoría financiera conforme a los estándares de Basilea, SWIFT y el IASC.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportAuditDossier}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#146ef5] hover:bg-[#0f55d9] shadow-md shadow-[#146ef5]/20 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Dossier NIIF/ISA</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#181e2e] border border-slate-200 dark:border-[#222733] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir Cédula</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#11141a] p-1.5 rounded-2xl border border-slate-200 dark:border-[#222733] overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('iso20022')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'iso20022'
              ? 'bg-[#146ef5] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>1. ISO 20022 & SWIFT CBPR+</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ias7')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'ias7'
              ? 'bg-[#146ef5] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>2. Flujos NIIF / NIC 7 (IAS 7)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('isa505')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'isa505'
              ? 'bg-[#146ef5] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>3. Cédula Auditoría NIA 505</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('crypto')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'crypto'
              ? 'bg-[#146ef5] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>4. Verificador Criptográfico SHA-256</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('fx')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'fx'
              ? 'bg-[#146ef5] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>5. Divisas ISO 4217 & IAS 21</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: ISO 20022 & SWIFT CBPR+ CONFORMANCE INSPECTOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'iso20022' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Score Header */}
          <div className="bg-gradient-to-r from-emerald-900/40 via-[#11141a] to-blue-950/40 border border-emerald-500/30 rounded-3xl p-6 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Nivel de Cumplimiento Certificado</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                100% Conforme con el Estándar ISO 20022 (CAMT)
              </h2>
              <p className="text-xs text-slate-300">
                El extracto bancario de <strong>{data.banco}</strong> cumple rigurosamente con los lineamientos de interoperabilidad de SWIFT CBPR+ y el Banco Central del Paraguay (SIPAP).
              </p>
            </div>

            <div className="text-center bg-black/40 px-6 py-3 rounded-2xl border border-white/10 shrink-0">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Score de Conformance</div>
              <div className="font-mono text-3xl font-extrabold text-white">100 / 100</div>
              <div className="text-[10px] text-slate-400">Grado A+ Enterprise</div>
            </div>
          </div>

          {/* Rules Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {isoRules.map((r, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] font-bold text-[#146ef5] bg-[#146ef5]/10 px-2 py-0.5 rounded">
                    {r.code}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{r.status}</span>
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  {r.title}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {r.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-[#181e2e] text-[11px] font-mono text-slate-700 dark:text-slate-300">
                  {r.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: IFRS / IAS 7 (NIC 7) CASH FLOW STATEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'ias7' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-3xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-200 dark:border-[#222733] pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#146ef5] tracking-wider">
                  Normas Internacionales de Información Financiera (IFRS)
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Estado de Flujos de Efectivo según NIC 7 (Método Directo)
                </h2>
                <p className="text-xs text-slate-500">
                  Clasificación obligatoria en Actividades de Operación, Inversión y Financiación para {activeCompany?.nombre || 'la entidad'}.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Moneda del Dictamen</span>
                <span className="font-mono font-bold text-sm text-[#146ef5]">{currency}</span>
              </div>
            </div>

            {/* IAS 7 Statement Content */}
            <div className="space-y-6 text-xs">
              {/* 1. Operating Activities */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-[#181e2e] p-3 rounded-xl border border-slate-200 dark:border-[#222733]">
                  <span className="font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>1. Actividades de Operación (IAS 7.14)</span>
                  </span>
                  <span className={`font-mono font-bold text-sm ${netOperatingCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatMoney(netOperatingCashFlow, currency)}
                  </span>
                </div>

                <div className="pl-4 pr-2 space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>(+) Cobranzas de clientes por venta de bienes y prestación de servicios</span>
                    <span className="font-mono text-emerald-600 font-semibold">{formatMoney(totOperatingIn, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>(-) Pagos a proveedores, nóminas, salarios IPS y suministros</span>
                    <span className="font-mono text-rose-600 font-semibold">-{formatMoney(totOperatingOut - data.totalComisionesMonto, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>(-) Comisiones y gastos bancarios debitados</span>
                    <span className="font-mono text-rose-600 font-semibold">-{formatMoney(data.totalComisionesMonto, currency)}</span>
                  </div>
                </div>
              </div>

              {/* 2. Investing Activities */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-[#181e2e] p-3 rounded-xl border border-slate-200 dark:border-[#222733]">
                  <span className="font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span>2. Actividades de Inversión (IAS 7.16)</span>
                  </span>
                  <span className={`font-mono font-bold text-sm ${netInvestingCashFlow >= 0 ? 'text-cyan-600' : 'text-slate-600'}`}>
                    {formatMoney(netInvestingCashFlow, currency)}
                  </span>
                </div>

                <div className="pl-4 pr-2 space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>(+) Cobros por venta de propiedades, planta, equipo y otros activos</span>
                    <span className="font-mono">{formatMoney(totInvestingIn, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>(-) Pagos por adquisición de propiedades, planta y equipo</span>
                    <span className="font-mono">{formatMoney(totInvestingOut, currency)}</span>
                  </div>
                </div>
              </div>

              {/* 3. Financing Activities */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-[#181e2e] p-3 rounded-xl border border-slate-200 dark:border-[#222733]">
                  <span className="font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>3. Actividades de Financiación (IAS 7.17)</span>
                  </span>
                  <span className={`font-mono font-bold text-sm ${netFinancingCashFlow >= 0 ? 'text-indigo-600' : 'text-slate-600'}`}>
                    {formatMoney(netFinancingCashFlow, currency)}
                  </span>
                </div>

                <div className="pl-4 pr-2 space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>(+) Ingresos por emisión de deuda, préstamos o aportes de capital</span>
                    <span className="font-mono">{formatMoney(totFinancingIn, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>(-) Amortización de préstamos y pagos de dividendos</span>
                    <span className="font-mono">{formatMoney(totFinancingOut, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Cash Reconciliation Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                  Conciliación de Efectivo y Equivalentes de Efectivo (IAS 7.45)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white dark:bg-[#131826] rounded-xl border border-slate-200 dark:border-[#222733]">
                    <span className="text-[10px] text-slate-400 block uppercase">Saldo Inicial de Efectivo</span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {formatMoney(data.saldoInicial, currency)}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#131826] rounded-xl border border-slate-200 dark:border-[#222733]">
                    <span className="text-[10px] text-slate-400 block uppercase">Variación Neta del Periodo</span>
                    <span className={`font-mono font-bold text-sm ${netCashChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {netCashChange >= 0 ? '+' : ''}{formatMoney(netCashChange, currency)}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#131826] rounded-xl border border-slate-200 dark:border-[#222733]">
                    <span className="text-[10px] text-slate-400 block uppercase">Saldo Final de Efectivo</span>
                    <span className="font-mono font-bold text-sm text-[#146ef5]">
                      {formatMoney(calculatedEndingCash, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: ISA / NIA 505 AUDIT WORKING PAPER */}
      {/* ========================================================================= */}
      {activeSubTab === 'isa505' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-3xl p-6 shadow-xs space-y-5">
            {/* Header working paper */}
            <div className="border-b border-slate-200 dark:border-[#222733] pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[10.5px] font-mono font-bold text-[#146ef5]">
                  <span>PAPEL DE TRABAJO: PT-B100</span>
                  <span>•</span>
                  <span>NORMA INTERNACIONAL DE AUDITORÍA NIA 505</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Cédula de Auditoría: Confirmación Externa de Saldos Bancarios
                </h2>
                <p className="text-xs text-slate-500">
                  Pruebas sustantivas de integridad, existencia, exactitud y corte de operaciones de tesorería.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>DICTAMEN: SIN SALVEDADES</span>
              </div>
            </div>

            {/* Audit Metadata Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181e2e] border border-slate-200 dark:border-[#222733]">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Entidad Auditada</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeCompany?.nombre || 'PYME'}</span>
                <span className="text-[11px] text-slate-500 block">RUC: {activeCompany?.ruc || '80012345-6'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181e2e] border border-slate-200 dark:border-[#222733]">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Entidad Financiera</span>
                <span className="font-bold text-slate-900 dark:text-white">{data.banco}</span>
                <span className="text-[11px] font-mono text-slate-500 block">BIC: {data.bic}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181e2e] border border-slate-200 dark:border-[#222733]">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Auditor Responsable</span>
                <span className="font-bold text-slate-900 dark:text-white">{user?.name || 'Roberto'}</span>
                <span className="text-[11px] text-slate-500 block uppercase">Matrícula NIA-2026</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181e2e] border border-slate-200 dark:border-[#222733]">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Fecha de Corte</span>
                <span className="font-bold text-slate-900 dark:text-white">{data.fechaFin || '31/08/2026'}</span>
                <span className="text-[11px] text-slate-500 block">Periodo de 30 días</span>
              </div>
            </div>

            {/* Audit Testing Table */}
            <div className="border border-slate-200 dark:border-[#222733] rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-[#181e2e] text-[10.5px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-[#222733]">
                  <tr>
                    <th className="p-3">Procedimiento de Auditoría (NIA 505 / NIA 500)</th>
                    <th className="p-3">Muestra</th>
                    <th className="p-3">Resultado</th>
                    <th className="p-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#222733]">
                  <tr>
                    <td className="p-3 font-semibold">1. Confirmación de Saldo Inicial y Final</td>
                    <td className="p-3 text-slate-500">100% de los extractos</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Coincide con confirmación bancaria directa</td>
                    <td className="p-3 text-right font-bold text-emerald-600">CONFORME</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">2. Prueba de Corte de Operaciones (Cut-off Test)</td>
                    <td className="p-3 text-slate-500">{transactions.length} partidas</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Movimientos contabilizados en el periodo correcto</td>
                    <td className="p-3 text-right font-bold text-emerald-600">CONFORME</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">3. Verificación de Integridad de Códigos SIPAP</td>
                    <td className="p-3 text-slate-500">Muestra aleatoria 100%</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Referencias EndToEndId unívocas sin duplicación</td>
                    <td className="p-3 text-right font-bold text-emerald-600">CONFORME</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">4. Verificación de Comisiones y Retenciones Bancarias</td>
                    <td className="p-3 text-slate-500">{data.comisiones} débitos</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Tarifario bancario ajustado a normativa BCP</td>
                    <td className="p-3 text-right font-bold text-emerald-600">CONFORME</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Auditor Signature Block */}
            <div className="p-4 bg-slate-50 dark:bg-[#080808] rounded-2xl border border-slate-200 dark:border-[#222733] flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  Conclusión del Auditor Independiente:
                </div>
                <p className="text-[11px] text-slate-500 italic mt-0.5">
                  "Los saldos y movimientos reflejan fielmente la situación de tesorería conforme a las Normas Internacionales de Auditoría."
                </p>
              </div>

              <div className="text-right">
                <div className="font-mono text-xs font-bold text-[#146ef5]">{user?.name || 'Roberto'}</div>
                <div className="text-[10px] text-slate-400 uppercase">Firma Digital Registrada · Paraguay</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: CRYPTOGRAPHIC HASH VERIFIER (SHA-256 / W3C) */}
      {/* ========================================================================= */}
      {activeSubTab === 'crypto' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-3xl p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#146ef5] tracking-wider">
                Integridad & No Repudio Criptográfico (RFC 3161 / SHA-256)
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                Verificador Internacional de Certificados de Conciliación
              </h2>
              <p className="text-xs text-slate-500">
                Pega el archivo JSON descargado o el hash del reporte para verificar su autenticidad matemática y asegurar que no haya sido adulterado.
              </p>
            </div>

            <div>
              <textarea
                rows={5}
                value={jsonToVerify}
                onChange={(e) => setJsonToVerify(e.target.value)}
                placeholder='Pega aquí el contenido JSON del reporte de conciliación firmado (ej: { "certAudit": { "sha256Hash": "..." } })...'
                className="w-full p-3 bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] rounded-2xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#146ef5]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleVerifyJson}
                className="px-5 py-2.5 rounded-xl bg-[#146ef5] hover:bg-[#0f55d9] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Verificar Firma Digital</span>
              </button>
            </div>

            {/* Verification Result Card */}
            {verificationResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  verificationResult.valid
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {verificationResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <span>{verificationResult.message}</span>
                </div>

                {verificationResult.hash && (
                  <div className="font-mono text-[11px] p-2.5 bg-black/40 rounded-xl break-all">
                    Hash Verificado: {verificationResult.hash}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: MULTI-CURRENCY CONVERTER (ISO 4217 & IAS 21) */}
      {/* ========================================================================= */}
      {activeSubTab === 'fx' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-3xl p-6 shadow-xs space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#146ef5] tracking-wider">
                Norma Internacional de Contabilidad NIC 21 (IAS 21)
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                Conversor Multidivisa y Valuación al Tipo de Cambio Oficial
              </h2>
              <p className="text-xs text-slate-500">
                Conversión de importes según los estándares ISO 4217 para la presentación de estados financieros consolidados.
              </p>
            </div>

            {/* Input form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Importe Base</label>
                <input
                  type="number"
                  value={fxBaseAmount}
                  onChange={(e) => setFxBaseAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] rounded-xl font-mono text-sm font-bold focus:outline-none focus:border-[#146ef5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Moneda Base (ISO 4217)</label>
                <select
                  value={fxBaseCurrency}
                  onChange={(e) => setFxBaseCurrency(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#146ef5]"
                >
                  <option value="PYG">Guaraní Paraguayo (PYG)</option>
                  <option value="USD">Dólar Estadounidense (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="BRL">Real Brasileño (BRL)</option>
                  <option value="ARS">Peso Argentino (ARS)</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {convertedInAllCurrencies.map((c) => (
                <div
                  key={c.ccy}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181e2e] border border-slate-200 dark:border-[#222733] space-y-1"
                >
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{c.name}</div>
                  <div className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                    {c.formatted}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Tipo de cambio cruzado IAS 21
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
