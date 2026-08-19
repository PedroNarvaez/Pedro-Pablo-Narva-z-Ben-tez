export interface CamtTransaction {
  _id: number;
  fecha: string;
  fechaValor: string;
  tipo: 'CRDT' | 'DBIT';
  monto: number;
  moneda: string;
  contra: string;
  ibanContra: string;
  bicContra: string;
  refEndToEnd: string;
  refTx: string;
  ref: string;
  codBanco: string;
  desc: string;
  esComision: boolean;
  categoria?: string;
}

export interface CounterpartySummary {
  nombre: string;
  total: number;
  count: number;
  tipoDominante: 'CRDT' | 'DBIT';
  creditoTotal: number;
  debitoTotal: number;
}

export type XsdSeverity = 'error' | 'warning' | 'info';

export interface CamtValidationIssue {
  id: string;
  severity: XsdSeverity;
  category:
    | 'schema_ns'
    | 'header_structure'
    | 'account_mandatory'
    | 'balance_rules'
    | 'entry_integrity'
    | 'accounting_reconciliation'
    | 'currency_code'
    | 'paraguay_sipap_rules';
  tagPath: string;
  ruleTitle: string;
  description: string;
  recommendation?: string;
  foundValue?: string;
  expectedFormat?: string;
}

export interface CamtValidationReport {
  isValid: boolean;
  isStrictCompliant: boolean;
  conformanceScore: number;
  schemaVersion: 'CAMT.053' | 'CAMT.052' | 'CAMT.054' | 'CAMT (Genérico)' | 'Desconocido';
  targetNamespace: string;
  xsdStandard: string;
  totalChecks: number;
  passedChecks: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: CamtValidationIssue[];
  auditedAt: string;
  financialBalanceCheck: {
    isBalanced: boolean;
    initialBalance: number;
    totalCredits: number;
    totalDebits: number;
    expectedFinalBalance: number;
    declaredFinalBalance: number;
    difference: number;
  };
}

export interface CamtStatementData {
  banco: string;
  bic: string;
  cuenta: string;
  iban: string;
  propietario: string;
  moneda: string;
  saldoInicial: number;
  saldoFinal: number;
  fechaInicio: string;
  fechaFin: string;
  diasPeriodo: number;
  movimientos: CamtTransaction[];
  totCredit: number;
  totDebit: number;
  comisiones: number;
  totalComisionesMonto: number;
  contrapartes: string[];
  topContrapartes: CounterpartySummary[];
  schemaVersion?: string;
  validation?: CamtValidationReport;
}

export interface CamtFile {
  id: string;
  name: string;
  size: number;
  raw: string;
  data: CamtStatementData;
  uploadDate: string;
  companyId?: string;
}

export interface FilterState {
  search: string;
  type: 'all' | 'credit' | 'debit';
  feeOnly: 'all' | 'fees';
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
}

export type UserRole = 'superadmin' | 'admin' | 'auditor' | 'tesorero' | 'operador';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'credentials' | 'google' | 'guest';
  role: UserRole;
  empresaId?: string;
  empresa?: string;
  pais?: string;
  active: boolean;
  createdAt: string;
}

export interface AppUserAccount extends UserProfile {
  passwordHash: string; // Plain/stored password for credentials validation
}

export interface CompanyProfile {
  id: string;
  nombre: string;
  ruc: string;
  rubro: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  email: string;
  bancoAsociado: 'Banco Itaú Paraguay' | 'ueno bank' | string;
  bic: string;
  nroCuenta: string;
  monedaPrincipal: 'PYG' | 'USD' | string;
  esActiva: boolean;
}

export type AppTheme = 'claro' | 'oscuro' | 'sistema';

export interface SystemChangelogEntry {
  id: string;
  fecha: string;
  version: string;
  titulo: string;
  descripcion: string;
  autor: string;
  tipo: 'mejora' | 'seguridad' | 'funcionalidad' | 'correccion';
}

export interface SystemInformation {
  nombreApp: string;
  subtitulo: string;
  version: string;
  licencia: string;
  descripcion: string;
  autorProyecto: string;
  institucion: string;
  normativa: string;
  bancosSoportados: string[];
  contactoComercial: string;
  telefonoSoporte: string;
  notasEmpresariales: string;
  changelog: SystemChangelogEntry[];
}

export type StorageProviderType = 'local' | 'supabase' | 'firebase' | 's3' | 'custom_api';

export interface StorageConfig {
  provider: StorageProviderType;
  supabaseUrl?: string;
  supabaseKey?: string;
  supabaseBucket?: string;
  s3Endpoint?: string;
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  firebaseApiKey?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  customApiUrl?: string;
  customApiKey?: string;
  autoSync: boolean;
}

export interface AnalyticsConfig {
  gaMeasurementId: string;
  enabled: boolean;
  debugMode: boolean;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
  rateToEUR: number;
}
