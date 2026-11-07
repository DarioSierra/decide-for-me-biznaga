import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, executeDeciderFlow } from './lib/firebase';
import { SignInView } from './components/SignInView';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { PrioritiesPanel } from './components/PrioritiesPanel';
import { ChatMessage } from './types';

const DEFAULT_PRIORITIES = `1. Long-term Autonomy & Leverage: Maximize ownership of time and compounding technical expertise over direct short-term titles.
2. Financial Runway & Downside Protection: Maintain 12+ months liquidity reserve; avoid unhedged illiquidity.
3. Work-Life Baseline Health: Non-negotiable 7h sleep threshold; avoid high sustained travel frequency.
Bias profile: Risk-neutral, Evidence-weighted`;

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [priorities, setPriorities] = useState<string>(DEFAULT_PRIORITIES);
  const [isSavingPriorities, setIsSavingPriorities] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Monitor Authentication state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync user's saved priorities from Firestore path: users/{userId}
  useEffect(() => {
    if (!currentUser) return;

    const userDocPath = `users/${currentUser.uid}`;
    const userDocRef = doc(db, 'users', currentUser.uid);

    const unsubscribeSnapshot = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && typeof data.priorities === 'string') {
            setPriorities(data.priorities);
          }
        } else {
          // Initialize first-time user document with default calibrated priorities
          setDoc(userDocRef, { priorities: DEFAULT_PRIORITIES }).catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, userDocPath);
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, userDocPath);
      }
    );

    return () => unsubscribeSnapshot();
  }, [currentUser]);

  // Handle saving priorities back to Firestore at users/{userId}
  const handleSavePriorities = async (newPriorities: string) => {
    if (!currentUser) return;
    setIsSavingPriorities(true);
    const userDocPath = `users/${currentUser.uid}`;

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        priorities: newPriorities,
      });
      setPriorities(newPriorities);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userDocPath);
    } finally {
      setIsSavingPriorities(false);
    }
  };

  // Handle "Decide For Me" Action:
  // 1. Render user options message
  // 2. Call Firebase AI Logic SDK with Template Generative Model (templateId: "decider-flow")
  // 3. Extract verdict, justification, firstStep and render system chat bubble on left
  const handleDilemmaSubmit = async (optionA: string, optionB: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      type: 'dilemma',
      optionA,
      optionB,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call Firebase AI Logic SDK with template "decider-flow"
      const decision = await executeDeciderFlow({
        priorities,
        optionA,
        optionB,
      });

      const systemMessage: ChatMessage = {
        id: `decision-${Date.now()}`,
        role: 'system',
        type: 'decision',
        decision,
      };

      setMessages((prev) => [...prev, systemMessage]);
    } catch (err: unknown) {
      console.error('Decider Flow Error:', err);
      const errorMessageText =
        err instanceof Error ? err.message : 'Deliberation request could not be completed.';

      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'system',
        type: 'error',
        text: errorMessageText,
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading indicator while resolving initial Firebase Auth
  if (authChecking) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Initializing Engine...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show clean, minimalist sign-in state
  if (!currentUser) {
    return <SignInView />;
  }

  // Logged in -> Take them directly to the dilemma decision screen
  return (
    <div className="bg-slate-50 text-slate-800 font-sans antialiased h-screen w-screen overflow-hidden flex flex-col">
      {/* Top Header */}
      <Header user={currentUser} />

      {/* Main Two-Column Split Screen Layout */}
      <main className="flex-1 flex flex-col lg:flex-row w-full h-full overflow-hidden">
        {/* Left Panel: Main Chat & Dilemma Decision Area (~73% width) */}
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSubmitDilemma={handleDilemmaSubmit}
        />

        {/* Right Panel: Configuration & My Priorities Screen (~27% width) */}
        <PrioritiesPanel
          priorities={priorities}
          isSaving={isSavingPriorities}
          onSavePriorities={handleSavePriorities}
        />
      </main>
    </div>
  );
}
