export interface DilemmaSubmission {
  id: string;
  optionA: string;
  optionB: string;
  timestamp: number;
}

export interface DecisionResponse {
  verdict: string;
  justification: string;
  firstStep: string;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user';
  type: 'welcome' | 'dilemma' | 'decision' | 'error';
  optionA?: string;
  optionB?: string;
  decision?: DecisionResponse;
  text?: string;
}

export interface UserPrioritiesData {
  priorities: string;
}
