import Image from 'next/image';
import { Heart, Star, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  produto: any;
}

export function ProductCard({ produto }: ProductCardProps) {
  // Generate a random mock discount since the DB only has precoAtual
  // Ideally, this should come from the DB (precoAntigo vs precoAtual)
  // For the sake of the mockup's visual fidelity, we'll simulate a 30% discount if there's no original price
  const currentPrice = produto.precoAtual;
  const originalPrice = currentPrice * 1.35; // Simulate 35% higher original price
  const discountAmount = originalPrice - currentPrice;
  const discountPercentage = Math.round((discountAmount / originalPrice) * 100);

  // Random mock reviews
  const reviewCount = Math.floor(Math.random() * 2000) + 100;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#141414] border border-white/5 shadow-2xl transition-all duration-300 hover:border-purple-500/30 hover:-translate-y-1">
      
      {/* Top Badges */}
      <div className="absolute top-3 w-full px-3 flex justify-between items-start z-10">
        <div className="rounded-full bg-[#8b5cf6] px-2 py-1 text-xs font-bold text-white shadow-lg">
          -{discountPercentage}%
        </div>
        <button className="text-zinc-500 hover:text-red-500 transition-colors">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden p-6 bg-gradient-to-b from-[#1a1a1a] to-[#141414]">
        {produto.imagem ? (
          <Image
            src={produto.imagem}
            alt={produto.titulo}
            fill
            className="object-contain p-8 mix-blend-screen transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-600">
            Sem Foto
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-5 flex-1">
        <h3 className="line-clamp-2 text-sm font-medium text-zinc-200 group-hover:text-purple-400 transition-colors min-h-[40px]">
          {produto.titulo}
        </h3>
        
        {/* Rating Mock */}
        <div className="mt-2 flex items-center gap-1">
          <div className="flex text-[#eab308]">
            <Star className="h-3 w-3 fill-current" />
            <Star className="h-3 w-3 fill-current" />
            <Star className="h-3 w-3 fill-current" />
            <Star className="h-3 w-3 fill-current" />
            <Star className="h-3 w-3 fill-current" />
          </div>
          <span className="text-xs text-zinc-500">({reviewCount.toLocaleString('pt-BR')})</span>
        </div>

        {/* Pricing */}
        <div className="mt-4 flex items-end gap-3">
          <span className="text-2xl font-extrabold text-[#9b51e0]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentPrice)}
          </span>
          <span className="text-sm text-zinc-500 line-through pb-1">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalPrice)}
          </span>
        </div>

        {/* Discount Badge */}
        <div className="mt-2">
          <span className="inline-block rounded bg-[#10b981]/10 px-2 py-0.5 text-xs font-semibold text-[#10b981]">
            Economize {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discountAmount)}
          </span>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <a
            href={produto.linkOriginal}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:bg-[#7c3aed] active:scale-95"
          >
            Ver oferta
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
