import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  BookOpen,
  Layers,
  ShieldCheck,
  TrendingUp,
  FileText,
  Printer,
  ExternalLink,
  Code2,
  CheckCircle2,
} from 'lucide-react';

interface ThesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ThesisModal: React.FC<ThesisModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [activeSection, setActiveSection] = useState<'resumen' | 'arquitectura' | 'iso20022' | 'seguridad' | 'negocio'>(
    'resumen'
  );

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
    onShowToast('info', 'Abriendo vista de impresión para la memoria de la tesis');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131826] border border-[#8b93a7]/20 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#8b93a7]/15 flex items-center justify-between bg-[#0e121a]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c47046] to-[#7ba8b8] text-white flex items-center justify-center font-black shadow-lg shadow-[#c47046]/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#e8e5df]">Memoria Técnica & Tesis de Grado</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7ba8b8]/20 text-[#7ba8b8] font-bold border border-[#7ba8b8]/30">
                  Ingeniería Informática
                </span>
              </div>
              <p className="text-xs text-[#8b93a7]">
                Conciliación Bancaria Automatizada ISO 20022 (CAMT/SIPAP) para PYMEs en Paraguay
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg text-[#8b93a7] hover:text-[#e8e5df] hover:bg-[#181e2e] transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Imprimir o Guardar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8b93a7] hover:text-[#e8e5df] hover:bg-[#181e2e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-[#8b93a7]/15 bg-[#0a0c10]/50 px-6 gap-1 pt-2 overflow-x-auto">
          {[
            { id: 'resumen', label: '1. Resumen & Problema', icon: BookOpen },
            { id: 'arquitectura', label: '2. Arquitectura de Software', icon: Layers },
            { id: 'iso20022', label: '3. Estándar ISO 20022 & SIPAP', icon: Code2 },
            { id: 'seguridad', label: '4. Seguridad & Privacidad', icon: ShieldCheck },
            { id: 'negocio', label: '5. Plan de Negocio PYME', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                  isSelected
                    ? 'border-[#c47046] text-[#c47046] bg-[#131826]'
                    : 'border-transparent text-[#8b93a7] hover:text-[#e8e5df]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[#e8e5df]">
          {activeSection === 'resumen' && (
            <div className="space-y-5">
              <div className="bg-[#181e2e]/50 border border-[#8b93a7]/15 p-5 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-[#c47046] uppercase tracking-wider">
                  Ficha Técnica del Proyecto de Grado
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#8b93a7] block">Título Académico:</span>
                    <strong>Plataforma Web Desacoplada para la Conciliación Financiera ISO 20022 en PYMEs</strong>
                  </div>
                  <div>
                    <span className="text-[#8b93a7] block">Área de Conocimiento:</span>
                    <strong>Sistemas Distribuidos, Seguridad de la Información e Ingeniería de Software</strong>
                  </div>
                  <div>
                    <span className="text-[#8b93a7] block">Contexto Geográfico:</span>
                    <strong>República del Paraguay (Sistema Financiero BCP / SIPAP)</strong>
                  </div>
                  <div>
                    <span className="text-[#8b93a7] block">Paradigma de Desarrollo:</span>
                    <strong>Clean Architecture, TypeScript Strict Mode & Zero-Trust Client Computing</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#e8e5df]">1.1. Justificación y Planteamiento del Problema</h4>
                <p className="text-xs text-[#8b93a7] leading-relaxed">
                  Las Pequeñas y Medianas Empresas (PYMEs) en Paraguay representan más del 90% de las unidades
                  económicas del país. Tradicionalmente, la conciliación entre los movimientos de cuenta bancaria y los
                  registros contables se realiza de forma manual mediante planillas de cálculo (Excel) o revisión de
                  extractos en formato PDF.
                </p>
                <p className="text-xs text-[#8b93a7] leading-relaxed">
                  Este proceso manual ocasiona:
                </p>
                <ul className="text-xs text-[#8b93a7] space-y-1.5 list-disc list-inside">
                  <li>
                    <strong className="text-[#e8e5df]">Elevada tasa de error humano</strong> en la digitación de montos
                    y referencias bancarias.
                  </li>
                  <li>
                    <strong className="text-[#e8e5df]">Pérdida de horas-hombre</strong> dedicadas a tareas repetitivas
                    de bajo valor agregado.
                  </li>
                  <li>
                    <strong className="text-[#e8e5df]">Falta de auditoría de comisiones bancarias</strong> ocultas o
                    indebidas cobradas por transacciones SIPAP.
                  </li>
                  <li>
                    <strong className="text-[#e8e5df]">Riesgos de fuga de información confidencial</strong> al recurrir a
                    conversores en línea no regulados.
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#e8e5df]">1.2. Solución Propuesta por el Software</h4>
                <p className="text-xs text-[#8b93a7] leading-relaxed">
                  <strong>ConciliaPyme</strong> solventa esta problemática mediante una arquitectura modular en la cual
                  el motor de procesamiento XML se ejecuta íntegramente en el cliente (Browser Runtime), garantizando
                  que ningún dato bancario confidencial sea expuesto sin el consentimiento explícito de la empresa.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'arquitectura' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#e8e5df] mb-1">Patrón de Arquitectura: Clean Architecture & Adapter</h3>
                <p className="text-xs text-[#8b93a7]">
                  El sistema se diseñó bajo los principios SOLID, aislando la lógica de negocio bancaria de cualquier
                  dependencia de infraestructura externa.
                </p>
              </div>

              {/* ASCII Diagram Card */}
              <div className="bg-[#0a0c10] border border-[#8b93a7]/20 p-4 rounded-xl font-mono text-[11px] text-[#7ba8b8] overflow-x-auto leading-relaxed">
                <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                            1. PRESENTATION LAYER                            │
│  React 19 + TypeScript + Tailwind CSS + Lucide Icons + Recharts Analytics   │
│  (Vistas: Dashboard de KPIs, Analizador CAMT, Conciliador, Reporte Flujo)   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (State & Hooks)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            2. APPLICATION LAYER                             │
│  - CamtProcessorEngine (DOMParser ISO 20022)                                │
│  - BalanceAuditor (Verificación matemática: SaldoInicial + Ingr - Gast = Fin)│
│  - CommissionDetector (Patrones RegExp & Códigos bancarios BCP)              │
│  - ReconciliationMatcher (Algoritmo de concordancia de referencias y montos) │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (Interfaces & Adapters)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           3. INFRASTRUCTURE LAYER                           │
│  ┌─────────────────────────┐ ┌─────────────────────────┐ ┌────────────────┐ │
│  │     AuthService         │ │      StorageService     │ │AnalyticsService│ │
│  │ (Google OAuth GIS / RBAC│ │ (IndexedDB/Supabase/S3) │ │ (GA4 Telemetría│ │
│  └─────────────────────────┘ └─────────────────────────┘ └────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#181e2e]/40 p-3.5 rounded-xl border border-[#8b93a7]/15">
                  <span className="font-bold text-[#c47046] block mb-1">Patrón Adapter (GoF)</span>
                  <p className="text-[#8b93a7] text-[11px]">
                    Permite cambiar de proveedor de almacenamiento (de LocalStorage a Supabase o AWS S3) sin modificar
                    una sola línea del código de conciliación o visualización.
                  </p>
                </div>
                <div className="bg-[#181e2e]/40 p-3.5 rounded-xl border border-[#8b93a7]/15">
                  <span className="font-bold text-[#7ba8b8] block mb-1">Autenticación Federada Desacoplada</span>
                  <p className="text-[#8b93a7] text-[11px]">
                    Soporte para Google Identity Services (GIS) con decodificación de JWT en cliente y modo de prueba para
                    demostración académica sin necesidad de backend activo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'iso20022' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#e8e5df] mb-1">
                  Estándar Financiero ISO 20022 & Sistema SIPAP (Paraguay)
                </h3>
                <p className="text-xs text-[#8b93a7]">
                  El estándar ISO 20022 es la norma global promovida por SWIFT y el Banco Central del Paraguay (BCP) para
                  la modernización de pagos de alto y bajo valor.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    code: 'CAMT.053',
                    name: 'Bank-to-Customer Statement',
                    desc: 'Extracto de cuenta contable periódico (diario o mensual) con saldos de apertura, movimientos y saldo de cierre oficial.',
                    status: 'Soportado al 100%',
                  },
                  {
                    code: 'CAMT.052',
                    name: 'Bank-to-Customer Report',
                    desc: 'Reporte intradiario de movimientos en tiempo real para tesorería ágil.',
                    status: 'Soportado al 100%',
                  },
                  {
                    code: 'CAMT.054',
                    name: 'Debit/Credit Notification',
                    desc: 'Avisos individuales o agrupados de cobros y pagos de proveedores.',
                    status: 'Soportado al 100%',
                  },
                ].map((s) => (
                  <div key={s.code} className="bg-[#181e2e]/50 border border-[#8b93a7]/15 p-3.5 rounded-xl">
                    <span className="text-xs font-mono font-bold text-[#c47046]">{s.code}</span>
                    <h5 className="text-xs font-bold text-[#e8e5df] mt-1">{s.name}</h5>
                    <p className="text-[11px] text-[#8b93a7] mt-1 leading-relaxed">{s.desc}</p>
                    <span className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded bg-[#2d9e6e]/15 text-[#2d9e6e]">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-[#181e2e]/30 p-4 rounded-xl border border-[#8b93a7]/15 space-y-2">
                <h5 className="text-xs font-bold text-[#e8e5df]">Mapeo de Campos Críticos Extraídos:</h5>
                <ul className="text-xs text-[#8b93a7] space-y-1 list-disc list-inside">
                  <li>
                    <strong className="text-[#e8e5df]">&lt;EndToEndId&gt;</strong>: Identificador único de transacción
                    SIPAP para conciliación con la Factura Electrónica.
                  </li>
                  <li>
                    <strong className="text-[#e8e5df]">&lt;RltdPties&gt; (Dbtr / Cdtr)</strong>: Nombre y RUC de la
                    contraparte bancaria.
                  </li>
                  <li>
                    <strong className="text-[#e8e5df]">&lt;Amt Ccy="PYG"&gt;</strong>: Monto nominal y moneda de la
                    operación (Guaraníes o Dólares).
                  </li>
                  <li>
                    <strong className="text-[#e8e5df]">&lt;Bal&gt; (OPBD / CLBD)</strong>: Verificación de cuadre contable
                    de saldos de apertura y cierre.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'seguridad' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#e8e5df] mb-1">Análisis de Seguridad de la Información</h3>
                <p className="text-xs text-[#8b93a7]">
                  Evaluación de riesgos bajo estándares de la Ley de Secreto Bancario y Protección de Datos en Paraguay.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#181e2e]/40 p-4 rounded-xl border border-[#8b93a7]/15 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2d9e6e]">
                    <ShieldCheck className="w-4 h-4" />
                    Procesamiento Zero-Trust en Cliente
                  </div>
                  <p className="text-[11px] text-[#8b93a7] leading-relaxed">
                    A diferencia de convertidores web públicos que envían el XML a servidores remotos, ConciliaPyme
                    parsea el árbol XML dentro de la memoria RAM del navegador utilizando la API nativa de DOMParser.
                  </p>
                </div>

                <div className="bg-[#181e2e]/40 p-4 rounded-xl border border-[#8b93a7]/15 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7ba8b8]">
                    <CheckCircle2 className="w-4 h-4" />
                    Autenticación OAuth 2.0 & GIS
                  </div>
                  <p className="text-[11px] text-[#8b93a7] leading-relaxed">
                    Las credenciales del usuario nunca son almacenadas en texto plano. La plataforma utiliza el flujo de
                    tokens criptográficos firmados por Google Identity Services.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'negocio' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#e8e5df] mb-1">
                  Modelo de Monetización y Venta a PYMEs en Paraguay
                </h3>
                <p className="text-xs text-[#8b93a7]">
                  Plan comercial validado para comercializar la plataforma como servicio (SaaS B2B).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#181e2e]/50 border border-[#8b93a7]/15 p-4 rounded-xl text-center flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#8b93a7] uppercase">Plan Emprendedor</span>
                    <div className="text-xl font-extrabold text-[#e8e5df] my-2">Gratuito</div>
                    <p className="text-[11px] text-[#8b93a7] leading-relaxed">
                      Procesamiento local, 1 banco, exportación a CSV sin almacenamiento en la nube.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#8b93a7]/15 text-[10px] text-[#7ba8b8] font-bold">
                    Adquisición de Usuarios (Freemium)
                  </div>
                </div>

                <div className="bg-[#c47046]/15 border border-[#c47046] p-4 rounded-xl text-center flex flex-col justify-between shadow-lg shadow-[#c47046]/10">
                  <div>
                    <span className="text-xs font-bold text-[#c47046] uppercase">Plan PYME Pro</span>
                    <div className="text-xl font-extrabold text-[#e8e5df] my-2">Gs. 150.000 / mes</div>
                    <p className="text-[11px] text-[#e8e5df] leading-relaxed">
                      Multi-banco ilimitado (Itaú, Continental, etc.), guardado en Supabase/S3, Google Auth y conciliación
                      masiva con facturas SIFEN.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#c47046]/30 text-[10px] text-[#c47046] font-bold">
                    Plan Principal
                  </div>
                </div>

                <div className="bg-[#181e2e]/50 border border-[#8b93a7]/15 p-4 rounded-xl text-center flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#8b93a7] uppercase">Estudios Contables</span>
                    <div className="text-xl font-extrabold text-[#e8e5df] my-2">Gs. 450.000 / mes</div>
                    <p className="text-[11px] text-[#8b93a7] leading-relaxed">
                      Gestión de hasta 50 empresas/RUCs clientes, reportes auditados para la DNIT y soporte prioritario.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#8b93a7]/15 text-[10px] text-[#7ba8b8] font-bold">
                    Alta Rentabilidad B2B
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#8b93a7]/15 flex items-center justify-between bg-[#0e121a]/90">
          <div className="text-xs text-[#8b93a7] flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#c47046]" />
            <span>Documento Oficial preparado para Defensa de Tesis y Propuesta de Negocio</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#c47046] text-white hover:bg-[#a85a33] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
