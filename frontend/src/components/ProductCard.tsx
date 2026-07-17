import Image from 'next/image';
import { Heart, Star, ExternalLink, ShieldCheck, Sparkles, TrendingDown, Clock } from 'lucide-react';

interface ProductCardProps {
  produto: any;
}

export function ProductCard({ produto }: ProductCardProps) {
  // Generate random mock data since DB doesn't have it all yet
  const currentPrice = produto.precoAtual;
  const originalPrice = currentPrice * 1.35; 
  const discountAmount = originalPrice - currentPrice;
  const discountPercentage = Math.round((discountAmount / originalPrice) * 100);

  const reviewCount = Math.floor(Math.random() * 5000) + 100;
  const aiScore = (Math.random() * (9.9 - 8.5) + 8.5).toFixed(1);
  const viewers = Math.floor(Math.random() * 50) + 10;
  
  const marketplaces = ['Mercado Livre', 'Amazon', 'Shopee', 'Magalu'];
  const marketplace = marketplaces[Math.floor(Math.random() * marketplaces.length)];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#111111] border border-white/5 shadow-xl transition-all duration-300 hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/10">
      
      {/* Top Badges */}
      <div className="absolute top-3 w-full px-3 flex justify-between items-start z-10 pointer-events-none">
        <div className="flex flex-col gap-1.5">
          <div className="rounded bg-gradient-to-r from-purple-600 to-blue-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-lg uppercase tracking-wider backdrop-blur-md">
            🔥 Top Oferta
          </div>
          <div className="w-fit rounded bg-[#10b981] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-lg uppercase tracking-wider">
            -{discountPercentage}%
          </div>
        </div>
        <button className="pointer-events-auto rounded-full bg-black/40 p-1.5 text-zinc-400 backdrop-blur-md transition-colors hover:text-red-500 hover:bg-black/60">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden p-6 bg-white">
        {produto.imagem ? (
          <Image
            src={produto.imagem}
            alt={produto.titulo}
            fill
            className="object-contain p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            Sem Foto
          </div>
        )}

        {/* AI Score Badge */}
        <div className="absolute bottom-2 left-2 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 px-2 py-1 flex items-center gap-1.5 shadow-lg">
          <Sparkles className="h-3 w-3 text-purple-400" />
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold leading-none">Nota IA</span>
            <span className="text-xs font-extrabold text-white leading-none mt-0.5">{aiScore}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-4 flex-1">
        {/* Marketplace & Rating */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            {marketplace}
          </span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-[#eab308] text-[#eab308]" />
            <span className="text-[10px] font-bold text-zinc-300">{aiScore}</span>
            <span className="text-[10px] text-zinc-500">({reviewCount})</span>
          </div>
        </div>

        <h3 className="line-clamp-2 text-sm font-medium text-zinc-200 group-hover:text-purple-400 transition-colors min-h-[40px] leading-snug">
          {produto.titulo}
        </h3>
        
        {/* Pricing Area */}
        <div className="mt-3 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 line-through font-medium">
              De: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalPrice)}
            </span>
          </div>
          
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-[#9b51e0] tracking-tight leading-none">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentPrice)}
            </span>
          </div>

          <span className="inline-block w-fit mt-1 rounded bg-[#10b981]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#10b981]">
            Economia: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discountAmount)}
          </span>
        </div>

        {/* Mini Price History Chart (Mock SVG) */}
        <div className="mt-4 border-t border-white/5 pt-3">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
            <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-emerald-500" /> Histórico 180d</span>
            <span>Menor Preço!</span>
          </div>
          {/* Simple Mock Sparkline */}
          <svg className="w-full h-4" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M0,5 L20,15 L40,8 L60,18 L80,12 L100,19" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="100" cy="19" r="2" fill="#10b981" />
          </svg>
        </div>

        {/* Urgency */}
        <div className="mt-3 flex items-center justify-center gap-1.5 rounded bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-500">
          <Clock className="h-3 w-3" />
          <span>{viewers} pessoas vendo agora</span>
        </div>

        {/* Action Button */}
        <div className="mt-3">
          <a
            href={produto.linkOriginal}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-[#10b981] px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95"
          >
            <span className="group-hover/btn:animate-pulse">🛒</span> Ver oferta
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
