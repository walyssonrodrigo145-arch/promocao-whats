import Image from 'next/image';
import { Tag, Zap, ShieldCheck, Trophy } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden w-full border-b border-white/5 pb-16 pt-12 md:pt-20">
      <div className="mx-auto max-w-[1600px] px-6">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          
          {/* Left: Text & Features */}
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-[1.1]">
              As melhores <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9b51e0] to-[#5b86e5]">ofertas</span><br/> garimpadas a dedo.
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Atualizado 24 horas por dia por nossa Inteligência Artificial.<br className="hidden sm:block"/>
              Se está aqui, é porque está mais barato que em qualquer outro lugar.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white">
                  <Tag className="h-5 w-5" />
                </div>
                <span className="text-sm text-zinc-300 font-medium">Ofertas selecionadas a dedo</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-sm text-zinc-300 font-medium">Atualizado 24h por dia</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-sm text-zinc-300 font-medium">Links 100% seguros</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white">
                  <Trophy className="h-5 w-5" />
                </div>
                <span className="text-sm text-zinc-300 font-medium">Os menores preços</span>
              </div>
            </div>
          </div>
          
          {/* Right: 3D Image */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none flex justify-center md:justify-end">
            <div className="relative aspect-[4/3] w-full max-w-[500px]">
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
