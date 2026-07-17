import Image from 'next/image';
import { Tag, Zap, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative w-full border-b border-white/5 pb-4 pt-6 md:pb-6 md:pt-10 overflow-visible bg-[#0a0a0a]">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1000px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-[1600px] px-6">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          
          {/* Left: Text & Features */}
          <div className="max-w-2xl z-10">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] text-white leading-[1.15]">
              As melhores <span className="text-gradient">ofertas</span><br/> garimpadas a dedo.
            </h1>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-zinc-400 max-w-lg">
              Atualizado 24 horas por dia por nossa Inteligência Artificial.<br className="hidden sm:block"/>
              Se está aqui, é porque está mais barato que em qualquer outro lugar.
            </p>

            {/* Benefícios (Mini Cards) */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-3 shadow-sm transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-purple-500/10 hover:shadow-lg hover:border-purple-500/20">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-zinc-300 font-semibold leading-tight group-hover:text-white">Seleção feita por IA</span>
              </div>
              
              <div className="group flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-3 shadow-sm transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-blue-500/10 hover:shadow-lg hover:border-blue-500/20">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-zinc-300 font-semibold leading-tight group-hover:text-white">Atualização em tempo real</span>
              </div>
              
              <div className="group flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-3 shadow-sm transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-emerald-500/10 hover:shadow-lg hover:border-emerald-500/20">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-zinc-300 font-semibold leading-tight group-hover:text-white">Links 100% seguros</span>
              </div>
              
              <div className="group flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-3 shadow-sm transition-all hover:bg-white/10 hover:-translate-y-1 hover:shadow-amber-500/10 hover:shadow-lg hover:border-amber-500/20">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Trophy className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-zinc-300 font-semibold leading-tight group-hover:text-white">Menor preço encontrado</span>
              </div>
            </div>
          </div>
          
          {/* Right: Marketing Banner (Hidden on small mobile) */}
          <div className="hidden sm:flex relative mx-auto w-full max-w-lg lg:max-w-md justify-end">
            <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#1a103c] to-[#0d0914] p-1 border border-purple-500/20 shadow-2xl shadow-purple-900/20 group animate-pulse-glow-purple">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative rounded-xl overflow-hidden bg-[#0a0a0a] p-6 flex flex-col items-center justify-center text-center">
                <div className="mb-4 relative w-32 h-32 opacity-90 group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src="/images/cart.jpg"
                    alt="Carrinho de compras 3D com logo WR"
                    fill
                    className="object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                    priority
                  />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">Monitoramento <span className="text-purple-400">Inteligente</span></h3>
                
                <ul className="text-sm text-zinc-400 space-y-2 text-left w-full">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Apenas promoções aprovadas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Economia de até 80%
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Mais de 500 ofertas diárias
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
