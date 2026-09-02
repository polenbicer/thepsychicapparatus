"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Scores = { id: number; ego: number; superego: number };
type Answer = { section: string; prompt: string; answer: string; at: string };
const STORAGE_KEY = "psychic-apparatus-case-file-v1";

const projectionCards = [
  { text: "This is a terrible idea. Continue.", answer: "Polen", delta: { id: 10, ego: 2, superego: 0 } },
  { text: "I’m only playing because I want to win.", answer: "Me", delta: { id: 4, ego: 8, superego: 2 } },
  { text: "If she texts now, I’ll wait before replying.", answer: "Me", delta: { id: 2, ego: 6, superego: 6 } },
  { text: "Why hasn’t she texted yet?", answer: "Me", delta: { id: 9, ego: 2, superego: 0 } },
  { text: "This tension is becoming operationally inefficient.", answer: "The phone", delta: { id: 3, ego: 5, superego: 8 } },
];
const realityCards = [
  { prompt: "It’s late.", safe: "Go home", spicy: "One more drink" },
  { prompt: "You wrote the message.", safe: "Wait until tomorrow", spicy: "Send it now" },
  { prompt: "Polen is typing…", safe: "Maintain dignity", spicy: "Open immediately" },
  { prompt: "Analysis complete.", safe: "End the game", spicy: "See what happens" },
];

const clamp = (v: number) => Math.max(0, Math.min(100, v));
function loadSavedAnswers(): Answer[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return Array.isArray(parsed.answers) ? parsed.answers : [];
  } catch { return []; }
}
function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="meter-wrap"><div className="meter-label"><span>{label}</span><span>{value}%</span></div><div className="meter-track"><div className="meter-fill" style={{ width: `${value}%`, background: color }} /></div></div>;
}

export default function Home() {
  const [screen, setScreen] = useState("intro");
  const [scores, setScores] = useState<Scores>({ id: 18, ego: 42, superego: 56 });
  const [answers, setAnswers] = useState<Answer[]>(loadSavedAnswers);
  const [messageIndex, setMessageIndex] = useState(0);
  const [projectionIndex, setProjectionIndex] = useState(0);
  const [realityIndex, setRealityIndex] = useState(0);
  const [slip, setSlip] = useState<"idle" | "switching" | "revealed">("idle");
  const [hold, setHold] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, scores, updatedAt: new Date().toISOString() })); }, [answers, scores]);

  const addAnswer = (section: string, prompt: string, answer: string) => setAnswers((a) => [...a, { section, prompt, answer, at: new Date().toISOString() }]);
  const bump = (d: Partial<Scores>) => setScores((s) => ({ id: clamp(s.id + (d.id ?? 0)), ego: clamp(s.ego + (d.ego ?? 0)), superego: clamp(s.superego + (d.superego ?? 0)) }));
  const diagnosis = useMemo(() => {
    const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    if (winner === "id") return { eyebrow: "THE ID HAS WON", title: "Clinically irresistible.", copy: "Impulse control was present, briefly. Polen recommends discussing the findings over a drink." };
    if (winner === "superego") return { eyebrow: "SUPEREGO DOMINANT", title: "Composed. Suspiciously curious.", copy: "You defeated Polen’s Id. Your prize is choosing where Polen takes you." };
    return { eyebrow: "EGO DOMINANT", title: "Functionally dangerous.", copy: "Excellent judgment. Selectively applied. Polen requests further evaluation in person." };
  }, [scores]);

  const messages = [
    { text: "Are you awake?", options: ["No.", "Unfortunately.", "Depends what you want."] },
    { text: "I was thinking about you.", options: ["Dangerous hobby.", "About what?", "Good. Continue."] },
    { text: "This is probably a bad idea.", options: ["Then stop.", "What kind of bad?", "My favourite kind."] },
  ];
  const choosePleasure = (answer: string) => {
    addAnswer("Pleasure Principle", `Polen: ${messages[messageIndex].text}`, answer);
    bump(answer.includes("Depends") || answer.includes("What kind") || answer.includes("Good") || answer.includes("favourite") ? { id: 12, ego: 4, superego: -4 } : { id: 4, ego: 7, superego: 6 });
    if (messageIndex < 2) setMessageIndex((v) => v + 1); else setScreen("repression");
  };
  const startHold = () => { if (!holdTimer.current) holdTimer.current = setInterval(() => setHold((v) => Math.min(100, v + 2)), 40); };
  const stopHold = () => {
    if (holdTimer.current) clearInterval(holdTimer.current); holdTimer.current = null;
    if (hold >= 96) { addAnswer("Repression Chamber", "Repress TEXT POLEN", "Successfully repressed (temporarily)"); bump({ superego: 12, ego: 5, id: 7 }); setScreen("slip"); } else setHold(0);
  };
  const triggerSlip = (word: string) => {
    if (slip !== "idle") return;
    if (word === "annoying") { setSlip("switching"); setTimeout(() => { setSlip("revealed"); addAnswer("Freudian Slip", "Polen is very ____.", "attractive (allegedly selected: annoying)"); bump({ id: 18, ego: -2, superego: -8 }); }, 900); }
    else { addAnswer("Freudian Slip", "Polen is very ____.", word); bump(word === "distracting" ? { id: 12, ego: 3 } : { ego: 6, superego: 3 }); setSlip("revealed"); }
  };
  const chooseProjection = (choice: string) => {
    const card = projectionCards[projectionIndex]; addAnswer("Projection Test", card.text, choice);
    if (choice === card.answer) bump({ ego: 7, superego: 3 }); else bump(card.delta);
    if (projectionIndex < projectionCards.length - 1) setProjectionIndex((v) => v + 1); else setScreen("reality");
  };
  const chooseReality = (choice: string, spicy: boolean) => {
    const card = realityCards[realityIndex]; addAnswer("Reality Principle", card.prompt, choice); bump(spicy ? { id: 14, ego: 2, superego: -5 } : { id: 3, ego: 7, superego: 9 });
    if (realityIndex < realityCards.length - 1) setRealityIndex((v) => v + 1); else setScreen("result");
  };
  const reportText = () => `CONFIDENTIAL PSYCHOANALYTIC CASE FILE\n\n${diagnosis.eyebrow}: ${diagnosis.title}\nID ${scores.id}% · EGO ${scores.ego}% · SUPEREGO ${scores.superego}%\n\n${answers.map((a, i) => `${i + 1}. [${a.section}] ${a.prompt}\n→ ${a.answer}`).join("\n\n")}\n\nFinal recommendation: Stop analysing each other and go on a date.`;
  const shareReport = async () => { const text = reportText(); if (navigator.share) await navigator.share({ title: "Confidential Case File", text }); else await navigator.clipboard.writeText(text); };
  const printReport = () => {
    const win = window.open("", "_blank"); if (!win) return;
    const safe = reportText().replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    win.document.write(`<html><head><title>Confidential Case File</title><style>body{font-family:Georgia,serif;background:#f3efe6;color:#151515;padding:48px;max-width:720px;margin:auto}pre{white-space:pre-wrap;font:16px/1.7 Georgia,serif}h1{font-size:30px;border-bottom:3px double #151515;padding-bottom:16px}@media print{body{padding:0}}</style></head><body><h1>CONFIDENTIAL CASE FILE</h1><pre>${safe}</pre><script>setTimeout(()=>window.print(),350)<\/script></body></html>`); win.document.close();
  };

  return <main className="game-shell"><div className="noise"/><section className="phone-frame">
    <header className="topbar"><span>PSYCHIC APPARATUS™</span><span className="live-dot">UNLICENSED</span></header>
    {screen !== "intro" && screen !== "result" && <div className="meters"><Meter label="DESIRE / ID" value={scores.id} color="#ff4f8b"/><Meter label="DENIAL / EGO" value={scores.ego} color="#e9ff65"/><Meter label="DIGNITY / SUPEREGO" value={scores.superego} color="#74dfff"/></div>}
    <div className="stage">
      {screen === "intro" && <div className="intro screen-in"><p className="kicker">CASE NO. 00–ID</p><h1>The Psychic<br/><em>Apparatus</em></h1><p className="lede">A completely unlicensed analysis of you, Polen, and her phone.</p><div className="roles"><p><b>POLEN</b><span>THE ID</span></p><p><b>YOU</b><span>THE EGO</span></p><p><b>THE PHONE</b><span>THE SUPEREGO</span></p></div><p className="privacy">Your choices remain on this device unless you decide to share the final case file.</p><button className="primary" onClick={() => { setAnswers([]); setScreen("pleasure"); }}>BEGIN EVALUATION</button></div>}
      {screen === "pleasure" && <div className="screen-in"><p className="chapter">01 / THE PLEASURE PRINCIPLE</p><div className="message-card"><span>POLEN · NOW</span><p>{messages[messageIndex].text}</p></div><p className="microcopy">Respond before dignity intervenes.</p><div className="choices">{messages[messageIndex].options.map((o) => <button key={o} onClick={() => choosePleasure(o)}>{o}</button>)}</div></div>}
      {screen === "repression" && <div className="screen-in repression"><p className="chapter">02 / REPRESSION CHAMBER</p><h2>Hold to repress<br/>the impulse.</h2><button className="repress-button" onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold}><span style={{ transform: `scale(${1 + hold / 450})` }}>TEXT POLEN</span><i style={{ height: `${hold}%` }}/></button><p className="temptation">{hold > 75 ? "Repression is making it hotter." : hold > 40 ? "Thought will return later." : "Do not release early."}</p></div>}
      {screen === "slip" && <div className="screen-in"><p className="chapter">03 / FREUDIAN SLIP</p><h2 className="sentence">Polen is very <span>{slip === "revealed" ? "attractive." : "______."}</span></h2>{slip === "switching" && <div className="system-alert">INPUT CORRECTED BY THE UNCONSCIOUS</div>}{slip === "idle" && <div className="choices slip-grid"><button onClick={() => triggerSlip("chaotic")}>chaotic</button><button className="annoying" onClick={() => triggerSlip("annoying")}>annoying</button><button onClick={() => triggerSlip("funny")}>funny</button><button onClick={() => triggerSlip("distracting")}>distracting</button></div>}{slip === "revealed" && <><blockquote>“Autocorrect has been blamed.<br/>Autocorrect denies involvement.”</blockquote><button className="primary" onClick={() => setScreen("projection")}>DENY AND CONTINUE</button></>}</div>}
      {screen === "projection" && <div className="screen-in"><p className="chapter">04 / PROJECTION TEST · {projectionIndex + 1}/5</p><h2 className="thought">“{projectionCards[projectionIndex].text}”</h2><p className="microcopy">Whose thought is this?</p><div className="choices triple">{["Polen", "Me", "The phone"].map((c) => <button key={c} onClick={() => chooseProjection(c)}>{c}</button>)}</div></div>}
      {screen === "reality" && <div className="screen-in"><p className="chapter">05 / REALITY PRINCIPLE · {realityIndex + 1}/4</p><h2>{realityCards[realityIndex].prompt}</h2><div className="versus"><button className="sensible" onClick={() => chooseReality(realityCards[realityIndex].safe, false)}>{realityCards[realityIndex].safe}<small>SUPEREGO’S ADVICE</small></button><span>OR</span><button className="spicy" onClick={() => chooseReality(realityCards[realityIndex].spicy, true)}>{realityCards[realityIndex].spicy}<small>ID’S PROPOSAL</small></button></div></div>}
      {screen === "result" && <div className="result screen-in"><p className="kicker">FINAL DIAGNOSIS</p><h1>{diagnosis.eyebrow}</h1><h2>{diagnosis.title}</h2><p className="lede">{diagnosis.copy}</p><div className="final-score"><b>{scores.id}</b><b>{scores.ego}</b><b>{scores.superego}</b><span>ID</span><span>EGO</span><span>SUPEREGO</span></div><div className="recommendation"><span>FINAL RECOMMENDATION</span>Stop analysing each other and go on a date.</div><button className="primary" onClick={shareReport}>SHARE CASE FILE</button><button className="secondary" onClick={printReport}>SAVE / PRINT AS PDF</button><button className="text-button" onClick={() => { setScores({ id: 18, ego: 42, superego: 56 }); setMessageIndex(0); setProjectionIndex(0); setRealityIndex(0); setSlip("idle"); setHold(0); setScreen("intro"); }}>REQUEST A SECOND OPINION</button></div>}
    </div><footer>THE PHONE IS OBSERVING · {answers.length.toString().padStart(2, "0")} RESPONSES RECORDED</footer>
  </section></main>;
}
