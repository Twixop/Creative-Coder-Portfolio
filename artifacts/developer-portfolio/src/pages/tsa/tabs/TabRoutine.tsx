import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTsa, CRENEAUX, todayStr, Activite, speak, speechSupported } from "../TsaContext";

const DURATIONS = [2, 5, 10, 15, 20, 30];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function TabRoutine() {
  const { state } = useTsa();
  const [eleveIndex, setEleveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const today = todayStr();

  // Séquence d'activités planifiées aujourd'hui pour l'élève
  const sequence = useMemo(() => {
    const planning = (state.plannings[today] ?? {})[eleveIndex] ?? {};
    return CRENEAUX
      .map(c => ({ creneau: c, activite: planning[c] as Activite | null | undefined }))
      .filter((x): x is { creneau: string; activite: Activite } => !!x.activite);
  }, [state.plannings, today, eleveIndex]);

  const [step, setStep] = useState(0);
  useEffect(() => { setStep(0); }, [eleveIndex]);

  const current = sequence[step];
  const next = sequence[step + 1];

  // Minuteur
  const [duration, setDuration] = useState(10 * 60);
  const [remaining, setRemaining] = useState(10 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          setRunning(false);
          if (speechSupported()) speak("C'est terminé !");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [running]);

  function setDur(min: number) {
    setDuration(min * 60);
    setRemaining(min * 60);
    setRunning(false);
  }
  function reset() { setRemaining(duration); setRunning(false); }

  function goStep(dir: 1 | -1) {
    const nextStep = Math.min(Math.max(step + dir, 0), Math.max(sequence.length - 1, 0));
    setStep(nextStep);
    const act = sequence[nextStep]?.activite;
    if (act && speechSupported()) speak(`Maintenant : ${act.nom}`);
  }

  const pct = duration > 0 ? (remaining / duration) * 100 : 0;
  const ringColor = remaining === 0 ? "#e53e3e" : pct < 20 ? "#f6ad55" : "var(--tsa-sage)";

  const timerCircle = (size: number) => (
    <div style={{
      width: size, height: size, borderRadius: "50%", margin: "0 auto",
      background: `conic-gradient(${ringColor} ${100 - pct}%, var(--tsa-sage-light) 0)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: size - 28, height: size - 28, borderRadius: "50%", background: "white",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: size * 0.22, fontWeight: 900, color: ringColor, lineHeight: 1 }}>{formatTime(remaining)}</div>
        {remaining === 0 && <div style={{ fontSize: size * 0.06, fontWeight: 800, color: "#e53e3e" }}>Terminé !</div>}
      </div>
    </div>
  );

  const sequenceView = (big: boolean) => (
    <div style={{ display: "flex", gap: big ? 24 : 14, alignItems: "stretch", justifyContent: "center", flexWrap: "wrap" }}>
      <div style={{
        flex: "1 1 240px", maxWidth: big ? 420 : 320, textAlign: "center", borderRadius: 20,
        padding: big ? 32 : 18, background: current ? current.activite.couleur + "22" : "var(--tsa-warm)",
        border: `3px solid ${current ? current.activite.couleur : "var(--tsa-border)"}`,
      }}>
        <div style={{ fontSize: big ? "1.1rem" : "0.8rem", fontWeight: 800, color: "var(--tsa-muted)", marginBottom: 8 }}>MAINTENANT</div>
        {current ? (
          <>
            <div style={{ fontSize: big ? "6rem" : "3rem", lineHeight: 1 }}>{current.activite.emoji}</div>
            <div style={{ fontSize: big ? "2rem" : "1.1rem", fontWeight: 900, color: current.activite.couleur, marginTop: 10, overflowWrap: "anywhere", hyphens: "auto" }}>{current.activite.nom}</div>
            <div style={{ fontSize: big ? "1rem" : "0.8rem", color: "var(--tsa-muted)", marginTop: 4, overflowWrap: "anywhere" }}>{current.creneau}</div>
          </>
        ) : <div style={{ color: "var(--tsa-muted)", padding: 20 }}>Aucune activité planifiée</div>}
      </div>

      <div style={{
        flex: "1 1 200px", maxWidth: big ? 360 : 280, textAlign: "center", borderRadius: 20,
        padding: big ? 32 : 18, background: "var(--tsa-warm)", border: "3px dashed var(--tsa-border)", opacity: 0.85,
      }}>
        <div style={{ fontSize: big ? "1.1rem" : "0.8rem", fontWeight: 800, color: "var(--tsa-muted)", marginBottom: 8 }}>ENSUITE</div>
        {next ? (
          <>
            <div style={{ fontSize: big ? "4.5rem" : "2.4rem", lineHeight: 1 }}>{next.activite.emoji}</div>
            <div style={{ fontSize: big ? "1.5rem" : "1rem", fontWeight: 800, color: next.activite.couleur, marginTop: 10, overflowWrap: "anywhere", hyphens: "auto" }}>{next.activite.nom}</div>
            <div style={{ fontSize: big ? "1rem" : "0.8rem", color: "var(--tsa-muted)", marginTop: 4, overflowWrap: "anywhere" }}>{next.creneau}</div>
          </>
        ) : <div style={{ color: "var(--tsa-muted)", padding: 20 }}>🎉 Dernière activité</div>}
      </div>
    </div>
  );

  const navButtons = (big: boolean) => (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: big ? 24 : 16 }}>
      <button className="tsa-btn tsa-btn-ghost" disabled={step === 0} onClick={() => goStep(-1)}
        style={big ? { fontSize: "1.2rem", padding: "12px 24px" } : undefined}>◀ Précédent</button>
      <span style={{ display: "flex", alignItems: "center", fontWeight: 800, color: "var(--tsa-muted)", fontSize: big ? "1.1rem" : "0.85rem" }}>
        {sequence.length > 0 ? `${step + 1} / ${sequence.length}` : "—"}
      </span>
      <button className="tsa-btn tsa-btn-primary" disabled={step >= sequence.length - 1} onClick={() => goStep(1)}
        style={big ? { fontSize: "1.2rem", padding: "12px 24px" } : undefined}>Suivant ▶</button>
    </div>
  );

  const timerControls = (big: boolean) => (
    <>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: big ? 20 : 12 }}>
        {DURATIONS.map(m => (
          <button key={m} className="tsa-btn tsa-btn-sm"
            style={{ background: duration === m * 60 ? "var(--tsa-sage)" : "var(--tsa-border)",
              color: duration === m * 60 ? "white" : "var(--tsa-muted)", ...(big ? { fontSize: "1rem", padding: "8px 16px" } : {}) }}
            onClick={() => setDur(m)}>{m} min</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
        <button className="tsa-btn tsa-btn-primary" onClick={() => setRunning(r => !r)}
          style={big ? { fontSize: "1.3rem", padding: "14px 32px" } : undefined}>
          {running ? "⏸ Pause" : "▶️ Démarrer"}
        </button>
        <button className="tsa-btn tsa-btn-ghost" onClick={reset}
          style={big ? { fontSize: "1.3rem", padding: "14px 32px" } : undefined}>↺ Réinitialiser</button>
      </div>
    </>
  );

  if (fullscreen) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999, background: "var(--tsa-cream)",
        overflowY: "auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 28,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--tsa-sage)" }}>🌱 {state.eleves[eleveIndex]}</div>
          <button className="tsa-btn tsa-btn-ghost" onClick={() => setFullscreen(false)} style={{ fontSize: "1.1rem" }}>✕ Quitter</button>
        </div>
        {sequenceView(true)}
        {navButtons(true)}
        <div style={{ marginTop: 12 }}>{timerCircle(260)}</div>
        {timerControls(true)}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <h2 className="tsa-section-title" style={{ margin: 0 }}>▶️ Routine visuelle & minuteur</h2>
        <button className="tsa-btn tsa-btn-secondary" onClick={() => setFullscreen(true)}>⛶ Mode plein écran</button>
      </div>

      <div className="tsa-card" style={{ marginBottom: 16 }}>
        <label className="tsa-label">Élève</label>
        <select className="tsa-input" value={eleveIndex} onChange={e => setEleveIndex(Number(e.target.value))} style={{ maxWidth: 320 }}>
          {state.eleves.map((nom, i) => <option key={i} value={i}>{nom}</option>)}
        </select>
        <p style={{ color: "var(--tsa-muted)", fontSize: "0.78rem", margin: "8px 0 0" }}>
          La séquence reprend le planning du jour de l'élève. Le mode plein écran est conçu pour être montré à l'élève.
        </p>
      </div>

      <div className="tsa-card" style={{ marginBottom: 16 }}>
        <div className="tsa-section-title" style={{ fontSize: "0.95rem" }}>🔄 Séquence du jour</div>
        {sequenceView(false)}
        {navButtons(false)}
      </div>

      <div className="tsa-card">
        <div className="tsa-section-title" style={{ fontSize: "0.95rem" }}>⏲️ Minuteur visuel</div>
        {timerCircle(180)}
        {timerControls(false)}
      </div>
    </div>
  );
}
