import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Sidebar } from '@/components/Sidebar';
import { ProductCard } from '@/components/ProductCard';
import { BadgePercent, ShieldCheck, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProducts(category?: string) {
  try {
    const url = category 
      ? `http://api:3000/products?category=${encodeURIComponent(category)}`
      : "http://api:3000/products";
      
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
  const products = await getProducts(categoria);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-purple-500/30">
      
      <Header />
      <Hero />

      <main className="mx-auto max-w-[1600px] px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <Sidebar currentCategory={categoria} />

          <div className="flex-1 min-w-0">
            <div className="mb-8 flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <h2 className="text-2xl font-bold tracking-tight text-white">Ofertas em destaque</h2>
              <div className="ml-auto">
                <a href="#" className="text-sm font-medium text-purple-400 hover:text-purple-300">
                  Ver todas &rarr;
                </a>
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
              <div className="flex items-center gap-4 rounded-2xl bg-[#111111] p-5 border border-white/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                  <BadgePercent className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-200">Menor Preço Garantido</h4>
                  <p className="text-xs text-zinc-500 mt-1">Só divulgamos ofertas realmente mais baratas.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-[#111111] p-5 border border-white/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-200">Compra Segura</h4>
                  <p className="text-xs text-zinc-500 mt-1">Todos os links são verificados e 100% seguros.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-[#111111] p-5 border border-white/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
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
