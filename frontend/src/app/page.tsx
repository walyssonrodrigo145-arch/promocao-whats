import Image from "next/image";

async function getProducts() {
  try {
    // Busca os produtos direto da API usando a rede interna do Docker (container "api")
    const res = await fetch("http://api:3000/products", { 
      next: { revalidate: 60 } // Revalida o cache a cada 60 segundos
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

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-purple-500/30">
      
      {/* Header Premium */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 font-bold text-white shadow-lg shadow-purple-500/20">
              WR
            </div>
            <span className="text-xl font-bold tracking-tight">Promoções</span>
          </div>
          
          <a
            href="https://chat.whatsapp.com/seu-link-aqui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-green-500/10 px-5 py-2.5 text-sm font-semibold text-green-400 transition-colors hover:bg-green-500/20"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Grupo VIP
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl">
          <div className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20" style={{ clipPath: 'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)' }}></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            As melhores <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">ofertas</span><br/> garimpadas a dedo.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Atualizado 24 horas por dia por nossa Inteligência Artificial. Se está aqui, é porque está mais barato que em qualquer outro lugar.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-6xl">🤖</div>
            <h3 className="text-2xl font-bold">Nenhuma oferta ainda</h3>
            <p className="mt-2 text-zinc-400">O Garimpeiro ainda está buscando as melhores promoções...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((produto: any) => (
              <div key={produto.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-white/10">
                <div className="relative aspect-square overflow-hidden bg-white">
                  {produto.imagem ? (
                    <Image
                      src={produto.imagem}
                      alt={produto.titulo}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-zinc-800 text-zinc-500">Sem Imagem</div>
                  )}
                  {/* Badge de Destaque Aleatório */}
                  <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    🔥 IMPERDÍVEL
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="line-clamp-2 text-base font-medium text-zinc-100 group-hover:text-purple-400 transition-colors">
                      {produto.titulo}
                    </h3>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.precoAtual)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <a
                      href={produto.linkOriginal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] hover:shadow-purple-500/40"
                    >
                      Comprar com Desconto
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/10 py-12 text-center text-zinc-500">
        <p>© {new Date().getFullYear()} WR Promoções. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
