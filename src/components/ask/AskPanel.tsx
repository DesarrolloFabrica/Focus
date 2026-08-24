import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CornerDownRight, ArrowRight, Check } from 'lucide-react';
import { ASK_PRESET_SUGGESTIONS } from '../../data/mockData';
import { AskSuggestion } from '../../types/focus';

interface AskPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (actionType: string) => void;
}

export const AskPanel: React.FC<AskPanelProps> = ({ isOpen, onClose, onSelectAction }) => {
  const [activeQuery, setActiveQuery] = useState<string>('¿Qué debería revisar primero?');
  const [customInput, setCustomInput] = useState<string>('');
  const [currentResponse, setCurrentResponse] = useState<AskSuggestion>(ASK_PRESET_SUGGESTIONS[0]);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const handleSelectSuggestion = (suggestion: AskSuggestion) => {
    setActiveQuery(suggestion.query);
    setIsThinking(true);
    setTimeout(() => {
      setCurrentResponse(suggestion);
      setIsThinking(false);
    }, 220);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const userQ = customInput.trim();
    setActiveQuery(userQ);
    setCustomInput('');
    setIsThinking(true);

    setTimeout(() => {
      const matched = ASK_PRESET_SUGGESTIONS.find((s) =>
        s.query.toLowerCase().includes(userQ.toLowerCase())
      );

      if (matched) {
        setCurrentResponse(matched);
      } else {
        setCurrentResponse({
          id: 'custom-resp',
          query: userQ,
          answer: `Interpretando «${userQ}» en el contexto del Proceso de Validación: el factor determinante sigue siendo la acumulación en el Punto B, donde 9 de los 12 elementos retrasados esperan autorización.`,
          subPoints: [
            {
              title: 'Análisis contextualizado',
              desc: 'No se detecta afectación en los demás 8 procesos supervisados.',
            },
            {
              title: 'Impacto directo',
              desc: 'La resolución de estos casos restauraría el SLA de 2.1 días en 48h.',
            },
          ],
          recommendedActionLabel: 'Revisar casos prioritarios',
          recommendedActionType: 'focus_cases',
        });
      }
      setIsThinking(false);
    }, 280);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity"
          />

          {/* Centered Command-Style Modal Interface */}
          <motion.div
            id="focus-ask-interface"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed inset-x-4 top-14 md:top-20 max-w-2xl mx-auto bg-[#050A18] border border-blue-500/30 rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[86vh] flex flex-col select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#030712]/90">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-blue-400 uppercase">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>CONSULTA CONTEXTUAL DIRECTA</span>
              </div>
              <button
                id="btn-close-ask-panel"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Outfit',sans-serif]">
                  Pregunta sobre este hallazgo.
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>FOCUS ya tiene en memoria el contexto del Proceso de Validación y Cierre.</span>
                </p>
              </div>

              {/* Preset suggestion chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono tracking-wider uppercase text-slate-500 block font-semibold">
                  PREGUNTAS FRECUENTES
                </span>
                <div className="flex flex-wrap gap-2">
                  {ASK_PRESET_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        activeQuery === suggestion.query
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                          : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-white/[0.06]'
                      }`}
                    >
                      {suggestion.query}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Query & Response Container */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-slate-900/40 border border-blue-500/25 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-blue-300 font-semibold">
                  <CornerDownRight className="w-3.5 h-3.5 text-blue-400" />
                  <span>FOCUS RESPONDE:</span>
                </div>

                {isThinking ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-sm text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    <span>Interpretando contexto operacional...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-base sm:text-lg text-slate-100 font-light leading-relaxed">
                      "{currentResponse.answer}"
                    </p>

                    {currentResponse.subPoints && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {currentResponse.subPoints.map((point, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.04] space-y-1"
                          >
                            <span className="text-xs font-mono font-semibold text-blue-300 block">
                              {point.title}
                            </span>
                            <span className="text-xs text-slate-400 font-light block leading-snug">
                              {point.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentResponse.recommendedActionLabel && (
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            onClose();
                            if (onSelectAction) onSelectAction(currentResponse.recommendedActionType || 'focus_cases');
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all"
                        >
                          <span>{currentResponse.recommendedActionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Freeform Prompt Input */}
              <form onSubmit={handleCustomSubmit} className="relative pt-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Escribe una pregunta libre (ej: ¿quién lidera Punto B?)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-full px-5 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors pr-12"
                />
                <button
                  type="submit"
                  disabled={!customInput.trim()}
                  className="absolute right-2 top-3.5 w-8 h-8 rounded-full bg-blue-600 disabled:opacity-30 text-white flex items-center justify-center transition-all hover:bg-blue-500"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
