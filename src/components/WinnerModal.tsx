import React from 'react';
import { Sparkles, CheckCircle2, X, RotateCcw, QrCode } from 'lucide-react';
import { Product } from '../types';

interface WinnerModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose?: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div
      id="winner-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        id="winner-modal-card"
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-amber-500/50 bg-gradient-to-b from-zinc-900 via-zinc-900/98 to-black p-5 sm:p-7 text-white shadow-2xl shadow-amber-500/20"
      >
        {/* Close button for multiple uses during events */}
        {onClose && (
          <button
            id="btn-close-modal"
            type="button"
            onClick={onClose}
            title="Fechar / Novo Giro"
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Glow ambient effects */}
        <div
          className="absolute -top-24 -left-24 h-48 w-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: product.color }}
        />
        <div className="absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative text-center flex flex-col items-center">
          {/* Header pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Parabéns! Você ganhou:
          </div>

          {/* Prominent Winning Product Name */}
          <div
            id="winning-product-badge"
            className="w-full mb-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 relative overflow-hidden"
            style={{
              backgroundColor: `${product.color}18`,
              borderColor: product.color,
              boxShadow: `0 10px 30px -8px ${product.color}40`,
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" style={{ color: product.color }} />
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                {product.name}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 font-medium">
              {product.tagline}
            </p>
          </div>

          {/* QR Code Section */}
          <div
            id="qr-code-container"
            className="w-full mb-5 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 flex flex-col items-center shadow-inner"
          >
            <div className="flex items-center gap-1.5 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Escaneie o QR Code</span>
            </div>

            <p className="text-zinc-300 text-xs sm:text-sm mb-3.5 max-w-xs text-center leading-relaxed">
              Aponte a câmera do seu celular para escanear e preencher o formulário.
            </p>

            {/* QR Code Image */}
            <div className="p-3 bg-white rounded-xl shadow-lg border border-zinc-200">
              <img
                id="img-qr-code"
                src="/formulario-roleta-imparavel.png"
                alt="QR Code Formulário Roleta Imparável"
                className="w-44 h-44 sm:w-52 sm:h-52 object-contain block mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Single Action Button: Voltar para a tela inicial / Girar Novamente */}
          {onClose && (
            <button
              id="btn-return-wheel"
              type="button"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-base sm:text-lg shadow-xl shadow-amber-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-amber-200"
            >
              <RotateCcw className="w-5 h-5 shrink-0" />
              <span>Voltar para a Roleta</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
