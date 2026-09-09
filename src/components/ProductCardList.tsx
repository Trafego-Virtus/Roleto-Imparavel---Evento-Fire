import React from 'react';
import { Product } from '../types';
import { Crown, TrendingUp, CheckSquare, Sparkles, Zap, Award, Clock } from 'lucide-react';

interface ProductCardListProps {
  products: Product[];
  activeProduct: Product | null;
}

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  Crown,
  TrendingUp,
  CheckSquare,
  Sparkles,
  Zap,
  Award,
  Clock,
};

export const ProductCardList: React.FC<ProductCardListProps> = ({ products, activeProduct }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-6 sm:mt-8 px-2 sm:px-4">
      <div className="text-center mb-3 sm:mb-4">
        <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 font-semibold">
          7 Produtos Participantes
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {products.map((product) => {
          const Icon = ICONS[product.iconName] || Sparkles;
          const isSelected = activeProduct?.id === product.id;

          return (
            <div
              key={product.id}
              id={`product-item-${product.id}`}
              className={`relative p-2.5 sm:p-3 rounded-xl border transition-all duration-300 text-left ${
                isSelected
                  ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/20 scale-[1.02] sm:scale-105'
                  : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900/90'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <span
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: product.color }}
                />
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-zinc-200 truncate">
                  {product.name}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-tight line-clamp-1 sm:line-clamp-2">
                {product.tagline}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
