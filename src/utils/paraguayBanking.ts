export interface ParaguayBankInfo {
  id: string;
  name: string;
  shortName: string;
  bic: string;
  color: string;
  tag: string;
  sipapCode: string;
}

// Strictly Paraguayan banks enabled in the system: Banco Itaú Paraguay and ueno bank
export const PARAGUAY_BANKS: ParaguayBankInfo[] = [
  {
    id: 'itau_py',
    name: 'Banco Itaú Paraguay S.A.',
    shortName: 'Banco Itaú',
    bic: 'ITAUPYASXXX',
    color: '#ec7000',
    tag: 'Líder Corporativo & SIPAP',
    sipapCode: '017',
  },
  {
    id: 'ueno_py',
    name: 'ueno bank S.A.',
    shortName: 'ueno bank',
    bic: 'UENOPYASXXX',
    color: '#00d26a',
    tag: 'Banca Digital & PYMEs Paraguay',
    sipapCode: '032',
  },
];

export function formatCurrencyParaguay(amount: number, currency: string = 'PYG'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return currency === 'PYG' ? 'Gs. 0' : '0,00 ' + currency;
  }

  if (currency === 'PYG') {
    // Guaraníes: no decimals, formatted with thousands periods in Paraguay
    const rounded = Math.round(amount);
    const formatted = Math.abs(rounded).toLocaleString('es-PY');
    const sign = amount < 0 ? '-' : '';
    return `${sign}Gs. ${formatted}`;
  }

  if (currency === 'USD') {
    return '$ ' + Number(amount).toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return Number(amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency;
}

export const SAMPLE_CAMT_ITAU_PARAGUAY = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>SIPAP-ITAU-2026-08-001</MsgId>
      <CreDtTm>2026-08-15T09:30:00</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>EXT-PYG-ITAU-2026-0815</Id>
      <Acct>
        <Id>
          <Othr>
            <Id>PY88017000000123456789</Id>
            <SchmeNm><Cd>BBAN</Cd></SchmeNm>
          </Othr>
        </Id>
        <Ccy>PYG</Ccy>
        <Nm>Cuenta Corriente PYME Comercial - Itaú</Nm>
        <Ownr>
          <Nm>AGROSERVICIOS DEL ESTE S.R.L. (RUC: 80095432-1)</Nm>
        </Ownr>
        <Svcr>
          <FinInstnId>
            <BIC>ITAUPYASXXX</BIC>
            <Nm>BANCO ITAÚ PARAGUAY S.A.</Nm>
            <PstlAdr><Ctry>PY</Ctry></PstlAdr>
          </FinInstnId>
        </Svcr>
      </Acct>
      <Bal>
        <Tp><CdOrPrtry><Cd>OPBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="PYG">145000000</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2026-08-01</Dt></Dt>
      </Bal>
      <Bal>
        <Tp><CdOrPrtry><Cd>CLBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="PYG">198750000</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2026-08-15</Dt></Dt>
      </Bal>
      
      <!-- Transacción 1: Cobro SIPAP Cliente -->
      <Ntry>
        <Amt Ccy="PYG">85000000</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt><Dt>2026-08-03</Dt></BookgDt>
        <ValDt><Dt>2026-08-03</Dt></ValDt>
        <AcctSvcrRef>SIPAP-TR-994821</AcctSvcrRef>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>SIPAP20260803-0982</EndToEndId>
              <InstrId>FAC-ELECT-2026-045</InstrId>
            </Refs>
            <RltdPties>
              <Dbtr>
                <Nm>COOPERATIVA COLONIAS UNIDAS LTDA (RUC: 80001234-5)</Nm>
              </Dbtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Pago Factura Electronica 001-002-0004512 Suministros Agricolas</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>

      <!-- Transacción 2: Pago Proveedor SIPAP -->
      <Ntry>
        <Amt Ccy="PYG">28500000</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt><Dt>2026-08-05</Dt></BookgDt>
        <ValDt><Dt>2026-08-05</Dt></ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>PROV-REPUESTOS-089</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr>
                <Nm>DIESEL &amp; TRACTORES PARAGUAY S.A. (RUC: 80045678-9)</Nm>
              </Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Transferencia Proveedor Repuestos Maquinaria Agricola</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>

      <!-- Transacción 3: Pago de Salarios / Nómina IPS -->
      <Ntry>
        <Amt Ccy="PYG">18200000</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt><Dt>2026-08-10</Dt></BookgDt>
        <ValDt><Dt>2026-08-10</Dt></ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>NOM-AGOSTO-2026</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr>
                <Nm>PAGO DE HABERES Y SALARIOS PLANILLA AGOSTO</Nm>
              </Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Acreditacion de Salarios Personal y Aporte Patronal</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>

      <!-- Transacción 4: Cobro Venta Minorista QR / POS -->
      <Ntry>
        <Amt Ccy="PYG">16000000</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt><Dt>2026-08-12</Dt></BookgDt>
        <ValDt><Dt>2026-08-12</Dt></ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>LIQ-POS-BANCARD-0812</EndToEndId>
            </Refs>
            <RltdPties>
              <Dbtr>
                <Nm>BANCARD S.A. - LIQUIDACION POS / QR</Nm>
              </Dbtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Liquidacion de Ventas Tarjetas y SIPAP QR Semana 32</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>

      <!-- Transacción 5: Comisión Mantenimiento Cuenta & SIPAP -->
      <Ntry>
        <Amt Ccy="PYG">550000</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt><Dt>2026-08-15</Dt></BookgDt>
        <ValDt><Dt>2026-08-15</Dt></ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>COM-BANCARIA-AGO26</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr>
                <Nm>BANCO ITAÚ PARAGUAY - COMISIONES Y GASTOS</Nm>
              </Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Comision mantenimiento de cuenta e IVA 10% operaciones SIPAP</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;

export const SAMPLE_CAMT_UENO_PARAGUAY = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>SIPAP-UENO-2026-08-088</MsgId>
      <CreDtTm>2026-08-16T11:45:00</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>EXT-PYG-UENO-2026-0816</Id>
      <Acct>
        <Id>
          <Othr>
            <Id>PY88032000000887766554</Id>
            <SchmeNm><Cd>BBAN</Cd></SchmeNm>
          </Othr>
        </Id>
        <Ccy>PYG</Ccy>
        <Nm>Cuenta PYME Digital ueno bank</Nm>
        <Ownr>
          <Nm>COMERCIAL &amp; DISTRIBUIDORA ASUNCIÓN S.A. (RUC: 80012456-3)</Nm>
        </Ownr>
        <Svcr>
          <FinInstnId>
            <BIC>UENOPYASXXX</BIC>
            <Nm>UENO BANK S.A.</Nm>
            <PstlAdr><Ctry>PY</Ctry></PstlAdr>
          </FinInstnId>
        </Svcr>
      </Acct>
      <Bal>
        <Tp><CdOrPrtry><Cd>OPBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="PYG">98400000</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2026-08-01</Dt></Dt>
      </Bal>
      <Bal>
        <Tp><CdOrPrtry><Cd>CLBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="PYG">162900000</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2026-08-16</Dt></Dt>
      </Bal>

      <!-- Transacción 1: Cobro Ventas E-Commerce / QR ueno -->
      <Ntry>
        <Amt Ccy="PYG">74500000</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt><Dt>2026-08-04</Dt></BookgDt>
        <ValDt><Dt>2026-08-04</Dt></ValDt>
        <AcctSvcrRef>UENO-QR-554109</AcctSvcrRef>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>UENO-SIPAP-20260804-01</EndToEndId>
            </Refs>
            <RltdPties>
              <Dbtr>
                <Nm>PAGOS DIGITALES DINELCO / UENO PAY</Nm>
              </Dbtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Acreditacion recaudacion transferencias SIPAP 24/7 y cobro QR</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>

      <!-- Transacción 2: Pago Proveedor Distribución -->
      <Ntry>
        <Amt Ccy="PYG">18000000</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt><Dt>2026-08-08</Dt></BookgDt>
        <ValDt><Dt>2026-08-08</Dt></ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>PROV-BEBIDAS-774</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr>
                <Nm>CERVECERIA PARAGUAYA S.A. (CERVEPAR)</Nm>
              </Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Transferencia Proveedor Factura 001-003-884102 Stock Mercaderias</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>

      <!-- Transacción 3: Alquiler Local Comercial Asunción -->
      <Ntry>
        <Amt Ccy="PYG">12000000</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt><Dt>2026-08-11</Dt></BookgDt>
        <ValDt><Dt>2026-08-11</Dt></ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>ALQ-LOCAL-ASU-AGO</EndToEndId>
            </Refs>
            <RltdPties>
              <Cdtr>
                <Nm>INMOBILIARIA DEL VALLE S.A.</Nm>
              </Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Pago Alquiler Salon Comercial Eje Corporativo Asuncion</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>

      <!-- Transacción 4: Cobro Distribución Mayorista -->
      <Ntry>
        <Amt Ccy="PYG">20000000</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt><Dt>2026-08-14</Dt></BookgDt>
        <ValDt><Dt>2026-08-14</Dt></ValDt>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>SIPAP-MAYORISTA-991</EndToEndId>
            </Refs>
            <RltdPties>
              <Dbtr>
                <Nm>SUPERMERCADOS REAL S.A. (RUC: 80004512-8)</Nm>
              </Dbtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>Abono Entrega Lote Alimentos Pedido Nro 4491</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;
