import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { PRODUCTS } from './data/products';
import { Product } from './types';
import { RouletteWheel } from './components/RouletteWheel';
import { WinnerModal } from './components/WinnerModal';
import { toggleMute, getMuteState } from './utils/audio';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(getMuteState());

  // Clear any previous single-spin locks so the event wheel can run freely
  useEffect(() => {
    try {
      localStorage.removeItem('olimpo_has_spun');
      localStorage.removeItem('olimpo_won_product_id');
    } catch {
      // ignore
    }
  }, []);

  const handleSpinEnd = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleToggleSound = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black overflow-x-hidden font-sans">
      {/* Background radial ambiance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-yellow-600/5 rounded-full blur-3xl" />
      </div>

      {/* Discrete floating sound toggle */}
      <button
        id="btn-toggle-sound"
        type="button"
        onClick={handleToggleSound}
        title={isMuted ? 'Ativar Som' : 'Silenciar Som'}
        className="fixed top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 sm:p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800/90 backdrop-blur border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors shadow-lg cursor-pointer"
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
      </button>

      {/* Main Content Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-3 sm:px-6 max-w-6xl mx-auto w-full">
        {/* Title Section */}
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-14 px-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            Sorteio Exclusivo
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            <span className="block">Gire a Roleta e Ganhe</span>
            <span className="block mt-1 sm:mt-2">1 Treinamento Agora</span>
          </h1>
        </div>

        {/* The Roulette Wheel Component */}
        <RouletteWheel
          products={PRODUCTS}
          onSpinEnd={handleSpinEnd}
          isSpinning={isSpinning}
          setIsSpinning={setIsSpinning}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 py-4 text-center text-xs text-zinc-500">
        <p>Roleta Imparável • Sorteio Exclusivo de Produtos</p>
      </footer>

      {/* Winner and Redirect Modal */}
      <WinnerModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
