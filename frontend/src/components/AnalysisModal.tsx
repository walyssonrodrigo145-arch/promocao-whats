import { X, Cpu, BrainCircuit, Target, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface AnalysisModalProps {
  analysis: any;
  isOpen: boolean;
  onClose: () => void;
}

export function AnalysisModal({ analysis, isOpen, onClose }: AnalysisModalProps) {
  if (!isOpen || !analysis) return null;

  const getArray = (val: any) => Array.isArray(val) ? val : (val ? [val] : []);
  const getJoined = (val: any) => Array.isArray(val) ? val.join(', ') : (val || '');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">Relatório de Inteligência</h2>
              <p className="text-sm text-purple-300/70">Mapeamento Cognitivo da IA sobre a Oferta</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Score IA</span>
              <div className="text-3xl font-black text-emerald-400">{analysis.score || 'N/A'}</div>
            </div>
            <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Prioridade</span>
              <div className="text-xl font-bold text-amber-400 mt-1">{analysis.prioridade || 'N/A'}</div>
            </div>
            <div className="bg-black/50 border border-white/5 p-4 rounded-xl col-span-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Classificação</span>
              <div className="text-sm font-medium text-purple-300 mt-1 leading-snug">{analysis.classificacao || 'N/A'}</div>
            </div>
          </div>

          {/* Dores & Público */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-white font-bold border-b border-white/10 pb-2">
                <Target className="w-4 h-4 text-rose-400" /> Dores do Cliente Resolvidas
              </h3>
              <ul className="space-y-2">
                {getArray(analysis.dores_resolvidas).map((dor: string, i: number) => (
                  <li key={i} className="text-sm text-zinc-300 flex items-start gap-2 bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
                    <span className="text-rose-400 shrink-0">❖</span>
                    {dor}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-white font-bold border-b border-white/10 pb-2">
                <Cpu className="w-4 h-4 text-blue-400" /> Público-Alvo e Intenção
              </h3>
              <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/10 space-y-3">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Perfis</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {getArray(analysis.publico_alvo).map((p: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-md">{p}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Intenção de Compra</span>
                  <p className="text-sm text-zinc-300 mt-1">{getJoined(analysis.intencao_compra)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gatilhos & Palavras */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-white font-bold border-b border-white/10 pb-2">
                <Zap className="w-4 h-4 text-yellow-400" /> Gatilhos Mentais
              </h3>
              <div className="flex flex-wrap gap-2">
                {getArray(analysis.gatilhos).map((g: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm rounded-lg font-medium">
                    {g}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-white font-bold border-b border-white/10 pb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Palavras de Impacto
              </h3>
              <div className="flex flex-wrap gap-2">
                {getArray(analysis.palavras_impacto).map((p: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Justificativa ou Motivo do Score */}
          {(analysis.motivo_descarte || analysis.observacao) && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-bold text-amber-400 block mb-1">Observação Crítica da IA</span>
                <p className="text-sm text-amber-200/80 leading-relaxed">
                  {analysis.motivo_descarte || analysis.observacao}
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
