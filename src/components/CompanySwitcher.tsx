import React, { useState, useEffect, useRef } from 'react';
import { Building2, ChevronDown, Check, Settings2, Plus, Sparkles } from 'lucide-react';
import { CompanyProfile } from '../types';
import { CompanyService } from '../services/companyService';

interface CompanySwitcherProps {
  onOpenCompanyManager: () => void;
}

export const CompanySwitcher: React.FC<CompanySwitcherProps> = ({ onOpenCompanyManager }) => {
  const [companies, setCompanies] = useState<CompanyProfile[]>(CompanyService.getCompanies());
  const [activeCompany, setActiveCompany] = useState<CompanyProfile | null>(CompanyService.getActiveCompany());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = CompanyService.subscribe((comps, active) => {
      setCompanies(comps);
      setActiveCompany(active);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    CompanyService.setActiveCompany(id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 hover:border-[#c47046]/50 dark:hover:border-[#c47046]/50 text-slate-800 dark:text-slate-200 transition-all text-xs font-semibold max-w-[200px] sm:max-w-[260px] truncate"
        title={activeCompany ? `${activeCompany.nombre} (${activeCompany.ruc}) - ${activeCompany.bancoAsociado}` : 'Seleccionar Empresa'}
      >
        <div className="w-5 h-5 rounded-lg bg-[#c47046]/15 text-[#c47046] flex items-center justify-center shrink-0 border border-[#c47046]/30">
          <Building2 className="w-3 h-3" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="truncate text-[11px] font-bold leading-tight">
            {activeCompany ? activeCompany.nombre : 'Seleccionar Empresa'}
          </div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono truncate leading-none mt-0.5">
            {activeCompany ? `${activeCompany.ruc} · ${activeCompany.bancoAsociado}` : '4 Empresas Disponibles'}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Empresas Habilitadas ({companies.length})
            </span>
            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              PYMEs Paraguay
            </span>
          </div>

          <div className="py-1.5 space-y-1 max-h-64 overflow-y-auto">
            {companies.map((comp) => {
              const isSelected = activeCompany?.id === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => handleSelect(comp.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-[#c47046]/10 dark:bg-[#c47046]/20 border border-[#c47046]/40 text-slate-900 dark:text-slate-100'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-[#c47046] text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {comp.nombre.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{comp.nombre}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#c47046] shrink-0 ml-1" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      RUC: {comp.ruc} · {comp.ciudad.split(',')[0]}
                    </div>
                    <div className="text-[9.5px] text-[#7ba8b8] font-medium mt-0.5 truncate">
                      Banco: {comp.bancoAsociado}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCompanyManager();
              }}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#c47046] hover:text-white dark:hover:bg-[#c47046] transition-all flex items-center justify-center gap-1.5"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Gestionar / Editar 4 Empresas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
