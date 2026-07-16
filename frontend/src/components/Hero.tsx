import Image from 'next/image';
import { Tag, Zap, ShieldCheck, Trophy } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden w-full border-b border-white/5 pb-8 pt-8 md:pb-8 md:pt-8">
      <div className="mx-auto max-w-[1600px] px-6">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          
          {/* Left: Text & Features */}
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white leading-[1.1]">
              As melhores <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9b51e0] to-[#5b86e5]">ofertas</span><br/> garimpadas a dedo.
            </h1>
            <p className="mt-4 text-base md:text-lg leading-relaxed md:leading-8 text-zinc-400">
              Atualizado 24 horas por dia por nossa Inteligência Artificial.<br className="hidden sm:block"/>
              Se está aqui, é porque está mais barato que em qualquer outro lugar.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white">
                  <Tag className="h-4 w-4" />
                </div>
                <span className="text-xs md:text-sm text-zinc-300 font-medium leading-tight">Ofertas selecionadas a dedo</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="text-xs md:text-sm text-zinc-300 font-medium leading-tight">Atualizado 24h por dia</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-xs md:text-sm text-zinc-300 font-medium leading-tight">Links 100% seguros</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white">
                  <Trophy className="h-4 w-4" />
                </div>
                <span className="text-xs md:text-sm text-zinc-300 font-medium leading-tight">Os menores preços</span>
              </div>
            </div>
          </div>
          
          {/* Right: 3D Image (Hidden on Mobile) */}
          <div className="hidden md:flex relative mx-auto w-full max-w-lg lg:max-w-none justify-end">
            <div className="relative aspect-[4/3] w-full max-w-[350px]">
              <Image
                src="/images/cart.jpg"
                alt="Carrinho de compras 3D com logo WR"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
