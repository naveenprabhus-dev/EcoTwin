import React, { useState, useEffect } from 'react';
import { UserProfile, OnboardingData } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ActionPlanner from './components/ActionPlanner';
import CarbonTwinPet from './components/CarbonTwinPet';
import AICoach from './components/AICoach';
import Scanner from './components/Scanner';
import Challenges from './components/Challenges';
import ProfileAchievements from './components/ProfileAchievements';
import FutureSimulator from './components/FutureSimulator';
import WeeklyReport from './components/WeeklyReport';
import { 
  Trees, Bot, Shield, Sparkles, LogOut, 
  Leaf, Trophy, Settings, Activity, Cpu, Scan, 
  HelpCircle, User as UserIcon, Lock, Mail, ArrowRight,
  Mic, MicOff, Volume2, Loader2, VolumeX, MessageSquare, Play, HelpCircle as HelpIcon, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Firebase client SDK integrations
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { auth } from './lib/firebase';

export default function App() {
  // Real Firebase Authentication states
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isAuthInitLoading, setIsAuthInitLoading] = useState(true);
  const [isWaitingVerification, setIsWaitingVerification] = useState(false);
  const [verifiedUserPlaceholder, setVerifiedUserPlaceholder] = useState<any>(null);

  // Sign up inputs
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot password inputs
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [resendSuccessMsg, setResendSuccessMsg] = useState('');

  // Authentication states
  const [userEmail, setUserEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');

  // Active view states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'twin' | 'coach' | 'challenges' | 'profile' | 'simulator' | 'reports'>('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);


  // Momentary companion visual triggers (for physical feeding, jumping)
  const [petMoodAction, setPetMoodAction] = useState<'feed' | 'dance' | 'idle' | 'petted'>('idle');

  // Voice Assistant state variables
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [userTranscript, setUserTranscript] = useState("Tap 'Listen' and tell Sprout about your commute or dinner!");
  const [twinReplyText, setTwinReplyText] = useState("Hi there! I'm your Carbon Twin. Try sharing actions like 'I rode a public bus for fifteen kilometers today' to watch our metrics update in real time!");
  const [isTwinSpeaking, setIsTwinSpeaking] = useState(false);
  const [sandboxInput, setSandboxInput] = useState('');
  const [assistantTextInput, setAssistantTextInput] = useState('');
  const [speechRecognitionInstance, setSpeechRecognitionInstance] = useState<any>(null);
  const [companionExpression, setCompanionExpression] = useState<'excited' | 'proud' | 'concerned' | 'sad' | 'motivational' | 'playful'>('proud');

  // Customizable voice companion settings
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [voicePitch, setVoicePitch] = useState<number>(1.6); // Default to a cute high pitched companion
  const [voiceRate, setVoiceRate] = useState<number>(1.05);

  // Synchronize dynamic browser languages and voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadWebVoices = () => {
        const list = window.speechSynthesis.getVoices();
        // Give preference to en or regional voices
        const filtered = list.filter(v => v.lang.toLowerCase().includes('en') || v.lang.toLowerCase().includes('in'));
        const finalSelection = filtered.length > 0 ? filtered : list;
        setAvailableVoices(finalSelection);

        if (finalSelection.length > 0) {
          // Attempt default cute voice selection (e.g. Google US English, premium English, or first matching child friendly voice)
          const preferred = finalSelection.find(v => v.name.includes('Google') && v.lang.includes('US')) ||
                            finalSelection.find(v => v.lang.includes('US')) ||
                            finalSelection.find(v => v.lang.includes('EN')) ||
                            finalSelection[0];
          setSelectedVoiceURI(p => p || preferred.voiceURI);
        }
      };

      loadWebVoices();
      window.speechSynthesis.onvoiceschanged = loadWebVoices;
    }
  }, []);

  // Initialize Speech Recognition cleanly in browser context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
          setVoiceStatus('listening');
          setUserTranscript('Listening carefully... speak now!');
        };

        rec.onresult = async (event: any) => {
          const text = event.results[0][0].transcript;
          setUserTranscript(text);
          setVoiceStatus('thinking');

          try {
            const res = await fetch('/api/twin/voice-chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUser || 'demo-user',
                text
              })
            });
            const data = await res.json();
            if (data.success) {
              setTwinReplyText(data.reply);
              setVoiceStatus('speaking');
              setIsTwinSpeaking(true);
              if (data.expression) {
                setCompanionExpression(data.expression);
              }
              
              if (data.profile) {
                setProfile(data.profile);
              }

              // Speak out response with pitch scaling
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(data.reply);
                if (selectedVoiceURI) {
                  const targetVoice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoiceURI);
                  if (targetVoice) {
                    utterance.voice = targetVoice;
                  }
                }
                utterance.pitch = voicePitch; 
                utterance.rate = voiceRate;
                utterance.onstart = () => {
                  setIsTwinSpeaking(true);
                  setVoiceStatus('speaking');
                };
                utterance.onend = () => {
                  setIsTwinSpeaking(false);
                  setVoiceStatus('idle');
                };
                utterance.onerror = () => {
                  setIsTwinSpeaking(false);
                  setVoiceStatus('idle');
                };
                window.speechSynthesis.speak(utterance);
              } else {
                setTimeout(() => {
                  setIsTwinSpeaking(false);
                  setVoiceStatus('idle');
                }, 3500);
              }
            } else {
              setTwinReplyText("Hmm, I got a bit dizzy and couldn't parse that. Can you tap and tell me again?");
              setVoiceStatus('idle');
            }
          } catch (err) {
            console.error('Twin conversation backend failure:', err);
            setTwinReplyText("Whoops! Connection is taking a tiny eco-break. Let's try once more!");
            setVoiceStatus('idle');
          }
        };

        rec.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
          setIsListening(false);
          setVoiceStatus('idle');
          setUserTranscript("Connection error or mic was silent. Tap the round microphone and let's try again!");
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setSpeechRecognitionInstance(rec);
      }
    }
  }, [currentUser]);

  // Voice recording controls
  const startListeningVoice = () => {
    if (speechRecognitionInstance) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsTwinSpeaking(false);
      try {
        speechRecognitionInstance.start();
      } catch (err) {
        console.warn('Speech recognition start override', err);
      }
    } else {
      alert("Voice captures are not supported on this browser. Try Chrome, Safari, or Edge!");
    }
  };

  const stopListeningVoice = () => {
    if (speechRecognitionInstance) {
      speechRecognitionInstance.stop();
      setIsListening(false);
      setVoiceStatus('idle');
    }
  };

  // Proactive starting conversation check-ins
  const startProactiveDailyCheckIn = async () => {
    setVoiceStatus('thinking');
    setUserTranscript("Retrieving dynamic check-in context with Sprout...");
    try {
      const res = await fetch('/api/twin/proactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser || 'demo-user' })
      });
      const data = await res.json();
      if (data.success) {
        setTwinReplyText(data.greeting);
        setVoiceStatus('speaking');
        setIsTwinSpeaking(true);
        if (data.expression) {
          setCompanionExpression(data.expression);
        }

        if (data.profile) {
          setProfile(data.profile);
        }

        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.greeting);
          if (selectedVoiceURI) {
            const targetVoice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoiceURI);
            if (targetVoice) {
              utterance.voice = targetVoice;
            }
          }
          utterance.pitch = voicePitch;
          utterance.rate = voiceRate;
          utterance.onstart = () => {
            setIsTwinSpeaking(true);
            setVoiceStatus('speaking');
          };
          utterance.onend = () => {
            setIsTwinSpeaking(false);
            setVoiceStatus('idle');
            // Auto trigger response ears for user!
            setTimeout(() => {
              startListeningVoice();
            }, 500);
          };
          utterance.onerror = () => {
            setIsTwinSpeaking(false);
            setVoiceStatus('idle');
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setTimeout(() => {
            setIsTwinSpeaking(false);
            setVoiceStatus('idle');
          }, 3500);
        }
      }
    } catch (err) {
      console.error('Proactive greeting failed:', err);
      setVoiceStatus('idle');
    }
  };

  // Educational prompt helpers
  const handleAskPresetQuestion = async (question: string) => {
    setUserTranscript(question);
    setVoiceStatus('thinking');
    try {
      const res = await fetch('/api/twin/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser || 'demo-user',
          text: question
        })
      });
      const data = await res.json();
      if (data.success) {
        setTwinReplyText(data.reply);
        setVoiceStatus('speaking');
        setIsTwinSpeaking(true);
        if (data.expression) {
          setCompanionExpression(data.expression);
        }

        if (data.profile) {
          setProfile(data.profile);
        }

        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.reply);
          if (selectedVoiceURI) {
            const targetVoice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoiceURI);
            if (targetVoice) {
              utterance.voice = targetVoice;
            }
          }
          utterance.pitch = voicePitch;
          utterance.rate = voiceRate;
          utterance.onstart = () => {
            setIsTwinSpeaking(true);
          };
          utterance.onend = () => {
            setIsTwinSpeaking(false);
            setVoiceStatus('idle');
          };
          utterance.onerror = () => {
            setIsTwinSpeaking(false);
            setVoiceStatus('idle');
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setTimeout(() => {
            setIsTwinSpeaking(false);
            setVoiceStatus('idle');
          }, 3500);
        }
      }
    } catch (err) {
      console.error('Preset question failure:', err);
      setVoiceStatus('idle');
    }
  };

  // Trigger loading user state on current user change
  const fetchProfile = async (uid: string, emailStr?: string) => {
    setIsProfileLoading(true);
    try {
      const url = `/api/profile?userId=${uid}${emailStr ? `&email=${encodeURIComponent(emailStr)}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to grab backend profile state:', err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // 1. Firebase Auth listener to maintain persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Dynamic status reload check
          await firebaseUser.reload();
          
          if (firebaseUser.emailVerified || firebaseUser.isAnonymous) {
            setCurrentUser(firebaseUser.uid);
            setUserEmail(firebaseUser.email || 'guest@ecotwin.local');
            setAuthError('');
            setIsWaitingVerification(false);
            setVerifiedUserPlaceholder(null);
            fetchProfile(firebaseUser.uid, firebaseUser.email || 'guest@ecotwin.local');
          } else {
            // Not activated yet – place them in pending
            setCurrentUser(null);
            setVerifiedUserPlaceholder(firebaseUser);
            setIsWaitingVerification(true);
          }
        } else {
          setCurrentUser(null);
          setVerifiedUserPlaceholder(null);
          setIsWaitingVerification(false);
        }
      } catch (err) {
        console.error("Auth state synchronizer error:", err);
      } finally {
        setIsAuthInitLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Form submission for traditional email sign-in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setAuthError('');
    setIsAuthLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const user = credential.user;
      
      await user.reload();
      if (!user.emailVerified) {
        setIsWaitingVerification(true);
        setVerifiedUserPlaceholder(user);
        setAuthError('Your email address must be verified. Please click the confirmation link in your inbox.');
      } else {
        setCurrentUser(user.uid);
        setUserEmail(user.email || '');
        setAuthError('');
      }
    } catch (err: any) {
      console.error("Login failure:", err);
      let msg = 'Failed to sign in. Verify your email credentials or network connection.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-email' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Incorrect email address or security password.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Temporary login lock. Too many bad attempts. Try again in a minute.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = "Email and Password authentication is not enabled for this Firebase project. To enable it: Go to your Firebase Console -> Build -> Authentication -> Sign-in Method, and enable the 'Email/Password' provider.";
      }
      setAuthError(msg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 3. Form submission for account creation
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword || !signupConfirmPassword) {
      setAuthError('Please fill out all the input fields.');
      return;
    }

    if (signupPassword.length < 6) {
      setAuthError('Security passwords must be at least 6 characters in length.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setAuthError('Confirm password does not match original password.');
      return;
    }

    setIsAuthLoading(true);

    try {
      // Create user credential
      const credential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = credential.user;

      // Update user display name profile
      await updateProfile(user, { displayName: signupName });

      // Send email verification link
      await sendEmailVerification(user);

      // Create backend index placeholder
      await fetch(`/api/profile?userId=${user.uid}&email=${encodeURIComponent(signupEmail)}`);

      // Set state pending
      setVerifiedUserPlaceholder(user);
      setIsWaitingVerification(true);
      setAuthError('');
    } catch (err: any) {
      console.error("Registration error:", err);
      let msg = 'Failed to registers eco account. Try again.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email address is already in use by another companion profile.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address formatting is invalid.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'The entered password is too weak. Try adding symbols and numbers.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = "Email and Password authentication is not enabled for this Firebase project. To enable it: Go to your Firebase Console -> Build -> Authentication -> Sign-in Method, and enable the 'Email/Password' provider.";
      }
      setAuthError(msg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 4. Send secure password reset link
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setAuthError('Please specify an email to register password resets.');
      return;
    }

    setAuthError('');
    setForgotSuccessMsg('');
    setIsAuthLoading(true);

    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotSuccessMsg('An authorization password-reset link has been successfully dispatched to your email.');
    } catch (err: any) {
      console.error("Forgot password failure:", err);
      let msg = 'Failed to submit password dispatch link.';
      if (err.code === 'auth/user-not-found') {
        msg = 'We could not locate an eco-account with that email address.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email address formatting specification.';
      }
      setAuthError(msg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 5. Verification Checkpoint Status poll
  const handleCheckVerification = async () => {
    if (!verifiedUserPlaceholder) return;
    setIsAuthLoading(true);
    setAuthError('');
    try {
      await verifiedUserPlaceholder.reload();
      if (verifiedUserPlaceholder.emailVerified) {
        setCurrentUser(verifiedUserPlaceholder.uid);
        setUserEmail(verifiedUserPlaceholder.email || '');
        setIsWaitingVerification(false);
        setVerifiedUserPlaceholder(null);
        setAuthError('');
        // Trigger profile reload
        fetchProfile(verifiedUserPlaceholder.uid, verifiedUserPlaceholder.email || '');
      } else {
        setAuthError('Email has not been verified yet. Check spam or request a resend link.');
      }
    } catch (err) {
      console.error("Verification reload failed:", err);
      setAuthError('Unable to reload status. Please verify networking.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 6. Resend verification trigger
  const handleResendActivation = async () => {
    if (!verifiedUserPlaceholder) return;
    setResendSuccessMsg('');
    setAuthError('');
    setIsAuthLoading(true);
    try {
      await sendEmailVerification(verifiedUserPlaceholder);
      setResendSuccessMsg('A fresh verification link has been successfully resent to your email!');
    } catch (err) {
      console.error("Resend failure:", err);
      setAuthError('Failed to trigger resend. Try again shortly.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 7. Sign in anonymously as Guest Sandbox
  const handlePlayGuest = async () => {
    setAuthError('');
    setIsAuthLoading(true);
    try {
      const credential = await signInAnonymously(auth);
      const user = credential.user;
      
      // Initialize sandbox configuration on demand
      await fetch(`/api/profile?userId=${user.uid}&email=guest@ecotwin.local`);
      
      setCurrentUser(user.uid);
      setUserEmail('guest@ecotwin.local');
      setIsWaitingVerification(false);
    } catch (err: any) {
      console.error("Guest flow failed:", err);
      let msg = 'Unable to spin sandbox instantly. Try standard email signup.';
      if (err.code === 'auth/operation-not-allowed') {
        msg = "Anonymous Sign-in is not enabled for this Firebase project. To enable it: Go to your Firebase Console -> Build -> Authentication -> Sign-in Method, and enable the 'Anonymous' provider.";
      }
      setAuthError(msg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 8. Sign out completely
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentUser(null);
    setVerifiedUserPlaceholder(null);
    setProfile(null);
    setUserEmail('');
    setIsWaitingVerification(false);
    setActiveTab('dashboard');
  };

  // Callback to refresh profile stats live
  const reloadProfileStats = (updatedUser?: any) => {
    if (updatedUser) {
      setProfile(updatedUser);
    } else if (currentUser) {
      fetchProfile(currentUser, userEmail);
    }
  };

  // Submit onboarding questionnaires
  const handleOnboardingSubmit = async (onboardValues: OnboardingData) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser,
          onboarding: onboardValues
        })
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Onboarding submission failed:', err);
    }
  };

  // Custom log additions proxy
  const handleLogAction = async (category: any, activity: string, co2: number, xp: number) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser,
          category,
          activity,
          co2Difference: co2,
          xpReward: xp
        })
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        
        // Trigger micro-bouncing visual
        setPetMoodAction('feed');
        setTimeout(() => setPetMoodAction('idle'), 2500);
      }
    } catch (err) {
      console.error('Failed to log transaction entries:', err);
    }
  };

  return (
    <div className="bg-art-cream min-h-screen text-art-text font-sans antialiased selection:bg-art-pale selection:text-art-dark transition-colors duration-200">
      
      {/* 0. AUTHENTICATION INIT LOADING STATE */}
      {isAuthInitLoading && (
        <div className="min-h-screen flex items-center justify-center bg-art-cream">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-art-forest mx-auto" />
            <p className="text-xs font-mono tracking-widest text-art-olive uppercase">Calibrating Carbon Twin Environment...</p>
          </div>
        </div>
      )}

      {/* 1. AUTHENTICATION / LANDING SPLASH */}
      {!isAuthInitLoading && !currentUser && (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-art-pale via-art-cream to-art-pale overflow-hidden">
          
          {/* Subtle eco design backdrops */}
          <div className="absolute top-10 left-10 w-64 h-64 bg-art-sage/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-art-olive/10 rounded-full blur-3xl pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-[32px] border border-art-border shadow-2xl overflow-hidden min-h-[580px]"
          >
            {/* Left Col: Brand Presentation */}
            <div className="bg-art-forest text-art-stone p-12 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-at-t from-art-dark/40 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-art-dark rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 bg-art-sage rounded-full animate-pulse"></div>
                </div>
                <span className="font-serif italic text-2xl font-bold tracking-tight text-white">EcoTwin</span>
              </div>

              <div className="space-y-4 my-8 md:my-0">
                <span className="text-xs font-mono uppercase tracking-widest text-art-sage font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-full w-max block">
                  AI-powered Carbon Twin Space
                </span>
                <h1 className="text-4xl font-serif italic font-extrabold text-white leading-tight">
                  Your carbon footprint, brought <span className="text-art-sage">to life</span>.
                </h1>
                <p className="text-slate-200 text-sm leading-relaxed max-w-sm font-sans font-medium">
                  Onboard your daily commuting, energy inputs, and buying indexes to watch Sprout, your virtual twin companion, thrive or wither in real-time. Let's make ecological awareness emotional and visual.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-slate-300 flex items-center gap-1.5 leading-normal">
                  <Cpu className="w-3.5 h-3.5 text-art-sage" /> Powered by Gemini multimodal intelligence models and Firebase cloud storage.
                </p>
              </div>
            </div>

            {/* Right Col: Forms & Interactive Play */}
            <div className="p-12 flex flex-col justify-center space-y-6 bg-white min-h-[520px]">
              
              {/* WAITING FOR EMAIL VERIFICATION SCREEN */}
              {isWaitingVerification ? (
                <div className="space-y-6 text-center md:text-left">
                  <div className="w-16 h-16 bg-art-pale rounded-full flex items-center justify-center mx-auto md:mx-0">
                    <Mail className="w-8 h-8 text-art-forest" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif italic font-bold text-art-dark">Verify Your Inbox</h2>
                    <p className="text-xs text-art-olive mt-1.5 leading-relaxed font-semibold">
                      We've dispatched a secure verification email to <span className="text-art-dark block font-bold font-mono text-sm mt-1">{verifiedUserPlaceholder?.email}</span>. Click the verification link inside to activate your EcoTwin profile.
                    </p>
                  </div>

                  {authError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                      <p className="text-xs text-rose-600 font-bold">{authError}</p>
                    </div>
                  )}

                  {resendSuccessMsg && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <p className="text-xs text-emerald-700 font-bold">{resendSuccessMsg}</p>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCheckVerification}
                      disabled={isAuthLoading}
                      className="w-full bg-art-dark hover:bg-art-forest text-white rounded-2xl py-3.5 text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:translate-y-[-1px] disabled:opacity-50"
                    >
                      {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ready! Let me Log In'}
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleResendActivation}
                        disabled={isAuthLoading}
                        className="bg-art-cream text-art-dark border border-art-border hover:bg-art-pale/40 rounded-2xl py-3 text-xs font-bold transition-all cursor-pointer text-center"
                      >
                        Resend Code
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="bg-white text-art-olive hover:text-art-dark hover:bg-slate-50 border border-slate-200 rounded-2xl py-3 text-xs font-bold transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* FORGOT PASSWORD SCREEN */}
                  {authMode === 'forgot' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl font-serif italic font-bold text-art-dark">Recover Password</h2>
                        <p className="text-xs text-art-olive mt-1 font-medium">Specify your registered email and we'll dispatch a secure recovery link.</p>
                      </div>

                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-art-dark block">Email Address:</label>
                          <div className="relative">
                            <input
                              type="email"
                              placeholder="e.g. xyz@gmail.com"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              className="w-full bg-art-cream/60 border border-art-border rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:ring-2 focus:ring-art-sage/20 focus:border-art-olive text-art-dark focus:outline-none"
                              required
                            />
                            <Mail className="absolute left-3.5 top-4 w-4 h-4 text-art-olive/60" />
                          </div>
                        </div>

                        {authError && (
                          <p className="text-xs text-rose-600 font-semibold">{authError}</p>
                        )}

                        {forgotSuccessMsg && (
                          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <p className="text-xs text-emerald-800 font-bold leading-relaxed">{forgotSuccessMsg}</p>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isAuthLoading}
                          className="w-full bg-art-dark hover:bg-art-forest text-white rounded-2xl py-3.5 text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:translate-y-[-1px] disabled:opacity-55"
                        >
                          {isAuthLoading ? 'Sending Dispatch Reset...' : 'Send Password Reset Link'}
                        </button>
                      </form>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => { setAuthMode('login'); setAuthError(''); setForgotSuccessMsg(''); }}
                          className="text-xs text-art-dark font-black hover:underline cursor-pointer"
                        >
                          Back to Log In
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SIGN UP SCREEN */}
                  {authMode === 'signup' && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-3xl font-serif italic font-bold text-art-dark">Join EcoTwin</h2>
                        <p className="text-xs text-art-olive mt-1 font-medium">Register to begin mapping and matching your Carbon footprints.</p>
                      </div>

                      <form onSubmit={handleSignUp} className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-art-dark block">Full Name:</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Your full name"
                              value={signupName}
                              onChange={(e) => setSignupName(e.target.value)}
                              className="w-full bg-art-cream/60 border border-art-border rounded-2xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-art-sage/20 focus:border-art-olive text-art-dark focus:outline-none"
                              required
                            />
                            <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-art-olive/60" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-art-dark block">Email Address:</label>
                          <div className="relative">
                            <input
                              type="email"
                              placeholder="xyz@gmail.com"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              className="w-full bg-art-cream/60 border border-art-border rounded-2xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-art-sage/20 focus:border-art-olive text-art-dark focus:outline-none"
                              required
                            />
                            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-art-olive/60" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-art-dark block">Password:</label>
                            <div className="relative">
                              <input
                                type="password"
                                placeholder="Min 6 chars"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                className="w-full bg-art-cream/60 border border-art-border rounded-2xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-art-sage/20 focus:border-art-olive text-art-dark focus:outline-none"
                                required
                              />
                              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-art-olive/60" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-art-dark block">Confirm:</label>
                            <div className="relative">
                              <input
                                type="password"
                                placeholder="..."
                                value={signupConfirmPassword}
                                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                className="w-full bg-art-cream/60 border border-art-border rounded-2xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-art-sage/20 focus:border-art-olive text-art-dark focus:outline-none"
                                required
                              />
                              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-art-olive/60" />
                            </div>
                          </div>
                        </div>

                        {authError && (
                          <p className="text-xs text-rose-600 font-semibold">{authError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={isAuthLoading}
                          className="w-full bg-art-dark hover:bg-art-forest text-white rounded-2xl py-3.5 text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:translate-y-[-1px] disabled:opacity-55"
                        >
                          {isAuthLoading ? 'Dispatching Verification...' : 'Create Account'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>

                      <div className="text-center text-xs">
                        <span className="text-art-olive">Already have an account? </span>
                        <button
                          type="button"
                          onClick={() => { setAuthMode('login'); setAuthError(''); }}
                          className="text-art-dark font-black hover:underline cursor-pointer"
                        >
                          Log In
                        </button>
                      </div>
                    </div>
                  )}

                  {/* MAIN LOGIN SCREEN */}
                  {authMode === 'login' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl font-serif italic font-bold text-art-dark">Let's Get Started</h2>
                        <p className="text-xs text-art-olive mt-1 font-medium font-display">Provide your credentials or launch an instant Sandbox session.</p>
                      </div>

                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-art-dark block">Email Address:</label>
                          <div className="relative">
                            <input
                              type="email"
                              placeholder="xyz@gmail.com"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              className="w-full bg-art-cream/60 border border-art-border rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:ring-2 focus:ring-art-sage/20 focus:border-art-olive text-art-dark focus:outline-none"
                              required
                            />
                            <Mail className="absolute left-3.5 top-4 w-4 h-4 text-art-olive/60" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-art-dark block">Security Password:</label>
                            <button
                              type="button"
                              onClick={() => { setAuthMode('forgot'); setAuthError(''); }}
                              className="text-[10px] text-art-olive hover:text-art-dark hover:underline font-bold"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="w-full bg-art-cream/60 border border-art-border rounded-2xl pl-10 pr-4 py-3.5 text-xs focus:ring-2 focus:ring-art-sage/20 focus:border-art-olive text-art-dark focus:outline-none"
                              required
                            />
                            <Lock className="absolute left-3.5 top-4 w-4 h-4 text-art-olive/60" />
                          </div>
                        </div>

                        {authError && (
                          <p className="text-xs text-rose-600 font-semibold">{authError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={isAuthLoading}
                          className="w-full bg-art-dark hover:bg-art-forest text-white rounded-2xl py-3.5 text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:translate-y-[-1px] disabled:opacity-50"
                        >
                          {isAuthLoading ? 'Authenticating securely...' : 'Secure Auth Check'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>

                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-art-border"></div>
                        <span className="flex-shrink mx-4 text-[10px] text-art-olive uppercase font-mono font-black">Or Sandbox</span>
                        <div className="flex-grow border-t border-art-border"></div>
                      </div>

                      {/* Quick Guest Play Button */}
                      <button
                        type="button"
                        onClick={handlePlayGuest}
                        disabled={isAuthLoading}
                        className="w-full bg-art-pale hover:bg-art-pale/80 border border-art-border text-art-dark rounded-2xl py-3.5 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-art-olive fill-art-pale" /> Play Instantly as Guest (Recommended)
                      </button>

                      <div className="text-center text-xs pt-1">
                        <span className="text-art-olive">Don't have an account? </span>
                        <button
                          type="button"
                          onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                          className="text-art-dark font-black hover:underline cursor-pointer"
                        >
                          Join EcoTwin
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>

          </motion.div>
        </div>
      )}

      {/* 2. ONBOARDING ASSESSMENT BLOCK */}
      {currentUser && profile && !profile.onboarded && (
        <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-art-pale via-art-cream to-art-pale flex items-center justify-center">
          <Onboarding onSubmit={handleOnboardingSubmit} />
        </div>
      )}

      {/* 3. MAIN DASHBOARD / TAB SHELL PANEL */}
      {currentUser && profile && profile.onboarded && (
        <div className="flex flex-col min-h-screen bg-art-cream">
          
          {/* Main Top Header Navigation */}
          <header className="bg-white border-b border-art-border sticky top-0 z-40 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
              
              {/* Product Logo / Details */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-art-forest rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 bg-art-sage rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif italic text-2xl font-bold tracking-tight text-art-dark">EcoTwin</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-art-pale text-art-olive uppercase">Companion</span>
                  </div>
                  <span className="text-[10px] text-art-olive block font-medium mt-0.5">Hello, {profile.name}! Carbon twin ecosystem is vibrant.</span>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-4 flex-wrap">
                
                {/* Companion Level status bubble */}
                <div className="bg-white border border-art-border px-4 py-2 rounded-full flex items-center gap-2 text-xs shadow-xs">
                  <span className="text-base">🦖</span>
                  <div>
                    <span className="text-[9px] text-art-olive block font-semibold leading-tight uppercase tracking-wider">Level {profile.companion.level}</span>
                    <span className="font-serif italic text-xs font-bold text-art-dark block leading-tight">
                      {profile.companion.name}
                    </span>
                  </div>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-art-border shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-widest text-art-olive">Sustainability Score</span>
                  <span className="text-lg font-serif italic text-art-dark">{profile.stats.score}/100</span>
                </div>

                {/* Log Out button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2.5 bg-art-cream hover:bg-rose-50 text-art-olive hover:text-rose-600 rounded-full cursor-pointer transition-all border border-art-border"
                  title="Logout Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>

              </div>
            </div>
          </header>

          {/* Nav Tab Rails */}
          <div className="bg-white border-b border-art-border">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-1 overflow-x-auto select-none scrollbar-none">
              {[
                { id: 'dashboard', label: '📊 Insights Dashboard' },
                { id: 'planner', label: '🌱 EcoBuddy Planner' },
                { id: 'twin', label: `🦖 Virtual Twin Workspace` },
                { id: 'simulator', label: `🔮 Footprint Simulator` },
                { id: 'reports', label: `📜 AI Weekly Reports` },
                { id: 'coach', label: '💬 AI Eco Q&A Coach' },
                { id: 'challenges', label: '🏆 Green Challenges' },
                { id: 'profile', label: '⚙️ Profile Achievements' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3.5 text-xs font-semibold truncate border-b-2 cursor-pointer transition-colors duration-150 ${
                    activeTab === tab.id
                      ? 'border-art-olive text-art-dark bg-art-pale/40 font-serif italic font-bold'
                      : 'border-transparent text-art-olive/85 hover:text-art-dark hover:bg-art-pale/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unified shell workspace layout */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
              >
                
                {/* A. GENERAL INSIGHTS DASHBOARD */}
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    stats={profile.stats} 
                    logs={profile.logs} 
                    onAddCustomEntry={handleLogAction}
                    userId={profile.userId}
                  />
                )}

                {/* A2. ECOBUDDY ADAPTIVE ACTION PLANNER VIEW */}
                {activeTab === 'planner' && (
                  <ActionPlanner 
                    userId={profile.userId}
                    onRefreshProfile={() => reloadProfileStats()}
                  />
                )}

                {/* B. DETAILED CARBON TWIN WORKSPACE */}
                {activeTab === 'twin' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left: Huge Virtual Companion sandbox and feeding controls */}
                    <div className="lg:col-span-7 space-y-6">
                      <CarbonTwinPet 
                        score={profile.stats.score}
                        equippedAccessories={profile.companion.equippedAccessories}
                        name={profile.companion.name}
                        moodState={petMoodAction}
                        currentMood={companionExpression}
                      />

                      {/* Custom Voice Customizer and direct Speech test preview */}
                      <div className="bg-white rounded-3xl p-6 border-2 border-art-dark shadow-md space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b-2 border-slate-100">
                          <div>
                            <h4 className="font-serif italic font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              🎙️ Voice Selection & Customization
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">Choose your companion's speaking voice below and click the preview button to test!</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Active Voice Selector */}
                          <div>
                            <label className="text-[10px] font-black text-slate-650 uppercase tracking-wider mb-1 block">
                              Available Voices in system:
                            </label>
                            {availableVoices.length > 0 ? (
                              <select 
                                value={selectedVoiceURI} 
                                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                                className="bg-slate-50 border-2 border-art-dark rounded-xl px-3 py-2 w-full text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                              >
                                {availableVoices.map((voice) => (
                                  <option key={voice.voiceURI} value={voice.voiceURI}>
                                    {voice.name} ({voice.lang})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="text-[11px] text-zinc-500 font-mono italic p-2 bg-slate-50 border border-slate-200 rounded-xl">
                                Looking for device system voices... browser default voice is active.
                              </div>
                            )}
                          </div>

                          {/* sliders grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Pitch Tone */}
                            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                              <div className="flex justify-between items-center text-[10px] font-black text-slate-650 uppercase tracking-wider mb-1.5">
                                <span>Voice Pitch:</span>
                                <span className="text-emerald-700 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  {voicePitch === 1.6 ? 'Cute' : voicePitch < 1.0 ? 'Deep' : voicePitch > 1.6 ? 'Squeaky' : 'Balanced'} ({voicePitch.toFixed(1)}x)
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
                            </div>

                            {/* Speaking Speed Rate */}
                            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                              <div className="flex justify-between items-center text-[10px] font-black text-slate-650 uppercase tracking-wider mb-1.5">
                                <span>Speaking Speed:</span>
                                <span className="text-emerald-700 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
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

                          {/* Auditory Preview Trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              if ('speechSynthesis' in window) {
                                window.speechSynthesis.cancel();
                                const utterance = new SpeechSynthesisUtterance(`Hi there! My name is ${profile.companion.name}. This is my sweet new custom voice speaking to you!`);
                                if (selectedVoiceURI) {
                                  const targetVoice = window.speechSynthesis.getVoices().find(v => v.voiceURI === selectedVoiceURI);
                                  if (targetVoice) {
                                    utterance.voice = targetVoice;
                                  }
                                }
                                utterance.pitch = voicePitch;
                                utterance.rate = voiceRate;
                                window.speechSynthesis.speak(utterance);
                              }
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                            Hear Selected Voice Test!
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Companion states details panel list */}
                    <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-4">
                      <div>
                        <h4 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-emerald-600" /> State Evolution Guidelines
                        </h4>
                        <p className="text-xs text-slate-500 leading-normal mt-0.5">
                          Your visual pet progresses dynamically through multiple emotional stages depending on carbon rating achievements.
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 text-xs">
                        
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                          <div className="flex gap-2">
                            <span className="text-lg">🌿</span>
                            <div>
                              <span className="font-bold text-emerald-950 block">Excellent (Score 80-100)</span>
                              <span className="text-[10px] text-emerald-800 font-sans block font-medium">Bright green body, smiling facial expression, lush foliage</span>
                            </div>
                          </div>
                          {profile.stats.score >= 80 && <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">Active</span>}
                        </div>

                        <div className="p-3 bg-teal-50/60 border border-teal-100/60 rounded-xl flex items-center justify-between">
                          <div className="flex gap-2">
                            <span className="text-lg">🌱</span>
                            <div>
                              <span className="font-bold text-teal-950 block">Good (Score 60-79)</span>
                              <span className="text-[10px] text-teal-800 font-sans block font-medium">Content face expression, healthy standard surroundings</span>
                            </div>
                          </div>
                          {(profile.stats.score >= 60 && profile.stats.score < 80) && <span className="font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded text-[10px]">Active</span>}
                        </div>

                        <div className="p-3 bg-amber-50/60 border border-amber-100/60 rounded-xl flex items-center justify-between">
                          <div className="flex gap-2">
                            <span className="text-lg">🍂</span>
                            <div>
                              <span className="font-bold text-amber-950 block">Moderate (Score 40-59)</span>
                              <span className="text-[10px] text-amber-800 font-sans block font-medium">Slightly concerned look, straight mouth, warning leaves</span>
                            </div>
                          </div>
                          {(profile.stats.score >= 40 && profile.stats.score < 60) && <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px]">Active</span>}
                        </div>

                        <div className="p-3 bg-orange-50/60 border border-orange-100/60 rounded-xl flex items-center justify-between">
                          <div className="flex gap-2">
                            <span className="text-lg">💨</span>
                            <div>
                              <span className="font-bold text-orange-950 block">High Carbon Impact (Score 20-39)</span>
                              <span className="text-[10px] text-orange-850 font-sans block font-medium">Sad crying expression, orange warning themes, dry foliage</span>
                            </div>
                          </div>
                          {(profile.stats.score >= 20 && profile.stats.score < 40) && <span className="font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded text-[10px]">Active</span>}
                        </div>

                        <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl flex items-center justify-between">
                          <div className="flex gap-2">
                            <span className="text-lg">☣️</span>
                            <div>
                              <span className="font-bold text-stone-900 block">Critical (Score 0-19)</span>
                              <span className="text-[10px] text-stone-600 font-sans block font-medium">Ash grey coughing face details, dead plants, carbon smog effects</span>
                            </div>
                          </div>
                          {profile.stats.score < 20 && <span className="font-bold text-zinc-700 bg-zinc-200 px-2 py-0.5 rounded text-[10px]">Active</span>}
                        </div>

                      </div>
                    </div>

                  </div>
                )}

                {/* FX. CARBON FUTURE FOOTPRINT SIMULATOR */}
                {activeTab === 'simulator' && (
                  <FutureSimulator 
                    stats={profile.stats}
                    companionName={profile.companion.name}
                  />
                )}

                {/* RX. AI WEEKLY REPORTS */}
                {activeTab === 'reports' && (
                  <WeeklyReport 
                    userId={profile.userId}
                    stats={profile.stats}
                    logs={profile.logs}
                    companionName={profile.companion.name}
                  />
                )}

                {/* C. AI SUSTAINABILITY COACH */}
                {activeTab === 'coach' && (
                  <AICoach 
                    userId={profile.userId}
                    companionName={profile.companion.name}
                    score={profile.stats.score}
                  />
                )}

                {/* E. GREEN CHALLENGES */}
                {activeTab === 'challenges' && (
                  <Challenges 
                    userId={profile.userId}
                    companion={profile.companion}
                    onRefreshProfile={reloadProfileStats}
                  />
                )}

                {/* F. PROFILE AND ACHIEVEMENTS */}
                {activeTab === 'profile' && (
                  <ProfileAchievements 
                    userId={profile.userId}
                    name={profile.name}
                    companion={profile.companion}
                    stats={profile.stats}
                    onRefreshProfile={reloadProfileStats}
                  />
                )}

              </motion.div>
            </AnimatePresence>

          </main>

          {/* Simple footer credit lines */}
          <footer className="py-6 text-center border-t border-slate-100 bg-white mt-12">
            <span className="text-[11px] text-slate-500 font-medium">
              EcoTwin Companionship Space • Interactive Carbon Tracking Network • 2026-2027
            </span>
          </footer>

          {/* Floating Carbon Twin Voice Assistant Microphone */}
          {profile && profile.onboarded && (
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
              <AnimatePresence>
                {!showVoicePanel && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    onClick={() => setShowVoicePanel(true)}
                    className="bg-white text-art-dark border border-art-border shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-4 py-2 text-[11px] font-sans font-extrabold flex items-center gap-2 cursor-pointer hover:bg-art-sand border-2 border-art-dark hover:shadow-[3px_3px_0_0_#1e293b] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span>Hey Sprout! (Voice)</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowVoicePanel(prev => !prev)}
                className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-[4px_4px_0_0_#1e293b] border-3 border-art-dark transition-all ${
                  showVoicePanel 
                    ? 'bg-art-sand text-art-dark' 
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
                title="Carbon Twin Live Assistant"
              >
                {showVoicePanel ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                )}
              </motion.button>
            </div>
          )}

          {/* Carbon Twin Live Assistant overlay panel dialog drawer */}
          <AnimatePresence>
            {showVoicePanel && profile && (
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
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5 animate-bounce" />
                    )}
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
