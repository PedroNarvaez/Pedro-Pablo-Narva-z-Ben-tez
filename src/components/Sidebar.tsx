import React, { useRef } from 'react';
import {
  UploadCloud,
  FileCode2,
  Trash2,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Plus,
  ArrowUpRight,
  AlertOctagon,
  AlertTriangle,
} from 'lucide-react';
import { CamtFile } from '../types';
import { SAMPLE_CAMT_FILES } from '../utils/sampleData';

interface SidebarProps {
  files: CamtFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onLoadFiles: (files: FileList | File[]) => void;
  onLoadSampleXml: (xmlString: string, sampleName: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onRemoveFile,
  onLoadFiles,
  onLoadSampleXml,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onLoadFiles(e.dataTransfer.files);
    }
  };

  return (
    <aside className="w-72 bg-slate-50 dark:bg-[#080808] border-r border-slate-200 dark:border-[#222733] flex flex-col shrink-0 h-[calc(100vh-53px)] overflow-hidden transition-colors">
      {/* Upload area */}
      <div className="p-4 border-b border-slate-200 dark:border-[#222733] space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-[#8b949e] tracking-wider uppercase">
            Extractos Bancarios
          </span>
          <span className="text-[10px] font-mono bg-white dark:bg-[#161b22] text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#30363d]">
            {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
          </span>
        </div>

        {/* Dropzone with Blockchain X styling */}
        <div
          id="dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#146ef5] bg-[#146ef5]/10 scale-[0.99]'
              : 'border-slate-300 dark:border-[#222733] bg-white dark:bg-[#11141a] hover:border-[#146ef5] hover:bg-slate-50 dark:hover:bg-[#161b22]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onLoadFiles(e.target.files);
                e.target.value = '';
              }
            }}
            multiple
            accept=".xml,.camt,.camt052,.camt053,.camt054,.km052,.km053,.km054,.km052535454,.txt,.csv,.json,.dat,*"
            className="hidden"
          />

          <div className="w-9 h-9 rounded-xl bg-[#146ef5]/10 text-[#146ef5] flex items-center justify-center mx-auto mb-2 border border-[#146ef5]/20">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            Arrastra o selecciona XML
          </div>
          <div className="text-[10px] text-slate-500 dark:text-[#8b949e] mt-0.5 font-mono">
            KM052/53/54 · CAMT.052/53/54 · Itaú & ueno
          </div>
        </div>

        {/* Quick sample loader (Itaú & ueno bank) */}
        <div className="pt-1">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-[#8b949e] mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#146ef5]" />
            <span>Ejemplos Oficiales de Bancos Paraguay:</span>
          </div>
          <div className="space-y-1.5">
            {SAMPLE_CAMT_FILES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onLoadSampleXml(sample.xml, sample.name)}
                className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-[#11141a] hover:bg-slate-100 dark:hover:bg-[#161b22] border border-slate-200 dark:border-[#222733] hover:border-[#146ef5]/50 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#146ef5] transition-colors">
                    {sample.bank}
                  </div>
                  <div className="text-[9.5px] text-slate-500 dark:text-[#8b949e] truncate">
                    {sample.description}
                  </div>
                </div>
                <span className="shrink-0 p-1 text-slate-400 group-hover:text-white group-hover:bg-[#146ef5] rounded-md transition-all">
                  <Plus className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {files.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-400 dark:text-[#8b949e]">
            <FileCode2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#146ef5]" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ningún extracto cargado</p>
            <p className="text-[10.5px] mt-1 text-slate-500 dark:text-[#8b949e] leading-relaxed">
              Carga extractos bancarios en XML estándar ISO 20022 de Banco Itaú o ueno bank
            </p>
          </div>
        ) : (
          files.map((file) => {
            const isActive = activeFileId === file.id;
            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group flex items-start gap-2.5 ${
                  isActive
                    ? 'bg-[#146ef5]/10 border-[#146ef5] text-slate-900 dark:text-white shadow-sm'
                    : 'bg-white dark:bg-[#11141a] border-slate-200 dark:border-[#222733] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#161b22] hover:border-slate-300 dark:hover:border-[#30363d] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono text-[9px] font-bold mt-0.5 ${
                    isActive
                      ? 'bg-[#146ef5] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-[#161b22] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#30363d]'
                  }`}
                >
                  XML
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                    {file.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-[#8b949e]">
                    <span className="flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3 shrink-0 text-[#146ef5]" />
                      <span className="truncate">{file.data.banco || 'Banco'}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[9.5px] font-mono text-slate-500 dark:text-[#8b949e]">
                    <span className="text-[#146ef5] font-semibold">
                      {file.data.movimientos.length} txs
                    </span>

                    {file.data.validation && (
                      <span
                        className={`flex items-center gap-0.5 font-bold ${
                          file.data.validation.errorCount > 0
                            ? 'text-rose-500'
                            : file.data.validation.warningCount > 0
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                        title={
                          file.data.validation.errorCount > 0
                            ? `${file.data.validation.errorCount} error(es) XSD`
                            : file.data.validation.warningCount > 0
                            ? `${file.data.validation.warningCount} advertencia(s) XSD`
                            : 'ISO 20022 Conforme'
                        }
                      >
                        {file.data.validation.errorCount > 0 ? (
                          <AlertOctagon className="w-3 h-3" />
                        ) : file.data.validation.warningCount > 0 ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        <span>{file.data.validation.conformanceScore}%</span>
                      </span>
                    )}

                    {file.data.fechaFin && (
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {file.data.fechaFin}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  title="Eliminar este extracto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Security Badge */}
      <div className="p-3 border-t border-slate-200 dark:border-[#222733] bg-slate-100/60 dark:bg-[#0c0f14] shrink-0 text-[10.5px] text-slate-600 dark:text-[#8b949e] space-y-1">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacidad 100% Local</span>
        </div>
        <p className="text-[9.5px] text-slate-500 dark:text-[#8b949e] leading-tight">
          Tus extractos financieros se procesan directamente en la memoria del navegador.
        </p>
      </div>
    </aside>
  );
};
