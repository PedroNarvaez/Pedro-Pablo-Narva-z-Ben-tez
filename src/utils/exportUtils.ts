import { CamtFile, CamtStatementData, CamtTransaction } from '../types';

export function formatMoney(val: number | undefined | null, currency: string = 'EUR'): string {
  if (val === undefined || val === null || isNaN(val)) return '—';
  const formatted = Number(val).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency === 'EUR' ? '€' : currency}`;
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function exportTransactionsToCSV(file: CamtFile) {
  const headers = [
    'Fecha Contabilización',
    'Fecha Valor',
    'Tipo Movimiento',
    'Importe Numérico',
    'Moneda',
    'Contraparte / Titular',
    'IBAN Contraparte',
    'BIC Contraparte',
    'Ref EndToEnd',
    'Ref Transacción',
    'Referencia Genérica',
    'Código Banco (BkTxCd)',
    'Concepto / Descripción',
    '¿Es Comisión / Cargo?',
  ];

  const rows = file.data.movimientos.map((tx: CamtTransaction) => [
    tx.fecha,
    tx.fechaValor,
    tx.tipo === 'CRDT' ? 'INGRESO' : 'GASTO',
    tx.monto.toFixed(2).replace('.', ','),
    tx.moneda,
    (tx.contra || '').replace(/"/g, '""'),
    tx.ibanContra || '',
    tx.bicContra || '',
    (tx.refEndToEnd || '').replace(/"/g, '""'),
    (tx.refTx || '').replace(/"/g, '""'),
    (tx.ref || '').replace(/"/g, '""'),
    tx.codBanco || '',
    (tx.desc || '').replace(/"/g, '""').replace(/\r?\n/g, ' '),
    tx.esComision ? 'SI' : 'NO',
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.map((h) => `"${h}"`).join(';'), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(';'))].join('\r\n');

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  downloadFile(csvContent, `${baseName}_transacciones_conciliapyme.csv`);
}

export function exportReportToCSV(file: CamtFile) {
  const d: CamtStatementData = file.data;
  const saldoNeto = d.totCredit - d.totDebit;

  const lines: string[] = [
    `"INFORME EJECUTIVO DE EXTRACTO BANCARIO ISO 20022"`,
    `"Generado por ConciliaPyme";"${new Date().toLocaleString('es-ES')}"`,
    `"Archivo Original";"${file.name}"`,
    `"Formato Detectado";"${d.schemaVersion || 'CAMT'}"`,
    ``,
    `"=== RESUMEN DE SALDOS Y MOVIMIENTOS ==="`,
    `"Entidad Bancaria";"${d.banco || 'No especificado'}"`,
    `"IBAN Cuenta";"${d.iban || d.cuenta || 'No especificado'}"`,
    `"BIC / SWIFT";"${d.bic || '—'}"`,
    `"Titular Cuenta";"${d.propietario || '—'}"`,
    `"Período del Extracto";"${d.fechaInicio} hasta ${d.fechaFin} (${d.diasPeriodo} días)"`,
    `"Moneda Principal";"${d.moneda}"`,
    `"Saldo Inicial";"${d.saldoInicial.toFixed(2).replace('.', ',')} €"`,
    `"Total Ingresos (Créditos)";"${d.totCredit.toFixed(2).replace('.', ',')} €"`,
    `"Total Gastos (Débitos)";"${d.totDebit.toFixed(2).replace('.', ',')} €"`,
    `"Saldo Neto del Período";"${saldoNeto.toFixed(2).replace('.', ',')} €"`,
    `"Saldo Final";"${d.saldoFinal.toFixed(2).replace('.', ',')} €"`,
    `"Total de Transacciones";"${d.movimientos.length}"`,
    `"Comisiones / Cargos Bancarios";"${d.comisiones} operaciones (${d.totalComisionesMonto.toFixed(2).replace('.', ',')} €)"`,
    `"Contrapartes Únicas";"${d.contrapartes.length}"`,
    ``,
    `"=== RANKING TOP CONTRAPARTES POR VOLUMEN ==="`,
    `"Contraparte";"Nº Operaciones";"Total Créditos (€)";"Total Débitos (€)";"Volumen Neto (€)"`,
  ];

  d.topContrapartes.forEach((cp) => {
    lines.push(
      `"${cp.nombre.replace(/"/g, '""')}";"${cp.count}";"${cp.creditoTotal.toFixed(2).replace('.', ',')}";"${cp.debitoTotal.toFixed(2).replace('.', ',')}";"${cp.total.toFixed(2).replace('.', ',')}"`
    );
  });

  if (d.comisiones > 0) {
    lines.push(``);
    lines.push(`"=== AUDITORÍA DE COMISIONES Y GASTOS BANCARIOS ==="`);
    lines.push(`"Fecha";"Importe (€)";"Referencia";"Concepto"`);
    d.movimientos
      .filter((m) => m.esComision)
      .forEach((fee) => {
        lines.push(
          `"${fee.fecha}";"${fee.monto.toFixed(2).replace('.', ',')}";"${(fee.ref || '').replace(/"/g, '""')}";"${(fee.desc || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`
        );
      });
  }

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  downloadFile(csvContent, `${baseName}_informe_ejecutivo_flujo.csv`);
}
