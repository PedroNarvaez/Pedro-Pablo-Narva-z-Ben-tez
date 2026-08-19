import { SystemInformation, SystemChangelogEntry } from '../types';

const SYSTEM_INFO_STORAGE_KEY = 'conciliapyme_system_information_data';

export const DEFAULT_SYSTEM_INFORMATION: SystemInformation = {
  nombreApp: 'ConciliaPyme',
  subtitulo: 'Plataforma Corporativa de Conciliación Bancaria ISO 20022 & SIPAP Paraguay',
  version: 'v2.5.0 International Standards Release (2026)',
  licencia: 'Licencia Empresarial B2B Paraguay / SaaS Multi-Empresa',
  descripcion:
    'Solución integral de procesamiento y cuadre de extractos bancarios en estándar internacional ISO 20022 (CAMT.052, CAMT.053, CAMT.054) adaptada específicamente para el ecosistema financiero paraguayo (SIPAP - Banco Central del Paraguay). Permite el procesamiento seguro de extractos bancarios en Guaraníes (Gs.) y Dólares (USD), análisis de contrapartes, desglose de comisiones, conciliación inteligente y generación de informes ejecutivos de flujo de caja conforme a NIIF/NIC 7 y NIA 505.',
  autorProyecto: 'Ing. Pedro Narváez & Lic. Ariel Torres',
  institucion: 'Tesis de Grado en Ingeniería Informática & Solución SaaS PYMEs Paraguay',
  normativa: 'ISO 20022 / SWIFT CBPR+ · IFRS / IAS 7 · ISA / NIA 505 · SIPAP BCP Res. N° 12/2023 · SEPRELAD Res. 70/2019',
  bancosSoportados: ['Banco Itaú Paraguay S.A.', 'ueno bank S.A.'],
  contactoComercial: 'contacto@conciliapyme.com.py',
  telefonoSoporte: '+595 981 123 456 / +595 21 608 900',
  notasEmpresariales:
    'Esta plataforma está lista para ser desplegada en servidores locales on-premise de empresas clientes o en la nube mediante contenedores Docker / Cloud Run. La privacidad es prioritaria: el procesamiento de transacciones financieras opera directamente en la memoria del cliente.',
  changelog: [
    {
      id: 'log_000',
      fecha: '2026-08-19',
      version: 'v2.5.0',
      titulo: 'Módulo de Estándares Internacionales (ISO 20022, SWIFT CBPR+, NIIF/IAS 7 y NIA 505)',
      descripcion:
        'Incorporación de módulo integral de cumplimiento con estándares globales: Validador de conformidad ISO 20022 & SWIFT CBPR+, Estado de Flujos de Efectivo según NIC 7 (Método Directo), Cédula de Confirmación de Auditoría NIA 505, Verificador Criptográfico SHA-256 de firmas y Conversor Multidivisa ISO 4217 / IAS 21.',
      autor: 'Pedro Narváez & Ariel Torres',
      tipo: 'mejora',
    },
    {
      id: 'log_001',
      fecha: '2026-08-17',
      version: 'v2.4.0',
      titulo: 'Exclusividad Bancaria Paraguay (Itaú & ueno bank) y Gestión Multi-Empresa',
      descripcion:
        'Filtrado y enfoque exclusivo en los bancos líderes del mercado paraguayo (Banco Itaú Paraguay y ueno bank). Se habilitó el soporte para gestión y alternancia de 4 empresas preconfiguradas y control de acceso obligatorio.',
      autor: 'Pedro Narváez & Ariel Torres',
      tipo: 'funcionalidad',
    },
    {
      id: 'log_002',
      fecha: '2026-08-15',
      version: 'v2.3.0',
      titulo: 'Control de Acceso Obligatorio y Módulo de Comercialización Multiusuario',
      descripcion:
        'Implementación de pantalla de autenticación obligatoria en el inicio del sitio, gestión de cuentas de usuarios con roles y licenciamiento comercial para venta a múltiples clientes.',
      autor: 'Pedro Narváez',
      tipo: 'seguridad',
    },
    {
      id: 'log_003',
      fecha: '2026-08-10',
      version: 'v2.2.0',
      titulo: 'Soporte Completo para Temas Claro, Oscuro y Según Sistema',
      descripcion:
        'Incorporación de motor de estilos adaptativo con soporte para tema claro de alto contraste, tema oscuro financiero y detección automática de preferencia del sistema operativo.',
      autor: 'Ariel Torres',
      tipo: 'mejora',
    },
    {
      id: 'log_004',
      fecha: '2026-08-01',
      version: 'v2.0.0',
      titulo: 'Motor de Conciliación Automática SIPAP y Algoritmo Levenshtein',
      descripcion:
        'Desarrollo del motor de cuadre bidireccional de extractos bancarios contra libro contable interno con cálculo de confianza probabilística.',
      autor: 'Equipo ConciliaPyme',
      tipo: 'funcionalidad',
    },
  ],
};

export class SystemInfoService {
  private static info: SystemInformation = { ...DEFAULT_SYSTEM_INFORMATION };
  private static listeners: ((info: SystemInformation) => void)[] = [];

  public static init(): void {
    try {
      const stored = localStorage.getItem(SYSTEM_INFO_STORAGE_KEY);
      if (stored) {
        this.info = JSON.parse(stored);
      } else {
        this.info = { ...DEFAULT_SYSTEM_INFORMATION };
        this.persist();
      }
    } catch {
      this.info = { ...DEFAULT_SYSTEM_INFORMATION };
    }
    this.notify();
  }

  public static getInfo(): SystemInformation {
    if (!this.info || !this.info.changelog) this.init();
    return this.info;
  }

  public static updateInfo(partial: Partial<SystemInformation>): void {
    this.info = {
      ...this.info,
      ...partial,
    };
    this.persist();
    this.notify();
  }

  public static addChangelogEntry(entry: Omit<SystemChangelogEntry, 'id' | 'fecha'>): SystemChangelogEntry {
    const newEntry: SystemChangelogEntry = {
      ...entry,
      id: `log_${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
    };
    this.info.changelog = [newEntry, ...this.info.changelog];
    this.persist();
    this.notify();
    return newEntry;
  }

  public static deleteChangelogEntry(id: string): void {
    this.info.changelog = this.info.changelog.filter((c) => c.id !== id);
    this.persist();
    this.notify();
  }

  public static resetToDefaults(): void {
    this.info = { ...DEFAULT_SYSTEM_INFORMATION };
    this.persist();
    this.notify();
  }

  private static persist(): void {
    localStorage.setItem(SYSTEM_INFO_STORAGE_KEY, JSON.stringify(this.info));
  }

  public static subscribe(listener: (info: SystemInformation) => void): () => void {
    this.listeners.push(listener);
    listener(this.getInfo());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify(): void {
    const inf = this.getInfo();
    this.listeners.forEach((l) => l(inf));
  }
}
