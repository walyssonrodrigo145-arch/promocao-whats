"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Loader2, Send, X, ShieldAlert, Zap, Target, TrendingUp } from "lucide-react";

export default function Laboratorio() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const [statusMessage, setStatusMessage] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setAnalysis(null);
    setPublished(false);
    setStatusMessage("Enviando tarefa para o Robô Garimpeiro...");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://76.13.228.159:3000";
      
      const reqRes = await fetch(`${apiUrl}/collector/laboratory/analyze-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!reqRes.ok) throw new Error("Falha ao enfileirar");
      const { taskId } = await reqRes.json();

      // Inicia o Polling
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${apiUrl}/collector/laboratory/analyze-status?taskId=${taskId}`);
          const statusData = await statusRes.json();
          
          if (statusData.data) {
            const st = statusData.data.status;
            if (st === 'PROCESSING') setStatusMessage("Robô Garimpeiro processando link...");
            if (st === 'ERROR') {
              clearInterval(pollInterval);
              setLoading(false);
              alert("Erro do Garimpeiro: " + statusData.data.error);
            }
            if (st === 'COMPLETED') {
              clearInterval(pollInterval);
              setAnalysis(statusData.data.analysisResult);
              setLoading(false);
              setStatusMessage("");
            }
          }
        } catch (pollErr) {
          console.error("Polling error", pollErr);
        }
      }, 2000);

    } catch (err) {
      alert("Erro ao analisar produto. Verifique o console.");
      console.error(err);
      setLoading(false);
      setStatusMessage("");
    }
  };

  const handlePublish = async () => {
    if (!analysis) return;
    setPublishing(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://76.13.228.159:3000";
      const res = await fetch(`${apiUrl}/collector/laboratory/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis }),
      });

      if (!res.ok) throw new Error("Falha ao publicar");
      setPublished(true);
    } catch (err) {
      alert("Erro ao publicar oferta.");
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-purple-500/30 pb-20">
      {/* Header Simples */}
      <header className="border-b border-white/10 bg-[#0a0a0a] px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7e22ce] to-[#10b981] font-bold text-white shadow-lg">
            🧪
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Laboratório de Ofertas</h1>
            <p className="text-sm text-zinc-400">Área Restrita - Análise e Disparo Manual</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl mt-12 px-6">
        
        {/* Formulário de Busca */}
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-2xl">
          <form onSubmit={handleAnalyze} className="flex gap-4 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Cole o link de afiliado do Mercado Livre aqui..."
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">{statusMessage || "Analisando com IA"}</span>
                </>
              ) : "Analisar com IA"}
            </button>
          </form>
        </div>

        {/* Relatório da IA */}
        {analysis && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Coluna 1: Produto (Esquerda) */}
            <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
              <div className="relative aspect-square bg-white">
                {analysis._raw?.image && (
                  <Image src={analysis._raw.image} alt={analysis.nome} fill className="object-contain p-4" />
                )}
              </div>
              <div className="p-5 flex-1">
                <h2 className="text-lg font-bold text-white mb-2 line-clamp-2">{analysis.nome || analysis._raw?.title}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded font-medium">
                    {analysis.nicho || "Nicho Indefinido"}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-emerald-400">R$ {analysis._raw?.price}</p>
                  <p className="text-sm text-zinc-500 line-through">De: {analysis.preco_antigo}</p>
                </div>
              </div>
            </div>

            {/* Coluna 2: Análise da IA (Centro e Direita) */}
            <div className="md:col-span-2 bg-[#111] rounded-2xl border border-white/5 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Raio-X da Oferta</h3>
                  <p className="text-sm text-zinc-400 mt-1">Analisado pela IA Analista Especialista</p>
                </div>
                
                {/* Score */}
                <div className="text-right flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Score</p>
                    <p className={`text-4xl font-black ${
                      (analysis.score >= 80) ? 'text-emerald-400' :
                      (analysis.score >= 60) ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {analysis.score || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Prioridade</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold ${
                      analysis.prioridade === 'Alta' ? 'bg-red-500/20 text-red-400' :
                      analysis.prioridade === 'Média' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {analysis.prioridade || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações Estratégicas */}
              <div className="grid grid-cols-2 gap-6 flex-1">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-3"><Target className="w-4 h-4 text-purple-400"/> Gatilhos Encontrados</h4>
                  <ul className="space-y-2">
                    {analysis.gatilhos?.map((g: string, i: number) => (
                      <li key={i} className="text-sm text-zinc-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>{g}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-3"><Zap className="w-4 h-4 text-emerald-400"/> Benefícios Destacados</h4>
                  <ul className="space-y-2">
                    {analysis.beneficios?.map((b: string, i: number) => (
                      <li key={i} className="text-sm text-zinc-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ações */}
              <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                <button
                  onClick={() => setAnalysis(null)}
                  className="px-6 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Descartar
                </button>
                
                <button
                  onClick={handlePublish}
                  disabled={publishing || published}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    published 
                      ? 'bg-emerald-600 text-white cursor-default' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-zinc-900 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {publishing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Gerando Copy e Disparando...</>
                  ) : published ? (
                    <>✅ Oferta Disparada com Sucesso!</>
                  ) : (
                    <><Send className="w-5 h-5" /> Aprovar e Disparar no WhatsApp</>
                  )}
                </button>
              </div>
              
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
