import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Plus,
  Trash2,
  Download,
  Printer,
  ShieldCheck,
  FileCode,
  FileSpreadsheet,
  FileText,
  Building,
  User,
  Clock,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Layers,
  HelpCircle,
  Upload,
} from 'lucide-react';
import { CamtTransaction, CamtFile, UserProfile, CompanyProfile } from '../types';
import { formatMoney, downloadFile } from '../utils/exportUtils';
import {
  createSignedReconciliationReport,
  DigitalSignatureRecord,
} from '../utils/cryptoSigner';

interface ReconciliationMatcherProps {
  transactions: CamtTransaction[];
  currency: string;
  activeFile?: CamtFile;
  activeCompany?: CompanyProfile;
  user: UserProfile | null;
  onShowToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export interface InternalTransferItem {
  id: string;
  fecha: string;
  ref: string;
  contraparte: string;
  ruc?: string;
  concepto: string;
  tipo: 'CRDT' | 'DBIT';
  monto: number;
  matchedTxId: number | null;
  matchScore?: number;
  matchNotes?: string;
}

// Sample authentic Paraguayan SME internal transfers
const DEFAULT_PARAGUAY_TRANSFERS: InternalTransferItem[] = [
  {
    id: 'tr-py-1',
    fecha: '2026-08-15',
    ref: 'SIPAP-TRANS-89210',
    contraparte: 'AGROVETERINARIA DEL ESTE S.A.',
    ruc: '80019284-3',
    concepto: 'Cobro de factura crédito N° 001-002-0004921',
    tipo: 'CRDT',
    monto: 35000000,
    matchedTxId: null,
  },
  {
    id: 'tr-py-2',
    fecha: '2026-08-14',
    ref: 'FAC-PROV-99124',
    contraparte: 'TELEFONIA CELULAR DEL PARAGUAY S.A.E. (TIGO)',
    ruc: '80001234-5',
    concepto: 'Pago servicio corporativo internet y telefonía móvil',
    tipo: 'DBIT',
    monto: 3450000,
    matchedTxId: null,
  },
  {
    id: 'tr-py-3',
    fecha: '2026-08-13',
    ref: 'ANDE-REC-202608',
    contraparte: 'ADMINISTRACION NACIONAL DE ELECTRICIDAD (ANDE)',
    ruc: '80000001-1',
    concepto: 'Suministro de energía eléctrica casa central y sucursal',
    tipo: 'DBIT',
    monto: 2150000,
    matchedTxId: null,
  },
  {
    id: 'tr-py-4',
    fecha: '2026-08-12',
    ref: 'SIPAP-COB-44910',
    contraparte: 'DISTRIBUIDORA GUARANI S.R.L.',
    ruc: '80045678-9',
    concepto: 'Cobranza por entrega de mercaderías e insumos agrícolas',
    tipo: 'CRDT',
    monto: 18750000,
    matchedTxId: null,
  },
  {
    id: 'tr-py-5',
    fecha: '2026-08-10',
    ref: 'NOMINA-IPS-AGO26',
    contraparte: 'INSTITUTO DE PREVISION SOCIAL (IPS)',
    ruc: '80000003-8',
    concepto: 'Aporte obrero patronal y salarios mes en curso',
    tipo: 'DBIT',
    monto: 8900000,
    matchedTxId: null,
  },
  {
    id: 'tr-py-6',
    fecha: '2026-08-09',
    ref: 'COMB-COPETROL-112',
    contraparte: 'COPETROL S.A.',
    ruc: '80002345-6',
    concepto: 'Combustible y lubricantes flota de distribución',
    tipo: 'DBIT',
    monto: 4500000,
    matchedTxId: null,
  },
  {
    id: 'tr-py-7',
    fecha: '2026-08-08',
    ref: 'ALQ-OFICINA-AGO',
    contraparte: 'INMOBILIARIA DEL ESTE S.A.',
    ruc: '80034567-1',
    concepto: 'Alquiler oficinas administrativas Asunción',
    tipo: 'DBIT',
    monto: 6500000,
    matchedTxId: null,
  },
];

export const ReconciliationMatcher: React.FC<ReconciliationMatcherProps> = ({
  transactions,
  currency,
  activeFile,
  activeCompany,
  user,
  onShowToast,
}) => {
  const [transfers, setTransfers] = useState<InternalTransferItem[]>(DEFAULT_PARAGUAY_TRANSFERS);
  const [filterMode, setFilterMode] = useState<'all' | 'matched' | 'pending_bank' | 'pending_transfers'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingTransfer, setIsAddingTransfer] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Form states for new transfer
  const [newRef, setNewRef] = useState('');
  const [newContraparte, setNewContraparte] = useState('');
  const [newRuc, setNewRuc] = useState('');
  const [newConcepto, setNewConcepto] = useState('');
  const [newMonto, setNewMonto] = useState('');
  const [newTipo, setNewTipo] = useState<'CRDT' | 'DBIT'>('DBIT');
  const [newFecha, setNewFecha] = useState(new Date().toISOString().substring(0, 10));

  // Signed Report Modal State
  const [signedReport, setSignedReport] = useState<DigitalSignatureRecord | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Derived calculations
  const totalTransfersAmount = useMemo(() => {
    return transfers.reduce((acc, t) => acc + Math.abs(t.monto), 0);
  }, [transfers]);

  const matchedTransfers = useMemo(() => {
    return transfers.filter((t) => t.matchedTxId !== null);
  }, [transfers]);

  const matchedBankTxIds = useMemo(() => {
    const ids = new Set<number>();
    transfers.forEach((t) => {
      if (t.matchedTxId !== null) ids.add(t.matchedTxId);
    });
    return ids;
  }, [transfers]);

  const matchedAmount = useMemo(() => {
    return matchedTransfers.reduce((acc, t) => acc + Math.abs(t.monto), 0);
  }, [matchedTransfers]);

  const pendingBankTxs = useMemo(() => {
    return transactions.filter((tx) => !matchedBankTxIds.has(tx._id));
  }, [transactions, matchedBankTxIds]);

  const pendingTransfers = useMemo(() => {
    return transfers.filter((t) => t.matchedTxId === null);
  }, [transfers]);

  const reconciliationPercentage = useMemo(() => {
    if (transfers.length === 0) return 0;
    return Math.round((matchedTransfers.length / transfers.length) * 100);
  }, [transfers.length, matchedTransfers.length]);

  // Automated Smart Matching Engine
  const handleAutoMatch = () => {
    let newMatchesCount = 0;
    const assignedTxIds = new Set<number>();

    // Copy current state
    const updated = transfers.map((tr) => {
      // If already matched and valid, keep
      if (tr.matchedTxId !== null) {
        assignedTxIds.add(tr.matchedTxId);
        return tr;
      }

      // Candidate search in transactions
      let bestTx: CamtTransaction | null = null;
      let highestScore = 0;
      let matchNote = '';

      for (const tx of transactions) {
        if (assignedTxIds.has(tx._id)) continue;

        const txAbs = Math.abs(tx.monto);
        const trAbs = Math.abs(tr.monto);
        const sameType = tx.tipo === tr.tipo;
        const amountDiff = Math.abs(txAbs - trAbs);
        const exactAmount = amountDiff < 0.01;
        const closeAmount = amountDiff <= trAbs * 0.02; // within 2%

        let score = 0;

        // Amount matching
        if (exactAmount) {
          score += 60;
          if (sameType) score += 20;
        } else if (closeAmount) {
          score += 35;
          if (sameType) score += 15;
        }

        // Reference / Invoice matching
        const cleanRef = tr.ref.trim().toLowerCase();
        const txCombinedText = `${tx.ref} ${tx.refEndToEnd} ${tx.refTx} ${tx.desc} ${tx.contra}`.toLowerCase();

        if (cleanRef && cleanRef.length >= 4 && txCombinedText.includes(cleanRef)) {
          score += 40;
        }

        // Counterparty & RUC matching
        const cleanContra = tr.contraparte.trim().toLowerCase();
        if (cleanContra && cleanContra.length >= 4) {
          const words = cleanContra.split(/\s+/).filter((w) => w.length >= 4);
          const matchedWords = words.filter((w) => txCombinedText.includes(w));
          if (matchedWords.length > 0) {
            score += Math.min(30, matchedWords.length * 15);
          }
        }

        if (tr.ruc && txCombinedText.includes(tr.ruc.toLowerCase())) {
          score += 35;
        }

        // Date proximity
        if (tr.fecha && tx.fecha) {
          const d1 = new Date(tr.fecha).getTime();
          const d2 = new Date(tx.fecha).getTime();
          const daysDiff = Math.abs(d1 - d2) / (1000 * 3600 * 24);
          if (daysDiff <= 2) score += 10;
          else if (daysDiff <= 7) score += 5;
        }

        if (score > highestScore && score >= 50) {
          highestScore = score;
          bestTx = tx;
          if (score >= 90) matchNote = 'Coincidencia Exacta (Monto + Referencia/Contraparte)';
          else if (score >= 70) matchNote = 'Coincidencia Alta (Monto + Contraparte aproximada)';
          else matchNote = 'Coincidencia Estimada (Monto similar)';
        }
      }

      if (bestTx) {
        assignedTxIds.add(bestTx._id);
        newMatchesCount++;
        return {
          ...tr,
          matchedTxId: bestTx._id,
          matchScore: highestScore,
          matchNotes: matchNote,
        };
      }

      return tr;
    });

    setTransfers(updated);
    if (onShowToast) {
      if (newMatchesCount > 0) {
        onShowToast('success', `Auto-conciliación completada: ${newMatchesCount} transferencias cruzadas con éxito.`);
      } else {
        onShowToast('info', 'No se encontraron nuevas coincidencias automáticas directas.');
      }
    }
  };

  // Reset all matches
  const handleResetMatches = () => {
    setTransfers((prev) =>
      prev.map((t) => ({ ...t, matchedTxId: null, matchScore: undefined, matchNotes: undefined }))
    );
    if (onShowToast) {
      onShowToast('info', 'Se desvincularon todas las partidas conciliadas.');
    }
  };

  // Manual toggle / match assignment
  const handleManualMatch = (transferId: string, txId: number | null) => {
    setTransfers((prev) =>
      prev.map((t) => {
        if (t.id === transferId) {
          return {
            ...t,
            matchedTxId: txId,
            matchScore: txId !== null ? 100 : undefined,
            matchNotes: txId !== null ? 'Asignación manual confirmada' : undefined,
          };
        }
        return t;
      })
    );
  };

  // Add new internal transfer
  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMonto = parseFloat(newMonto.replace(/,/g, '.'));
    if (isNaN(parsedMonto) || parsedMonto <= 0) {
      if (onShowToast) onShowToast('error', 'Ingresa un monto numérico válido mayor a 0');
      return;
    }

    const item: InternalTransferItem = {
      id: `tr-custom-${Date.now()}`,
      fecha: newFecha || new Date().toISOString().substring(0, 10),
      ref: newRef.trim() || `TR-${transfers.length + 1}`,
      contraparte: newContraparte.trim() || 'Contraparte PYME',
      ruc: newRuc.trim() || undefined,
      concepto: newConcepto.trim() || 'Transferencia contable',
      tipo: newTipo,
      monto: parsedMonto,
      matchedTxId: null,
    };

    setTransfers((prev) => [item, ...prev]);
    setIsAddingTransfer(false);
    setNewRef('');
    setNewContraparte('');
    setNewRuc('');
    setNewConcepto('');
    setNewMonto('');
    if (onShowToast) onShowToast('success', `Transferencia "${item.ref}" agregada al registro.`);
  };

  // Remove transfer
  const handleRemoveTransfer = (id: string) => {
    setTransfers((prev) => prev.filter((t) => t.id !== id));
    if (onShowToast) onShowToast('info', 'Partida eliminada.');
  };

  // Bulk import from CSV/Excel text
  const handleProcessBulk = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
    const imported: InternalTransferItem[] = [];

    lines.forEach((line, idx) => {
      // Split by tab, semicolon or comma
      const parts = line.split(/\t|;|,/).map((p) => p.trim());
      if (parts.length >= 3) {
        const fecha = parts[0] || new Date().toISOString().substring(0, 10);
        const ref = parts[1] || `IMP-${idx + 1}`;
        const contraparte = parts[2] || 'Beneficiario / Proveedor';
        const rawMonto = parts[3] ? parseFloat(parts[3].replace(/[^0-9.-]/g, '')) : 1000000;
        const monto = isNaN(rawMonto) ? 1000000 : Math.abs(rawMonto);
        const tipo: 'CRDT' | 'DBIT' = (parts[4]?.toUpperCase().includes('CR') || parts[4]?.toUpperCase().includes('ING')) ? 'CRDT' : 'DBIT';

        imported.push({
          id: `tr-bulk-${Date.now()}-${idx}`,
          fecha,
          ref,
          contraparte,
          concepto: `Importado: ${ref} - ${contraparte}`,
          tipo,
          monto,
          matchedTxId: null,
        });
      }
    });

    if (imported.length > 0) {
      setTransfers((prev) => [...imported, ...prev]);
      setIsBulkImportOpen(false);
      setBulkText('');
      if (onShowToast) onShowToast('success', `Se importaron ${imported.length} partidas desde el portapapeles.`);
    } else {
      if (onShowToast) onShowToast('error', 'No se pudieron reconocer filas válidas. Usa el formato: Fecha | Referencia | Contraparte | Monto');
    }
  };

  // Generate Signed Cryptographic Report
  const handleGenerateSignedReport = async () => {
    setIsSigning(true);

    const signerInfo = {
      name: user?.name || 'Roberto',
      username: user?.username || 'Roberto',
      role: user?.role || 'admin',
      email: user?.email || 'roberto@pyme.com.py',
      company: activeCompany?.nombre || user?.empresa || 'Agroservicios del Este S.R.L.',
      country: user?.pais || 'Paraguay',
    };

    const summary = {
      bankName: activeFile?.data.banco || 'Banco Itaú Paraguay S.A. / ueno bank',
      accountNumber: activeFile?.data.iban || activeFile?.data.cuenta || 'Cuenta Corriente PYG',
      currency: activeFile?.data.moneda || currency || 'PYG',
      openingBalance: activeFile?.data.saldoInicial || 0,
      closingBalance: activeFile?.data.saldoFinal || 0,
      totalBankMovements: transactions.length,
      totalInternalTransfers: transfers.length,
      matchedCount: matchedTransfers.length,
      matchedAmount,
      pendingBankCount: pendingBankTxs.length,
      pendingBankAmount: pendingBankTxs.reduce((acc, t) => acc + Math.abs(t.monto), 0),
      pendingTransfersCount: pendingTransfers.length,
      pendingTransfersAmount: pendingTransfers.reduce((acc, t) => acc + Math.abs(t.monto), 0),
      reconciliationPercentage,
      isFullyReconciled: pendingTransfers.length === 0 && pendingBankTxs.length === 0,
      difference:
        (activeFile?.data.saldoFinal || 0) -
        (matchedTransfers.reduce((acc, t) => acc + (t.tipo === 'CRDT' ? t.monto : -t.monto), 0)),
    };

    const record = await createSignedReconciliationReport(signerInfo, summary, transfers);
    setSignedReport(record);
    setIsSigning(false);
    setIsReportModalOpen(true);
    if (onShowToast) {
      onShowToast('success', `Certificado de Conciliación firmado digitalmente por ${signerInfo.name}`);
    }
  };

  // JSON Export
  const handleExportJSON = () => {
    if (!signedReport) {
      handleGenerateSignedReport();
    }

    const payload = {
      certAudit: signedReport,
      banco: {
        nombre: activeFile?.data.banco,
        cuenta: activeFile?.data.cuenta || activeFile?.data.iban,
        moneda: activeFile?.data.moneda || currency,
        saldoInicial: activeFile?.data.saldoInicial,
        saldoFinal: activeFile?.data.saldoFinal,
        totalTransacciones: transactions.length,
      },
      conciliacion: {
        totalPartidasInternas: transfers.length,
        partidasConciliadas: matchedTransfers.length,
        porcentaje: `${reconciliationPercentage}%`,
        partidas: transfers.map((t) => {
          const matchedTx = transactions.find((tx) => tx._id === t.matchedTxId);
          return {
            id: t.id,
            fecha: t.fecha,
            ref: t.ref,
            contraparte: t.contraparte,
            ruc: t.ruc || null,
            concepto: t.concepto,
            tipo: t.tipo,
            monto: t.monto,
            estado: t.matchedTxId !== null ? 'CONCILIADO' : 'PENDIENTE',
            movimientoBancarioAsociado: matchedTx
              ? {
                  id: matchedTx._id,
                  fecha: matchedTx.fecha,
                  referencia: matchedTx.ref || matchedTx.refEndToEnd,
                  monto: matchedTx.monto,
                  descripcion: matchedTx.desc,
                }
              : null,
          };
        }),
      },
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    downloadFile(jsonStr, `conciliacion_firmada_${new Date().toISOString().substring(0, 10)}.json`, 'application/json');
    if (onShowToast) onShowToast('success', 'Archivo JSON de conciliación descargado exitosamente.');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'ID Transferencia',
      'Fecha',
      'Referencia / Factura',
      'Contraparte',
      'RUC / CI',
      'Tipo (CRDT/DBIT)',
      'Monto',
      'Estado Conciliacion',
      'ID Movimiento Banco',
      'Fecha Banco',
      'Monto Banco',
      'Diferencia',
      'Concepto / Descripcion',
    ];

    const rows = transfers.map((t) => {
      const matchedTx = transactions.find((tx) => tx._id === t.matchedTxId);
      const montoBanco = matchedTx ? Math.abs(matchedTx.monto) : '';
      const diff = matchedTx ? Math.abs(t.monto) - Math.abs(matchedTx.monto) : '';
      return [
        `"${t.id}"`,
        `"${t.fecha}"`,
        `"${t.ref.replace(/"/g, '""')}"`,
        `"${t.contraparte.replace(/"/g, '""')}"`,
        `"${t.ruc || ''}"`,
        `"${t.tipo}"`,
        t.monto,
        `"${t.matchedTxId !== null ? 'CONCILIADO' : 'PENDIENTE'}"`,
        `"${matchedTx ? matchedTx._id : ''}"`,
        `"${matchedTx ? matchedTx.fecha : ''}"`,
        montoBanco,
        diff,
        `"${t.concepto.replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    downloadFile(csvContent, `conciliacion_bancaria_${new Date().toISOString().substring(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    if (onShowToast) onShowToast('success', 'Archivo CSV de conciliación exportado para Excel.');
  };

  // XML ISO 20022 Export
  const handleExportXML = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.054.001.08">
  <BkToCstmrDbtCdtNtfctn>
    <GrpHdr>
      <MsgId>CONCIL-PY-${Date.now()}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <MsgRcpt>
        <Nm>${activeCompany?.nombre || 'PYME Paraguay'}</Nm>
      </MsgRcpt>
    </GrpHdr>
    <Ntfctn>
      <Id>NTFCTN-${Date.now()}</Id>
      <Acct>
        <Id>
          <Othr>
            <Id>${activeFile?.data.cuenta || activeFile?.data.iban || 'Cuenta-PY'}</Id>
          </Othr>
        </Id>
        <Ccy>${activeFile?.data.moneda || currency || 'PYG'}</Ccy>
      </Acct>
      ${transfers
        .filter((t) => t.matchedTxId !== null)
        .map(
          (t) => `
      <Ntry>
        <Amt Ccy="${activeFile?.data.moneda || currency || 'PYG'}">${t.monto}</Amt>
        <CdtDbtInd>${t.tipo}</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt><Dt>${t.fecha}</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>${t.ref}</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr><Nm>${t.contraparte}</Nm></Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>${t.concepto}</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>`
        )
        .join('')}
    </Ntfctn>
  </BkToCstmrDbtCdtNtfctn>
</Document>`;

    downloadFile(xml, `conciliacion_iso20022_${new Date().toISOString().substring(0, 10)}.xml`, 'application/xml');
    if (onShowToast) onShowToast('success', 'Archivo XML ISO 20022 generado.');
  };

  // Filtered transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      if (filterMode === 'matched' && t.matchedTxId === null) return false;
      if (filterMode === 'pending_transfers' && t.matchedTxId !== null) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesRef = t.ref.toLowerCase().includes(q);
        const matchesContra = t.contraparte.toLowerCase().includes(q);
        const matchesConcept = t.concepto.toLowerCase().includes(q);
        const matchesRuc = t.ruc?.toLowerCase().includes(q) || false;
        if (!matchesRef && !matchesContra && !matchesConcept && !matchesRuc) return false;
      }
      return true;
    });
  }, [transfers, filterMode, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16 font-sans">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#146ef5] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#146ef5] animate-pulse" />
            <span>Módulo de Conciliación Bancaria · ISO 20022 Paraguay</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Cruce de Extractos Bancarios & Transferencias Contables
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Compara los movimientos bancarios de <strong className="text-slate-900 dark:text-white">{activeFile?.data.banco || 'Banco Itaú / ueno bank'}</strong> contra tus transferencias contables internas.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleAutoMatch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#146ef5] hover:bg-[#0f55d9] shadow-md shadow-[#146ef5]/20 transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-Conciliar Inteligente</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateSignedReport}
            disabled={isSigning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Firmar & Emitir Certificado</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#181e2e] p-1 rounded-xl border border-slate-200 dark:border-[#222733]">
            <button
              type="button"
              onClick={handleExportJSON}
              title="Descargar JSON"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#222733] rounded-lg transition-all text-xs flex items-center gap-1 font-semibold cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-[#146ef5]" />
              <span className="hidden sm:inline">JSON</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              title="Exportar a CSV / Excel"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#222733] rounded-lg transition-all text-xs flex items-center gap-1 font-semibold cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              type="button"
              onClick={handleExportXML}
              title="Exportar XML ISO 20022"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#222733] rounded-lg transition-all text-xs flex items-center gap-1 font-semibold cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">XML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active User Signatory Banner */}
      <div className="bg-slate-50 dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#146ef5]/15 text-[#146ef5] flex items-center justify-center font-bold border border-[#146ef5]/30">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Firmante Autorizado: {user?.name || 'Roberto'}</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#146ef5]/15 text-[#146ef5] border border-[#146ef5]/30">
                {user?.role || 'Administrador'}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sesión activa persistente
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-0.5">
              <span>Empresa: <strong className="text-slate-700 dark:text-slate-200">{activeCompany?.nombre || 'Agroservicios del Este S.R.L.'}</strong></span>
              <span>•</span>
              <span>RUC: <strong className="text-slate-700 dark:text-slate-200">{activeCompany?.ruc || '80012345-6'}</strong></span>
              <span>•</span>
              <span>Banco: <strong className="text-slate-700 dark:text-slate-200">{activeFile?.data.banco || 'Banco Itaú Paraguay'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTransfers(DEFAULT_PARAGUAY_TRANSFERS)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#181e2e] border border-slate-200 dark:border-[#222733] hover:border-[#146ef5]/40 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Cargar Lote PYME Paraguay</span>
          </button>

          <button
            type="button"
            onClick={handleResetMatches}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
          >
            Desvincular Todo
          </button>
        </div>
      </div>

      {/* KPI Metrics Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] p-4 rounded-2xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Transferencias en Libros</div>
          <div className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1">
            {transfers.length} partidas
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Volumen: {formatMoney(totalTransfersAmount, currency)}
          </div>
        </div>

        <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] p-4 rounded-2xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Conciliadas con Éxito</div>
          <div className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {matchedTransfers.length} / {transfers.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            {reconciliationPercentage}% verificado ({formatMoney(matchedAmount, currency)})
          </div>
        </div>

        <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] p-4 rounded-2xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Pendientes en Libros</div>
          <div className="font-mono text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {pendingTransfers.length} partidas
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Por conciliar: {formatMoney(pendingTransfers.reduce((s, t) => s + t.monto, 0), currency)}
          </div>
        </div>

        <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] p-4 rounded-2xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">Pendientes en Banco</div>
          <div className="font-mono text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
            {pendingBankTxs.length} txs
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Movimientos sin emparejar
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search, Add Transfer */}
      <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-[#181e2e] p-1 rounded-xl border border-slate-200 dark:border-[#222733] text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-[#222733] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todas ({transfers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('matched')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterMode === 'matched'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-600'
              }`}
            >
              Conciliadas ({matchedTransfers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('pending_transfers')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterMode === 'pending_transfers'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-400 hover:text-amber-600'
              }`}
            >
              Pendientes ({pendingTransfers.length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por referencia, RUC o contraparte..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#146ef5] w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBulkImportOpen(!isBulkImportOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-[#181e2e] border border-slate-200 dark:border-[#222733] transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#146ef5]" />
            <span>Pegar desde Excel/CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingTransfer(!isAddingTransfer)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#146ef5] hover:bg-[#0f55d9] transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Transferencia</span>
          </button>
        </div>
      </div>

      {/* Bulk Paste Drawer */}
      {isBulkImportOpen && (
        <div className="bg-white dark:bg-[#11141a] border border-[#146ef5]/40 rounded-2xl p-4 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#146ef5]" />
              <span>Pegar filas de Excel / CSV de Transferencias</span>
            </h3>
            <button
              onClick={() => setIsBulkImportOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Copia columnas de tu planilla Excel (Fecha, Referencia, Contraparte, Monto, Tipo) y pégalas aquí:
          </p>
          <textarea
            rows={4}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={`2026-08-15\tFAC-2026-001\tAGROSERVICIOS S.A.\t15000000\tCRDT\n2026-08-14\tSIPAP-99012\tTIGO PARAGUAY\t3450000\tDBIT`}
            className="w-full p-2.5 bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#146ef5]"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsBulkImportOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleProcessBulk}
              className="px-4 py-1.5 bg-[#146ef5] text-white rounded-xl text-xs font-bold hover:bg-[#0f55d9]"
            >
              Procesar e Importar
            </button>
          </div>
        </div>
      )}

      {/* Add Transfer Form */}
      {isAddingTransfer && (
        <form
          onSubmit={handleAddTransfer}
          className="bg-white dark:bg-[#11141a] border border-[#146ef5]/40 rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#222733] pb-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#146ef5]" />
              <span>Registrar Nueva Transferencia Contable para Conciliar</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingTransfer(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="block text-[10.5px] font-semibold text-slate-500 uppercase mb-1">Fecha</label>
              <input
                type="date"
                required
                value={newFecha}
                onChange={(e) => setNewFecha(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#146ef5]"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold text-slate-500 uppercase mb-1">Tipo</label>
              <select
                value={newTipo}
                onChange={(e) => setNewTipo(e.target.value as 'CRDT' | 'DBIT')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#146ef5]"
              >
                <option value="DBIT">Gasto / Pago / Egreso (DBIT)</option>
                <option value="CRDT">Ingreso / Cobranza (CRDT)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold text-slate-500 uppercase mb-1">Referencia / Factura</label>
              <input
                type="text"
                required
                placeholder="ej: FAC-001-002-9901"
                value={newRef}
                onChange={(e) => setNewRef(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#146ef5]"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold text-slate-500 uppercase mb-1">Contraparte / Beneficiario</label>
              <input
                type="text"
                required
                placeholder="ej: Tigo Paraguay / IPS"
                value={newContraparte}
                onChange={(e) => setNewContraparte(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#146ef5]"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold text-slate-500 uppercase mb-1">RUC / C.I.</label>
              <input
                type="text"
                placeholder="ej: 80001234-5"
                value={newRuc}
                onChange={(e) => setNewRuc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#146ef5]"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold text-slate-500 uppercase mb-1">Monto ({currency})</label>
              <input
                type="text"
                required
                placeholder="ej: 3450000"
                value={newMonto}
                onChange={(e) => setNewMonto(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] rounded-xl font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#146ef5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] font-semibold text-slate-500 uppercase mb-1">Concepto / Descripción Contable</label>
            <input
              type="text"
              placeholder="Detalle o descripción de la transferencia contable..."
              value={newConcepto}
              onChange={(e) => setNewConcepto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#146ef5]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingTransfer(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#146ef5] hover:bg-[#0f55d9] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Guardar Transferencia
            </button>
          </div>
        </form>
      )}

      {/* Main Reconciliation Table */}
      <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-[#222733] bg-slate-50/80 dark:bg-[#181e2e]/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#146ef5]" />
            <span>Matriz de Cruce: Transferencias Internas vs Extracto Bancario XML</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {transactions.length} transacciones bancarias disponibles en extracto
          </span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-[#222733]">
          {filteredTransfers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No se encontraron transferencias con el filtro aplicado.
            </div>
          ) : (
            filteredTransfers.map((tr) => {
              const matchedTx = transactions.find((tx) => tx._id === tr.matchedTxId);
              const isMatched = !!matchedTx;

              return (
                <div
                  key={tr.id}
                  className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-[#181e2e]/40 transition-colors"
                >
                  {/* Left: Transfer data */}
                  <div className="w-full lg:w-5/12 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          tr.tipo === 'CRDT'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {tr.tipo === 'CRDT' ? 'Cobro / Ingreso' : 'Pago / Egreso'}
                      </span>

                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {tr.ref}
                      </span>

                      <span className="text-[11px] font-mono text-slate-500">
                        {tr.fecha}
                      </span>

                      {tr.ruc && (
                        <span className="text-[10px] font-mono bg-slate-100 dark:bg-[#181e2e] text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                          RUC: {tr.ruc}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {tr.contraparte}
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {tr.concepto}
                    </div>

                    <div className="font-mono text-sm font-bold text-slate-900 dark:text-white pt-0.5">
                      {tr.tipo === 'CRDT' ? '+' : '-'}{formatMoney(tr.monto, currency)}
                    </div>
                  </div>

                  {/* Center: Match Selector & Bank Tx Info */}
                  <div className="w-full lg:w-6/12 bg-slate-50 dark:bg-[#080808]/70 p-3 rounded-2xl border border-slate-200 dark:border-[#222733] space-y-2">
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="font-bold text-slate-500 uppercase flex items-center gap-1.5">
                        <span>Movimiento Bancario Asignado:</span>
                      </span>
                      {isMatched && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>100% Conciliado</span>
                        </span>
                      )}
                    </div>

                    {/* Selector */}
                    <div className="flex items-center gap-2">
                      <select
                        value={tr.matchedTxId !== null ? tr.matchedTxId.toString() : ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                          handleManualMatch(tr.id, val);
                        }}
                        className="w-full bg-white dark:bg-[#131826] border border-slate-200 dark:border-[#222733] rounded-xl text-xs text-slate-900 dark:text-slate-100 p-2 focus:outline-none focus:border-[#146ef5]"
                      >
                        <option value="">-- Sin Conciliar (Seleccionar movimiento del extracto) --</option>
                        {transactions.map((tx) => (
                          <option key={tx._id} value={tx._id.toString()}>
                            [{tx.fecha}] {tx.tipo === 'CRDT' ? '+' : '-'}{formatMoney(tx.monto, currency)} — {tx.contra || tx.desc || tx.ref}
                          </option>
                        ))}
                      </select>

                      {isMatched && (
                        <button
                          type="button"
                          onClick={() => handleManualMatch(tr.id, null)}
                          title="Desvincular"
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {matchedTx && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-[#11141a] p-2 rounded-xl border border-slate-200 dark:border-[#222733] flex items-center justify-between">
                        <span className="truncate">Ref Banco: {matchedTx.ref || matchedTx.refEndToEnd || '—'}</span>
                        <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                          Monto Banco: {formatMoney(matchedTx.monto, currency)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="shrink-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveTransfer(tr.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="Eliminar transferencia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Official Signed Audit Report Certificate Modal */}
      {isReportModalOpen && signedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans overflow-y-auto">
          <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#222733] flex items-center justify-between bg-slate-50 dark:bg-[#080808]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Certificado & Dictamen de Conciliación Bancaria Firmado
                  </h2>
                  <p className="text-xs text-slate-500">
                    Sello Digital de Integridad Financiera · Normativa BCP & DNIT Paraguay
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#181e2e] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Institution and Seal */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-[#222733] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[10.5px] uppercase font-bold text-slate-500">Certificado Oficial N°</div>
                  <div className="font-mono text-base font-bold text-[#146ef5]">{signedReport.certificateSerialNumber}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{signedReport.signedAtLocalPYT}</div>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>FIRMA DIGITAL VÁLIDA (SHA-256)</span>
                </div>
              </div>

              {/* Signer details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131826] border border-slate-200 dark:border-[#222733] space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Datos del Firmante / Auditor</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{signedReport.signedBy.name}</div>
                  <div className="text-slate-500">Rol: <strong className="text-slate-700 dark:text-slate-300 uppercase">{signedReport.signedBy.role}</strong></div>
                  <div className="text-slate-500">Email: <strong className="text-slate-700 dark:text-slate-300">{signedReport.signedBy.email}</strong></div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131826] border border-slate-200 dark:border-[#222733] space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Entidad & Cuenta Auditada</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{signedReport.signedBy.company}</div>
                  <div className="text-slate-500">Banco: <strong className="text-slate-700 dark:text-slate-300">{signedReport.reconciliationSummary.bankName}</strong></div>
                  <div className="text-slate-500">Cuenta: <strong className="text-slate-700 dark:text-slate-300 font-mono">{signedReport.reconciliationSummary.accountNumber}</strong></div>
                </div>
              </div>

              {/* Reconciliation Breakdown */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#131826] border border-slate-200 dark:border-[#222733] space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#146ef5]" />
                  <span>Resumen Ejecutivo de Conciliación</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080808]">
                    <span className="text-[10px] text-slate-400 block uppercase">Total Transferencias</span>
                    <span className="font-mono font-bold text-sm">{signedReport.reconciliationSummary.totalInternalTransfers}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080808]">
                    <span className="text-[10px] text-slate-400 block uppercase">Conciliadas</span>
                    <span className="font-mono font-bold text-sm text-emerald-600">{signedReport.reconciliationSummary.matchedCount}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080808]">
                    <span className="text-[10px] text-slate-400 block uppercase">Pendientes Libros</span>
                    <span className="font-mono font-bold text-sm text-amber-600">{signedReport.reconciliationSummary.pendingTransfersCount}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080808]">
                    <span className="text-[10px] text-slate-400 block uppercase">Porcentaje</span>
                    <span className="font-mono font-bold text-sm text-[#146ef5]">{signedReport.reconciliationSummary.reconciliationPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Cryptographic SHA-256 Hash Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[10.5px] border border-slate-800 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-between">
                  <span>Hash Criptográfico de la Firma (SHA-256)</span>
                  <span className="text-emerald-400">Algoritmo: {signedReport.algorithm}</span>
                </div>
                <div className="p-2 bg-black/50 rounded-xl break-all text-[#00d2ff] select-all">
                  {signedReport.sha256Hash}
                </div>
                <div className="text-[9.5px] text-slate-400">
                  ID Firma: {signedReport.signatureId} · Timestamp UTC: {signedReport.signedAtIso}
                </div>
              </div>

              {/* Legal disclaimer */}
              <p className="text-[10px] text-slate-500 leading-relaxed italic text-center">
                {signedReport.legalNotice}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-[#222733] bg-slate-50 dark:bg-[#080808] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 bg-white dark:bg-[#181e2e] border border-slate-200 dark:border-[#222733] cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Certificado</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#146ef5] hover:bg-[#0f55d9] transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Dictamen JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
