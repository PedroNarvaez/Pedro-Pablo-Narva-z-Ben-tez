import React, { useState } from 'react';
import { X, Copy, Check, CodeXml } from 'lucide-react';

interface XmlPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  xmlContent: string;
  fileName: string;
}

export const XmlPreviewModal: React.FC<XmlPreviewModalProps> = ({
  isOpen,
  onClose,
  xmlContent,
  fileName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131826] border border-[#8b93a7]/20 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#8b93a7]/15 bg-[#181e2e]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c47046]/15 text-[#c47046] flex items-center justify-center border border-[#c47046]/30">
              <CodeXml className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#e8e5df]">
                Código Fuente XML ISO 20022
              </h2>
              <p className="text-[11px] font-mono text-[#8b93a7]">{fileName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#181e2e] hover:bg-[#0a0c10] text-[#e8e5df] border border-[#8b93a7]/20 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#2d9e6e]" />
                  <span className="text-[#2d9e6e]">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar XML</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#8b93a7] hover:text-[#e8e5df] hover:bg-[#181e2e] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#0a0c10]">
          <pre className="font-mono text-xs text-[#7ba8b8] leading-relaxed select-all whitespace-pre-wrap word-break-break-all">
            {xmlContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#8b93a7]/15 bg-[#181e2e]/50 flex items-center justify-between text-[11px] text-[#8b93a7]">
          <span>Estructura parseada automáticamente con DOMParser ISO 20022</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs text-[#e8e5df] hover:bg-[#131826] rounded-md transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
