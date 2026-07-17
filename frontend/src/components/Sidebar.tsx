import { Home, Smartphone, Sofa, Heart, Shirt, Dumbbell, Monitor, Gamepad2, Car } from 'lucide-react';
import Link from 'next/link';

export function Sidebar({ currentCategory }: { currentCategory?: string }) {
  const categories = [
    { name: 'Todas as ofertas', icon: Home },
    { name: 'Eletrônicos', icon: Smartphone },
    { name: 'Casa e Decoração', icon: Sofa },
    { name: 'Beleza e Saúde', icon: Heart },
    { name: 'Moda', icon: Shirt },
    { name: 'Esportes', icon: Dumbbell },
    { name: 'Informática', icon: Monitor },
    { name: 'Brinquedos', icon: Gamepad2 },
    { name: 'Automotivo', icon: Car },
  ];

  return (
    <aside id="categorias" className="w-full lg:w-64 flex-shrink-0 scroll-mt-24">
      <div className="rounded-2xl bg-[#111111] p-3 lg:p-4 shadow-xl border border-white/5">
        <h3 className="hidden lg:block mb-4 px-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
          Explorar Categorias
        </h3>
        <nav className="flex overflow-x-auto lg:flex-col lg:space-y-1.5 gap-2 pb-2 lg:pb-0 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            
            // "Todas as ofertas" is active when no specific category is selected
            const isTodas = category.name === 'Todas as ofertas';
            const isActive = isTodas ? !currentCategory : currentCategory === category.name;
            
            const href = isTodas ? '/' : `/?categoria=${encodeURIComponent(category.name)}`;

            return (
              <Link
                key={category.name}
                href={href}
                scroll={false}
                className={`group flex flex-none items-center justify-between gap-2 lg:gap-3 rounded-xl px-4 lg:px-3 py-2.5 text-xs lg:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-transparent text-purple-400 border border-purple-500/20 shadow-inner'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  <Icon className={`h-4 w-4 lg:h-5 lg:w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                  <span className="whitespace-nowrap font-semibold">{category.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block mt-8 rounded-xl bg-gradient-to-br from-[#1a2f26] to-[#0d1c16] p-4 border border-emerald-500/20 shadow-lg shadow-emerald-900/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10b981] text-white shadow-lg animate-pulse-glow">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            </div>
            <span className="font-bold text-white tracking-tight">Grupo VIP</span>
          </div>
          <p className="text-xs text-emerald-100/70 leading-relaxed mb-3">
            Receba ofertas exclusivas primeiro. <span className="font-bold text-emerald-400">+3.500 membros</span>
          </p>
          <a
            href="https://chat.whatsapp.com/seu-link-aqui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/30 hover:text-emerald-300"
          >
            Entrar no Grupo
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
