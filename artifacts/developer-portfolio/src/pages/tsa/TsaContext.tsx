import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

export const DEFAULT_ELEVES = Array.from({ length: 10 }, (_, i) => `Élève ${i + 1}`);

export const DEFAULT_ACTIVITES: Activite[] = [
  { id: "a1", nom: "Atelier créatif", emoji: "🎨", couleur: "#f97316" },
  { id: "a2", nom: "Lecture", emoji: "📖", couleur: "#3b82f6" },
  { id: "a3", nom: "Temps calme", emoji: "🧘", couleur: "#8b5cf6" },
  { id: "a4", nom: "Motricité", emoji: "🏃", couleur: "#22c55e" },
  { id: "a5", nom: "Musique", emoji: "🎵", couleur: "#ec4899" },
  { id: "a6", nom: "Jeux éducatifs", emoji: "🧩", couleur: "#eab308" },
  { id: "a7", nom: "Repas", emoji: "🍽️", couleur: "#a16207" },
  { id: "a8", nom: "Temps extérieur", emoji: "🌿", couleur: "#166534" },
  { id: "a9", nom: "Orthophonie", emoji: "💬", couleur: "#0ea5e9" },
  { id: "a10", nom: "Ergothérapie", emoji: "🖐️", couleur: "#fb923c" },
  { id: "a11", nom: "Mathématiques", emoji: "🔢", couleur: "#ef4444" },
  { id: "a12", nom: "Écriture", emoji: "✏️", couleur: "#64748b" },
];

export type Activite = { id: string; nom: string; emoji: string; couleur: string };

export type NiveauComm = "verbal" | "semi-verbal" | "non-verbal";
export type Tolerance = "faible" | "moyenne" | "haute";
export type Humeur = "😊" | "😐" | "😟" | "😡" | "😴";

export type ObjectifStatut = "non-acquis" | "en-cours" | "acquis";

export type Objectif = {
  id: string;
  titre: string;
  description: string;
  progression: number;
  statut?: ObjectifStatut;
  historique: { date: string; progression: number }[];
};

export type ProfilEleve = {
  niveauComm: NiveauComm;
  sensibilites: { bruit: Tolerance; lumiere: Tolerance; toucher: Tolerance; foule: Tolerance };
  declencheurs: string[];
  strategies: string[];
  notes: string;
  objectifs: Objectif[];
  anniversaire: string;
  avatar?: string;
  photo?: string;
};

export type HumeurEntry = { date: string; humeur: Humeur; note: string };
export type AbsenceEntry = { date: string };

export type ComportementType = "positif" | "difficile";
export type Comportement = {
  id: string;
  date: string;
  heure: string;
  type: ComportementType;
  intensite: 1 | 2 | 3;
  declencheur: string;
  comportement: string;
  apaisement: string;
};

export type Evenement = {
  id: string;
  titre: string;
  date: string;
  type: "sortie" | "atelier" | "bilan" | "autre";
  description: string;
};

export type Jalon = { id: string; titre: string; date: string; description: string };

export type ProjetAnnuel = {
  id: string;
  titre: string;
  description: string;
  statut: "En cours" | "Planifié" | "Idée";
  responsable: string;
  dateCible: string;
};

export type CarnetEntry = {
  semaine: string;
  activites: string;
  positifs: string;
  atravailler: string;
  message: string;
};

export type DayPlanning = Record<string, Record<string, Activite | null>>;

export type AppSettings = {
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  autoSave: boolean;
};

export const defaultSettings: AppSettings = {
  largeText: false,
  highContrast: false,
  reduceMotion: false,
  autoSave: false,
};

export type TsaState = {
  eleves: string[];
  activites: Activite[];
  profils: Record<number, ProfilEleve>;
  humeurs: Record<number, HumeurEntry[]>;
  absences: Record<number, AbsenceEntry[]>;
  comportements: Record<number, Comportement[]>;
  plannings: Record<string, DayPlanning>;
  evenements: Evenement[];
  jalons: Jalon[];
  projetsAnnuels: ProjetAnnuel[];
  carnets: Record<number, CarnetEntry[]>;
  settings: AppSettings;
};

type Action =
  | { type: "SET_ELEVE"; index: number; nom: string }
  | { type: "SET_ELEVES"; eleves: string[] }
  | { type: "ADD_ACTIVITE"; activite: Activite }
  | { type: "DELETE_ACTIVITE"; id: string }
  | { type: "SET_PROFIL"; index: number; profil: Partial<ProfilEleve> }
  | { type: "ADD_HUMEUR"; index: number; entry: HumeurEntry }
  | { type: "SET_ABSENCE"; index: number; date: string; absent: boolean }
  | { type: "ADD_COMPORTEMENT"; index: number; entry: Comportement }
  | { type: "DELETE_COMPORTEMENT"; index: number; id: string }
  | { type: "SET_PLANNING_CELL"; date: string; eleve: number; creneau: string; activite: Activite | null }
  | { type: "RESET_PLANNING"; date: string }
  | { type: "ADD_EVENEMENT"; ev: Evenement }
  | { type: "DELETE_EVENEMENT"; id: string }
  | { type: "ADD_JALON"; jalon: Jalon }
  | { type: "ADD_PROJET"; projet: ProjetAnnuel }
  | { type: "UPDATE_PROJET"; projet: ProjetAnnuel }
  | { type: "SET_CARNET"; eleveIndex: number; semaine: string; entry: Partial<CarnetEntry> }
  | { type: "SET_SETTINGS"; settings: Partial<AppSettings> }
  | { type: "LOAD"; state: TsaState };

const defaultProfil = (): ProfilEleve => ({
  niveauComm: "verbal",
  sensibilites: { bruit: "moyenne", lumiere: "moyenne", toucher: "moyenne", foule: "moyenne" },
  declencheurs: [],
  strategies: [],
  notes: "",
  objectifs: [],
  anniversaire: "",
});

const initialState: TsaState = {
  eleves: DEFAULT_ELEVES,
  activites: DEFAULT_ACTIVITES,
  profils: {},
  humeurs: {},
  absences: {},
  comportements: {},
  plannings: {},
  evenements: [],
  jalons: [
    { id: "j1", titre: "Rentrée scolaire", date: "2024-09-02", description: "Premier jour de l'année" },
    { id: "j2", titre: "Bilan trimestriel 1", date: "2024-12-20", description: "Bilan de fin de premier trimestre" },
    { id: "j3", titre: "Bilan trimestriel 2", date: "2025-03-28", description: "Bilan de fin de deuxième trimestre" },
    { id: "j4", titre: "Fête de fin d'année", date: "2025-06-27", description: "Célébration de l'année écoulée" },
  ],
  projetsAnnuels: [],
  carnets: {},
  settings: defaultSettings,
};

function migrateState(raw: unknown): TsaState {
  const s = raw as Record<string, unknown>;
  if (s.planningJour !== undefined && s.plannings === undefined) {
    const today = new Date().toISOString().split("T")[0];
    s.plannings = { [today]: s.planningJour as DayPlanning };
    delete s.planningJour;
    delete s.planningHebdo;
  }
  const merged = { ...initialState, ...s } as TsaState;
  merged.settings = { ...defaultSettings, ...(s.settings as Partial<AppSettings> | undefined) };
  return merged;
}

function reducer(state: TsaState, action: Action): TsaState {
  switch (action.type) {
    case "LOAD": return migrateState(action.state);
    case "SET_ELEVE": {
      const eleves = [...state.eleves];
      eleves[action.index] = action.nom;
      return { ...state, eleves };
    }
    case "SET_ELEVES": return { ...state, eleves: action.eleves };
    case "ADD_ACTIVITE": return { ...state, activites: [...state.activites, action.activite] };
    case "DELETE_ACTIVITE": return { ...state, activites: state.activites.filter(a => a.id !== action.id) };
    case "SET_PROFIL": {
      const existing = state.profils[action.index] ?? defaultProfil();
      return { ...state, profils: { ...state.profils, [action.index]: { ...existing, ...action.profil } } };
    }
    case "ADD_HUMEUR": {
      const prev = state.humeurs[action.index] ?? [];
      return { ...state, humeurs: { ...state.humeurs, [action.index]: [...prev, action.entry] } };
    }
    case "SET_ABSENCE": {
      const prev = state.absences[action.index] ?? [];
      const filtered = prev.filter(a => a.date !== action.date);
      const next = action.absent ? [...filtered, { date: action.date }] : filtered;
      return { ...state, absences: { ...state.absences, [action.index]: next } };
    }
    case "ADD_COMPORTEMENT": {
      const prev = state.comportements[action.index] ?? [];
      return { ...state, comportements: { ...state.comportements, [action.index]: [...prev, action.entry] } };
    }
    case "DELETE_COMPORTEMENT": {
      const prev = state.comportements[action.index] ?? [];
      return { ...state, comportements: { ...state.comportements, [action.index]: prev.filter(c => c.id !== action.id) } };
    }
    case "SET_PLANNING_CELL": {
      const datePlan = state.plannings[action.date] ?? {};
      const prevEleve = datePlan[action.eleve] ?? {};
      return {
        ...state,
        plannings: {
          ...state.plannings,
          [action.date]: {
            ...datePlan,
            [action.eleve]: { ...prevEleve, [action.creneau]: action.activite },
          },
        },
      };
    }
    case "RESET_PLANNING": {
      const { [action.date]: _removed, ...rest } = state.plannings;
      return { ...state, plannings: rest };
    }
    case "ADD_EVENEMENT": return { ...state, evenements: [...state.evenements, action.ev] };
    case "DELETE_EVENEMENT": return { ...state, evenements: state.evenements.filter(e => e.id !== action.id) };
    case "ADD_JALON": return { ...state, jalons: [...state.jalons, action.jalon] };
    case "ADD_PROJET": return { ...state, projetsAnnuels: [...state.projetsAnnuels, action.projet] };
    case "UPDATE_PROJET": return { ...state, projetsAnnuels: state.projetsAnnuels.map(p => p.id === action.projet.id ? action.projet : p) };
    case "SET_CARNET": {
      const prev = state.carnets[action.eleveIndex] ?? [];
      const idx = prev.findIndex(c => c.semaine === action.semaine);
      const base: CarnetEntry = { semaine: action.semaine, activites: "", positifs: "", atravailler: "", message: "" };
      const updated = idx >= 0
        ? prev.map((c, i) => i === idx ? { ...c, ...action.entry } : c)
        : [...prev, { ...base, ...action.entry }];
      return { ...state, carnets: { ...state.carnets, [action.eleveIndex]: updated } };
    }
    case "SET_SETTINGS": return { ...state, settings: { ...state.settings, ...action.settings } };
    default: return state;
  }
}

const TsaContext = createContext<{ state: TsaState; dispatch: React.Dispatch<Action> } | null>(null);

export function TsaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tsa_app_state");
      if (saved) dispatch({ type: "LOAD", state: JSON.parse(saved) });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("tsa_app_state", JSON.stringify(state));
    } catch {
      /* quota dépassé (ex. trop de photos) — la sauvegarde Airtable reste la source fiable */
    }
  }, [state]);

  return <TsaContext.Provider value={{ state, dispatch }}>{children}</TsaContext.Provider>;
}

export function useTsa() {
  const ctx = useContext(TsaContext);
  if (!ctx) throw new Error("useTsa must be used within TsaProvider");
  return ctx;
}

export function useProfil(index: number): ProfilEleve {
  const { state } = useTsa();
  return state.profils[index] ?? defaultProfil();
}

export const CRENEAUX = Array.from({ length: 18 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

export const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

export function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export function currentWeek() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().split("T")[0];
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
