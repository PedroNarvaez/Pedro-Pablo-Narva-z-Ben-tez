import { CompanyProfile } from '../types';

const COMPANIES_STORAGE_KEY = 'conciliapyme_companies_data';
const ACTIVE_COMPANY_KEY = 'conciliapyme_active_company_id';

// The 4 designated Paraguayan companies
export const DEFAULT_PARAGUAY_COMPANIES: CompanyProfile[] = [
  {
    id: 'empresa_1_agro',
    nombre: 'Agroservicios del Este S.R.L.',
    ruc: '80095432-1',
    rubro: 'Agroindustria, Silos & Insumos Agrícolas',
    ciudad: 'Ciudad del Este, Alto Paraná',
    direccion: 'Avda. Monseñor Rodríguez Km 4.5',
    telefono: '+595 61 578 400',
    email: 'contacto@agroserviciosdeleste.com.py',
    bancoAsociado: 'Banco Itaú Paraguay',
    bic: 'ITAUPYASXXX',
    nroCuenta: 'PY88017000000123456789',
    monedaPrincipal: 'PYG',
    esActiva: true,
  },
  {
    id: 'empresa_2_distribuidora',
    nombre: 'Comercial & Distribuidora Asunción S.A.',
    ruc: '80012456-3',
    rubro: 'Importación, Logística & Distribución Masiva',
    ciudad: 'Asunción, Distrito Capital',
    direccion: 'Avda. Eusebio Ayala 2450 c/ Choferes del Chaco',
    telefono: '+595 21 608 900',
    email: 'administracion@distribuidoraasuncion.com.py',
    bancoAsociado: 'ueno bank',
    bic: 'UENOPYASXXX',
    nroCuenta: 'PY88032000000887766554',
    monedaPrincipal: 'PYG',
    esActiva: true,
  },
  {
    id: 'empresa_3_tech',
    nombre: 'Tecnología y Soluciones Digitales PY S.A.',
    ruc: '80078912-7',
    rubro: 'Desarrollo de Software, FinTech & Facturación Electrónica',
    ciudad: 'San Lorenzo, Central',
    direccion: 'Ruta Mcal. Estigarribia Km 9.5 Edificio TechHub Piso 3',
    telefono: '+595 21 585 200',
    email: 'tesoreria@techsoluciones.com.py',
    bancoAsociado: 'Banco Itaú Paraguay',
    bic: 'ITAUPYASXXX',
    nroCuenta: 'PY88017000000456789012',
    monedaPrincipal: 'PYG',
    esActiva: true,
  },
  {
    id: 'empresa_4_construccion',
    nombre: 'Constructora & Logística Guaraní S.R.L.',
    ruc: '80034567-9',
    rubro: 'Obras Civiles, Maquinaria Pesada & Transporte',
    ciudad: 'Encarnación, Itapúa',
    direccion: 'Avda. Costanera República del Paraguay 840',
    telefono: '+595 71 204 330',
    email: 'finanzas@constructoraguarani.com.py',
    bancoAsociado: 'ueno bank',
    bic: 'UENOPYASXXX',
    nroCuenta: 'PY88032000000332211445',
    monedaPrincipal: 'PYG',
    esActiva: true,
  },
];

export class CompanyService {
  private static companies: CompanyProfile[] = [];
  private static activeCompanyId: string = '';
  private static listeners: ((companies: CompanyProfile[], activeCompany: CompanyProfile | null) => void)[] = [];

  public static init(): void {
    try {
      const stored = localStorage.getItem(COMPANIES_STORAGE_KEY);
      if (stored) {
        this.companies = JSON.parse(stored);
      } else {
        this.companies = [...DEFAULT_PARAGUAY_COMPANIES];
        this.persist();
      }
    } catch {
      this.companies = [...DEFAULT_PARAGUAY_COMPANIES];
    }

    const storedActive = localStorage.getItem(ACTIVE_COMPANY_KEY);
    if (storedActive && this.companies.some((c) => c.id === storedActive)) {
      this.activeCompanyId = storedActive;
    } else {
      this.activeCompanyId = this.companies[0]?.id || '';
      localStorage.setItem(ACTIVE_COMPANY_KEY, this.activeCompanyId);
    }

    this.notify();
  }

  public static getCompanies(): CompanyProfile[] {
    if (this.companies.length === 0) this.init();
    return this.companies;
  }

  public static getActiveCompany(): CompanyProfile | null {
    if (this.companies.length === 0) this.init();
    return this.companies.find((c) => c.id === this.activeCompanyId) || this.companies[0] || null;
  }

  public static setActiveCompany(id: string): void {
    if (this.companies.some((c) => c.id === id)) {
      this.activeCompanyId = id;
      localStorage.setItem(ACTIVE_COMPANY_KEY, id);
      this.notify();
    }
  }

  public static saveCompany(company: CompanyProfile): void {
    const idx = this.companies.findIndex((c) => c.id === company.id);
    if (idx >= 0) {
      this.companies[idx] = company;
    } else {
      this.companies.push(company);
    }
    this.persist();
    this.notify();
  }

  public static addCompany(newComp: Omit<CompanyProfile, 'id'>): CompanyProfile {
    const id = `empresa_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const fullCompany: CompanyProfile = {
      ...newComp,
      id,
    };
    this.companies.push(fullCompany);
    this.persist();
    this.notify();
    return fullCompany;
  }

  public static deleteCompany(id: string): boolean {
    if (this.companies.length <= 1) return false;
    this.companies = this.companies.filter((c) => c.id !== id);
    if (this.activeCompanyId === id) {
      this.activeCompanyId = this.companies[0]?.id || '';
      localStorage.setItem(ACTIVE_COMPANY_KEY, this.activeCompanyId);
    }
    this.persist();
    this.notify();
    return true;
  }

  public static resetToDefaults(): void {
    this.companies = [...DEFAULT_PARAGUAY_COMPANIES];
    this.activeCompanyId = this.companies[0].id;
    localStorage.setItem(ACTIVE_COMPANY_KEY, this.activeCompanyId);
    this.persist();
    this.notify();
  }

  private static persist(): void {
    localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(this.companies));
  }

  public static subscribe(listener: (companies: CompanyProfile[], activeCompany: CompanyProfile | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.getCompanies(), this.getActiveCompany());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify(): void {
    const comps = this.companies;
    const active = this.getActiveCompany();
    this.listeners.forEach((l) => l(comps, active));
  }
}
