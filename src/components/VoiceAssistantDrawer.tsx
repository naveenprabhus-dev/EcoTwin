import React, { SetStateAction, Dispatch } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Mic, MicOff } from 'lucide-react';
import { UserProfile } from '../types';
import CarbonTwinPet from './CarbonTwinPet';

interface VoiceAssistantDrawerProps {
  showVoicePanel: boolean;
  setShowVoicePanel: Dispatch<SetStateAction<boolean>>;
  profile: UserProfile;
  isTwinSpeaking: boolean;
  companionExpression: 'excited' | 'proud' | 'concerned' | 'sad' | 'motivational' | 'playful';
  voiceStatus: 'idle' | 'listening' | 'thinking' | 'speaking';
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  setSelectedVoiceURI: Dispatch<SetStateAction<string>>;
  voicePitch: number;
  setVoicePitch: Dispatch<SetStateAction<number>>;
  voiceRate: number;
  setVoiceRate: Dispatch<SetStateAction<number>>;
  userTranscript: string;
  twinReplyText: string;
  assistantTextInput: string;
  setAssistantTextInput: Dispatch<SetStateAction<string>>;
  handleAskPresetQuestion: (question: string) => Promise<void>;
  startProactiveDailyCheckIn: () => Promise<void>;
  isListening: boolean;
  startListeningVoice: () => void;
  stopListeningVoice: () => void;
}

export default function VoiceAssistantDrawer({
  showVoicePanel,
  setShowVoicePanel,
  profile,
  isTwinSpeaking,
  companionExpression,
  voiceStatus,
  availableVoices,
  selectedVoiceURI,
  setSelectedVoiceURI,
  voicePitch,
  setVoicePitch,
  voiceRate,
  setVoiceRate,
  userTranscript,
  twinReplyText,
  assistantTextInput,
  setAssistantTextInput,
  handleAskPresetQuestion,
  startProactiveDailyCheckIn,
  isListening,
  startListeningVoice,
  stopListeningVoice
}: VoiceAssistantDrawerProps) {
  return (
    <AnimatePresence>
      {showVoicePanel && (
        <motion.div
          initial={{ opacity: 0, y: 150, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 150, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="fixed bottom-24 right-4 left-4 md:left-auto md:w-[420px] max-h-[75vh] z-45 bg-art-sand/90 backdrop-blur-md border-4 border-art-dark rounded-[28px] shadow-[8px_8px_0_0_#1e293b] flex flex-col overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-art-forest text-white px-5 py-4 border-b-4 border-art-dark flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-serif italic font-bold text-sm uppercase tracking-wider text-art-stone">Carbon Twin Live Assistant</h3>
            </div>
            <button 
              onClick={() => {
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setShowVoicePanel(false);
              }}
              className="text-white hover:text-art-sage transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Content Panel Scroll */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4 font-sans text-xs">
            
            {/* Living Character Preview */}
            <div className="bg-white/60 rounded-2xl p-4 border-2 border-art-dark flex flex-col items-center">
              <div className="w-32 h-32 rounded-2xl border-2 border-art-dark overflow-hidden bg-art-cream relative shadow-sm">
                <CarbonTwinPet 
                  score={profile.stats.score}
                  equippedAccessories={profile.companion.equippedAccessories}
                  name={profile.companion.name}
                  isSpeaking={isTwinSpeaking}
                  currentMood={companionExpression}
                />
              </div>
              <span className="font-bold text-[13px] text-art-dark mt-2 block">{profile.companion.name} is listening</span>
              
              {/* Status animations indicators */}
              <div className="mt-2.5 flex items-center justify-center gap-1.5 h-6">
                {voiceStatus === 'listening' && (
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border-2 border-emerald-500 rounded-full py-0.5 px-3 text-[10px] font-black uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <span>Listening... Speak Now</span>
                  </div>
                )}
                {voiceStatus === 'thinking' && (
                  <div className="flex items-center gap-1 bg-purple-50 text-purple-800 border-2 border-purple-400 rounded-full py-0.5 px-3 text-[10px] font-black uppercase">
                    <Loader2 className="w-2.5 h-2.5 animate-spin shrink-0" />
                    <span>Contextualizing carbon...</span>
                  </div>
                )}
                {voiceStatus === 'speaking' && (
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border-2 border-amber-600 rounded-full py-0.5 px-3 text-[10px] font-black uppercase">
                    <span className="flex gap-0.5 items-end h-2.5 w-4">
                      <span className="bg-amber-600 w-0.5 h-1 animate-pulse" style={{ animationDelay: '0.1s' }} />
                      <span className="bg-amber-600 w-0.5 h-2.5 animate-pulse" style={{ animationDelay: '0.3s' }} />
                      <span className="bg-amber-600 w-0.5 h-1.5 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </span>
                    <span>Sprout is Speaking</span>
                  </div>
                )}
                {voiceStatus === 'idle' && (
                  <span className="text-[10px] text-art-olive/80 font-mono uppercase font-black tracking-wide">Ears Open • Tap the Mic</span>
                )}
              </div>
            </div>

            {/* Custom Voice Settings Card */}
            <div className="bg-[#FAF9F5] border-2 border-art-dark rounded-2xl p-3.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold italic text-xs text-art-forest flex items-center gap-1.5">
                  🎙️ Voice Setup & Customization
                </span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase">
                  Web Speech API
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Active Voice Selection */}
                <div>
                  <label className="text-[10px] font-bold text-art-olive uppercase mb-1 block">Selected Assistant Voice:</label>
                  {availableVoices.length > 0 ? (
                    <select 
                      value={selectedVoiceURI} 
                      onChange={(e) => setSelectedVoiceURI(e.target.value)}
                      className="bg-white border-2 border-art-dark rounded-xl px-2.5 py-1.5 w-full text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                    >
                      {availableVoices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-[10px] text-zinc-500 font-mono italic">
                      No external system voices found. Using browser default.
                    </div>
                  )}
                </div>

                {/* Pitch scale slider */}
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-art-olive uppercase mb-1">
                    <span>Voice Pitch-Tone:</span>
                    <span className="text-emerald-700 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-150">
                      {voicePitch === 1.6 ? 'Cute & Small' : voicePitch < 1.0 ? 'Deep & Bold' : voicePitch > 1.6 ? 'Squeaky!' : 'Sweet Spot'} ({voicePitch.toFixed(1)}x)
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voicePitch}
                    onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                    <span>Deep Coach (0.5x)</span>
                    <span>Cute Companion (2.0x)</span>
                  </div>
                </div>

                {/* Speed Rate slider */}
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-art-olive uppercase mb-1">
                    <span>Speaking Speed:</span>
                    <span className="text-emerald-700 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-150">
                      {voiceRate === 1.05 ? 'Normal' : voiceRate < 1.0 ? 'Slower' : 'Faster'} ({voiceRate.toFixed(2)}x)
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.05"
                    value={voiceRate}
                    onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Transcripts Display Boxes */}
            <div className="space-y-2.5">
              <div className="p-3 bg-white/80 rounded-xl border border-art-border text-[11px] leading-relaxed">
                <span className="font-bold text-art-olive uppercase text-[9px] block mb-1">You said:</span>
                <p className="text-art-dark font-medium italic">"{userTranscript}"</p>
              </div>

              <div className="p-3.5 bg-art-dark/5 rounded-xl border-2 border-art-dark text-[11px] leading-relaxed relative">
                <span className="font-serif italic font-bold text-art-forest text-[11px] block mb-1">{profile.companion.name} says:</span>
                <p className="text-art-dark font-medium">{twinReplyText}</p>
              </div>
            </div>

            {/* Text Input Row for Typed Questions/Commands */}
            <div className="bg-white/90 rounded-2xl p-3 border-2 border-art-dark space-y-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <label className="text-[10px] font-bold text-art-olive uppercase tracking-wide block">Or Ask/Tell Sprout with Text:</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. I rode a train today, or Ask a question..."
                  value={assistantTextInput}
                  onChange={(e) => setAssistantTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && assistantTextInput.trim()) {
                      handleAskPresetQuestion(assistantTextInput);
                      setAssistantTextInput('');
                    }
                  }}
                  className="flex-1 bg-slate-50 border border-art-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 font-sans text-slate-800 font-semibold"
                />
                <button 
                  onClick={() => {
                    if (!assistantTextInput.trim()) return;
                    handleAskPresetQuestion(assistantTextInput);
                    setAssistantTextInput('');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm shrink-0 flex items-center justify-center leading-none"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Educational Presets triggers */}
            <div className="space-y-1.5 mt-2">
              <span className="text-[10px] font-bold uppercase text-art-olive tracking-wider block">Environmental Q&A Practice:</span>
              <div className="grid grid-cols-1 gap-1.5">
                <button 
                  onClick={() => handleAskPresetQuestion("What is a carbon footprint and why does it matter?")}
                  className="bg-white hover:bg-art-stone text-art-dark border border-art-border rounded-xl px-3 py-2 text-left font-sans font-bold text-[10.5px] cursor-pointer hover:border-art-dark transition-all"
                >
                  ❓ What is a carbon footprint?
                </button>
                <button 
                  onClick={() => handleAskPresetQuestion("How does choosing public transport help save carbon?")}
                  className="bg-white hover:bg-art-stone text-art-dark border border-art-border rounded-xl px-3 py-2 text-left font-sans font-bold text-[10.5px] cursor-pointer hover:border-art-dark transition-all"
                >
                  🚆 How does transit help?
                </button>
                <button 
                  onClick={() => handleAskPresetQuestion("What kind of foods generate high carbon footprints?")}
                  className="bg-white hover:bg-art-stone text-art-dark border border-art-border rounded-xl px-3 py-2 text-left font-sans font-bold text-[10.5px] cursor-pointer hover:border-art-dark transition-all"
                >
                  🥩 What diets have a high footprint?
                </button>
                <button 
                  onClick={() => handleAskPresetQuestion("How do I reduce phantom electricity consumption on standby?")}
                  className="bg-white hover:bg-art-stone text-art-dark border border-art-border rounded-xl px-3 py-2 text-left font-sans font-bold text-[10.5px] cursor-pointer hover:border-art-dark transition-all"
                >
                  🔌 How do I conserve electricity?
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Control Box */}
          <div className="p-4 bg-white border-t-4 border-art-dark flex items-center justify-between gap-3">
            <button
              onClick={startProactiveDailyCheckIn}
              className="flex-1 border-2 border-art-dark hover:shadow-[2px_2px_0_0_#1e293b] bg-art-stone hover:bg-art-pale text-art-dark py-2.5 rounded-xl text-center font-bold font-serif italic text-xs cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
            >
              🗓️ Daily Check-In Mode
            </button>

            <button
              onClick={isListening ? stopListeningVoice : startListeningVoice}
              className={`w-12 h-12 rounded-full border-2 border-art-dark shadow-[2px_2px_0_0_#1e293b] flex items-center justify-center shrink-0 cursor-pointer text-white transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                isListening ? 'bg-red-500 hover:bg-red-650 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
              title={isListening ? "Stop listening" : "Talk to Twin"}
            >
              {isListening ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95a7 7 0 0 1-12-4.95v-2"></path><path d="M19 10v2a7 7 0 0 1-.58 2.82"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              )}
            </button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
