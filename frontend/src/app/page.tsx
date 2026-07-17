import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Sidebar } from '@/components/Sidebar';
import { ProductCard } from '@/components/ProductCard';
import { BadgePercent, ShieldCheck, Tag, Zap, Ticket, Truck, TrendingDown, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProducts(category?: string, q?: string) {
  try {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (q) params.append('q', q);
    
    const url = `http://api:3000/products${params.toString() ? `?${params.toString()}` : ''}`;
      
    const res = await fetch(url, { 
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      console.error("Failed to fetch products, status:", res.status);
      return [];
    }
    
    return res.json();
  } catch (e) {
    console.error("Error fetching products:", e);
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const categoria = typeof params.categoria === 'string' ? params.categoria : undefined;
  const q = typeof params.q === 'string' ? params.q : undefined;
  const products = await getProducts(categoria, q);

  // Mock live count
  const liveCount = (Math.floor(Math.random() * 500) + 12000).toLocaleString('pt-BR');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-purple-500/30">
      
      <Header />
      <Hero />

      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <Sidebar currentCategory={categoria} />

          <div className="flex-1 min-w-0" id="ofertas">
            
            {/* Quick Categories Bar (CRO element) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#1a1128] to-[#111111] border border-purple-500/20 cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all">
                <Zap className="h-5 w-5 text-purple-400 mb-1" />
                <span className="text-xs font-bold text-white text-center">Super Ofertas</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#111c18] to-[#111111] border border-emerald-500/20 cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
                <TrendingDown className="h-5 w-5 text-emerald-400 mb-1" />
                <span className="text-xs font-bold text-white text-center">Queda de Preço</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#241a12] to-[#111111] border border-amber-500/20 cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all">
                <Ticket className="h-5 w-5 text-amber-400 mb-1" />
                <span className="text-xs font-bold text-white text-center">Cupons Ativos</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#111926] to-[#111111] border border-blue-500/20 cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all">
                <Truck className="h-5 w-5 text-blue-400 mb-1" />
                <span className="text-xs font-bold text-white text-center">Frete Grátis</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#221016] to-[#111111] border border-pink-500/20 cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all">
                <Sparkles className="h-5 w-5 text-pink-400 mb-1" />
                <span className="text-xs font-bold text-white text-center">Escolha da IA</span>
              </div>
            </div>

            {/* Header Ofertas */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">🔥</span>
                <h2 className="text-2xl font-black tracking-tight text-white">Ofertas em destaque</h2>
              </div>
              
              <div className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-full px-4 py-1.5 w-fit">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-zinc-300">
                  <span className="text-emerald-400">{liveCount}</span> ofertas encontradas
                </span>
                <span className="text-zinc-600 px-1">•</span>
                <span className="text-[10px] text-zinc-500">Atualizado agora</span>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-[#111111] rounded-2xl border border-white/5">
                <div className="mb-4 text-6xl">🛒</div>
                <h3 className="text-xl font-bold text-zinc-200">Nenhuma oferta no momento</h3>
                <p className="mt-2 text-zinc-500">O robô está garimpando as melhores promoções para você.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {products.map((produto: any) => (
                  <ProductCard key={produto.id} produto={produto} />
                ))}
              </div>
            )}
            
            {/* Bottom Info Badges */}
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#111111] to-[#141414] p-5 border border-white/5 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 shadow-inner">
                  <BadgePercent className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-200">Menor Preço Garantido</h4>
                  <p className="text-xs text-zinc-500 mt-1">Só divulgamos ofertas realmente mais baratas.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#111111] to-[#141414] p-5 border border-white/5 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 shadow-inner">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-200">Compra Segura</h4>
                  <p className="text-xs text-zinc-500 mt-1">Todos os links são verificados e 100% seguros.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#111111] to-[#141414] p-5 border border-white/5 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 shadow-inner">
                  <Tag className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-200">Ofertas Reais</h4>
                  <p className="text-xs text-zinc-500 mt-1">Nada de pegadinhas. Só ofertas de verdade pra você!</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-white/5 bg-[#0a0a0a] py-12 text-center text-zinc-600 text-sm">
        <p>© {new Date().getFullYear()} WR Promoções. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
