import { SAMPLE_CAMT_ITAU_PARAGUAY, SAMPLE_CAMT_UENO_PARAGUAY } from './paraguayBanking';

export interface SampleFile {
  name: string;
  description: string;
  bank: string;
  xml: string;
  currency: string;
}

export const SAMPLE_CAMT_FILES: SampleFile[] = [
  {
    name: 'extracto_camt053_itau_paraguay_pyme_2026.xml',
    description: 'Extracto mensual SIPAP en Guaraníes (Gs.), cobranzas electrónicas, nómina y proveedores (100% Conforme XSD)',
    bank: 'Banco Itaú Paraguay',
    currency: 'PYG',
    xml: SAMPLE_CAMT_ITAU_PARAGUAY,
  },
  {
    name: 'extracto_camt053_ueno_bank_digital_2026.xml',
    description: 'Extracto bancario digital en Guaraníes (Gs.), liquidación QR, transferencias 24/7 y comercio (100% Conforme XSD)',
    bank: 'ueno bank',
    currency: 'PYG',
    xml: SAMPLE_CAMT_UENO_PARAGUAY,
  },
  {
    name: 'extracto_camt053_con_advertencias_estructura.xml',
    description: 'Archivo de prueba con advertencias de estructura XSD (Falta MsgId en cabecera y fechas sin hora UTC) para probar el validador',
    bank: 'Banco de Prueba (Alerta XSD)',
    currency: 'PYG',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <GrpHdr>
      <!-- Falta MsgId obligatorio en XSD -->
      <CreDtTm>2026-03-31</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>STMT-2026-WARN-01</Id>
      <Acct>
        <Id>
          <Othr>
            <Id>0981999888</Id>
          </Othr>
        </Id>
        <Ccy>PYG</Ccy>
        <Nm>Comercial San Lorenzo SRL</Nm>
        <Svcr>
          <FinInstnId>
            <BIC>PRTESTPY</BIC>
            <Nm>Banco de Prueba Test PY</Nm>
          </FinInstnId>
        </Svcr>
      </Acct>
      <FrToDt>
        <FrDtTm>2026-03-01</FrDtTm>
        <ToDtTm>2026-03-31</ToDtTm>
      </FrToDt>
      <Bal>
        <Tp><CdOrPrtry><Cd>OPBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="PYG">15000000.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2026-03-01</Dt></Dt>
      </Bal>
      <Ntry>
        <Amt Ccy="PYG">4500000.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt><Dt>2026-03-15</Dt></BookgDt>
        <NtryDtls>
          <TxDtls>
            <Refs><EndToEndId>VENTA-9901</EndToEndId></Refs>
            <RltdPties>
              <Dbtr><Nm>Cliente Mostrador Asunción</Nm></Dbtr>
            </RltdPties>
            <RmtInf><Ustrd>Cobro Factura 001-002-9901</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Bal>
        <Tp><CdOrPrtry><Cd>CLBD</Cd></CdOrPrtry></Tp>
        <Amt Ccy="PYG">19500000.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt><Dt>2026-03-31</Dt></Dt>
      </Bal>
    </Stmt>
  </BkToCstmrStmt>
</Document>`,
  },
];
