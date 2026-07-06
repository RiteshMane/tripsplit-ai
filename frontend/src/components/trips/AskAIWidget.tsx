import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Loader2, Mic } from "lucide-react";
import { aiApi } from "@/api/ai";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = ["Who owes me money?", "What was our biggest expense?", "How much did we spend on food?"];

export function AskAIWidget({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm your trip assistant. Ask me anything about this trip's expenses." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const ask = async (question: string) => {
    if (!question.trim()) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const { answer } = await aiApi.ask(tripId, question);
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, I couldn't reach the AI service just now." }]);
    } finally {
      setLoading(false);
    }
  };

  // Voice input via the browser's built-in Web Speech API (Chrome/Edge).
  // Falls back silently if unsupported — no extra dependency required.
  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-mint-500 shadow-glow lg:bottom-8"
      >
        <Sparkles size={22} className="text-white" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-5 z-40 flex h-[480px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-base-border bg-base-900/95 shadow-glass backdrop-blur-xl lg:bottom-28"
          >
            <div className="flex items-center justify-between border-b border-base-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent-400" />
                <span className="font-display text-sm font-semibold">Travel Assistant</span>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-white/40 hover:bg-base-700 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                      m.role === "user" ? "bg-accent-500 text-white" : "bg-base-800 text-white/80"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-base-800 px-3.5 py-2 text-sm text-white/50">
                    <Loader2 size={14} className="animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="rounded-full border border-base-border px-2.5 py-1 text-[11px] text-white/50 hover:text-white">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-base-border p-3"
            >
              <button type="button" onClick={startVoice} className={`rounded-lg p-2 ${listening ? "text-coral-500" : "text-white/40"} hover:bg-base-700`}>
                <Mic size={16} />
              </button>
              <input value={input} onChange={(e) => setInput(e.target.value)} className="input-field flex-1 py-2" placeholder="Ask about this trip..." />
              <button type="submit" className="rounded-lg bg-accent-500 p-2 text-white hover:bg-accent-600">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
