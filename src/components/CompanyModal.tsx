import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  Save,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { CompanyProfile } from '../types';
import { CompanyService, DEFAULT_PARAGUAY_COMPANIES } from '../services/companyService';
import { PARAGUAY_BANKS } from '../utils/paraguayBanking';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [companies, setCompanies] = useState<CompanyProfile[]>(CompanyService.getCompanies());
  const [activeCompanyId, setActiveCompanyId] = useState<string>(CompanyService.getActiveCompany()?.id || '');
  const [editingCompany, setEditingCompany] = useState<CompanyProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCompanies(CompanyService.getCompanies());
      setActiveCompanyId(CompanyService.getActiveCompany()?.id || '');
      setEditingCompany(null);
      setIsCreating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectActive = (id: string) => {
    CompanyService.setActiveCompany(id);
    setActiveCompanyId(id);
    onShowToast('info', 'Empresa activa actualizada');
  };

  const handleStartEdit = (comp: CompanyProfile) => {
    setEditingCompany({ ...comp });
    setIsCreating(false);
  };

  const handleStartCreate = () => {
    setEditingCompany({
      id: '',
      nombre: '',
      ruc: '',
      rubro: 'Comercial / Servicios',
      ciudad: 'Asunción',
      direccion: '',
      telefono: '+595 ',
      email: '',
      bancoAsociado: 'Banco Itaú Paraguay',
      bic: 'ITAUPYASXXX',
      nroCuenta: 'PY88017000000',
      monedaPrincipal: 'PYG',
      esActiva: true,
    });
    setIsCreating(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    if (!editingCompany.nombre.trim() || !editingCompany.ruc.trim()) {
      onShowToast('error', 'El nombre y RUC son campos obligatorios');
      return;
    }

    if (isCreating) {
      const added = CompanyService.addCompany(editingCompany);
      onShowToast('success', `Empresa "${added.nombre}" creada con éxito`);
    } else {
      CompanyService.saveCompany(editingCompany);
      onShowToast('success', `Empresa "${editingCompany.nombre}" actualizada`);
    }

    setCompanies(CompanyService.getCompanies());
    setEditingCompany(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (companies.length <= 1) {
      onShowToast('error', 'Debe haber al menos una empresa registrada');
      return;
    }
    const success = CompanyService.deleteCompany(id);
    if (success) {
      setCompanies(CompanyService.getCompanies());
      onShowToast('info', 'Empresa eliminada del sistema');
    }
  };

  const handleResetDefaults = () => {
    CompanyService.resetToDefaults();
    setCompanies(CompanyService.getCompanies());
    setActiveCompanyId(CompanyService.getActiveCompany()?.id || '');
    setEditingCompany(null);
    onShowToast('info', 'Restauradas las 4 empresas preconfiguradas de Paraguay');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c47046]/15 text-[#c47046] flex items-center justify-center border border-[#c47046]/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Gestión de Empresas & Cuentas PYME</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  4 Empresas Habilitadas
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configura los datos fiscales (RUC), cuentas bancarias (Banco Itaú & ueno bank) y monedas para cada entidad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              title="Restaurar las 4 empresas oficiales"
              className="p-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Restaurar 4 Empresas</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {editingCompany ? (
            /* Editing / Creating Form */
            <form onSubmit={handleSaveForm} className="space-y-4 bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c47046]">
                  {isCreating ? 'Registrar Nueva Empresa' : `Editar: ${editingCompany.nombre}`}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Razón Social / Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCompany.nombre}
                    onChange={(e) => setEditingCompany({ ...editingCompany, nombre: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                    placeholder="Ej: Agroservicios del Este S.R.L."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    RUC con Dígito Verificador (SET / DNIT) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCompany.ruc}
                    onChange={(e) => setEditingCompany({ ...editingCompany, ruc: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046] font-mono"
                    placeholder="Ej: 80095432-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Banco Asociado (Paraguay) *
                  </label>
                  <select
                    value={editingCompany.bancoAsociado}
                    onChange={(e) => {
                      const bankName = e.target.value;
                      const found = PARAGUAY_BANKS.find((b) => b.shortName === bankName || b.name === bankName);
                      setEditingCompany({
                        ...editingCompany,
                        bancoAsociado: bankName,
                        bic: found?.bic || (bankName.includes('Itaú') ? 'ITAUPYASXXX' : 'UENOPYASXXX'),
                      });
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                  >
                    <option value="Banco Itaú Paraguay">Banco Itaú Paraguay S.A. (BIC: ITAUPYASXXX)</option>
                    <option value="ueno bank">ueno bank S.A. (BIC: UENOPYASXXX)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Nro. Cuenta Corriente / BBAN
                  </label>
                  <input
                    type="text"
                    value={editingCompany.nroCuenta}
                    onChange={(e) => setEditingCompany({ ...editingCompany, nroCuenta: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046] font-mono"
                    placeholder="PY88017000000123456789"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Rubro / Actividad Económica
                  </label>
                  <input
                    type="text"
                    value={editingCompany.rubro}
                    onChange={(e) => setEditingCompany({ ...editingCompany, rubro: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                    placeholder="Ej: Silos y Acopio de Granos"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Ciudad / Departamento
                  </label>
                  <input
                    type="text"
                    value={editingCompany.ciudad}
                    onChange={(e) => setEditingCompany({ ...editingCompany, ciudad: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                    placeholder="Ej: Ciudad del Este, Alto Paraná"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Dirección Comercial
                  </label>
                  <input
                    type="text"
                    value={editingCompany.direccion}
                    onChange={(e) => setEditingCompany({ ...editingCompany, direccion: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                    placeholder="Avda. Principal Km 4"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Teléfono & Email de Contacto
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editingCompany.telefono}
                      onChange={(e) => setEditingCompany({ ...editingCompany, telefono: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                      placeholder="+595 21 ..."
                    />
                    <input
                      type="email"
                      value={editingCompany.email}
                      onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                      placeholder="admin@empresa.com.py"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#c47046] text-white hover:bg-[#b35e35] transition-all flex items-center gap-1.5 shadow-md shadow-[#c47046]/20"
                >
                  <Save className="w-4 h-4" />
                  Guardar Empresa
                </button>
              </div>
            </form>
          ) : null}

          {/* Companies Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((comp, idx) => {
              const isSelected = activeCompanyId === comp.id;
              return (
                <div
                  key={comp.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#c47046]/10 border-[#c47046] shadow-md shadow-[#c47046]/10'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#c47046]/20 text-[#c47046] flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{comp.nombre}</h3>
                      </div>
                      {isSelected ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c47046] text-white flex items-center gap-1">
                          <Check className="w-3 h-3" /> Activa
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectActive(comp.id)}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#c47046] hover:text-white transition-colors"
                        >
                          Seleccionar
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
                      <div className="flex items-center justify-between font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                        <span className="text-slate-500">RUC:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{comp.ruc}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <CreditCard className="w-3.5 h-3.5 text-[#7ba8b8] shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {comp.bancoAsociado}
                        </span>
                        <span className="font-mono text-slate-500">({comp.bic})</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{comp.ciudad}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">
                      {comp.nroCuenta}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(comp)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar datos de la empresa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {companies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDelete(comp.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar empresa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={handleStartCreate}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Otra Empresa PYME</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Total Empresas: <strong className="text-slate-800 dark:text-slate-200">{companies.length}</strong> · Bancos Habilitados: Banco Itaú Paraguay & ueno bank
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#c47046] text-white hover:bg-[#b35e35] transition-colors"
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
