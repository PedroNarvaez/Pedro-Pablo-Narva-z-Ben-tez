import React, { useState } from 'react';
import {
  X,
  FileArchive,
  Download,
  CheckCircle2,
  FolderTree,
  Server,
  Cloud,
  Loader2,
  Terminal,
} from 'lucide-react';
import { createFullProjectZip } from '../utils/zipGenerator';
import { AnalyticsService } from '../services/analyticsService';

interface ZipExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ZipExporterModal: React.FC<ZipExporterModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setIsGenerating(true);
      const zipBlob = await createFullProjectZip();
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ConciliaPyme_Full_Project_Tesis_Paraguay.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      AnalyticsService.trackEvent('download_full_project_zip', {
        timestamp: new Date().toISOString(),
      });

      onShowToast('success', '✅ Paquete ZIP completo descargado con éxito. ¡Listo para desplegar!');
    } catch (err: any) {
      console.error(err);
      onShowToast('error', 'Error al empaquetar el archivo ZIP: ' + (err.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131826] border border-[#8b93a7]/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#8b93a7]/15 flex items-center justify-between bg-[#0e121a]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c47046] to-[#2d9e6e] text-white flex items-center justify-center font-bold shadow-lg shadow-[#c47046]/20">
              <FileArchive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#e8e5df]">Empaquetado Completo del Proyecto (.ZIP)</h2>
              <p className="text-xs text-[#8b93a7]">Código Fuente + Documentación de Tesis + Despliegue en Servidor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b93a7] hover:text-[#e8e5df] hover:bg-[#181e2e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-[#e8e5df]">
          <div className="bg-[#181e2e]/50 border border-[#8b93a7]/15 p-4 rounded-xl space-y-2">
            <h3 className="text-sm font-bold text-[#c47046]">¿Qué contiene este archivo ZIP?</h3>
            <p className="text-[#8b93a7] leading-relaxed text-[11.5px]">
              El archivo ZIP generado contiene todo el ecosistema de la aplicación listo para ser subido a cualquier
              hosting, VPS, servidor en Paraguay o entregado a la mesa examinadora de tu tesis:
            </p>
          </div>

          {/* Checklist of files */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#8b93a7] uppercase tracking-wider">Estructura del Paquete:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { name: 'TESIS_INFORMATICA_PARAGUAY.md', desc: 'Memoria académica de grado completa' },
                { name: 'MANUAL_DESPLIEGUE_PYME.md', desc: 'Guía paso a paso para Vercel/VPS' },
                { name: 'package.json & vite.config.ts', desc: 'Configuración moderna de build' },
                { name: '.env.example', desc: 'Variables de Google Auth, GA4 y Storage' },
                { name: 'Dockerfile & nginx.conf', desc: 'Contenedor Docker para producción' },
                { name: 'vercel.json & netlify.toml', desc: 'Despliegue serverless con 1 clic' },
                { name: 'dist_single_standalone.html', desc: 'Versión autónoma en un solo archivo' },
                { name: 'sample_xmls/ (Itaú PY, BBVA, Santander)', desc: 'Ficheros XML CAMT de prueba' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="p-2.5 rounded-lg bg-[#0a0c10] border border-[#8b93a7]/15 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#2d9e6e] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-mono font-bold text-[#e8e5df] text-[11px]">{item.name}</div>
                    <div className="text-[10px] text-[#8b93a7]">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick instructions */}
          <div className="bg-[#0a0c10] border border-[#8b93a7]/20 p-3.5 rounded-xl font-mono text-[11px] text-[#7ba8b8] space-y-1">
            <div className="text-[#8b93a7] font-bold">// Cómo ejecutar tras descomprimir:</div>
            <div>$ npm install</div>
            <div>$ npm run build</div>
            <div>$ npm run preview  # o subir la carpeta dist/ a tu hosting</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#8b93a7]/15 flex items-center justify-between bg-[#0e121a]/90">
          <div className="text-[11px] text-[#8b93a7]">Generación en caliente en memoria</div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#181e2e] border border-[#8b93a7]/20 text-[#8b93a7] hover:text-[#e8e5df] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-[#c47046] to-[#2d9e6e] text-white hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#c47046]/20 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isGenerating ? 'Generando ZIP...' : 'Descargar Proyecto Completo (.ZIP)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
