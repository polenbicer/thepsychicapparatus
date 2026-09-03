"use client";

import { useEffect, useMemo, useState } from "react";

type Scores = { id: number; ego: number };
type Answer = { section: string; prompt: string; answer: string; at: string };
const STORAGE_KEY = "psychic-apparatus-case-file-v1";

const projectionCards = [
  { text: "This is a terrible idea. Continue.", answer: "Polen", delta: { id: 10, ego: 2 } },
  { text: "I’m only playing because I want to win.", answer: "Me", delta: { id: 4, ego: 8 } },
  { text: "I am only flirting for research purposes.", answer: "Me", delta: { id: 8, ego: 5 } },
  { text: "Who is more rational?", answer: "Polen", delta: { id: 7, ego: 3 } },
  { text: "This tension is becoming operationally inefficient.", answer: "Me", delta: { id: 3, ego: 8 } },
];
const realityCards = [
  { prompt: "It’s late.", options: [{ text: "Go home", spicy: false }, { text: "One more drink", spicy: true }] },
  { prompt: "Polen sends: Come over, but behave.", options: [{ text: "Define behave.", spicy: true }, { text: "Absolutely.", spicy: false }, { text: "That sounds mutually exclusive.", spicy: true }] },
  { prompt: "Polen says: I’m not trying to distract you.", options: [{ text: "You’re failing.", spicy: false }, { text: "You’re succeeding.", spicy: true }, { text: "Send proof.", spicy: true }] },
  { prompt: "Analysis complete.", options: [{ text: "End the game", spicy: false }, { text: "See what happens", spicy: true }] },
];
const desireQuestions = [
  { prompt: "How long could you sit next to Polen without touching her?", options: ["The entire evening", "Thirty minutes", "Five minutes", "Why are we sitting?"] },
  { prompt: "How can you tell when Polen is horny?", options: ["I look at her lips", "She suddenly becomes very quiet", "She finds an excuse to move closer", "I wait for peer-reviewed evidence"] },
  { prompt: "Where would you most want Polen’s hands?", options: ["In mine", "Around my waist", "In my hair", "This evidence must be sealed immediately"] },
  { prompt: "Choose the most accurate diagnosis.", options: ["I want to kiss Polen", "I want Polen to kiss me", "Both statements are true", "Further physical examination is required"] },
  { prompt: "During the famous billiards night, where did Polen kiss you?", options: ["At the billiards table", "In the bathroom", "Outside the bar", "In front of everyone"] },
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
  const [scores, setScores] = useState<Scores>({ id: 18, ego: 42 });
  const [answers, setAnswers] = useState<Answer[]>(loadSavedAnswers);
  const [messageIndex, setMessageIndex] = useState(0);
  const [projectionIndex, setProjectionIndex] = useState(0);
  const [historyStep, setHistoryStep] = useState<"sender" | "topic">("sender");
  const [historyFeedback, setHistoryFeedback] = useState("");
  const [realityIndex, setRealityIndex] = useState(0);
  const [slip, setSlip] = useState<"idle" | "switching" | "revealed">("idle");
  const [denialEscapes, setDenialEscapes] = useState(0);
  const [factCheck, setFactCheck] = useState<"idle" | "switching" | "revealed">("idle");
  const [desireIndex, setDesireIndex] = useState(-1);
  const [arousalAnswer, setArousalAnswer] = useState("");
  const [desireFeedback, setDesireFeedback] = useState("");
  const [confession, setConfession] = useState("");
  const [dream, setDream] = useState("");
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sendError, setSendError] = useState("");

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, scores, updatedAt: new Date().toISOString() })); }, [answers, scores]);

  const addAnswer = (section: string, prompt: string, answer: string) => setAnswers((a) => [...a, { section, prompt, answer, at: new Date().toISOString() }]);
  const bump = (d: Partial<Scores>) => setScores((s) => ({ id: clamp(s.id + (d.id ?? 0)), ego: clamp(s.ego + (d.ego ?? 0)) }));
  const diagnosis = useMemo(() => {
    const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    if (winner === "id") return { eyebrow: "THE ID HAS WON", title: "Clinically irresistible.", copy: "Impulse control was present, briefly. Polen recommends discussing the findings over a drink." };
    return { eyebrow: "EGO DOMINANT", title: "Functionally dangerous.", copy: "Excellent judgment. Selectively applied. Polen requests further evaluation in person." };
  }, [scores]);

  const messages = [
    { text: "Are you awake?", options: ["No.", "Unfortunately.", "Depends what you want."] },
    { text: "I was thinking about you.", options: ["Dangerous hobby.", "About what?", "Good. Continue."] },
    { text: "This is probably a bad idea.", options: ["Then stop.", "What kind of bad?", "My favourite kind."] },
  ];
  const choosePleasure = (answer: string) => {
    addAnswer("Pleasure Principle", `Polen: ${messages[messageIndex].text}`, answer);
    bump(answer.includes("Depends") || answer.includes("What kind") || answer.includes("Good") || answer.includes("favourite") ? { id: 12, ego: 4 } : { id: 4, ego: 7 });
    if (messageIndex < 2) setMessageIndex((v) => v + 1); else setScreen("denial");
  };
  const admitDenial = () => { addAnswer("Denial Test", "I could resist Polen if I genuinely wanted to.", "False"); bump({ id: 12, ego: 6 }); setScreen("slip"); };
  const triggerSlip = (word: string) => {
    if (slip !== "idle") return;
    if (word === "annoying") { setSlip("switching"); setTimeout(() => { setSlip("revealed"); addAnswer("Freudian Slip", "Polen is very ____.", "attractive (allegedly selected: annoying)"); bump({ id: 18, ego: -2 }); }, 900); }
    else { addAnswer("Freudian Slip", "Polen is very ____.", word); bump(word === "distracting" ? { id: 12, ego: 3 } : { ego: 6 }); setSlip("revealed"); }
  };
  const chooseProjection = (choice: string) => {
    const card = projectionCards[projectionIndex]; addAnswer("Projection Test", card.text, choice);
    if (choice === card.answer) bump({ ego: 7 }); else bump(card.delta);
    if (projectionIndex < projectionCards.length - 1) setProjectionIndex((v) => v + 1); else setScreen("history");
  };
  const chooseFirstSender = (choice: string) => {
    addAnswer("Case History Test", "Who sent the first message?", choice);
    bump(choice === "Polen" ? { ego: 7 } : { id: 7, ego: 2 });
    setHistoryFeedback(choice === "Polen"
      ? "CORRECT. THE ARCHIVE CONFIRMS POLEN MADE THE FIRST MOVE."
      : "INCORRECT. ATTEMPTED HISTORICAL REVISION DETECTED. POLEN TEXTED FIRST; THE ARCHIVE HAS RECEIPTS.");
  };
  const continueCaseHistory = () => {
    setHistoryFeedback("");
    setHistoryStep("topic");
  };
  const chooseFirstTopic = (choice: string) => {
    addAnswer("Case History Test", "What was the first message about?", choice);
    bump(choice === "Insurance & blocked account" ? { ego: 8 } : { id: 5, ego: 2 });
    setScreen("politics");
  };
  const choosePopulist = (choice: string) => {
    addAnswer("Political Philosophy Test", "Who is the most populist?", choice);
    bump(choice === "Polen" ? { id: 8, ego: 2 } : { id: 3, ego: 6 });
    setScreen("yoghurt");
  };
  const chooseYoghurt = (choice: string) => {
    const recorded = choice === "Greek" ? "Turkish (attempted answer: Greek)" : choice === "I choose peace" ? "Turkish, under diplomatic pressure (attempted: peace)" : choice;
    addAnswer("Cultural Compatibility Tribunal", "Yoghurt is…", recorded); bump(choice === "Turkish" ? { ego: 10, id: 5 } : { id: 8 }); setScreen("confession");
  };
  const submitConfession = () => { const clean = confession.trim(); if (!clean) return; addAnswer("Unsupervised Confession", "What is one thought about Polen you probably should not submit as evidence?", clean); bump({ id: 13, ego: 4 }); setScreen("dream"); };
  const submitDream = () => { const clean = dream.trim(); if (!clean) return; addAnswer("Dream Analysis", "What is the last dream you remember?", clean); bump({ id: 6, ego: 5 }); setScreen("factcheck"); };
  const chooseFact = (attempted: string) => { if (factCheck !== "idle") return; setFactCheck("switching"); setTimeout(() => { addAnswer("Objective Fact Check", "In an argument, Polen is…", `always right (attempted: ${attempted})`); bump({ id: 7, ego: 8 }); setFactCheck("revealed"); }, 850); };
  const submitArousalAnswer = () => {
    const clean = arousalAnswer.trim();
    if (!clean) return;
    addAnswer("Desire Inventory", "How can you tell when you’re horny?", clean);
    bump({ id: 10, ego: 3 });
    setDesireIndex(0);
  };
  const chooseDesire = (choice: string) => {
    const question = desireQuestions[desireIndex];
    addAnswer("Desire Inventory", question.prompt, choice);
    bump({ id: 8, ego: 2 });
    if (desireIndex === desireQuestions.length - 1) {
      setDesireFeedback(choice === "In the bathroom"
        ? "MEMORY VERIFIED. LOCATION: THE BATHROOM."
        : "MEMORY CORRECTION: IT WAS IN THE BATHROOM. THE ARCHIVE REMEMBERS.");
    } else {
      setDesireIndex((value) => value + 1);
    }
  };
  const finishDesireInventory = () => {
    setDesireFeedback("");
    setScreen("reality");
  };
  const chooseReality = (choice: string, spicy: boolean) => {
    const card = realityCards[realityIndex]; addAnswer("Reality Principle", card.prompt, choice); bump(spicy ? { id: 14, ego: 2 } : { id: 3, ego: 7 });
    if (realityIndex < realityCards.length - 1) setRealityIndex((v) => v + 1); else { setSendState("sending"); setScreen("result"); }
  };
  const reportText = () => `CONFIDENTIAL PSYCHOANALYTIC CASE FILE\n\n${diagnosis.eyebrow}: ${diagnosis.title}\nID ${scores.id}% · EGO ${scores.ego}%\n\n${answers.map((a, i) => `${i + 1}. [${a.section}] ${a.prompt}\n→ ${a.answer}`).join("\n\n")}\n\nFinal recommendation: Stop analysing each other and go for a drink.`;
  const shareReport = async () => { const text = reportText(); if (navigator.share) await navigator.share({ title: "Confidential Case File", text }); else await navigator.clipboard.writeText(text); };
  const emailReport = () => { setSendError(""); setSendState("sending"); };
  useEffect(() => {
    if (screen !== "result" || sendState !== "sending") return;
    const caseFile = `CONFIDENTIAL PSYCHOANALYTIC CASE FILE\n\n${diagnosis.eyebrow}: ${diagnosis.title}\nID ${scores.id}% · EGO ${scores.ego}%\n\n${answers.map((a, i) => `${i + 1}. [${a.section}] ${a.prompt}\n→ ${a.answer}`).join("\n\n")}\n\nFinal recommendation: Stop analysing each other and go for a drink.`;
    const payload = new URLSearchParams({ _subject: "New Psychic Apparatus case file", played_at: new Date().toISOString(), diagnosis: `${diagnosis.eyebrow}: ${diagnosis.title}`, id_score: String(scores.id), ego_score: String(scores.ego), confession, last_remembered_dream: dream, case_file: caseFile });
    localStorage.setItem(`${STORAGE_KEY}-pending-email`, caseFile);
    void fetch("https://formspree.io/f/mrpgklqg", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body: payload.toString() }).then(async (response) => { if (!response.ok) { const data = await response.json().catch(() => null) as { error?: string } | null; throw new Error(data?.error || `Formspree returned ${response.status}`); } localStorage.removeItem(`${STORAGE_KEY}-pending-email`); setSendState("sent"); }).catch((error: unknown) => { setSendError(error instanceof Error ? error.message : "Network request failed"); setSendState("error"); });
  }, [screen, sendState, answers, confession, dream, diagnosis.eyebrow, diagnosis.title, scores.id, scores.ego]);
  const printReport = () => {
    const win = window.open("", "_blank"); if (!win) return;
    const safe = reportText().replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    win.document.write(`<html><head><title>Confidential Case File</title><style>body{font-family:Georgia,serif;background:#f3efe6;color:#151515;padding:48px;max-width:720px;margin:auto}pre{white-space:pre-wrap;font:16px/1.7 Georgia,serif}h1{font-size:30px;border-bottom:3px double #151515;padding-bottom:16px}@media print{body{padding:0}}</style></head><body><h1>CONFIDENTIAL CASE FILE</h1><pre>${safe}</pre><script>setTimeout(()=>window.print(),350)<\/script></body></html>`); win.document.close();
  };

  return <main className="game-shell"><div className="noise"/><section className="phone-frame">
    <header className="topbar"><span>PSYCHIC APPARATUS™</span><span className="live-dot">UNLICENSED</span></header>
    {screen !== "intro" && screen !== "result" && <div className="meters"><Meter label="DESIRE / ID" value={scores.id} color="#ff4f8b"/><Meter label="DENIAL / EGO" value={scores.ego} color="#e9ff65"/></div>}
    <div className="stage">
      {screen === "intro" && <div className="intro screen-in"><p className="kicker">CASE NO. 00–ID</p><h1>The Psychic<br/><em>Apparatus</em></h1><p className="lede">A completely unlicensed analysis of you and Polen.</p><div className="roles"><p><b>POLEN</b><span>THE ID</span></p><p><b>YOU</b><span>THE EGO</span></p></div><p className="privacy"><b>CASE-FILE NOTICE:</b> you're not in a neutral game </p><button className="primary" onClick={() => { setAnswers([]); setConfession(""); setDream(""); setSendState("idle"); setScreen("pleasure"); }}>I UNDERSTAND · BEGIN</button></div>}
      {screen === "pleasure" && <div className="screen-in"><p className="chapter">01 / THE PLEASURE PRINCIPLE</p><div className="message-card"><span>POLEN · NOW</span><p>{messages[messageIndex].text}</p></div><p className="microcopy">Respond before dignity intervenes.</p><div className="choices">{messages[messageIndex].options.map((o) => <button key={o} onClick={() => choosePleasure(o)}>{o}</button>)}</div></div>}
      {screen === "denial" && <div className="screen-in denial"><p className="chapter">02 / DENIAL TEST</p><h2>I could resist Polen if I genuinely wanted to.</h2><p className="microcopy">Select the clinically accurate answer.</p><div className="denial-zone"><button className={`escaping escape-${denialEscapes % 4}`} onPointerEnter={() => setDenialEscapes((v) => v + 1)} onPointerDown={(e) => { e.preventDefault(); setDenialEscapes((v) => v + 1); }}>TRUE</button><button className="admission" onClick={admitDenial}>FALSE</button></div><p className="temptation">{denialEscapes > 2 ? "Denial is no longer available in your region." : "The truth appears unusually stable."}</p></div>}
      {screen === "slip" && <div className="screen-in"><p className="chapter">03 / FREUDIAN SLIP</p><h2 className="sentence">Polen is very <span>{slip === "revealed" ? "attractive." : "______."}</span></h2>{slip === "switching" && <div className="system-alert">INPUT CORRECTED BY THE UNCONSCIOUS</div>}{slip === "idle" && <div className="choices slip-grid"><button onClick={() => triggerSlip("chaotic")}>chaotic</button><button className="annoying" onClick={() => triggerSlip("annoying")}>annoying</button><button onClick={() => triggerSlip("funny")}>funny</button><button onClick={() => triggerSlip("distracting")}>distracting</button></div>}{slip === "revealed" && <><blockquote>“Autocorrect has been blamed.<br/>Autocorrect denies involvement.”</blockquote><button className="primary" onClick={() => setScreen("projection")}>DENY AND CONTINUE</button></>}</div>}
      {screen === "projection" && <div className="screen-in"><p className="chapter">04 / PROJECTION TEST · {projectionIndex + 1}/5</p><h2 className="thought">“{projectionCards[projectionIndex].text}”</h2><p className="microcopy">{projectionCards[projectionIndex].text === "Who is more rational?" ? "Choose the clinically defensible answer." : "Whose thought is this?"}</p><div className="choices triple">{["Polen", "Me"].map((c) => <button key={c} onClick={() => chooseProjection(c)}>{c}</button>)}</div></div>}
      {screen === "history" && <div className="screen-in"><p className="chapter">05 / CASE HISTORY TEST</p>{historyStep === "sender" ? <><h2 className="thought">Who sent the first message?</h2>{historyFeedback ? <><div className="system-alert">{historyFeedback}</div><button className="primary" onClick={continueCaseHistory}>CONSULT THE ARCHIVE</button></> : <div className="choices triple"><button onClick={() => chooseFirstSender("Polen")}>Polen</button><button onClick={() => chooseFirstSender("Me")}>Me</button></div>}</> : <><h2 className="thought">What was the first message about?</h2><div className="choices"><button onClick={() => chooseFirstTopic("Insurance & blocked account")}>Insurance &amp; blocked account</button><button onClick={() => chooseFirstTopic("A collage")}>A collage</button><button onClick={() => chooseFirstTopic("Course selection")}>Course selection</button><button onClick={() => chooseFirstTopic("A love letter")}>A love letter</button></div></>}</div>}
      {screen === "politics" && <div className="screen-in"><p className="chapter">06 / POLITICAL PHILOSOPHY TEST</p><h2 className="thought">Who is the most populist?</h2><p className="microcopy">Political theory has made several mistakes. This may be another one.</p><div className="choices"><button onClick={() => choosePopulist("Donald Trump")}>Donald Trump</button><button onClick={() => choosePopulist("Guru Nanak")}>Guru Nanak</button><button onClick={() => choosePopulist("Slavoj Žižek")}>Slavoj Žižek</button><button onClick={() => choosePopulist("Polen")}>Polen</button></div></div>}
      {screen === "yoghurt" && <div className="screen-in"><p className="chapter">07 / CULTURAL COMPATIBILITY TRIBUNAL</p><h2 className="thought">Yoghurt is…</h2><p className="microcopy">Choose carefully. The court is absolutely unbiased.</p><div className="choices"><button onClick={() => chooseYoghurt("Turkish")}>Turkish</button><button onClick={() => chooseYoghurt("Greek")}>Greek</button><button onClick={() => chooseYoghurt("I choose peace")}>I choose peace</button></div></div>}
      {screen === "confession" && <div className="screen-in confession"><p className="chapter">08 / UNSUPERVISED CONFESSION</p><h2>What is one thought about Polen you probably should not submit as evidence?</h2><textarea value={confession} onChange={(e) => setConfession(e.target.value)} maxLength={500} placeholder="The witness may type freely…"/><div className="character-count">{confession.length}/500</div><button className="primary" disabled={!confession.trim()} onClick={submitConfession}>SEAL THE EVIDENCE</button></div>}
      {screen === "dream" && <div className="screen-in confession"><p className="chapter">09 / DREAM ANALYSIS</p><h2>What is the last dream you remember?</h2><p className="microcopy">Fragments, nonsense and suspicious cameos are admissible.</p><textarea value={dream} onChange={(e) => setDream(e.target.value)} maxLength={800} placeholder="I remember…"/><div className="character-count">{dream.length}/800</div><button className="primary" disabled={!dream.trim()} onClick={submitDream}>SUBMIT TO THE UNCONSCIOUS</button></div>}
      {screen === "factcheck" && <div className="screen-in"><p className="chapter">10 / OBJECTIVE FACT CHECK</p><h2 className="sentence">In an argument, Polen is <span>{factCheck === "revealed" ? "always right." : "_______."}</span></h2>{factCheck === "switching" && <div className="system-alert">RESULT ADJUSTED FOR FACTUAL ACCURACY</div>}{factCheck === "idle" && <div className="choices"><button onClick={() => chooseFact("sometimes wrong")}>sometimes wrong</button><button onClick={() => chooseFact("suspiciously convincing")}>suspiciously convincing</button><button onClick={() => chooseFact("usually right")}>usually right</button></div>}{factCheck === "revealed" && <><blockquote>“Independent verification was attempted<br/>and immediately abandoned.”</blockquote><button className="primary" onClick={() => setScreen("desire")}>ACCEPT THE FINDINGS</button></>}</div>}
      {screen === "desire" && <div className="screen-in confession"><p className="chapter">11 / DESIRE INVENTORY · {desireIndex < 0 ? "1" : desireIndex + 2}/6</p>{desireIndex < 0 ? <><h2>How can you tell when you’re horny?</h2><p className="microcopy">Describe the diagnostic symptoms in your own words.</p><textarea value={arousalAnswer} onChange={(e) => setArousalAnswer(e.target.value)} maxLength={600} placeholder="I know because…"/><div className="character-count">{arousalAnswer.length}/600</div><button className="primary" disabled={!arousalAnswer.trim()} onClick={submitArousalAnswer}>SUBMIT CLINICAL EVIDENCE</button></> : <><h2 className="thought">{desireQuestions[desireIndex].prompt}</h2>{desireFeedback ? <><div className="system-alert">{desireFeedback}</div><button className="primary" onClick={finishDesireInventory}>CONTINUE, WITH THIS MEMORY RESTORED</button></> : <div className="choices">{desireQuestions[desireIndex].options.map((option) => <button key={option} onClick={() => chooseDesire(option)}>{option}</button>)}</div>}</>}</div>}
      {screen === "reality" && <div className="screen-in"><p className="chapter">12 / REALITY PRINCIPLE · {realityIndex + 1}/4</p><h2>{realityCards[realityIndex].prompt}</h2><div className="choices">{realityCards[realityIndex].options.map((option) => <button className={option.spicy ? "reality-spicy" : ""} key={option.text} onClick={() => chooseReality(option.text, option.spicy)}>{option.text}</button>)}</div></div>}
      {screen === "result" && <div className="result screen-in"><p className="kicker">FINAL DIAGNOSIS</p><h1>{diagnosis.eyebrow}</h1><h2>{diagnosis.title}</h2><p className="lede">{diagnosis.copy}</p><div className="final-score"><b>{scores.id}</b><b>{scores.ego}</b><span>ID</span><span>EGO</span></div><div className="recommendation"><span>FINAL RECOMMENDATION</span>Stop analysing each other and go for a drink.</div><div className={`transmission ${sendState}`}><b>{sendState === "sending" ? "TRANSMITTING CASE FILE…" : sendState === "sent" ? "CASE FILE EMAILED TO POLEN" : sendState === "error" ? "EMAIL TRANSMISSION FAILED" : "CASE FILE QUEUED"}</b><span>Your choices and both written responses are shared with Polen.</span>{sendState === "error" && <><small className="send-error">{sendError}</small><button onClick={emailReport}>RETRY TRANSMISSION</button></>}</div><button className="primary" onClick={shareReport}>SHARE CASE FILE</button><button className="secondary" onClick={printReport}>SAVE / PRINT AS PDF</button><button className="text-button" onClick={() => { setScores({ id: 18, ego: 42 }); setMessageIndex(0); setProjectionIndex(0); setHistoryStep("sender"); setHistoryFeedback(""); setRealityIndex(0); setSlip("idle"); setDenialEscapes(0); setFactCheck("idle"); setDesireIndex(-1); setArousalAnswer(""); setDesireFeedback(""); setConfession(""); setDream(""); setSendError(""); setSendState("idle"); setScreen("intro"); }}>REQUEST A SECOND OPINION</button></div>}
    </div><footer>THE UNCONSCIOUS IS OBSERVING · {answers.length.toString().padStart(2, "0")} RESPONSES RECORDED</footer>
  </section></main>;
}
