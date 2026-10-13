import React, { useState, useRef, useEffect } from 'react';
import { InstrumentType, Exercise } from '../types';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  PlusCircle,
  Play,
} from 'lucide-react';

interface Props {
  instrument: InstrumentType;
  onPracticeGeneratedExercise?: (exercise: Exercise) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedExercise?: Exercise;
}

const QUICK_QUESTIONS: Record<InstrumentType, string[]> = {
  keyboard: [
    'How do I keep my wrists from collapsing during scale passages?',
    'What is the correct thumb under tuck technique for C major?',
    'How can I play with dynamic expression without tensing my shoulders?',
    'Generate a customized 5-finger speed independence drill for me.',
  ],
  guitar: [
    'Why do my chords buzz even when I press hard?',
    'How should my left thumb be positioned behind the neck?',
    'How do I switch quickly between C Major and G Major chords?',
    'Generate a 3-minute finger dexterity exercise for frets 1 to 4.',
  ],
  violin: [
    'Why is my tone raspy and scratchy near the bow frog?',
    'How do I keep the bow 90 degrees parallel to the bridge?',
    'How can I find accurate 1st and 3rd finger intonation without frets?',
    'Generate an intonation exercise for A and E string finger transitions.',
  ],
  bansuri: [
    'Why does my low Sa sound airy or not sound at all?',
    'How do I seal the bamboo holes completely with flat finger pads?',
    'What is the difference between Shuddha and Teevra Ma in Raag Yaman?',
    'Generate an Indian Classical Alankar practice sequence for Sa-Re-Ga-Ma.',
  ],
};

export const AITeacherChat: React.FC<Props> = ({
  instrument,
  onPracticeGeneratedExercise,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Namaste & Welcome! I am your VIBEX AI Music Mentor for **${instrument.toUpperCase()}**.\n\nAsk me any questions about posture, finger placement, intonation, Indian classical theory, or Western harmony. You can also ask me to **generate a custom interactive exercise** tailored to what you are struggling with!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDrill, setIsGeneratingDrill] = useState(false);
  const [drillTopic, setDrillTopic] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send question to AI
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/mentor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument,
          message: query,
          conversationHistory: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('Failed to get reply');
      }
    } catch (err) {
      console.warn('AI chat failed, using fallback advice', err);
      const fallbackMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: `Here is a foundational tip for ${instrument}: Remember to keep your shoulders dropped, breathe deeply into your diaphragm, and focus on slow, deliberate muscle memory repetitions. Consistency of 15 minutes a day produces far superior intonation than rushed practicing.`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Custom Exercise
  const handleGenerateCustomExercise = async () => {
    if (!drillTopic.trim() || isGeneratingDrill) return;

    setIsGeneratingDrill(true);
    try {
      const res = await fetch('/api/ai/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument,
          skillArea: drillTopic,
          difficulty: 'Beginner',
        }),
      });

      if (res.ok) {
        const generatedExercise: Exercise = await res.json();
        const aiMsg: Message = {
          id: String(Date.now()),
          sender: 'ai',
          text: `✨ I have engineered a customized micro-drill for you: **${generatedExercise.title}**.\n\n*${generatedExercise.description || generatedExercise.instructions || 'Interactive exercise ready.'}*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedExercise: generatedExercise,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setDrillTopic('');
      }
    } catch (err) {
      console.error('Failed to generate exercise', err);
    } finally {
      setIsGeneratingDrill(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Quick Questions & Custom Generator */}
      <div className="lg:col-span-4 space-y-5">
        {/* Custom AI Drill Generator Card */}
        <div className="bg-[#0F1115] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-[#E5C07B] font-bold text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>AI Micro-Drill Synthesizer</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Specify a technique, chord, or swara transition that is challenging you, and AI will synthesize an interactive practice module.
          </p>

          <div className="space-y-3 pt-1">
            <input
              type="text"
              value={drillTopic}
              onChange={(e) => setDrillTopic(e.target.value)}
              placeholder="e.g. Switching from C to G chord, Pa to Dha..."
              className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#E5C07B]"
            />
            <button
              type="button"
              onClick={handleGenerateCustomExercise}
              disabled={!drillTopic.trim() || isGeneratingDrill}
              className="w-full py-3 rounded-full bg-[#E5C07B] hover:bg-[#d4ae67] disabled:opacity-50 text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-[#E5C07B]/20"
            >
              {isGeneratingDrill ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Exercise...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>SYNTHESIZE DRILL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Mentor Inquiries */}
        <div className="bg-[#0F1115] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-3">
          <div className="flex items-center gap-2 text-white/80 font-bold text-xs uppercase tracking-widest">
            <Lightbulb className="w-4 h-4 text-[#E5C07B]" />
            <span>Popular {instrument} Inquiries</span>
          </div>

          <div className="space-y-2 pt-1">
            {QUICK_QUESTIONS[instrument]?.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="w-full text-left p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#E5C07B]/40 text-xs text-white/70 hover:text-white transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Conversational AI Mentor Chat Stream */}
      <div className="lg:col-span-8 bg-[#0F1115] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col h-[620px]">
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E5C07B] to-[#B8914B] text-black flex items-center justify-center font-bold shadow-lg shadow-[#E5C07B]/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white capitalize">
                VIBEX {instrument} AI Mentor
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-green-400 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                Active & Listening
              </span>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#E5C07B]/20 border border-[#E5C07B]/40 flex items-center justify-center text-[#E5C07B] shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-3xl p-4 space-y-2 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#E5C07B] text-black font-semibold shadow-lg shadow-[#E5C07B]/10'
                      : 'bg-[#1A1D23] text-white/90 border border-white/10 shadow-xl'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Interactive Exercise Action Card embedded in AI message */}
                  {msg.suggestedExercise && onPracticeGeneratedExercise && (
                    <div className="mt-3 p-4 bg-black/40 border border-[#E5C07B]/40 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-[#E5C07B] font-bold">
                          Interactive Drill Ready
                        </span>
                        <h5 className="text-xs font-bold text-white">
                          {msg.suggestedExercise.title}
                        </h5>
                        <span className="text-[10px] text-white/50">
                          {msg.suggestedExercise.targetNotes.length} Target Notes • {msg.suggestedExercise.bpm || 75} BPM
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onPracticeGeneratedExercise(msg.suggestedExercise!)}
                        className="px-4 py-2 rounded-full bg-[#E5C07B] text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#E5C07B]/20 hover:scale-105 transition-all shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>LAUNCH</span>
                      </button>
                    </div>
                  )}

                  <span className={`text-[9px] block text-right font-mono ${isUser ? 'text-black/60' : 'text-white/40'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E5C07B]/20 border border-[#E5C07B]/40 flex items-center justify-center text-[#E5C07B] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#1A1D23] border border-white/10 rounded-3xl p-4 flex items-center gap-2.5 text-xs text-white/60">
                <div className="w-3 h-3 border-2 border-[#E5C07B] border-t-transparent rounded-full animate-spin" />
                <span>VIBEX AI Mentor is analyzing pedagogical theory...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-4 border-t border-white/10"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask your ${instrument} teacher anything...`}
            className="flex-1 px-5 py-3 bg-black/50 border border-white/10 rounded-full text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#E5C07B]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3.5 rounded-full bg-[#E5C07B] hover:bg-[#d4ae67] disabled:opacity-50 text-black font-bold transition shadow-lg shadow-[#E5C07B]/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITeacherChat;
