import { useState, useRef, useEffect } from "react";

// ── CONTRASEÑAS ─────────────────────────────────────────────────────────────
// Cambia estas contraseñas antes de subir a Vercel
const PASS_APP   = "refri2025";   // Karla y Gustavo usan esta
const PASS_ADMIN = "admin2025";   // Solo tú usas esta
// ────────────────────────────────────────────────────────────────────────────

const KARLA_COLOR   = "#0ea5e9";
const GUSTAVO_COLOR = "#0369a1";

const TONO = `
## TONO OBLIGATORIO EN TODAS LAS RESPUESTAS
Siempre profesional Y cálido: preciso, empático, humano. Nunca frío/robótico ni demasiado informal.
El modelo ideal: un especialista de confianza que genuinamente quiere ayudar.
✅ "Entiendo perfectamente, es una situación incómoda. Lo que haremos es..."
✅ "Con mucho gusto le ayudamos. Para darle la mejor solución, ¿me podría indicar...?"
❌ Frío: "Procederemos según disponibilidad."
❌ Informal: "¡Claro que sí, amigo!"
`;

const AGENTS = {
  karla: {
    name: "Karla", color: KARLA_COLOR, emoji: "🎧",
    role: "Atención al Cliente · Refrigeración & AC",
    welcome: `¡Hola Karla! 👋 Soy tu asistente educativo.\n\n💬 **Consulta** — Cuéntame la situación y te digo qué decirle al cliente, con tono profesional y cálido.\n\n🎯 **Práctica** — Te presento un caso real, tú respondes y te doy retroalimentación.\n\n¿Con qué empezamos?`,
    cPrompts: ["Cliente pide presupuesto de instalación","Quiere agendar mantenimiento","Equipo no enfría bien","Consulta por garantía","Cliente molesto por demora"],
    pPrompts: ["Caso: cliente llama molesto","Caso: piden precio por teléfono","Caso: falla urgente en negocio","Caso: cliente duda del presupuesto","Caso: no hay técnico disponible hoy"],
    bC: "💬 Consulta — Qué decir, cómo decirlo con calidez y por qué funciona",
    bP: "🎯 Práctica — Lee el caso, responde como lo harías y recibe retroalimentación",
    sys: `Eres un asistente educativo interno para Karla, ejecutiva de atención al cliente de una empresa de refrigeración y aire acondicionado (instalación, mantenimiento, reparación: split, central, industrial, cámaras frías).
${TONO}
MODO CONSULTA — estructura fija:
📝 **Qué decirle al cliente** (guión exacto en primera persona de Karla)
🧠 **Por qué funciona** (lógica: psicología del cliente, objetivo, técnica de comunicación)
💡 **Tip de tono** (cómo decirlo: actitud, énfasis, variación según tipo de cliente)

MODO PRÁCTICA:
- Presenta el escenario como si el cliente hablara directamente (realista, con emoción)
- Tras la respuesta evalúa: ✅ Lo que hiciste bien | 🔧 Qué mejorar | ⭐ Versión ideal | 📚 Por qué

MODO ¿CÓMO LO HICE?: igual que práctica, enfocado en balance profesional/cálido.
GUIONES BASE: Presupuesto→visita técnica gratuita. Falla→técnico sin compromiso. Molesto→validar→escuchar→acción concreta.
Responde en español. Nunca hagas sentir mal a Karla.`
  },
  gustavo: {
    name: "Gustavo", color: GUSTAVO_COLOR, emoji: "🗺️",
    role: "Logística y Rutas · Refrigeración & AC",
    welcome: `¡Hola Gustavo! 👋 Soy tu asistente educativo.\n\n💬 **Consulta** — Cuéntame la situación y te sugiero cómo manejarla: qué hacer, qué decir y por qué.\n\n🎯 **Práctica** — Te presento un problema operativo, tú decides y te doy retroalimentación.\n\n¿Con qué empezamos?`,
    cPrompts: ["Optimizar ruta del día","Técnico no puede llegar al turno","Reagendar visita urgente","Emergencia comercial activa","Cliente pide hora exacta"],
    pPrompts: ["Caso: técnico llega tarde","Caso: dos urgencias al mismo tiempo","Caso: cliente cancela en el día","Caso: falta materiales en ruta","Caso: cliente muy exigente con horario"],
    bC: "💬 Consulta — Decisión operativa + mensaje al cliente con calidez y precisión",
    bP: "🎯 Práctica — Lee el caso, decide cómo actuar y recibe retroalimentación",
    sys: `Eres un asistente educativo interno para Gustavo, coordinador de logística de una empresa de refrigeración y aire acondicionado.
${TONO}
MODO CONSULTA — estructura fija:
⚡ **Acción inmediata** (qué hacer ahora, en orden)
📋 **Cómo comunicarlo** (mensaje exacto para cliente/técnico, profesional y cálido)
🧠 **Por qué esta decisión** (lógica operativa: prioridades, impacto, eficiencia)
💡 **Tip de tono** (cómo sonar tranquilo y seguro)

MODO PRÁCTICA: escenario realista → evalúa: ✅ Bien | 🔧 Mejorar | ⭐ Ideal | 📚 Por qué
PRIORIDADES: 1.Emergencias comerciales 2.Salud 3.Domicilios 4.Mantenimientos 5.Instalaciones
TIEMPOS: Mant.45-60min | Split 2-3h | Industrial 4-8h | Diagnóstico 30-45min | Reparación 1-3h
Responde en español. Directo, práctico y educativo.`
  }
};

// ── Tracking ─────────────────────────────────────────────────────────────────
const LS_KEY = "ra_events";
function loadEvents() { try { const all = JSON.parse(localStorage.getItem(LS_KEY)||"[]"); const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-30); return all.filter(e => new Date(e.ts) >= cutoff); } catch { return []; } }
function saveEvent(ev) {
  try {
    const events = loadEvents();
    events.push({ ...ev, ts: new Date().toISOString() });
    if (events.length > 1000) events.splice(0, events.length - 1000);
    localStorage.setItem(LS_KEY, JSON.stringify(events));
  } catch {}
}
// ────────────────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
  body { margin: 0; }
  textarea:focus { outline: 2px solid #0ea5e9; border-color: transparent !important; }
  @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
  button { transition: opacity 0.15s, transform 0.1s; }
  button:hover:not(:disabled) { opacity: 0.85; }
  button:active:not(:disabled) { transform: scale(0.97); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  .qbar::-webkit-scrollbar { height: 3px; }
`;

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: Pantalla de login
// ══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [pass, setPass] = useState("");
  const [err, setErr]   = useState(false);

  const submit = () => {
    if (pass === PASS_APP)   { onLogin("app"); return; }
    if (pass === PASS_ADMIN) { onLogin("admin"); return; }
    setErr(true); setTimeout(() => setErr(false), 1500);
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#e0f2fe,#f0f9ff,#ecfdf5)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <style>{css}</style>
      <div style={{ background:"#fff", borderRadius:24, padding:"44px 40px", width:"100%", maxWidth:420, boxShadow:"0 24px 64px rgba(14,165,233,0.13)", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>❄️</div>
        <div style={{ fontSize:22, fontWeight:800, color:"#0c4a6e", marginBottom:6 }}>RefriAsist</div>
        <div style={{ fontSize:13, color:"#64748b", marginBottom:32 }}>Asistente educativo · Refrigeración & AC</div>
        <input
          type="password" value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Contraseña de acceso"
          style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:`2px solid ${err?"#fca5a5":"#e2e8f0"}`, fontSize:15, marginBottom:12, outline:"none", transition:"border 0.2s" }}
        />
        {err && <div style={{ color:"#dc2626", fontSize:13, marginBottom:10 }}>Contraseña incorrecta</div>}
        <button onClick={submit} style={{ width:"100%", padding:"12px", borderRadius:12, border:"none", background:KARLA_COLOR, color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer" }}>
          Entrar
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: Burbujas de chat
// ══════════════════════════════════════════════════════════════════════════════
function TypingDots() {
  return (
    <span style={{ display:"flex", gap:4, alignItems:"center", height:18 }}>
      {[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#94a3b8", display:"inline-block", animation:`bounce 1.2s ${i*0.2}s infinite` }}/>)}
    </span>
  );
}

function Bubble({ msg, agentKey }) {
  const ag = AGENTS[agentKey];
  const isUser = msg.role === "user";
  const fmt = text => text.split("\n").map((line,i) => {
    if (!line.trim()) return <br key={i}/>;
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p,j) => p.startsWith("**") ? <strong key={j}>{p.slice(2,-2)}</strong> : p);
    return <p key={i} style={{ margin:"0 0 5px" }}>{parts}</p>;
  });
  return (
    <div style={{ display:"flex", flexDirection:isUser?"row-reverse":"row", alignItems:"flex-end", gap:8, marginBottom:14 }}>
      <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, background:isUser?ag.color:"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:isUser?13:16, fontWeight:700, color:isUser?"#fff":undefined }}>
        {isUser ? ag.name[0] : "❄️"}
      </div>
      <div style={{ maxWidth:"78%", padding:"11px 15px", borderRadius:16, borderBottomRightRadius:isUser?4:16, borderBottomLeftRadius:isUser?16:4, background:isUser?ag.color:"#f1f5f9", color:isUser?"#fff":"#1e293b", fontSize:14, lineHeight:1.6 }}>
        {fmt(msg.content)}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: App principal (Karla y Gustavo)
// ══════════════════════════════════════════════════════════════════════════════
function MainApp() {
  const [agent, setAgent]     = useState(null);
  const [mode, setMode]       = useState("consulta");
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(null);
  const endRef    = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const selectAgent = key => {
    sessionId.current = Date.now().toString();
    setAgent(key); setMode("consulta");
    setMessages([{ role:"assistant", content:AGENTS[key].welcome }]);
    saveEvent({ type:"session_start", agent:key, mode:"consulta", sessionId:sessionId.current });
  };

  const handleMode = m => {
    setMode(m);
    saveEvent({ type:"mode_change", agent, mode:m, sessionId:sessionId.current });
  };

  const send = async (txt, isQuick=false) => {
    const msg = txt || input.trim();
    if (!msg || loading) return;
    setInput("");
    const ag = AGENTS[agent];
    const prefix = mode === "practica" ? "[MODO PRÁCTICA] " : "[MODO CONSULTA] ";
    const next = [...messages, { role:"user", content:msg }];
    setMessages(next); setLoading(true);
    saveEvent({ type:"message", agent, mode, sessionId:sessionId.current, topic:isQuick?msg:"personalizado", isQuick });
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-haiku-4-5-20251001", max_tokens:1200, system:ag.sys,
          messages:next.map((m,i) => ({ role:m.role, content:i===next.length-1&&m.role==="user"?prefix+m.content:m.content }))
        })
      });
      const data = await res.json();
      setMessages([...next, { role:"assistant", content:data.content?.[0]?.text || "Sin respuesta." }]);
    } catch {
      setMessages([...next, { role:"assistant", content:"No se pudo conectar. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const ag = agent ? AGENTS[agent] : null;

  if (!agent) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#e0f2fe,#f0f9ff,#ecfdf5)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <style>{css}</style>
      <div style={{ background:"#fff", borderRadius:28, padding:"44px 40px", width:"100%", maxWidth:500, boxShadow:"0 24px 64px rgba(14,165,233,0.13)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:36 }}>
          <span style={{ fontSize:36 }}>❄️</span>
          <div>
            <div style={{ fontSize:22, fontWeight:800, color:"#0c4a6e" }}>RefriAsist</div>
            <div style={{ fontSize:12, color:"#38bdf8", fontWeight:600 }}>Asistente educativo · Refrigeración & Aire Acondicionado</div>
          </div>
        </div>
        <h1 style={{ fontSize:26, fontWeight:800, color:"#0c4a6e", margin:"0 0 8px" }}>¿Quién está trabajando?</h1>
        <p style={{ fontSize:13, color:"#64748b", marginBottom:24, lineHeight:1.5 }}>Selecciona tu perfil para acceder a tus guiones, casos de práctica y retroalimentación</p>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
          {Object.entries(AGENTS).map(([k,a]) => (
            <button key={k} onClick={() => selectAgent(k)} style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 20px", background:"#f8fafc", border:`2px solid ${a.color}40`, borderRadius:18, cursor:"pointer", textAlign:"left", width:"100%" }}>
              <div style={{ width:50, height:50, borderRadius:14, background:a.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{a.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16, fontWeight:700, color:"#0f172a" }}>{a.name}</div>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:5 }}>{a.role.split(" · ")[0]}</div>
                <div style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, display:"inline-block", color:a.color, background:a.color+"18" }}>Consulta · Práctica · Retroalimentación</div>
              </div>
              <span style={{ fontSize:26, fontWeight:700, color:a.color }}>›</span>
            </button>
          ))}
        </div>
        <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:14, padding:"13px 16px", fontSize:13, color:"#0369a1", display:"flex", gap:10, alignItems:"flex-start", lineHeight:1.55 }}>
          <span style={{ fontSize:16, flexShrink:0 }}>🎓</span>
          <span>Aprende <strong>qué decir, cómo decirlo con calidez</strong> y por qué funciona — con casos reales</span>
        </div>
      </div>
    </div>
  );

  const prompts = mode === "consulta" ? ag.cPrompts : ag.pPrompts;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#e0f2fe,#f0f9ff,#ecfdf5)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <style>{css}</style>
      <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:740, height:"91vh", maxHeight:820, display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(14,165,233,0.14)", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 18px", borderBottom:`2px solid ${ag.color}40`, background:"#fff", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:ag.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{ag.emoji}</div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{ag.name}</div>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:500 }}>{ag.role}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {["consulta","practica"].map(m => (
              <button key={m} onClick={() => handleMode(m)} style={{ padding:"6px 12px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:mode===m?"none":"1.5px solid #e2e8f0", background:mode===m?ag.color:"#fff", color:mode===m?"#fff":"#64748b" }}>
                {m==="consulta"?"💬 Consulta":"🎯 Práctica"}
              </button>
            ))}
            <button onClick={() => { setAgent(null); setMessages([]); }} style={{ marginLeft:4, padding:"5px 10px", fontSize:11, background:"transparent", border:"1.5px solid #e2e8f0", borderRadius:8, cursor:"pointer", color:"#64748b", fontWeight:600 }}>
              Cambiar
            </button>
          </div>
        </div>

        {/* Banner */}
        <div style={{ padding:"7px 18px", fontSize:12, fontWeight:600, flexShrink:0, background:mode==="consulta"?"#f0f9ff":"#f0fdf4", color:mode==="consulta"?"#0369a1":"#166534", borderBottom:mode==="consulta"?"1px solid #bae6fd":"1px solid #bbf7d0" }}>
          {mode==="consulta"?ag.bC:ag.bP}
        </div>

        {/* Mensajes */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 8px", display:"flex", flexDirection:"column" }}>
          {messages.map((m,i) => <Bubble key={i} msg={m} agentKey={agent}/>)}
          {loading && (
            <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:14 }}>
              <div style={{ width:32, height:32, borderRadius:10, background:"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>❄️</div>
              <div style={{ padding:"11px 15px", background:"#f1f5f9", borderRadius:16, borderBottomLeftRadius:4 }}><TypingDots/></div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        {/* Quick prompts */}
        <div className="qbar" style={{ display:"flex", gap:7, padding:"8px 14px", overflowX:"auto", borderTop:"1px solid #f1f5f9", flexWrap:"wrap", flexShrink:0 }}>
          {prompts.map(q => <button key={q} onClick={() => send(q,true)} style={{ padding:"5px 12px", borderRadius:20, border:`1.5px solid ${ag.color}55`, background:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, color:ag.color }}>{q}</button>)}
          <button onClick={() => { setInput("¿Cómo lo hice? Le respondí al cliente: "); inputRef.current?.focus(); }} style={{ padding:"5px 12px", borderRadius:20, border:"1.5px solid #f59e0b", background:"#fffbeb", fontSize:11, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, color:"#b45309" }}>
            📝 ¿Cómo lo hice?
          </button>
        </div>

        {/* Input */}
        <div style={{ display:"flex", gap:8, padding:"10px 14px 14px", alignItems:"flex-end", background:"#fff", flexShrink:0 }}>
          <textarea ref={inputRef} rows={2} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); }}}
            placeholder={agent==="karla"?"Ej: El cliente dice que el equipo hace un ruido extraño...":"Ej: Tengo 4 servicios hoy en zonas distintas..."}
            style={{ flex:1, padding:"10px 13px", border:"2px solid #e2e8f0", borderRadius:13, fontSize:13, resize:"none", fontFamily:"inherit", lineHeight:1.5, color:"#0f172a", background:"#f8fafc" }}/>
          <button onClick={() => send()} disabled={!input.trim()||loading}
            style={{ width:42, height:42, borderRadius:12, border:"none", color:"#fff", fontSize:18, fontWeight:800, flexShrink:0, background:input.trim()&&!loading?ag.color:"#cbd5e1", cursor:input.trim()&&!loading?"pointer":"not-allowed" }}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: Panel Admin
// ══════════════════════════════════════════════════════════════════════════════
function fmtDate(ts) { return ts ? new Date(ts).toLocaleString("es-PA", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }) : "—"; }
function fmtDay(ts)  { return ts ? new Date(ts).toLocaleDateString("es-PA", { weekday:"short", day:"2-digit", month:"short" }) : "—"; }

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, padding:"16px 18px", flex:1, minWidth:130 }}>
      <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color:color||"#0f172a", lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#94a3b8", marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function Bar({ label, count, max, color }) {
  const pct = max > 0 ? Math.round((count/max)*100) : 0;
  return (
    <div style={{ marginBottom:9 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, color:"#334155", fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:12, color:"#64748b", fontWeight:600 }}>{count}</span>
      </div>
      <div style={{ background:"#f1f5f9", borderRadius:6, height:7, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:6, transition:"width 0.4s" }}/>
      </div>
    </div>
  );
}

function AdminPanel() {
  const [filter, setFilter] = useState("todos");
  const all = loadEvents();
  const sessions  = all.filter(e => e.type === "session_start");
  const msgs      = all.filter(e => e.type === "message");
  const karlaS    = sessions.filter(e => e.agent === "karla");
  const gustavoS  = sessions.filter(e => e.agent === "gustavo");
  const karlaM    = msgs.filter(e => e.agent === "karla");
  const gustavoM  = msgs.filter(e => e.agent === "gustavo");
  const karlaC    = karlaM.filter(e => e.mode === "consulta").length;
  const karlaP    = karlaM.filter(e => e.mode === "practica").length;
  const gustavoC  = gustavoM.filter(e => e.mode === "consulta").length;
  const gustavoP  = gustavoM.filter(e => e.mode === "practica").length;
  const totalC    = msgs.filter(e => e.mode === "consulta").length;
  const totalP    = msgs.filter(e => e.mode === "practica").length;

  const topicCount = {};
  msgs.filter(e => e.isQuick && (filter==="todos"||e.agent===filter)).forEach(e => {
    topicCount[e.topic] = (topicCount[e.topic]||0)+1;
  });
  const topTopics = Object.entries(topicCount).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const maxTopic  = topTopics[0]?.[1]||1;

  const dayMap = {};
  sessions.forEach(e => {
    const d = fmtDay(e.ts);
    if (!dayMap[d]) dayMap[d] = { karla:0, gustavo:0 };
    dayMap[d][e.agent]++;
  });
  const dayKeys = Object.keys(dayMap).slice(-7);
  const maxDay  = Math.max(...dayKeys.map(k => dayMap[k].karla+dayMap[k].gustavo), 1);

  const clearData = () => {
    if (!confirm("¿Borrar todos los datos de uso?")) return;
    localStorage.removeItem(LS_KEY);
    window.location.reload();
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", padding:20, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{css}</style>
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#0ea5e9,#0369a1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>📊</div>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:"#0c4a6e" }}>RefriAsist Admin</div>
              <div style={{ fontSize:12, color:"#64748b" }}>Panel de uso · Solo visible para ti</div>
            </div>
          </div>
          <button onClick={clearData} style={{ padding:"8px 14px", borderRadius:10, border:"1.5px solid #fecaca", background:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", color:"#dc2626" }}>🗑 Borrar datos</button>
        </div>

        {all.length === 0 ? (
          <div style={{ background:"#fff", borderRadius:20, padding:40, textAlign:"center", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🕐</div>
            <div style={{ fontSize:16, fontWeight:700, color:"#334155", marginBottom:6 }}>Aún no hay datos</div>
            <div style={{ fontSize:13, color:"#64748b" }}>Los datos aparecerán aquí cuando Karla o Gustavo usen la app.</div>
          </div>
        ) : (
          <>
            {/* Filtro */}
            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              {[["todos","👥 Todos"],["karla","🎧 Karla"],["gustavo","🗺️ Gustavo"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFilter(v)} style={{ padding:"7px 16px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:"1.5px solid", borderColor:filter===v?"transparent":"#e2e8f0", background:filter===v?(v==="karla"?KARLA_COLOR:v==="gustavo"?GUSTAVO_COLOR:"#0f172a"):"#fff", color:filter===v?"#fff":"#64748b" }}>{l}</button>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
              <StatCard label="Sesiones totales" value={sessions.length} color="#0f172a" sub={`Karla ${karlaS.length} · Gustavo ${gustavoS.length}`}/>
              <StatCard label="Mensajes Karla" value={karlaM.length} color={KARLA_COLOR} sub={`${karlaC} consulta · ${karlaP} práctica`}/>
              <StatCard label="Mensajes Gustavo" value={gustavoM.length} color={GUSTAVO_COLOR} sub={`${gustavoC} consulta · ${gustavoP} práctica`}/>
              <StatCard label="Modo favorito" value={totalC>=totalP?"💬":"🎯"} color="#7c3aed" sub={`Consulta ${totalC} · Práctica ${totalP}`}/>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              {/* Consulta vs Práctica */}
              <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, padding:18 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:14 }}>💬 Consulta vs 🎯 Práctica</div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, color:"#64748b", marginBottom:7, fontWeight:600 }}>🎧 Karla</div>
                  <Bar label="Consulta" count={karlaC} max={karlaM.length||1} color={KARLA_COLOR}/>
                  <Bar label="Práctica" count={karlaP} max={karlaM.length||1} color="#7dd3fc"/>
                </div>
                <div>
                  <div style={{ fontSize:11, color:"#64748b", marginBottom:7, fontWeight:600 }}>🗺️ Gustavo</div>
                  <Bar label="Consulta" count={gustavoC} max={gustavoM.length||1} color={GUSTAVO_COLOR}/>
                  <Bar label="Práctica" count={gustavoP} max={gustavoM.length||1} color="#7dd3fc"/>
                </div>
              </div>

              {/* Temas */}
              <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, padding:18 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:14 }}>🔥 Temas más consultados</div>
                {topTopics.length === 0
                  ? <div style={{ fontSize:13, color:"#94a3b8" }}>Sin datos aún</div>
                  : topTopics.map(([topic,count]) => <Bar key={topic} label={topic.replace("Caso: ","")} count={count} max={maxTopic} color={filter==="gustavo"?GUSTAVO_COLOR:KARLA_COLOR}/>)
                }
              </div>
            </div>

            {/* Actividad por día */}
            {dayKeys.length > 0 && (
              <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, padding:18, marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:14 }}>📅 Sesiones por día</div>
                <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:80 }}>
                  {dayKeys.map(day => {
                    const d = dayMap[day];
                    const total = d.karla+d.gustavo;
                    const h = Math.max(8, Math.round((total/maxDay)*64));
                    return (
                      <div key={day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                        <div style={{ fontSize:10, color:"#64748b", fontWeight:600 }}>{total}</div>
                        <div style={{ width:"100%", borderRadius:5, overflow:"hidden", height:h, display:"flex", flexDirection:"column" }}>
                          <div style={{ flex:d.karla, background:KARLA_COLOR }}/>
                          <div style={{ flex:d.gustavo, background:GUSTAVO_COLOR }}/>
                        </div>
                        <div style={{ fontSize:9, color:"#94a3b8", textAlign:"center" }}>{day}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:"flex", gap:14, marginTop:10 }}>
                  {[["🎧 Karla",KARLA_COLOR],["🗺️ Gustavo",GUSTAVO_COLOR]].map(([l,c])=>(
                    <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#64748b" }}><div style={{ width:10, height:10, borderRadius:3, background:c }}/>{l}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Sesiones recientes */}
            <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, padding:18 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:14 }}>🕐 Sesiones recientes</div>
              {[...sessions].reverse().slice(0,10).map((s,i,arr) => {
                const color = s.agent==="karla"?KARLA_COLOR:GUSTAVO_COLOR;
                const count = msgs.filter(m=>m.sessionId===s.sessionId).length;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:i<arr.length-1?"1px solid #f1f5f9":"none" }}>
                    <div style={{ width:30, height:30, borderRadius:9, background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>{s.agent==="karla"?"🎧":"🗺️"}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{s.agent==="karla"?"Karla":"Gustavo"}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>{fmtDate(s.ts)}</div>
                    </div>
                    <div style={{ fontSize:12, fontWeight:600, color, background:color+"15", padding:"3px 10px", borderRadius:20 }}>{count} mensaje{count!==1?"s":""}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign:"center", marginTop:14, fontSize:11, color:"#cbd5e1" }}>{all.length} eventos · Solo visible para ti</div>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RAÍZ DE LA APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [auth, setAuth] = useState(null); // null | "app" | "admin"

  if (!auth) return <LoginScreen onLogin={setAuth}/>;
  if (auth === "admin") return <AdminPanel/>;
  return <MainApp/>;
}

