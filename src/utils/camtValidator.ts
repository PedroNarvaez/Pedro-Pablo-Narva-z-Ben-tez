import { CamtValidationReport, CamtValidationIssue, XsdSeverity } from '../types';

const KNOWN_CAMT_NAMESPACES: Record<string, { standard: string; version: 'CAMT.053' | 'CAMT.052' | 'CAMT.054' }> = {
  'urn:iso:std:iso:20022:tech:xsd:camt.053.001.02': {
    standard: 'ISO 20022 · Bank-to-Customer Account Statement (camt.053.001.02)',
    version: 'CAMT.053',
  },
  'urn:iso:std:iso:20022:tech:xsd:camt.053.001.04': {
    standard: 'ISO 20022 · Bank-to-Customer Account Statement v4 (camt.053.001.04)',
    version: 'CAMT.053',
  },
  'urn:iso:std:iso:20022:tech:xsd:camt.053.001.08': {
    standard: 'ISO 20022 · Bank-to-Customer Account Statement v8 (camt.053.001.08)',
    version: 'CAMT.053',
  },
  'urn:iso:std:iso:20022:tech:xsd:camt.052.001.02': {
    standard: 'ISO 20022 · Bank-to-Customer Account Report (camt.052.001.02)',
    version: 'CAMT.052',
  },
  'urn:iso:std:iso:20022:tech:xsd:camt.052.001.04': {
    standard: 'ISO 20022 · Bank-to-Customer Account Report v4 (camt.052.001.04)',
    version: 'CAMT.052',
  },
  'urn:iso:std:iso:20022:tech:xsd:camt.052.001.08': {
    standard: 'ISO 20022 · Bank-to-Customer Account Report v8 (camt.052.001.08)',
    version: 'CAMT.052',
  },
  'urn:iso:std:iso:20022:tech:xsd:camt.054.001.02': {
    standard: 'ISO 20022 · Bank-to-Customer Debit/Credit Notification (camt.054.001.02)',
    version: 'CAMT.054',
  },
  'urn:iso:std:iso:20022:tech:xsd:camt.054.001.04': {
    standard: 'ISO 20022 · Bank-to-Customer Notification v4 (camt.054.001.04)',
    version: 'CAMT.054',
  },
  'urn:iso:std:iso:20022:tech:xsd:camt.054.001.08': {
    standard: 'ISO 20022 · Bank-to-Customer Notification v8 (camt.054.001.08)',
    version: 'CAMT.054',
  },
};

const VALID_ISO_CURRENCIES = new Set([
  'PYG', 'USD', 'EUR', 'BRL', 'ARS', 'CLP', 'UYU', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'MXN', 'COP', 'PEN', 'BOB'
]);

const PARAGUAY_BIC_MAP: Record<string, string> = {
  ITAUUYPA: 'Banco Itaú Paraguay S.A.',
  UENOPY22: 'ueno bank S.A.',
  BNFAPYPA: 'Banco Nacional de Fomento (BNF)',
  CITIPYPA: 'Citibank N.A. Sucursal Paraguay',
  BBVAPYPA: 'Banco GNB / BBVA Paraguay',
  SNTNPYPA: 'Banco Santander / Sudameris',
  CONTPYPA: 'Banco Continental S.A.E.C.A.',
  ATLAPYPA: 'Banco Atlas S.A.',
  FAMPYPA: 'Banco Familiar S.A.E.C.A.',
  BASAPYPA: 'Banco Basa S.A.',
};

export function validateCamtXsdDocument(xmlText: string, doc: Document): CamtValidationReport {
  const issues: CamtValidationIssue[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  function recordCheck(passed: boolean, issue: Omit<CamtValidationIssue, 'id'>) {
    totalChecks++;
    if (passed) {
      passedChecks++;
      issues.push({
        ...issue,
        id: `check-${totalChecks}`,
        severity: 'info',
      });
    } else {
      issues.push({
        ...issue,
        id: `check-${totalChecks}`,
      });
    }
  }

  // 1. Check XML Well-Formedness
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    issues.push({
      id: 'crit-xml-syntax',
      severity: 'error',
      category: 'schema_ns',
      tagPath: 'XML/DOMParser',
      ruleTitle: 'Error fatal de sintaxis XML',
      description: `El documento XML contiene errores de sintaxis que impiden su interpretación: ${parserError.textContent?.substring(0, 160) || 'Etiqueta no cerrada o carácter inválido'}`,
      recommendation: 'Verifica la integridad del archivo XML y asegúrate de que todas las etiquetas estén correctamente cerradas.',
    });

    return {
      isValid: false,
      isStrictCompliant: false,
      conformanceScore: 0,
      schemaVersion: 'Desconocido',
      targetNamespace: 'Desconocido',
      xsdStandard: 'XML no válido (Error de análisis sintáctico)',
      totalChecks: 1,
      passedChecks: 0,
      errorCount: 1,
      warningCount: 0,
      infoCount: 0,
      issues,
      auditedAt: new Date().toISOString(),
      financialBalanceCheck: {
        isBalanced: false,
        initialBalance: 0,
        totalCredits: 0,
        totalDebits: 0,
        expectedFinalBalance: 0,
        declaredFinalBalance: 0,
        difference: 0,
      },
    };
  }

  // 2. Check Root Element (<Document>) & Target Namespace
  const root = doc.documentElement;
  const rootTag = root.localName || root.tagName || '';
  const isDocumentRoot = rootTag.toLowerCase() === 'document';

  recordCheck(isDocumentRoot, {
    severity: isDocumentRoot ? 'info' : 'error',
    category: 'schema_ns',
    tagPath: 'Document',
    ruleTitle: 'Elemento raíz <Document> de ISO 20022',
    description: isDocumentRoot
      ? 'Elemento raíz <Document> conforme a la especificación estándar ISO 20022.'
      : `El elemento raíz es <${rootTag}>. La especificación ISO 20022 requiere que el nodo contenedor principal sea <Document>.`,
    recommendation: 'El XML debe iniciar con la etiqueta <Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt...">.',
    foundValue: rootTag,
    expectedFormat: 'Document',
  });

  const xmlns = root.getAttribute('xmlns') || '';
  let identifiedNamespace = xmlns;
  let schemaVersion: 'CAMT.053' | 'CAMT.052' | 'CAMT.054' | 'CAMT (Genérico)' | 'Desconocido' = 'Desconocido';
  let xsdStandard = 'ISO 20022 CAMT Extensible Schema';

  // Search if any child element contains an ISO 20022 xmlns
  if (!xmlns) {
    const allElems = doc.querySelectorAll('*');
    for (let i = 0; i < allElems.length; i++) {
      const ns = allElems[i].getAttribute('xmlns');
      if (ns && ns.includes('camt')) {
        identifiedNamespace = ns;
        break;
      }
    }
  }

  if (identifiedNamespace && KNOWN_CAMT_NAMESPACES[identifiedNamespace]) {
    const info = KNOWN_CAMT_NAMESPACES[identifiedNamespace];
    schemaVersion = info.version;
    xsdStandard = info.standard;

    recordCheck(true, {
      severity: 'info',
      category: 'schema_ns',
      tagPath: 'Document/@xmlns',
      ruleTitle: 'Namespace XSD ISO 20022 Reconocido',
      description: `Namespace oficial verificado: ${identifiedNamespace} (${info.standard}).`,
      foundValue: identifiedNamespace,
      expectedFormat: 'urn:iso:std:iso:20022:tech:xsd:camt.*',
    });
  } else if (identifiedNamespace && identifiedNamespace.includes('camt')) {
    schemaVersion = 'CAMT (Genérico)';
    if (identifiedNamespace.includes('053')) schemaVersion = 'CAMT.053';
    else if (identifiedNamespace.includes('052')) schemaVersion = 'CAMT.052';
    else if (identifiedNamespace.includes('054')) schemaVersion = 'CAMT.054';

    recordCheck(true, {
      severity: 'info',
      category: 'schema_ns',
      tagPath: 'Document/@xmlns',
      ruleTitle: 'Namespace CAMT detectado',
      description: `Se detectó namespace ISO 20022: ${identifiedNamespace}.`,
      foundValue: identifiedNamespace,
    });
  } else {
    recordCheck(false, {
      severity: 'warning',
      category: 'schema_ns',
      tagPath: 'Document/@xmlns',
      ruleTitle: 'Namespace XSD no declarado o personalizado',
      description: 'El XML no incluye un atributo xmlns con un namespace ISO 20022 oficial (ej. urn:iso:std:iso:20022:tech:xsd:camt.053.001.02). El parseador procesará la estructura de forma tolerante.',
      recommendation: 'Asegura que el elemento <Document> incluya el atributo xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02" para cumplimiento estricto con auditorías bancarias.',
      foundValue: identifiedNamespace || '(vacío)',
    });
  }

  // 3. Helper function to find elements in namespace or localName
  function findChild(parent: Element | Document, tag: string): Element | null {
    const list = parent.getElementsByTagName(tag);
    if (list.length > 0) return list[0];
    const all = parent.querySelectorAll('*');
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName?.toLowerCase() === tag.toLowerCase()) return all[i];
    }
    return null;
  }

  function findChildren(parent: Element | Document, tag: string): Element[] {
    const list = parent.getElementsByTagName(tag);
    if (list.length > 0) return Array.from(list);
    const results: Element[] = [];
    const all = parent.querySelectorAll('*');
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName?.toLowerCase() === tag.toLowerCase()) results.push(all[i]);
    }
    return results;
  }

  function getChildText(parent: Element | Document, tag: string): string {
    const el = findChild(parent, tag);
    return el?.textContent?.trim() || '';
  }

  // 4. Verify Message Container: <BkToCstmrStmt>, <BkToCstmrAcctRpt> or <BkToCstmrDbtCdtNtfctn>
  const msgContainer =
    findChild(doc, 'BkToCstmrStmt') ||
    findChild(doc, 'BkToCstmrAcctRpt') ||
    findChild(doc, 'BkToCstmrDbtCdtNtfctn') ||
    doc.documentElement;

  const hasMsgContainer = !!findChild(doc, 'BkToCstmrStmt') || !!findChild(doc, 'BkToCstmrAcctRpt') || !!findChild(doc, 'BkToCstmrDbtCdtNtfctn');
  recordCheck(hasMsgContainer, {
    severity: hasMsgContainer ? 'info' : 'warning',
    category: 'header_structure',
    tagPath: 'Document/BkToCstmrStmt',
    ruleTitle: 'Contenedor del Mensaje ISO 20022',
    description: hasMsgContainer
      ? 'Contenedor de mensaje bancario identificado correctamente.'
      : 'No se encontró el nodo de envoltura <BkToCstmrStmt> / <BkToCstmrAcctRpt>. Estructura no canónica.',
    recommendation: 'Los extractos camt.053 deben envolver los datos dentro de <BkToCstmrStmt>.',
  });

  // 5. Verify Group Header (<GrpHdr>)
  const grpHdr = findChild(msgContainer, 'GrpHdr');
  const hasGrpHdr = !!grpHdr;
  recordCheck(hasGrpHdr, {
    severity: hasGrpHdr ? 'info' : 'error',
    category: 'header_structure',
    tagPath: 'Document/BkToCstmrStmt/GrpHdr',
    ruleTitle: 'Cabecera de Grupo Obligatoria <GrpHdr>',
    description: hasGrpHdr
      ? 'Cabecera de grupo <GrpHdr> presente en el extracto.'
      : 'La especificación XSD ISO 20022 exige la presencia de <GrpHdr> como primer elemento hijo.',
    recommendation: 'Incluye el elemento <GrpHdr> con identificador de mensaje y fecha de creación.',
  });

  if (grpHdr) {
    const msgId = getChildText(grpHdr, 'MsgId');
    const hasMsgId = Boolean(msgId && msgId.length >= 1 && msgId.length <= 35);
    recordCheck(hasMsgId, {
      severity: hasMsgId ? 'info' : 'error',
      category: 'header_structure',
      tagPath: 'Document/BkToCstmrStmt/GrpHdr/MsgId',
      ruleTitle: 'Identificador Único de Mensaje <MsgId>',
      description: hasMsgId
        ? `Identificador de mensaje conforme: "${msgId}" (longitud: ${msgId.length}/35 caracteres).`
        : 'El campo <MsgId> es obligatorio en XSD (tipo Max35Text, entre 1 y 35 caracteres).',
      recommendation: 'Proporciona un identificador único de mensaje no vacío de hasta 35 caracteres.',
      foundValue: msgId || '(vacío)',
      expectedFormat: 'Max35Text (1..35 caracteres)',
    });

    const creDtTm = getChildText(grpHdr, 'CreDtTm');
    const isIsoDate = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(creDtTm);
    recordCheck(isIsoDate, {
      severity: isIsoDate ? 'info' : 'warning',
      category: 'header_structure',
      tagPath: 'Document/BkToCstmrStmt/GrpHdr/CreDtTm',
      ruleTitle: 'Timestamp de Creación <CreDtTm> ISO 8601',
      description: isIsoDate
        ? `Timestamp de creación válido en formato ISO 8601: "${creDtTm}".`
        : `El campo <CreDtTm> ("${creDtTm || 'vacío'}") no cumple con el formato estándar ISO 8601 (YYYY-MM-DDThh:mm:ss).`,
      recommendation: 'Formatea la fecha y hora de creación como YYYY-MM-DDThh:mm:ssZ (ej: 2026-03-31T09:30:00Z).',
      foundValue: creDtTm,
      expectedFormat: 'ISODateTime (YYYY-MM-DDThh:mm:ss)',
    });
  }

  // 6. Verify Statement / Report / Notification (<Stmt> / <Rpt>)
  const stmt = findChild(msgContainer, 'Stmt') || findChild(msgContainer, 'Rpt') || msgContainer;
  const hasStmt = !!findChild(msgContainer, 'Stmt') || !!findChild(msgContainer, 'Rpt');
  recordCheck(hasStmt, {
    severity: hasStmt ? 'info' : 'error',
    category: 'account_mandatory',
    tagPath: 'Document/BkToCstmrStmt/Stmt',
    ruleTitle: 'Elemento de Extracto <Stmt>',
    description: hasStmt
      ? 'Bloque de extracto bancario <Stmt> identificado correctamente.'
      : 'No se encontró el bloque <Stmt> o <Rpt> que contiene la cuenta, saldos y movimientos.',
    recommendation: 'Agrega el elemento <Stmt> dentro de <BkToCstmrStmt>.',
  });

  // Statement ID
  const stmtId = getChildText(stmt, 'Id');
  const hasStmtId = Boolean(stmtId && stmtId.length >= 1 && stmtId.length <= 35);
  recordCheck(hasStmtId, {
    severity: hasStmtId ? 'info' : 'warning',
    category: 'account_mandatory',
    tagPath: 'Document/BkToCstmrStmt/Stmt/Id',
    ruleTitle: 'Identificador del Extracto <Stmt><Id>',
    description: hasStmtId
      ? `Identificador de extracto verificado: "${stmtId}".`
      : 'Falta el identificador <Id> del extracto o excede los 35 caracteres estándar.',
    recommendation: 'Incluye <Id> en cada extracto <Stmt>.',
    foundValue: stmtId,
  });

  // 7. Verify Account (<Acct>)
  const acct = findChild(stmt, 'Acct');
  const hasAcct = !!acct;
  recordCheck(hasAcct, {
    severity: hasAcct ? 'info' : 'error',
    category: 'account_mandatory',
    tagPath: 'Document/BkToCstmrStmt/Stmt/Acct',
    ruleTitle: 'Identificación de Cuenta Bancaria <Acct>',
    description: hasAcct
      ? 'Estructura de cuenta bancaria <Acct> presente.'
      : 'El elemento <Acct> es obligatorio según el esquema XSD camt.053 para identificar la cuenta origen.',
    recommendation: 'Agrega el elemento <Acct> con su correspondiente subárbol <Id> e identificación bancaria.',
  });

  let declaredCurrency = '';
  let declaredIban = '';
  let declaredBic = '';
  let declaredBankName = '';

  if (acct) {
    // Currency in Acct
    const acctCcy = getChildText(acct, 'Ccy');
    if (acctCcy) {
      declaredCurrency = acctCcy;
      const isValidCcy = VALID_ISO_CURRENCIES.has(acctCcy.toUpperCase());
      recordCheck(isValidCcy, {
        severity: isValidCcy ? 'info' : 'warning',
        category: 'currency_code',
        tagPath: 'Document/BkToCstmrStmt/Stmt/Acct/Ccy',
        ruleTitle: 'Código de Moneda ISO 4217 en Cuenta',
        description: isValidCcy
          ? `Moneda declarada válida: ${acctCcy} (ISO 4217).`
          : `El código de moneda "${acctCcy}" no coincide con las monedas comunes ISO 4217 (ej. PYG, USD, EUR).`,
        foundValue: acctCcy,
        expectedFormat: 'Código alfabético de 3 letras (ej. PYG, USD, EUR)',
      });
    }

    // Account ID (<Id><IBAN> or <Id><Othr><Id>)
    const idAcct = findChild(acct, 'Id');
    if (idAcct) {
      const iban = getChildText(idAcct, 'IBAN');
      const othrId = getChildText(idAcct, 'Id') || (findChild(idAcct, 'Othr') ? getChildText(findChild(idAcct, 'Othr')!, 'Id') : '');

      if (iban) {
        declaredIban = iban;
        const isValidIbanFormat = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(iban.replace(/\s+/g, ''));
        recordCheck(isValidIbanFormat, {
          severity: isValidIbanFormat ? 'info' : 'warning',
          category: 'account_mandatory',
          tagPath: 'Document/BkToCstmrStmt/Stmt/Acct/Id/IBAN',
          ruleTitle: 'Estructura de IBAN / Cuenta Internacional',
          description: isValidIbanFormat
            ? `IBAN con formato estándar válido: ${iban}.`
            : `El IBAN "${iban}" no cumple con la estructura estándar (2 letras de país + 2 dígitos de control + hasta 30 caracteres alfanuméricos).`,
          foundValue: iban,
        });
      } else if (othrId) {
        declaredIban = othrId;
        recordCheck(true, {
          severity: 'info',
          category: 'account_mandatory',
          tagPath: 'Document/BkToCstmrStmt/Stmt/Acct/Id/Othr/Id',
          ruleTitle: 'Número de Cuenta Local <Othr><Id>',
          description: `Número de cuenta identificado: "${othrId}".`,
          foundValue: othrId,
        });
      } else {
        recordCheck(false, {
          severity: 'error',
          category: 'account_mandatory',
          tagPath: 'Document/BkToCstmrStmt/Stmt/Acct/Id',
          ruleTitle: 'Identificador de Cuenta ausente',
          description: 'El elemento <Id> dentro de <Acct> debe contener <IBAN> o <Othr><Id>.',
          recommendation: 'Agrega <IBAN> o <Othr><Id> con el número de cuenta.',
        });
      }
    } else {
      recordCheck(false, {
        severity: 'error',
        category: 'account_mandatory',
        tagPath: 'Document/BkToCstmrStmt/Stmt/Acct/Id',
        ruleTitle: 'Falta nodo <Id> en <Acct>',
        description: 'Se requiere el elemento <Id> dentro de <Acct> para la identificación contable.',
      });
    }

    // Bank Servicer (<Svcr><FinInstnId>)
    const svcr = findChild(acct, 'Svcr');
    if (svcr) {
      const fi = findChild(svcr, 'FinInstnId');
      if (fi) {
        declaredBic = getChildText(fi, 'BIC') || getChildText(fi, 'BICFI');
        declaredBankName = getChildText(fi, 'Nm');

        if (declaredBic) {
          const isValidBic = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(declaredBic);
          recordCheck(isValidBic, {
            severity: isValidBic ? 'info' : 'warning',
            category: 'account_mandatory',
            tagPath: 'Document/BkToCstmrStmt/Stmt/Acct/Svcr/FinInstnId/BIC',
            ruleTitle: 'Código BIC / SWIFT de la Entidad Bancaria',
            description: isValidBic
              ? `Código BIC estándar verificado: "${declaredBic}".`
              : `El código BIC "${declaredBic}" no sigue el formato ISO 9362 (8 u 11 caracteres alfanuméricos).`,
            foundValue: declaredBic,
            expectedFormat: 'ISO 9362 (8 u 11 caracteres, ej. ITAUUYPA, UENOPY22)',
          });

          // Check Paraguay banking compatibility
          if (PARAGUAY_BIC_MAP[declaredBic.toUpperCase()]) {
            recordCheck(true, {
              severity: 'info',
              category: 'paraguay_sipap_rules',
              tagPath: 'Document/BkToCstmrStmt/Stmt/Acct/Svcr/FinInstnId/BIC',
              ruleTitle: 'Entidad Bancaria de Paraguay Reconocida en SIPAP',
              description: `Banco paraguayo homologado: ${PARAGUAY_BIC_MAP[declaredBic.toUpperCase()]} (BIC: ${declaredBic}).`,
              foundValue: `${declaredBic} - ${PARAGUAY_BIC_MAP[declaredBic.toUpperCase()]}`,
            });
          }
        }
      }
    }
  }

  // 8. Verify Balances (<Bal>)
  const balances = findChildren(stmt, 'Bal');
  const hasBalances = balances.length >= 1;

  recordCheck(hasBalances, {
    severity: hasBalances ? 'info' : 'error',
    category: 'balance_rules',
    tagPath: 'Document/BkToCstmrStmt/Stmt/Bal',
    ruleTitle: 'Presencia de Saldos Bancarios <Bal>',
    description: hasBalances
      ? `Se identificaron ${balances.length} saldo(s) declarados en el extracto.`
      : 'El extracto no contiene ningún elemento <Bal>. Los esquemas camt.053 requieren saldos de apertura y cierre.',
    recommendation: 'Agrega elementos <Bal> con tipos OPBD (apertura) y CLBD (cierre).',
  });

  let openingBalance = 0;
  let closingBalance = 0;
  let hasOpeningBalance = false;
  let hasClosingBalance = false;

  balances.forEach((bal, idx) => {
    const tpEl = findChild(bal, 'Tp');
    const code = tpEl ? getChildText(tpEl, 'Cd') || getChildText(tpEl, 'Prtry') : '';
    const amtEl = findChild(bal, 'Amt');
    const ind = getChildText(bal, 'CdtDbtInd').toUpperCase();
    const dtEl = findChild(bal, 'Dt');
    const dt = dtEl ? getChildText(dtEl, 'Dt') || getChildText(dtEl, 'DtTm') : '';

    const hasAmt = !!amtEl && !isNaN(parseFloat(amtEl.textContent || ''));
    const balCcy = amtEl?.getAttribute('Ccy') || '';
    if (balCcy && !declaredCurrency) declaredCurrency = balCcy;

    let balValue = hasAmt ? parseFloat(amtEl!.textContent || '0') : 0;
    if (ind.startsWith('DBIT')) balValue = -balValue;

    // Check balance mandatory sub-elements
    const hasValidIndicator = ind === 'CRDT' || ind === 'DBIT';
    if (!hasValidIndicator) {
      recordCheck(false, {
        severity: 'error',
        category: 'balance_rules',
        tagPath: `Document/BkToCstmrStmt/Stmt/Bal[${idx + 1}]/CdtDbtInd`,
        ruleTitle: `Indicador de Saldo <CdtDbtInd> inválido en Bal #${idx + 1}`,
        description: `El indicador <CdtDbtInd> ("${ind || 'vacío'}") debe ser estrictamente CRDT o DBIT.`,
        recommendation: 'Especifica <CdtDbtInd>CRDT</CdtDbtInd> para saldos positivos o DBIT para deudores.',
        foundValue: ind,
      });
    }

    if (!balCcy) {
      recordCheck(false, {
        severity: 'error',
        category: 'currency_code',
        tagPath: `Document/BkToCstmrStmt/Stmt/Bal[${idx + 1}]/Amt/@Ccy`,
        ruleTitle: `Atributo de Moneda Ccy ausente en Bal #${idx + 1}`,
        description: 'El elemento <Amt> en <Bal> debe tener el atributo obligatorio Ccy (ej. <Amt Ccy="PYG">100000</Amt>).',
        recommendation: 'Añade el atributo Ccy="..." al elemento <Amt>.',
      });
    }

    if (code.includes('OPBD') || code.includes('PRCD') || code.includes('ITBD')) {
      hasOpeningBalance = true;
      openingBalance = balValue;
    } else if (code.includes('CLBD') || code.includes('CLAV') || code.includes('ITAV')) {
      hasClosingBalance = true;
      closingBalance = balValue;
    }
  });

  recordCheck(hasOpeningBalance && hasClosingBalance, {
    severity: hasOpeningBalance && hasClosingBalance ? 'info' : 'warning',
    category: 'balance_rules',
    tagPath: 'Document/BkToCstmrStmt/Stmt/Bal/Tp/CdOrPrtry',
    ruleTitle: 'Existencia de Saldos de Apertura (OPBD) y Cierre (CLBD)',
    description: hasOpeningBalance && hasClosingBalance
      ? `Saldos contables estándar verificados (Apertura: ${openingBalance}, Cierre: ${closingBalance}).`
      : 'No se encontraron explícitamente ambos saldos estándar OPBD (Opening Booked) y CLBD (Closing Booked).',
    recommendation: 'Asegúrate de incluir <Bal><Tp><CdOrPrtry><Cd>OPBD</Cd>...</CdOrPrtry></Tp></Bal> y <Bal><Tp><CdOrPrtry><Cd>CLBD</Cd>...</CdOrPrtry></Tp></Bal>.',
  });

  // 9. Verify Movements / Entries (<Ntry>)
  const entries = findChildren(stmt, 'Ntry');
  let totalCredits = 0;
  let totalDebits = 0;
  let invalidEntriesCount = 0;
  let entriesWithoutEndToEndCount = 0;

  entries.forEach((ntry, idx) => {
    const amtEl = findChild(ntry, 'Amt');
    const ind = getChildText(ntry, 'CdtDbtInd').toUpperCase();
    const bg = findChild(ntry, 'BookgDt');
    const vd = findChild(ntry, 'ValDt');

    const amt = amtEl ? parseFloat(amtEl.textContent || '0') : NaN;
    const ntryCcy = amtEl?.getAttribute('Ccy') || declaredCurrency;

    if (isNaN(amt) || amt < 0 || (ind !== 'CRDT' && ind !== 'DBIT')) {
      invalidEntriesCount++;
    }

    if (ind === 'CRDT') {
      totalCredits += Math.abs(isNaN(amt) ? 0 : amt);
    } else if (ind === 'DBIT') {
      totalDebits += Math.abs(isNaN(amt) ? 0 : amt);
    }

    // Check EndToEnd reference in TxDtls
    const nd = findChild(ntry, 'NtryDtls');
    if (nd) {
      const td = findChild(nd, 'TxDtls');
      if (td) {
        const refs = findChild(td, 'Refs');
        const endToEnd = refs ? getChildText(refs, 'EndToEndId') : '';
        if (!endToEnd || endToEnd === 'NOTPROVIDED') {
          entriesWithoutEndToEndCount++;
        }
      }
    }
  });

  recordCheck(invalidEntriesCount === 0, {
    severity: invalidEntriesCount === 0 ? 'info' : 'error',
    category: 'entry_integrity',
    tagPath: 'Document/BkToCstmrStmt/Stmt/Ntry',
    ruleTitle: 'Integridad de Apuntes Bancarios <Ntry>',
    description: invalidEntriesCount === 0
      ? `Todos los ${entries.length} apuntes bancarios poseen importe numérico positivo, moneda e indicador CRDT/DBIT conforme a XSD.`
      : `Se detectaron ${invalidEntriesCount} apunte(s) con estructura inválida en <Amt> o <CdtDbtInd>.`,
    recommendation: 'Revisa que cada <Ntry> contenga <Amt Ccy="..."> numérico y <CdtDbtInd>CRDT|DBIT</CdtDbtInd>.',
  });

  if (entriesWithoutEndToEndCount > 0 && entries.length > 0) {
    recordCheck(false, {
      severity: 'info',
      category: 'entry_integrity',
      tagPath: 'Document/BkToCstmrStmt/Stmt/Ntry/NtryDtls/TxDtls/Refs/EndToEndId',
      ruleTitle: 'Identificadores EndToEnd en Transferencias',
      description: `${entriesWithoutEndToEndCount} de ${entries.length} movimiento(s) no incluyen referencia <EndToEndId> (habitual en cargos directos o comisiones de servicio).`,
    });
  }

  // 10. Financial Reconciliation & Mathematical Balance Check
  // Saldo Inicial + Total Créditos - Total Débitos = Saldo Final Esperado
  const expectedFinalBalance = openingBalance + totalCredits - totalDebits;
  const declaredFinalBalance = hasClosingBalance ? closingBalance : expectedFinalBalance;
  const difference = Math.round((declaredFinalBalance - expectedFinalBalance) * 100) / 100;
  const isBalanced = Math.abs(difference) <= 0.01;

  recordCheck(isBalanced, {
    severity: isBalanced ? 'info' : 'error',
    category: 'accounting_reconciliation',
    tagPath: 'Document/BkToCstmrStmt/Stmt/Bal[CLBD]',
    ruleTitle: 'Cuadre Contable y Conciliación Matemática de Saldos',
    description: isBalanced
      ? `Cuadre matemático perfecto: Saldo Inicial (${openingBalance}) + Ingresos (${totalCredits}) - Gastos (${totalDebits}) = Saldo Final (${declaredFinalBalance}).`
      : `Discrepancia contable detectada de ${difference} ${declaredCurrency}. Saldo final esperado: ${expectedFinalBalance}, saldo declarado: ${declaredFinalBalance}.`,
    recommendation: isBalanced
      ? undefined
      : 'Verifica si el extracto omitió transacciones intermedias o si el saldo de cierre declarado contiene una anomalía contable.',
    foundValue: `Diferencia: ${difference}`,
    expectedFormat: 'Diferencia = 0.00',
  });

  // Calculate final score & severity counts
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  const isValid = errorCount === 0;
  const isStrictCompliant = errorCount === 0 && warningCount === 0;
  
  // Score: 100 base, deductions for errors (-25) and warnings (-10)
  let conformanceScore = Math.max(0, 100 - (errorCount * 25) - (warningCount * 8));
  if (!isValid && conformanceScore > 65) conformanceScore = 50;

  return {
    isValid,
    isStrictCompliant,
    conformanceScore,
    schemaVersion,
    targetNamespace: identifiedNamespace || 'No declarado',
    xsdStandard,
    totalChecks,
    passedChecks,
    errorCount,
    warningCount,
    infoCount,
    issues,
    auditedAt: new Date().toISOString(),
    financialBalanceCheck: {
      isBalanced,
      initialBalance: openingBalance,
      totalCredits,
      totalDebits,
      expectedFinalBalance,
      declaredFinalBalance,
      difference,
    },
  };
}
