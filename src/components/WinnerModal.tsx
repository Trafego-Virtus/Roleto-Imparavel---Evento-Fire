import React, { useEffect, useState } from 'react';
import { ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { REDIRECT_URL } from '../data/products';

interface WinnerModalProps {
  product: Product | null;
  isOpen: boolean;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  product,
  isOpen,
}) => {
  const [countdown, setCountdown] = useState<number>(4);

  useEffect(() => {
    if (!isOpen || !product) {
      setCountdown(4);
      return;
    }
    setCountdown(4);
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen || !product) return;

    if (countdown <= 0) {
      handleRedirect();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isOpen, product]);

  const handleRedirect = () => {
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = REDIRECT_URL;
      } else {
        window.location.href = REDIRECT_URL;
      }
    } catch {
      window.location.href = REDIRECT_URL;
    }
  };

  if (!isOpen || !product) return null;

  const progressPercent = Math.max(0, Math.min(100, (countdown / 4) * 100));

  return (
    <div
      id="winner-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        id="winner-modal-card"
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-amber-500/50 bg-gradient-to-b from-zinc-900 via-zinc-900/98 to-black p-4 xs:p-6 sm:p-8 text-white shadow-2xl shadow-amber-500/20"
      >
        {/* Glow ambient effects */}
        <div
          className="absolute -top-24 -left-24 h-48 w-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: product.color }}
        />
        <div className="absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-amber-500/25 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative text-center">
          {/* Header pill */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-semibold tracking-wider uppercase mb-2 sm:mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            Parabéns! Você ganhou:
          </div>

          {/* Prominent Winning Product Name */}
          <div
            id="winning-product-badge"
            className="my-3 sm:my-5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 relative overflow-hidden"
            style={{
              backgroundColor: `${product.color}18`,
              borderColor: product.color,
              boxShadow: `0 12px 35px -8px ${product.color}50`,
            }}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7 shrink-0" style={{ color: product.color }} />
              <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                {product.name}
              </h2>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-zinc-200 font-medium">
              {product.tagline}
            </p>
          </div>

          <p className="text-zinc-300 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 leading-relaxed">
            Seu giro único foi concluído com sucesso. Clique no botão abaixo para garantir e resgatar o seu produto no <strong className="text-amber-300">Olimpo</strong>.
          </p>

          {/* Countdown timer & progress */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
            <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 mb-2">
              <span>Redirecionando automaticamente em:</span>
              <span className="font-mono font-bold text-amber-400 text-sm sm:text-base">
                {countdown}s
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-800 h-2 sm:h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Single Action Button: Pegue o seu produto aqui */}
          <div className="flex flex-col gap-3 items-stretch">
            <a
              id="btn-access-olimpo"
              href={REDIRECT_URL}
              target="_top"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                handleRedirect();
              }}
              className="w-full inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-base sm:text-lg md:text-xl shadow-xl shadow-amber-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-amber-200"
            >
              <span>Pegue o seu produto aqui</span>
              <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
