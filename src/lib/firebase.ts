import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAI, getTemplateGenerativeModel } from 'firebase/ai';
import firebaseConfig from '../../firebase-applet-config.json';
import { DecisionResponse } from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// App Check debug mode per requirements
if (typeof window !== 'undefined') {
  (window as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(firebaseConfig.recaptchaSiteKey || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.warn('App Check initialization notice:', e);
  }
}

// Initialize Firebase AI Logic SDK
export const ai = getAI(app);

export interface DeciderInputPayload {
  priorities: string;
  optionA: string;
  optionB: string;
}

/**
 * Calls the Firebase AI Logic SDK using a Template Generative Model
 * with prompt template id "decider-flow".
 */
export async function executeDeciderFlow(payload: DeciderInputPayload): Promise<DecisionResponse> {
  const model = getTemplateGenerativeModel(ai);

  const result = await model.generateContent({
    templateId: 'decider-flow',
    templateVariables: {
      priorities: payload.priorities,
      optionA: payload.optionA,
      optionB: payload.optionB,
    },
  });

  const responseText = result.response.text();
  return parseDecisionResponse(responseText);
}

function parseDecisionResponse(rawText: string): DecisionResponse {
  try {
    const codeFenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const textToParse = codeFenceMatch ? codeFenceMatch[1] : rawText;

    const firstBrace = textToParse.indexOf('{');
    const lastBrace = textToParse.lastIndexOf('}');
    let parsed: Record<string, string>;
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      parsed = JSON.parse(textToParse.slice(firstBrace, lastBrace + 1));
    } else {
      parsed = JSON.parse(textToParse);
    }

    return {
      verdict: parsed.verdict || 'Decision Recommendation',
      justification: parsed.justification || 'Analyzed trade-offs against configured priorities.',
      firstStep: parsed.firstStep || 'Take immediate next concrete step.',
    };
  } catch (err) {
    console.warn('Could not parse JSON directly from decider-flow response, extracting fields:', err);
    const verdictMatch = rawText.match(/["']?verdict["']?\s*:\s*["']([^"'\n\r]+)["']/i);
    const justMatch = rawText.match(/["']?justification["']?\s*:\s*["']([^"'\n\r]+)["']/i);
    const stepMatch = rawText.match(/["']?firstStep["']?\s*:\s*["']([^"'\n\r]+)["']/i);

    return {
      verdict: verdictMatch ? verdictMatch[1] : 'Calibrated Recommendation',
      justification: justMatch ? justMatch[1] : rawText,
      firstStep: stepMatch ? stepMatch[1] : 'Proceed with the chosen course of action.',
    };
  }
}

// Error Handling Specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();
