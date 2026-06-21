import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, User, Sparkles, MessageCircle, HelpCircle, 
  Volume2, BookOpen, Target, History, Check, Calendar, Activity, 
  Trash2, Plus, Info, Award, Settings, BrainCircuit, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEcoBuddy } from '../hooks/useEcoBuddy';
import { EcoBuddyAssistant } from '../services/EcoBuddyAssistant';
import { VoiceSystem } from '../services/VoiceSystem';
import { MemorySystem } from '../services/MemorySystem';
import { CarbonEngine } from '../services/CarbonEngine';
import { UserProfile, Goal } from '../types';

interface UnifiedEcoBuddyAssistantProps {
  userId: string;
  companionName: string;
  score: number;
  profile: UserProfile;
  onAddCustomEntry: (category: any, activity: string, co2: number, xp: number) => void;
  onRefreshProfile?: () => void;
}

export default function UnifiedEcoBuddyAssistant({
  userId,
  companionName,
  score,
  profile,
  onAddCustomEntry,
  onRefreshProfile
}: UnifiedEcoBuddyAssistantProps) {
  const {
    goals,
    handleToggleGoal,
    setGoals,
    actionPlan
  } = useEcoBuddy(userId);

  // Assistant inner tabs
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'voice' | 'journal' | 'memories' | 'goals'>('chat');

  // Chat parameters
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: EcoBuddyAssistant.buildInitialGreeting(companionName, score),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice parameters
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [voicePitch, setVoicePitch] = useState<number>(1.6);
  const [voiceRate, setVoiceRate] = useState<number>(1.05);

  // Journal parameters
  const [journalInput, setJournalInput] = useState('');
  const [journalFeedback, setJournalFeedback] = useState<{
    activity: string;
    category: string;
    co2Difference: number;
    xpReward: number;
    explanation: string;
  } | null>(null);

  // New Custom Goal Creator
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<'transport' | 'energy' | 'food' | 'shopping' | 'waste'>('transport');
  const [goalTarget, setGoalTarget] = useState<number>(5);
  const [goalUnit, setGoalUnit] = useState('days');

  // Initialize Speech synthesis available voices list on mount
  useEffect(() => {
    if (VoiceSystem.isSupported()) {
      const loadVoices = () => {
        const voices = VoiceSystem.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0) {
          const defaultURI = localStorage.getItem('selected_voice_uri') || voices[0].voiceURI;
          setSelectedVoiceURI(defaultURI);
        }
      };
      loadVoices();
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Sync scroll on chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Dynamic system/companion voice speak
  const handleVocalizeText = (textToSpeak: string) => {
    VoiceSystem.speak(textToSpeak, {
      pitch: voicePitch,
      rate: voiceRate,
      voiceURI: selectedVoiceURI
    });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: Math.random().toString(36).substring(2),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          messages: [...messages, userMsg].map(m => ({
            role: m.sender === 'ai' ? 'assistant' : 'user',
            text: m.text
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substring(2),
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      console.error("Failed model response, retrieving offline buddy advice:", err);
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(2),
        sender: 'ai',
        text: EcoBuddyAssistant.getFallbackReply(textToSend, score),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Process Carbon Journal logging on the fly using CarbonEngine heuristics
  const handleProcessJournal = () => {
    if (!journalInput.trim()) return;
    const evaluation = CarbonEngine.estimateLogImpact(journalInput, false);
    
    setJournalFeedback({
      activity: evaluation.activity,
      category: evaluation.category,
      co2Difference: evaluation.co2Difference,
      xpReward: evaluation.xpReward,
      explanation: evaluation.explanation
    });
  };

  const handleApplyJournalToLog = () => {
    if (!journalFeedback) return;
    
    // Call props function to append entry onto active profile logs tree and update XP
    onAddCustomEntry(
      journalFeedback.category,
      journalFeedback.activity,
      journalFeedback.co2Difference,
      journalFeedback.xpReward
    );

    // Give audio validation
    handleVocalizeText(`Excellent habit logged! That ${journalFeedback.co2Difference < 0 ? 'reduces' : 'affects'} your carbon footprint by ${Math.abs(journalFeedback.co2Difference)} kg CO2!`);

    setJournalFeedback(null);
    setJournalInput('');
    if (onRefreshProfile) {
      onRefreshProfile();
    }
  };

  // Add custom companion goal
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const newGoal: Goal = {
      id: 'g_' + Math.random().toString(36).substring(2),
      title: goalTitle,
      category: goalCategory,
      targetDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
      completed: false,
      targetValue: goalTarget,
      currentValue: 0,
      unit: goalUnit,
      buddyFeedback: `EcoBuddy selected this goal for you to target ${goalCategory} emissions and secure Sprout's healthy environment!`
    };

    setGoals(prev => [newGoal, ...prev]);
    setGoalTitle('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-[32px] overflow-hidden border border-art-border shadow-xs flex flex-col md:flex-row min-h-[620px]">
      
      {/* 🧭 Sidebar Segment with internal navigation tabs */}
      <div className="w-full md:w-60 bg-[#F9FAF8]/65 border-r border-art-border p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-art-dark text-white rounded-2xl shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic font-extrabold text-art-dark text-base">{companionName} Assistant</h3>
              <p className="text-[10px] text-art-olive font-mono font-bold uppercase tracking-wide">AI Living Companion</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            {[
              { id: 'chat', label: '💬 Chat Coach', desc: 'Smarter carbon advice' },
              { id: 'voice', label: '🎙️ Speech & Voice', desc: 'Hearing custom pitches' },
              { id: 'journal', label: '📖 Habit Journal', desc: 'Logging clean routines' },
              { id: 'memories', label: '🧠 Memory Vault', desc: 'Stored carbon facts' },
              { id: 'goals', label: '🎯 Eco Goals', desc: 'Milestones & progress' }
            ].map(tab => {
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex flex-col cursor-pointer ${
                    isActive 
                      ? 'bg-art-pale/80 border border-art-border text-art-dark font-serif italic' 
                      : 'hover:bg-art-pale/25 text-slate-650'
                  }`}
                >
                  <span className="text-xs font-bold leading-none flex items-center gap-1.5 align-middle">
                    {tab.label}
                  </span>
                  <span className="text-[9px] text-slate-450 mt-1 font-semibold leading-none">{tab.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic status indicators */}
        <div className="bg-art-pale border border-art-border rounded-[20px] p-4 mt-6">
          <div className="flex items-center gap-1.5 text-xs font-black text-art-dark uppercase">
            <Sparkles className="w-3.5 h-3.5 text-art-olive animate-pulse" />
            <span>Interactive Active State</span>
          </div>
          <p className="text-[10px] text-art-olive leading-relaxed font-semibold mt-1">
            Analyzing your carbon history, consistency streaks, and level multipliers to supply localized sustainability recommendations.
          </p>
        </div>
      </div>

      {/* 🚀 Main Window Area */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* SubTab Contents Rendering */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          <AnimatePresence mode="wait">
            
            {/* 1. CHAT SUB-TAB */}
            {activeSubTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-[500px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-art-border mb-4">
                  <div>
                    <h4 className="font-serif italic font-bold text-art-dark text-base">{companionName} Q&A Coach</h4>
                    <p className="text-[10px] text-slate-400 font-semibold font-mono">Ask about carbon metrics, dietary footprint, or energy savings recipes.</p>
                  </div>
                  
                  {/* Text-to-Speech active vocalizer */}
                  {messages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const lastAi = [...messages].reverse().find(m => m.sender === 'ai');
                        if (lastAi) handleVocalizeText(lastAi.text);
                      }}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center gap-1 text-[10px] font-black text-slate-600 uppercase cursor-pointer transition-all"
                      title="Read last reply aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Speak Last Reply
                    </button>
                  )}
                </div>

                {/* Question suggestions panels */}
                {messages.length < 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {EcoBuddyAssistant.SAMPLE_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(q)}
                        disabled={isLoading}
                        className="text-left text-[11px] bg-[#F9FAF8]/60 hover:bg-art-pale text-slate-650 p-2.5 rounded-xl border border-art-border hover:border-art-sage transition-all font-semibold italic flex items-center justify-between gap-1 cursor-pointer"
                      >
                        <span>{q}</span>
                        <ChevronRight className="w-3 h-3 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto space-y-3 pb-3">
                  {messages.map(msg => {
                    const isAI = msg.sender === 'ai';
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                      >
                        <div className={`p-1 rounded-full h-8 w-8 flex items-center justify-center shrink-0 border ${
                          isAI ? 'bg-art-pale text-art-dark border-art-border' : 'bg-slate-800 text-white border-slate-900'
                        }`}>
                          {isAI ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>

                        <div>
                          <div className={`px-3.5 py-2.5 rounded-[20px] text-xs leading-relaxed whitespace-pre-wrap font-sans ${
                            isAI 
                              ? 'bg-art-cream text-art-dark border border-art-border rounded-tl-none font-medium' 
                              : 'bg-art-dark text-white rounded-tr-none font-semibold'
                          }`}>
                            {msg.text.split('\n').map((line: string, lIdx: number) => {
                              if (line.startsWith('###')) {
                                return <h5 key={lIdx} className="font-serif italic font-bold text-xs my-1 text-art-dark">{line.replace('###', '')}</h5>;
                              }
                              if (line.startsWith('*') || line.startsWith('-')) {
                                return (
                                  <div key={lIdx} className="flex gap-1 ml-2 mt-0.5 font-sans font-medium text-slate-750">
                                    <span className="text-art-olive font-bold">•</span>
                                    <span>{line.substring(2)}</span>
                                  </div>
                                );
                              }
                              return <p key={lIdx} className="mt-0.5">{line}</p>;
                            })}
                          </div>
                          <span className="text-[9px] text-slate-400 block mt-1 font-mono">{msg.timestamp}</span>
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex gap-3 mr-auto items-center">
                      <div className="p-1 h-8 w-8 bg-art-pale text-art-dark rounded-full flex items-center justify-center border animate-bounce">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-art-cream rounded-2xl px-4 py-2 text-xs border border-art-border font-serif italic text-art-olive font-bold animate-pulse">
                        Analyzing carbon trends and configuring reply...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input block */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }}
                  className="flex items-center gap-2 pt-3 border-t border-art-border mt-2"
                >
                  <input
                    type="text"
                    placeholder={`Ask ${companionName} for energy savings & footprint reduction tips...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 bg-white font-sans text-xs px-4 py-3 rounded-xl border border-art-border focus:border-art-dark focus:outline-none text-art-dark font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className={`p-3 rounded-xl shadow-xs cursor-pointer transition-all ${
                      !inputMessage.trim() || isLoading
                        ? 'bg-art-cream/40 text-art-olive/45 border border-art-border pointer-events-none'
                        : 'bg-art-dark hover:bg-art-forest text-white'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* 2. SPEECH & VOICE SUB-TAB */}
            {activeSubTab === 'voice' && (
              <motion.div 
                key="voice"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="pb-3 border-b border-art-border">
                  <h4 className="font-serif italic font-bold text-art-dark text-base">🎙️ Companion Voice Speech Synthesis</h4>
                  <p className="text-xs text-slate-400 font-semibold leading-normal">Configure custom audio pitches, vocalization speed, and choose system dialects.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-[#F9FAF8]/60 p-5 rounded-2xl border border-art-border space-y-4">
                    <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Voice custom preferences:</span>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block">Dialect Selection:</label>
                        {availableVoices.length > 0 ? (
                          <select 
                            value={selectedVoiceURI} 
                            onChange={(e) => {
                              setSelectedVoiceURI(e.target.value);
                              localStorage.setItem('selected_voice_uri', e.target.value);
                            }}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 w-full text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                          >
                            {availableVoices.map((voice) => (
                              <option key={voice.voiceURI} value={voice.voiceURI}>
                                {voice.name} ({voice.lang})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-[11px] text-zinc-500 font-mono italic p-2 bg-white border border-slate-150 rounded-xl">
                            Using default Web SpeechSynthesis engine...
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>Tone Pitch:</span>
                          <span className="font-mono">{voicePitch.toFixed(1)}x</span>
                        </div>
                        <input 
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={voicePitch}
                          onChange={(e) => {
                            setVoicePitch(parseFloat(e.target.value));
                            localStorage.setItem('selected_pitch', e.target.value);
                          }}
                          className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>Speaking speed Rate:</span>
                          <span className="font-mono">{voiceRate.toFixed(2)}x</span>
                        </div>
                        <input 
                          type="range"
                          min="0.7"
                          max="1.5"
                          step="0.05"
                          value={voiceRate}
                          onChange={(e) => {
                            setVoiceRate(parseFloat(e.target.value));
                            localStorage.setItem('selected_rate', e.target.value);
                          }}
                          className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded uppercase w-max block">Test Narration</span>
                      <h5 className="font-serif italic font-bold text-emerald-950 text-sm">Hear Sprout's Sustainability Lessons</h5>
                      <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">Click the testing button below to play back an auditory preview of your custom voice parameters speaking eco lessons aloud!</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVocalizeText(`Hello Eco-guardian! My name is ${companionName}. Today our carbon statistics show an overall sustainability rating of ${score} out of 100. Let's work together to complete challenges and heal our planet!`)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase mt-4"
                    >
                      <Volume2 className="w-4 h-4" />
                      Narration Sound Preview
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. HABIT JOURNAL PROMPT */}
            {activeSubTab === 'journal' && (
              <motion.div 
                key="journal"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="pb-3 border-b border-art-border">
                  <h4 className="font-serif italic font-bold text-art-dark text-base">📖 Dynamic Habit Journal</h4>
                  <p className="text-xs text-slate-400 font-semibold leading-normal">Write your clean lifestyle habits (e.g. "I rode public subway to college") to calculate estimated greenhouse offsets.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                  <div className="md:col-span-7 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Describe what you did:</label>
                      <textarea
                        rows={3}
                        placeholder="E.g. I rode my bicycle to get groceries instead of driving my gasoline private car, and had vegetarian tomato salad for lunch!"
                        value={journalInput}
                        onChange={(e) => setJournalInput(e.target.value)}
                        className="bg-white border border-slate-200 rounded-2xl p-4 w-full text-xs font-semibold text-slate-800 focus:outline-none focus:border-art-dark placeholder-slate-400 leading-relaxed"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleProcessJournal}
                      disabled={!journalInput.trim()}
                      className="px-4 py-2.5 bg-art-dark hover:bg-art-forest text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <BrainCircuit className="w-4 h-4" />
                      Calculate Habit Carbon Offset
                    </button>
                  </div>

                  <div className="md:col-span-5 bg-[#F9FAF8]/60 p-5 rounded-2xl border border-art-border flex flex-col justify-between">
                    {journalFeedback ? (
                      <div className="space-y-3 font-sans">
                        <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded uppercase w-max block">Dynamic Calc Results</span>
                        <div className="space-y-1">
                          <h5 className="font-bold text-slate-900 text-xs">{journalFeedback.activity}</h5>
                          <div className="flex gap-2 items-center pt-1">
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                              {journalFeedback.co2Difference <= 0 ? 'Saved:' : 'Added:'} {Math.abs(journalFeedback.co2Difference)} kg
                            </span>
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                              +{journalFeedback.xpReward} XP
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 font-semibold leading-relaxed my-1.5 italic">"{journalFeedback.explanation}"</p>

                        <button
                          type="button"
                          onClick={handleApplyJournalToLog}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-[10px] uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Commit and Log to Dashboard
                        </button>
                      </div>
                    ) : (
                      <div className="text-center my-auto p-4 space-y-2">
                        <span className="text-2xl block">🖋️</span>
                        <h5 className="font-serif italic font-bold text-slate-800 text-xs">Waiting for your daily pen...</h5>
                        <p className="text-[10px] text-slate-400 font-semibold max-w-xs mx-auto">Heuristics module will instantly parse transport, diet, or waste key terms.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. MEMORY VAULT SUB-TAB */}
            {activeSubTab === 'memories' && (
              <motion.div 
                key="memories"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="pb-3 border-b border-art-border">
                  <h4 className="font-serif italic font-bold text-art-dark text-base">🧠 Secure Memory Vault</h4>
                  <p className="text-xs text-slate-400 font-semibold leading-normal">EcoBuddy registers these emotional milestones and carbon metrics contextually inside Gemini inputs.</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 font-mono text-[11px] text-slate-700 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap font-bold">
                  <div>
                    {MemorySystem.getUserMemoryContext(profile)}
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-2xl text-[11px] text-indigo-900 leading-relaxed font-semibold italic flex gap-2 items-start">
                  <span>💡</span>
                  <span>Every custom log entry, green challenge claim, or carbon conversation and onboard profile expands Sprout's cognitive context registry, making conversations increasingly authentic and personalized over weeks!</span>
                </div>
              </motion.div>
            )}

            {/* 5. ECO GOALS SUB-TAB */}
            {activeSubTab === 'goals' && (
              <motion.div 
                key="goals"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="flex justify-between items-center pb-3 border-b border-art-border">
                  <div>
                    <h4 className="font-serif italic font-bold text-art-dark text-base">🎯 Structured Eco Goals</h4>
                    <p className="text-xs text-slate-400 font-semibold leading-normal">Plan bespoke carbon swap targets for the upcoming weeks.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Goals creation form */}
                  <div className="lg:col-span-5 bg-[#F9FAF8]/60 p-5 rounded-2xl border border-art-border space-y-3">
                    <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block mb-1">Set New Goal Target:</span>
                    <form onSubmit={handleCreateGoal} className="space-y-3 text-xs font-semibold">
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Goal Description:</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Segregate compost scraps"
                          value={goalTitle}
                          onChange={(e) => setGoalTitle(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 mb-1 block">Target Category:</label>
                          <select 
                            value={goalCategory} 
                            onChange={(e) => setGoalCategory(e.target.value as any)}
                            className="bg-White border border-slate-200 rounded-xl px-2 py-1.5 w-full text-xs"
                          >
                            <option value="transport">Transport</option>
                            <option value="energy">Energy</option>
                            <option value="food">Diet/Food</option>
                            <option value="shopping">Shopping</option>
                            <option value="waste">Waste</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 mb-1 block">Target Metric:</label>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={goalTarget}
                              onChange={(e) => setGoalTarget(parseInt(e.target.value))}
                              className="w-12 bg-white border border-slate-200 rounded-xl px-2 py-1 font-mono text-center"
                            />
                            <input
                              type="text"
                              value={goalUnit}
                              onChange={(e) => setGoalUnit(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1 text-center font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-art-dark hover:bg-art-forest text-white font-bold py-2 rounded-xl text-xs uppercase"
                      >
                        Launch custom target!
                      </button>
                    </form>
                  </div>

                  {/* Active Goals Checklist */}
                  <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#slate-250] flex flex-col justify-between">
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      <span className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">My Goal Progress:</span>
                      
                      {goals.map(goal => {
                        const progressPercent = Math.round((goal.currentValue / goal.targetValue) * 100);
                        return (
                          <div 
                            key={goal.id} 
                            onClick={() => handleToggleGoal(goal.id)}
                            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-150 transition-all flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              {goal.completed ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 text-emerald-700 font-extrabold" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-white border border-slate-300 shrink-0" />
                              )}
                              
                              <div className="space-y-0.5">
                                <span className={`text-xs font-bold text-slate-800 ${goal.completed ? 'line-through opacity-60' : ''}`}>{goal.title}</span>
                                <p className="text-[10px] text-slate-450 font-semibold">{goal.buddyFeedback}</p>
                              </div>
                            </div>

                            <div className="text-right font-mono text-[10px] shrink-0 ml-3">
                              <span className="font-black text-slate-700">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                              <span className="block text-slate-400 font-bold">{progressPercent}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
