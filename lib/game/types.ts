export type GameMode = "global" | "austin";

export type RoundSource = "windy" | "austin";

export type Round = {
  id: string;
  image: string;
  lat: number;
  lng: number;
  city: string;
  region: string;
  country: string;
  source: RoundSource;
  mode?: GameMode;
  locationName?: string;
  primaryStreet?: string;
  crossStreet?: string;
  landmark?: string;
  cameraId?: string;
};

export type Guess = {
  lat: number;
  lng: number;
};

export type GamePhase = "briefing" | "shift" | "debrief";

export type RoundFeedback = {
  correct: boolean;
  chosenId: string;
  correctId: string;
};

export type ShiftResult = {
  correct: number;
  total: number;
  roundResults: RoundFeedback[];
  durationSeconds: number;
  timeUsed: number;
};

export type GameState = {
  phase: GamePhase;
  rounds: Round[];
  currentRoundIndex: number;
  correct: number;
  timeRemaining: number;
  durationSeconds: number;
  feedback: RoundFeedback | null;
  roundResults: RoundFeedback[];
};

export type GameAction =
  | { type: "START_SHIFT"; durationSeconds: number; rounds: Round[] }
  | { type: "SUBMIT_GUESS"; chosenId: string }
  | { type: "DISMISS_FEEDBACK" }
  | { type: "TICK" }
  | { type: "PLAY_AGAIN" };

