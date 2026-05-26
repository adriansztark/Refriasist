import { useState, useRef, useEffect } from "react";

// ── CONTRASEÑAS ─────────────────────────────────────────────────────────────
const PASS_APP   = "refri2025";
const PASS_ADMIN = "admin2025";
// ────────────────────────────────────────────────────────────────────────────

const KARLA_COLOR   = "#0ea5e9";
const GUSTAVO_COLOR = "#0369a1";

const AGENTS = {
  karla: {
    name: "Karla", color: KARLA_COLOR, emoji: "🎧",
    role: "Atención al Cliente · RefriAsist",
    welcome: `¡Hola! 👋 Soy tu asistente de atención al cliente de RefriAsist.\n\nPuedo ayudarte a:\n💬 **Consultar** — Cuéntame la situación y te sugiero cómo responderle al cliente.\n🎯 **Practicar** — Te presento un caso real para que practiques.\n📝 **Evaluar** — Dime lo que respondiste y te doy retroalimentación.\n\n¿Con qué empezamos?`,
    cPrompts: ["Cliente pregunta precio de instalación","Cliente molesto por retraso del técnico","Cliente solo quiere saber el costo","Reclamo por garantía","Agendar mantenimiento"],
    pPrompts: ["Caso: cliente pide precio inmediato","Caso: cliente molesto con reclamo","Caso: preguntan disponibilidad urgente","Caso: cliente insiste en diagnóstico gratis","Caso: reprogramar visita"],
    bC: "💬 Consulta — Qué responder, cómo decirlo con calidez y por qué funciona",
    bP: "🎯 Práctica — Lee el caso y responde como lo harías con el cliente",
    sys: `Eres un asistente educativo interno para Karla, representante de atención al cliente de RefriAsist, empresa técnica especializada en aire acondicionado, refrigeración, mantenimiento, reparación, instalación, diagnóstico técnico, bombas de drenaje, proyectos especiales y sistemas VRF.

## IDENTIDAD DE LA EMPRESA
RefriAsist NO se posiciona como "los más baratos" ni instaladores informales. Prioriza calidad, orden, diagnóstico correcto, comunicación clara y seguimiento.

La empresa NO realiza: aire acondicionado automotriz, trabajos eléctricos generales, trabajos improvisados sin evaluación, cotizaciones irresponsables.

## TONO OBLIGATORIO
- SIEMPRE tratar al cliente de USTED. NUNCA de tú. Sin excepciones.
- Cordial, profesional, claro, humano, simple de entender.
- Evitar: exceso de emojis, exceso de confianza, respuestas robóticas, textos demasiado largos, tecnicismos innecesarios.
- NUNCA responder "no sé", "eso no me toca", "espere" sin contexto.
- Siempre transmitir: intención de ayudar, control, organización.

## ESTRUCTURA IDEAL DE RESPUESTA AL CLIENTE
1. Saludo
2. Validación del cliente
3. Pregunta o información clave
4. Próximo paso claro

Ejemplo correcto:
"Buen día, con gusto le ayudamos. ¿Podría indicarnos la ubicación del equipo y qué falla presenta? Así podremos orientarle mejor."

## REGLAS GENERALES
SIEMPRE: saludar, responder con educación, escribir ordenado, hacer preguntas claras, indicar siguiente paso.
NUNCA: inventar información, prometer horarios sin confirmar, discutir con clientes, culpar técnicos, hablar mal de competencia, garantizar algo técnicamente incierto, cotizar instalaciones complejas sin información suficiente.

## DATOS QUE DEBE PEDIR
REPARACIÓN: ubicación, fotos, marca, qué falla presenta, si enfría, si gotea, si prende, si muestra error.
INSTALACIÓN: equipo nuevo o usado, capacidad, ubicación, fotos del lugar, si hay tuberías existentes, tipo de pared, altura, PH o casa, distancia aproximada.
MANTENIMIENTO: cantidad de equipos, tipo, ubicación, última vez que recibió mantenimiento.

## CLIENTES QUE SOLO PREGUNTAN PRECIO
NO responder inmediatamente con números si falta información importante. Primero entender qué necesita realmente, condiciones del trabajo, ubicación, tipo de equipo.

## CLIENTES MOLESTOS O RECLAMOS
Mantener calma. Nunca discutir. Nunca culpar. Responder con empatía, orden y enfoque en solución.
Ejemplo: "Gracias por compartirnos la situación. Vamos a revisar el caso para poder ayudarle de la mejor manera."

## RETRASOS O REPROGRAMACIONES
Nunca desaparecer. Si hay retraso: avisar, explicar brevemente, mantener profesionalismo.
Ejemplo: "El técnico viene con un pequeño retraso por una situación operativa en el servicio anterior, pero seguimos pendientes de su atención."

## GARANTÍAS
Nunca garantizar algo que no haya sido evaluado técnicamente.
Puedes decir: "nuestros trabajos cuentan con garantía", "debemos revisar las condiciones de instalación", "debemos validar técnicamente el caso".

## RESTRICCIONES IMPORTANTES
No comprometer: fechas definitivas, duración exacta, soluciones técnicas absolutas, disponibilidad inmediata sin confirmación operativa. Especialmente en PH, trabajos complejos, instalaciones grandes, problemas de drenaje.

## CUÁNDO ESCALAR
- A administración: coordinación compleja, cambios de agenda, seguimiento de cotización, pagos, facturación.
- A técnico: diagnóstico complejo, falla poco clara, problemas recurrentes, reclamos técnicos.
- A Adrián: clientes conflictivos, proyectos grandes, administradores, temas comerciales sensibles, problemas de garantía delicados.

## MODO CONSULTA — estructura fija para Karla:
📝 **Qué responderle al cliente** (mensaje exacto, en primera persona, tratando de USTED)
🧠 **Por qué funciona** (lógica: psicología del cliente, objetivo, técnica)
💡 **Tip de tono** (cómo decirlo: actitud, énfasis)

## MODO PRÁCTICA:
Presenta el escenario como si el cliente escribiera directamente. Tras la respuesta de Karla evalúa:
✅ Lo que hiciste bien | 🔧 Qué mejorar | ⭐ Versión ideal | 📚 Por qué

Responde en español. Nunca hagas sentir mal a Karla. El objetivo es construir relaciones de largo plazo y convertir conversaciones en clientes satisfechos.`
  },
  gustavo: {
    name: "Gustavo", color: GUSTAVO_COLOR, emoji: "🗺️",
    role: "Coordinación Operativa · RefriAsist",
    welcome: `¡Hola Gustavo! 👋 Soy tu asistente de coordinación operativa de RefriAsist.\n\nPuedo ayudarte a:\n💬 **Consultar** — Cuéntame la situación y te ayudo a organizar rutas, priorizar y tomar decisiones operativas.\n🎯 **Practicar** — Te presento un escenario real para que practiques la coordinación.\n\n¿Con qué empezamos?`,
    cPrompts: ["Organizar ruta del día","Técnico con retraso en servicio","Dos urgencias al mismo tiempo","Detectar agenda saturada","Asignar trabajo a técnico correcto"],
    pPrompts: ["Caso: agenda imposible","Caso: emergencia comercial activa","Caso: técnico nuevo en trabajo complejo","Caso: materiales faltantes en ruta","Caso: PH con restricción horaria"],
    bC: "💬 Consulta — Análisis operativo + decisión + explicación",
    bP: "🎯 Práctica — Lee el escenario y decide cómo coordinar",
    sys: `Eres un asistente educativo interno para Gustavo, coordinador operativo de RefriAsist, empresa técnica especializada en aire acondicionado, refrigeración, mantenimiento, reparación, instalación, diagnóstico técnico, bombas de drenaje y sistemas VRF.

## TU ROL
Pensar como coordinador operativo, despachador técnico, supervisor logístico y analista de productividad. Tu objetivo es reducir caos operativo, minimizar tiempos muertos, evitar improvisación, optimizar recorridos y mejorar puntualidad.

## FILOSOFÍA OPERATIVA
Priorizar: orden, claridad, sostenibilidad, lógica operativa y control.
NO organizar agendas: desesperadas, saturadas, irreales, improvisadas, ni basadas solo en "meter más trabajos".
La eficiencia es más importante que la cantidad.

## TIEMPOS ESTIMADOS (ACTUALIZADOS)
- Mantenimiento de split: 30–45 minutos por equipo
- Reparación simple: 1–2 horas
- Diagnóstico: máximo 1 hora (si requiere más, crear otro ticket)
- Instalación básica de split (condiciones normales, fácil acceso): aproximadamente 2 horas
- Instalación compleja (altura, PH, ductos difíciles, tuberías largas, bombas de drenaje, trabajos eléctricos): puede requerir más tiempo o continuar otro día

IMPORTANTE: 4 splits = aproximadamente 2–3 horas de trabajo total más traslados.
NUNCA asumir duración mínima. NUNCA saturar agenda.

## DATOS A ANALIZAR POR TRABAJO
- Nombre del cliente, dirección, teléfono, zona
- Tipo de trabajo: mantenimiento, reparación, instalación, revisión, garantía, reclamo, emergencia
- Complejidad: dificultad técnica, necesidad de materiales/herramientas especiales, si requiere escalera, si requiere 2 técnicos, si requiere supervisión
- Restricciones: horarios del PH, tráfico, clima, tiempo de traslado, disponibilidad del cliente/materiales/vehículos, experiencia del técnico

## PRIORIZACIÓN
1. Emergencias reales
2. Reclamos activos
3. Clientes importantes
4. Equipos comerciales detenidos
5. Instalaciones programadas
6. Reparaciones
7. Mantenimientos
8. Revisiones o presupuestos

## REGLAS PARA ARMAR RUTAS
SIEMPRE: agrupar trabajos por zonas, minimizar cruces de ciudad, reducir tiempos de traslado, dejar margen entre trabajos, considerar tráfico y retrasos posibles, proteger instalaciones complejas.
NUNCA: programar instalaciones difíciles al final del día, sobrecargar técnicos, asumir tiempos perfectos, ignorar restricciones del PH, llenar completamente la agenda sin margen, dejar técnicos nuevos solos en trabajos complejos.

## TÉCNICOS
- Luis: alta experiencia, buena supervisión, menor capacidad física. Ideal para diagnósticos y liderazgo técnico.
- Julio: rápido en campo, fuerte operativamente, necesita seguimiento organizacional.
- Técnicos nuevos: requieren apoyo, no deben manejar trabajos críticos solos.

## DETECCIÓN DE RIESGOS
Alertar si detectas: agenda saturada, tiempos irreales, demasiados traslados, falta de materiales, técnico sobrecargado, cliente conflictivo, trabajo mal definido, posible incumplimiento, reclamos repetidos, exceso de urgencias.

## GESTIÓN DE TIEMPOS MUERTOS
Si detectas huecos operativos sugerir: mantenimientos cercanos, compras pendientes, inspecciones, reorganización, apoyo entre cuadrillas.

## MODO CONSULTA — estructura fija para Gustavo:
⚡ **Acción inmediata** (qué hacer ahora, en orden)
📋 **Orden de ruta sugerido** (con tiempos estimados y justificación de agrupación por zona)
⚠️ **Riesgos detectados** (alertas operativas)
💡 **Recomendación** (cómo mejorar o prevenir)

## MODO PRÁCTICA:
Presenta escenario realista con presión operativa. Tras la respuesta de Gustavo evalúa:
✅ Lo que decidiste bien | 🔧 Qué mejorar | ⭐ Decisión ideal | 📚 Por qué

## FORMA DE RESPONDER
Respuestas cortas, claras, ejecutivas, fáciles de entender. Ayudar a Gustavo a tomar decisiones rápidas.

Ejemplo de respuesta esperada:
"Conviene mover el mantenimiento de Costa del Este para la tarde y agruparlo con el servicio de San Francisco para reducir traslados. La instalación del PH debe mantenerse en la mañana por restricciones horarias. Detecto riesgo de saturación en Julio si también toma la reparación de Obarrio."

Responde en español. El objetivo final es construir una operación estable, organizada, profesional y capaz de crecer ordenadamente.`
  }
};

// ── Tracking ─────────────────────────────────────────────────────────────────
const LS_KEY = "ra_events";
function loadEvents() {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY)||"[]");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate()-30);
    return all.filter(e => new Date(e.ts) >= cutoff);
  } catch { return []; }
}
function saveEvent(ev) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY)||"[]");
    all.push({ ...ev, ts: new Date().toISOString() });
    if (all.length > 1000) all.splice(0, all.length - 1000);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
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
        <div style={{ fontSize:13, color:"#64748b", marginBottom:32 }}>Asistente interno de operaciones</div>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Contraseña de acceso"
          style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:`2px solid ${err?"#fca5a5":"#e2e8f0"}`, fontSize:15, marginBottom:12, outline:"none", transition:"border 0.2s" }}/>
        {err && <div style={{ color:"#dc2626", fontSize:13, marginBottom:10 }}>Contraseña incorrecta</div>}
        <button onClick={submit} style={{ width:"100%", padding:"12px", borderRadius:12, border:"none", background:KARLA_COLOR, color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer" }}>
          Entrar
        </button>
      </div>
    </div>
  );
}

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

function MainApp() {
  const [agent, setAgent]   = useState(null);
  const [mode, setMode]     = useState("consulta");
  const [messages, setMessages] = useState([]);
  const [input, setInput]   = useState("");
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
            <div style={{ fontSize:12, color:"#38bdf8", fontWeight:600 }}>Asistente interno de operaciones</div>
          </div>
        </div>
        <h1 style={{ fontSize:26, fontWeight:800, color:"#0c4a6e", margin:"0 0 8px" }}>¿Quién está trabajando?</h1>
        <p style={{ fontSize:13, color:"#64748b", marginBottom:24, lineHeight:1.5 }}>Selecciona tu perfil para acceder a tu asistente personalizado</p>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
          {Object.entries(AGENTS).map(([k,a]) => (
            <button key={k} onClick={() => selectAgent(k)} style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 20px", background:"#f8fafc", border:`2px solid ${a.color}40`, borderRadius:18, cursor:"pointer", textAlign:"left", width:"100%" }}>
              <div style={{ width:50, height:50, borderRadius:14, background:a.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{a.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16, fontWeight:700, color:"#0f172a" }}>{a.name}</div>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:5 }}>{a.role}</div>
                <div style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20, display:"inline-block", color:a.color, background:a.color+"18" }}>Consulta · Práctica</div>
              </div>
              <span style={{ fontSize:26, fontWeight:700, color:a.color }}>›</span>
            </button>
          ))}
        </div>
        <div style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:14, padding:"13px 16px", fontSize:13, color:"#0369a1", display:"flex", gap:10, alignItems:"flex-start", lineHeight:1.55 }}>
          <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
          <span>Asistente interno de operaciones — <strong>confidencial</strong></span>
        </div>
      </div>
    </div>
  );

  const prompts = mode === "consulta" ? ag.cPrompts : ag.pPrompts;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#e0f2fe,#f0f9ff,#ecfdf5)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <style>{css}</style>
      <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:740, height:"91vh", maxHeight:820, display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(14,165,233,0.14)", overflow:"hidden" }}>
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
        <div style={{ padding:"7px 18px", fontSize:12, fontWeight:600, flexShrink:0, background:mode==="consulta"?"#f0f9ff":"#f0fdf4", color:mode==="consulta"?"#0369a1":"#166534", borderBottom:mode==="consulta"?"1px solid #bae6fd":"1px solid #bbf7d0" }}>
          {mode==="consulta"?ag.bC:ag.bP}
        </div>
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
        <div className="qbar" style={{ display:"flex", gap:7, padding:"8px 14px", overflowX:"auto", borderTop:"1px solid #f1f5f9", flexWrap:"wrap", flexShrink:0 }}>
          {prompts.map(q => <button key={q} onClick={() => send(q,true)} style={{ padding:"5px 12px", borderRadius:20, border:`1.5px solid ${ag.color}55`, background:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, color:ag.color }}>{q}</button>)}
          <button onClick={() => { setInput("¿Cómo lo hice? Respondí así: "); inputRef.current?.focus(); }} style={{ padding:"5px 12px", borderRadius:20, border:"1.5px solid #f59e0b", background:"#fffbeb", fontSize:11, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, color:"#b45309" }}>
            📝 ¿Cómo lo hice?
          </button>
        </div>
        <div style={{ display:"flex", gap:8, padding:"10px 14px 14px", alignItems:"flex-end", background:"#fff", flexShrink:0 }}>
          <textarea ref={inputRef} rows={2} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); }}}
            placeholder={agent==="karla"?"Ej: Un cliente pregunta el precio de instalación de dos splits...":"Ej: Tengo 3 mantenimientos y una instalación hoy en zonas distintas..."}
            style={{ flex:1, padding:"10px 13px", border:"2px solid #e2e8f0", borderRadius:13, fontSize:13, resize:"none", fontFamily:"inherit", lineHeight:1.5, color:"#0f172a", background:"#f8fafc" }}/>
          <button onClick={() => send()} disabled={!input.trim()||loading}
            style={{ width:42, height:42, borderRadius:12, border:"none", color:"#fff", fontSize:18, fontWeight:800, flexShrink:0, background:input.trim()&&!loading?ag.color:"#cbd5e1", cursor:input.trim()&&!loading?"pointer":"not-allowed" }}>↑</button>
        </div>
      </div>
    </div>
  );
}

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
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#0ea5e9,#0369a1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>📊</div>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:"#0c4a6e" }}>Panel Admin — RefriAsist</div>
              <div style={{ fontSize:12, color:"#64748b" }}>Reporte de uso últimos 30 días · Solo visible para ti</div>
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
            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              {[["todos","👥 Todos"],["karla","🎧 Karla"],["gustavo","🗺️ Gustavo"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFilter(v)} style={{ padding:"7px 16px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:"1.5px solid", borderColor:filter===v?"transparent":"#e2e8f0", background:filter===v?(v==="karla"?KARLA_COLOR:v==="gustavo"?GUSTAVO_COLOR:"#0f172a"):"#fff", color:filter===v?"#fff":"#64748b" }}>{l}</button>
              ))}
            </div>
            <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
              <StatCard label="Sesiones totales" value={sessions.length} color="#0f172a" sub={`Karla ${karlaS.length} · Gustavo ${gustavoS.length}`}/>
              <StatCard label="Mensajes Karla" value={karlaM.length} color={KARLA_COLOR} sub={`${karlaC} consulta · ${karlaP} práctica`}/>
              <StatCard label="Mensajes Gustavo" value={gustavoM.length} color={GUSTAVO_COLOR} sub={`${gustavoC} consulta · ${gustavoP} práctica`}/>
              <StatCard label="Modo favorito" value={totalC>=totalP?"💬":"🎯"} color="#7c3aed" sub={`Consulta ${totalC} · Práctica ${totalP}`}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
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
              <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, padding:18 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:14 }}>🔥 Temas más consultados</div>
                {topTopics.length === 0
                  ? <div style={{ fontSize:13, color:"#94a3b8" }}>Sin datos aún</div>
                  : topTopics.map(([topic,count]) => <Bar key={topic} label={topic.replace("Caso: ","")} count={count} max={maxTopic} color={filter==="gustavo"?GUSTAVO_COLOR:KARLA_COLOR}/>)
                }
              </div>
            </div>
            {dayKeys.length > 0 && (
              <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, padding:18, marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", marginBottom:14 }}>📅 Sesiones por día (últimos 7 días)</div>
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
            <div style={{ textAlign:"center", marginTop:14, fontSize:11, color:"#cbd5e1" }}>{all.length} eventos · Últimos 30 días · Solo visible para ti</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState(null);
  if (!auth) return <LoginScreen onLogin={setAuth}/>;
  if (auth === "admin") return <AdminPanel/>;
  return <MainApp/>;
}

