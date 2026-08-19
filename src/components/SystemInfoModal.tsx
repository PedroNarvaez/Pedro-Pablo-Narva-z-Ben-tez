import React, { useState, useEffect } from 'react';
import {
  X,
  Info,
  Edit3,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  FileCode2,
  Layers,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  User,
  Tag,
  Download,
} from 'lucide-react';
import { SystemInformation, SystemChangelogEntry } from '../types';
import { SystemInfoService } from '../services/systemInfoService';

interface SystemInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SystemInfoModal: React.FC<SystemInfoModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [info, setInfo] = useState<SystemInformation>(SystemInfoService.getInfo());
  const [activeTab, setActiveTab] = useState<'info' | 'changelog' | 'edit'>('info');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editForm, setEditForm] = useState<SystemInformation>({ ...SystemInfoService.getInfo() });

  // New changelog item state
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogDesc, setNewLogDesc] = useState('');
  const [newLogVer, setNewLogVer] = useState('v2.4.1');
  const [newLogAuthor, setNewLogAuthor] = useState('Pedro Narváez & Ariel Torres');
  const [newLogType, setNewLogType] = useState<'mejora' | 'funcionalidad' | 'seguridad' | 'correccion'>('mejora');

  useEffect(() => {
    if (isOpen) {
      const current = SystemInfoService.getInfo();
      setInfo(current);
      setEditForm({ ...current });
      setIsEditingInfo(false);
      setIsAddingLog(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    SystemInfoService.updateInfo(editForm);
    setInfo(SystemInfoService.getInfo());
    setIsEditingInfo(false);
    onShowToast('success', 'Información del sistema actualizada y guardada con éxito');
  };

  const handleAddChangelog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTitle.trim() || !newLogDesc.trim()) {
      onShowToast('error', 'Por favor ingresa título y descripción de la mejora');
      return;
    }

    SystemInfoService.addChangelogEntry({
      version: newLogVer,
      titulo: newLogTitle,
      descripcion: newLogDesc,
      autor: newLogAuthor,
      tipo: newLogType,
    });

    setInfo(SystemInfoService.getInfo());
    setIsAddingLog(false);
    setNewLogTitle('');
    setNewLogDesc('');
    onShowToast('success', 'Nueva mejora registrada en el historial del sistema');
  };

  const handleDeleteLog = (id: string) => {
    SystemInfoService.deleteChangelogEntry(id);
    setInfo(SystemInfoService.getInfo());
    onShowToast('info', 'Registro de mejora eliminado');
  };

  const handleReset = () => {
    SystemInfoService.resetToDefaults();
    const current = SystemInfoService.getInfo();
    setInfo(current);
    setEditForm({ ...current });
    onShowToast('info', 'Información restaurada a los valores predeterminados');
  };

  const handleExportSystemReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(info, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Ficha_Tecnica_ConciliaPyme_Paraguay_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('success', 'Ficha técnica y bitácora de mejoras descargadas en JSON');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c47046] to-[#7ba8b8] text-white flex items-center justify-center font-bold">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">{info.nombreApp}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c47046]/15 text-[#c47046] font-mono font-bold">
                  {info.version}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{info.subtitulo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportSystemReport}
              className="p-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              title="Descargar Ficha Técnica JSON"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Exportar Ficha</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-[#c47046] text-[#c47046]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ficha del Sistema & Tesis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('changelog')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'changelog'
                ? 'border-[#c47046] text-[#c47046]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mejoras & Actualizaciones ({info.changelog.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditForm({ ...info });
              setActiveTab('edit');
            }}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'border-[#c47046] text-[#c47046]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Información del Sistema</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: System Info & Thesis Overview */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* Main Description */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c47046]">
                    Descripción General del Proyecto
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {info.licencia}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {info.descripcion}
                </p>
              </div>

              {/* Grid with metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Autores & Titulares del Proyecto
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#c47046]" />
                    <span>{info.autorProyecto}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{info.institucion}</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Normativa Financiera & Estándares
                  </div>
                  <div className="text-xs font-bold text-[#7ba8b8] flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>{info.normativa}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Bancos activos: <strong className="text-slate-700 dark:text-slate-300">Banco Itaú Paraguay & ueno bank</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Soporte & Mesa Comercial
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#c47046]" />
                    <span>{info.contactoComercial}</span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{info.telefonoSoporte}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Seguridad & Privacidad de Datos
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
                    {info.notasEmpresariales}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Changelog & Continuous Improvements */}
          {activeTab === 'changelog' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Historial de Mejoras del Sistema
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Registra y documenta las nuevas funciones desarrolladas para el sistema
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingLog(!isAddingLog)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#c47046] text-white hover:bg-[#b35e35] transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cargar Nueva Mejora</span>
                </button>
              </div>

              {/* Form to add improvement */}
              {isAddingLog && (
                <form
                  onSubmit={handleAddChangelog}
                  className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in"
                >
                  <div className="text-xs font-bold text-[#c47046] uppercase">
                    Registrar Nueva Mejora / Versión
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Título de la Mejora *
                      </label>
                      <input
                        type="text"
                        required
                        value={newLogTitle}
                        onChange={(e) => setNewLogTitle(e.target.value)}
                        placeholder="Ej: Integración con ueno bank y conciliación QR"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#c47046]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Versión
                      </label>
                      <input
                        type="text"
                        value={newLogVer}
                        onChange={(e) => setNewLogVer(e.target.value)}
                        placeholder="v2.4.1"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:border-[#c47046]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Tipo de Mejora
                      </label>
                      <select
                        value={newLogType}
                        onChange={(e) => setNewLogType(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#c47046]"
                      >
                        <option value="funcionalidad">Nueva Funcionalidad</option>
                        <option value="mejora">Optimización / Rendimiento</option>
                        <option value="seguridad">Seguridad & Autenticación</option>
                        <option value="correccion">Corrección de Error</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Autor / Responsable
                      </label>
                      <input
                        type="text"
                        value={newLogAuthor}
                        onChange={(e) => setNewLogAuthor(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#c47046]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Detalle y Alcance de la Mejora *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={newLogDesc}
                      onChange={(e) => setNewLogDesc(e.target.value)}
                      placeholder="Explica qué se implementó o mejoró..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs outline-none focus:border-[#c47046]"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingLog(false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#c47046] text-white hover:bg-[#b35e35]"
                    >
                      Guardar Mejora
                    </button>
                  </div>
                </form>
              )}

              {/* Changelog Timeline */}
              <div className="space-y-3">
                {info.changelog.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {log.titulo}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[#c47046]">
                          {log.version}
                        </span>
                        <span
                          className={`text-[9.5px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                            log.tipo === 'seguridad'
                              ? 'bg-red-500/10 text-red-500'
                              : log.tipo === 'funcionalidad'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-[#7ba8b8]/15 text-[#7ba8b8]'
                          }`}
                        >
                          {log.tipo}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {log.fecha}
                        </span>
                        {info.changelog.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {log.descripcion}
                    </p>

                    <div className="text-[10.5px] text-slate-400 flex items-center gap-1 pt-1">
                      <span>Responsable:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{log.autor}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Edit System Information */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#c47046] flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4" />
                  <span>Edición de Metadatos & Configuración del Sistema</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Nombre de la Aplicación
                    </label>
                    <input
                      type="text"
                      value={editForm.nombreApp}
                      onChange={(e) => setEditForm({ ...editForm, nombreApp: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Versión Comercial
                    </label>
                    <input
                      type="text"
                      value={editForm.version}
                      onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Subtítulo / Eslogan
                  </label>
                  <input
                    type="text"
                    value={editForm.subtitulo}
                    onChange={(e) => setEditForm({ ...editForm, subtitulo: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Descripción del Sistema & Alcance
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.descripcion}
                    onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs outline-none focus:border-[#c47046]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Autores del Proyecto
                    </label>
                    <input
                      type="text"
                      value={editForm.autorProyecto}
                      onChange={(e) => setEditForm({ ...editForm, autorProyecto: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Institución / Tesis de Grado
                    </label>
                    <input
                      type="text"
                      value={editForm.institucion}
                      onChange={(e) => setEditForm({ ...editForm, institucion: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Email de Contacto Comercial
                    </label>
                    <input
                      type="email"
                      value={editForm.contactoComercial}
                      onChange={(e) => setEditForm({ ...editForm, contactoComercial: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Teléfono de Soporte
                    </label>
                    <input
                      type="text"
                      value={editForm.telefonoSoporte}
                      onChange={(e) => setEditForm({ ...editForm, telefonoSoporte: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c47046]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Notas Empresariales & Despliegue
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.notasEmpresariales}
                    onChange={(e) => setEditForm({ ...editForm, notasEmpresariales: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs outline-none focus:border-[#c47046]"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Valores por Defecto</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('info')}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#c47046] text-white hover:bg-[#b35e35] flex items-center gap-1.5 shadow-md shadow-[#c47046]/20"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios del Sistema
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70">
          <div className="text-[11px] text-slate-500">
            Tesis de Grado en Informática · Comercialización PYMEs Paraguay 2026
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#c47046] text-white hover:bg-[#b35e35] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
