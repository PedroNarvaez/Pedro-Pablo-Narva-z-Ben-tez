import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Copy,
  Check,
  Tag,
  Building2,
  Calendar,
  CreditCard,
  FileSpreadsheet,
} from 'lucide-react';
import { CamtTransaction } from '../types';
import { formatMoney } from '../utils/exportUtils';

interface TransactionsTableProps {
  transactions: CamtTransaction[];
  currency: string;
  onFilterCounterparty?: string;
  onClearCounterpartyFilter?: () => void;
}

type SortColumn = 'fecha' | 'fechaValor' | 'monto' | 'tipo' | 'contra' | 'ref';
type SortDirection = 'asc' | 'desc';

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  currency,
  onFilterCounterparty,
  onClearCounterpartyFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [feeFilter, setFeeFilter] = useState<'all' | 'fees'>('all');
  const [sortCol, setSortCol] = useState<SortColumn>('fecha');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [openRowIds, setOpenRowIds] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toggle single row open/close
  const toggleRow = (id: number) => {
    setOpenRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logic
  const filteredList = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter === 'credit' && tx.monto < 0) return false;
      if (typeFilter === 'debit' && tx.monto >= 0) return false;

      // Fee filter
      if (feeFilter === 'fees' && !tx.esComision) return false;

      // Counterparty pre-filter
      if (onFilterCounterparty && tx.contra.toLowerCase() !== onFilterCounterparty.toLowerCase()) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const haystack = `${tx.fecha} ${tx.fechaValor} ${tx.contra} ${tx.ibanContra} ${tx.bicContra} ${tx.ref} ${tx.refEndToEnd} ${tx.refTx} ${tx.codBanco} ${tx.desc} ${tx.monto}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, feeFilter, onFilterCounterparty, searchTerm]);

  // Sort logic
  const sortedList = useMemo(() => {
    const list = [...filteredList];
    list.sort((a, b) => {
      let va = a[sortCol] as any;
      let vb = b[sortCol] as any;

      if (sortCol === 'monto') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }

      va = String(va || '').toLowerCase();
      vb = String(vb || '').toLowerCase();

      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredList, sortCol, sortDir]);

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const getSortIcon = (col: SortColumn) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#146ef5]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#146ef5]" />
    );
  };

  return (
    <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl overflow-hidden shadow-xs transition-colors">
      {/* Table Toolbar */}
      <div className="p-3.5 border-b border-slate-200 dark:border-[#222733] bg-slate-50/80 dark:bg-[#161b22]/60 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8b949e]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar transacción, titular, IBAN, referencia..."
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#080808] border border-slate-300 dark:border-[#30363d] rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#146ef5] focus:ring-1 focus:ring-[#146ef5]/40 transition-all font-sans"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-200 bg-slate-200 dark:bg-[#222733] px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type selector */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-white dark:bg-[#080808] border border-slate-300 dark:border-[#30363d] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#146ef5]"
          >
            <option value="all">Todos los tipos</option>
            <option value="credit">Solo Ingresos (Créditos)</option>
            <option value="debit">Solo Gastos (Débitos)</option>
          </select>

          {/* Fee selector */}
          <select
            value={feeFilter}
            onChange={(e) => setFeeFilter(e.target.value as any)}
            className="bg-white dark:bg-[#080808] border border-slate-300 dark:border-[#30363d] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#146ef5]"
          >
            <option value="all">Todos los conceptos</option>
            <option value="fees">Solo comisiones bancarias</option>
          </select>
        </div>

        {/* Counter and active tags */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#8b949e]">
          {onFilterCounterparty && (
            <span className="flex items-center gap-1 bg-[#146ef5]/10 text-[#146ef5] px-2.5 py-0.5 rounded-full border border-[#146ef5]/20 text-[11px] font-medium">
              <span>Filtro: {onFilterCounterparty}</span>
              <button
                type="button"
                onClick={onClearCounterpartyFilter}
                className="hover:text-red-500 font-bold ml-1 cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          <span className="font-mono font-medium">
            <span className="text-slate-900 dark:text-white font-bold">{sortedList.length}</span> de{' '}
            {transactions.length} movimientos
          </span>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100 dark:bg-[#080808] sticky top-0 z-10 text-[10px] font-bold text-slate-500 dark:text-[#8b949e] uppercase tracking-wider border-b border-slate-200 dark:border-[#222733]">
            <tr>
              <th
                onClick={() => handleSort('fecha')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Fecha</span>
                  {getSortIcon('fecha')}
                </div>
              </th>

              <th
                onClick={() => handleSort('fechaValor')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors select-none hidden sm:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Valor</span>
                  {getSortIcon('fechaValor')}
                </div>
              </th>

              <th
                onClick={() => handleSort('tipo')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Tipo</span>
                  {getSortIcon('tipo')}
                </div>
              </th>

              <th
                onClick={() => handleSort('monto')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors select-none text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Importe</span>
                  {getSortIcon('monto')}
                </div>
              </th>

              <th
                onClick={() => handleSort('contra')}
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Contraparte / Titular</span>
                  {getSortIcon('contra')}
                </div>
              </th>

              <th
                onClick={() => handleSort('ref')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors select-none hidden md:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Referencia</span>
                  {getSortIcon('ref')}
                </div>
              </th>

              <th className="py-3 px-3 text-center w-10">
                <span>Detalle</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-[#222733]">
            {sortedList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-[#8b949e]">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#146ef5]" />
                  <p className="font-semibold text-slate-800 dark:text-slate-200">No se encontraron transacciones</p>
                  <p className="text-[11px] mt-0.5">Prueba cambiando los filtros o el texto de búsqueda</p>
                </td>
              </tr>
            ) : (
              sortedList.map((tx) => {
                const isOpen = openRowIds.has(tx._id);
                const isCredit = tx.monto >= 0;

                return (
                  <React.Fragment key={tx._id}>
                    <tr
                      onClick={() => toggleRow(tx._id)}
                      className={`cursor-pointer transition-colors ${
                        isOpen
                          ? 'bg-[#146ef5]/5 dark:bg-[#161b22]'
                          : 'hover:bg-slate-50 dark:hover:bg-[#161b22]/50 odd:bg-transparent even:bg-slate-50/40 dark:even:bg-[#0c0f14]'
                      }`}
                    >
                      {/* Booking Date */}
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {tx.fecha || '—'}
                      </td>

                      {/* Value Date */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-[#8b949e] whitespace-nowrap hidden sm:table-cell">
                        {tx.fechaValor || tx.fecha || '—'}
                      </td>

                      {/* Movement Type Badge */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide font-mono ${
                            isCredit
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          }`}
                        >
                          {isCredit ? 'INGRESO' : 'GASTO'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-2.5 px-3.5 font-mono font-bold text-right whitespace-nowrap text-xs ${
                          isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isCredit ? '+' : ''}
                        {formatMoney(tx.monto, currency)}
                      </td>

                      {/* Counterparty & Fee Tag */}
                      <td className="py-2.5 px-3.5 max-w-[240px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="font-semibold text-slate-900 dark:text-slate-100 truncate block max-w-full"
                            title={tx.contra}
                          >
                            {tx.contra || (
                              <span className="text-slate-400 italic font-normal">
                                Sin contraparte
                              </span>
                            )}
                          </span>
                          {tx.esComision && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9.5px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                              comisión
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Reference */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-[#8b949e] max-w-[180px] truncate hidden md:table-cell">
                        {tx.ref || tx.refEndToEnd || '—'}
                      </td>

                      {/* Accordion Arrow */}
                      <td className="py-2.5 px-3 text-center text-slate-400">
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 mx-auto text-[#146ef5]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mx-auto opacity-60" />
                        )}
                      </td>
                    </tr>

                    {/* Expanded Detail Accordion */}
                    {isOpen && (
                      <tr className="bg-slate-50 dark:bg-[#080808]">
                        <td colSpan={7} className="p-4 border-t border-b border-slate-200 dark:border-[#222733]">
                          <div className="bg-white dark:bg-[#11141a] border border-slate-200 dark:border-[#222733] rounded-2xl p-4 space-y-3 shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#222733] pb-2.5 text-[11px]">
                              <span className="font-bold text-[#146ef5] flex items-center gap-1.5 font-mono">
                                <Tag className="w-3.5 h-3.5" />
                                Detalle Completo de Transacción (ISO 20022 XML)
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleCopy(
                                      JSON.stringify(tx, null, 2),
                                      `json-${tx._id}`,
                                      e
                                    )
                                  }
                                  className="text-[10.5px] text-slate-600 dark:text-[#8b949e] hover:text-[#146ef5] flex items-center gap-1 bg-slate-100 dark:bg-[#161b22] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#30363d] cursor-pointer"
                                >
                                  {copiedId === `json-${tx._id}` ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  <span>Copiar JSON</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                              {/* References */}
                              <div className="space-y-1.5 bg-slate-50 dark:bg-[#161b22] p-3 rounded-xl border border-slate-200 dark:border-[#222733]">
                                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#8b949e] font-mono">
                                  Referencias & Identificadores
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-[#8b949e]">Ref. EndToEnd:</span>
                                  <span className="font-mono text-slate-900 dark:text-white select-all font-semibold">
                                    {tx.refEndToEnd || '—'}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-[#8b949e]">Ref. Transacción:</span>
                                  <span className="font-mono text-slate-900 dark:text-white select-all">
                                    {tx.refTx || '—'}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-[#8b949e]">Referencia Libre:</span>
                                  <span className="font-mono text-slate-900 dark:text-white select-all">
                                    {tx.ref || '—'}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-[#8b949e]">Código (BkTxCd):</span>
                                  <span className="font-mono text-[#146ef5] font-bold">
                                    {tx.codBanco || '—'}
                                  </span>
                                </div>
                              </div>

                              {/* Party info */}
                              <div className="space-y-1.5 bg-slate-50 dark:bg-[#161b22] p-3 rounded-xl border border-slate-200 dark:border-[#222733]">
                                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#8b949e] font-mono">
                                  Contraparte & Datos Bancarios
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-[#8b949e]">Nombre / Razón:</span>
                                  <span className="text-slate-900 dark:text-white font-semibold">
                                    {tx.contra || 'No especificado'}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-[#8b949e]">IBAN Contraparte:</span>
                                  <span className="font-mono text-slate-900 dark:text-white select-all font-semibold">
                                    {tx.ibanContra || '—'}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-[#8b949e]">BIC / SWIFT:</span>
                                  <span className="font-mono text-[#146ef5]">
                                    {tx.bicContra || '—'}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-[#8b949e]">¿Comisión Bancaria?:</span>
                                  <span
                                    className={`font-semibold ${
                                      tx.esComision ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                                    }`}
                                  >
                                    {tx.esComision ? 'Sí (Detectada autom.)' : 'No'}
                                  </span>
                                </div>
                              </div>

                              {/* Amounts and Dates */}
                              <div className="space-y-1.5 bg-slate-50 dark:bg-[#161b22] p-3 rounded-xl border border-slate-200 dark:border-[#222733]">
                                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#8b949e] font-mono">
                                  Fechas & Valores Financieros
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-[#8b949e]">Fecha Contable:</span>
                                  <span className="font-mono text-slate-900 dark:text-white">{tx.fecha}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-[#8b949e]">Fecha Valor:</span>
                                  <span className="font-mono text-slate-900 dark:text-white">{tx.fechaValor}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-[#8b949e]">Moneda:</span>
                                  <span className="font-mono text-slate-900 dark:text-white font-bold">
                                    {tx.moneda}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500 dark:text-[#8b949e]">Importe Neto:</span>
                                  <span
                                    className={`font-mono font-bold ${
                                      isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                    }`}
                                  >
                                    {formatMoney(tx.monto, currency)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Full remittance text */}
                            <div className="bg-slate-50 dark:bg-[#080808] p-3 rounded-xl border border-slate-200 dark:border-[#222733]">
                              <div className="text-[10px] font-bold text-slate-500 dark:text-[#8b949e] uppercase mb-1 font-mono">
                                Concepto / Texto de Remesa (RmtInf / Ustrd)
                              </div>
                              <p className="text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed select-all">
                                {tx.desc || (
                                  <span className="text-slate-400 italic font-sans">
                                    Sin información de remesa adicional en el XML
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
