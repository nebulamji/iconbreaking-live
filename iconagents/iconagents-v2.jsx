/* ═══════════════════════════════════════════════════════════════
   IconAgents v2 — React Components
   ═══════════════════════════════════════════════════════════════
   8 components mounted by index.html:
     IACompounding · IACapabilities · IAFight · IAHow
     IAFounding · IAPricing · IASkills · IAChat · IAFAQ

   Design grammar: HUD music-studio aesthetic
   Black base · gold primary · cyan secondary · scan-lines + data bars
   Membrane: never expose GetRida, Worker, Cloudflare, D1, DeepSeek, GHL, CompanyOS
   ═══════════════════════════════════════════════════════════════ */

const { useState, useRef, useEffect, useCallback } = React;

/* ─── Shared data ───────────────────────────────────────────────── */

const CAPABILITIES = [
  { idx: "01", title: "Music Registration", desc: "Register releases with proper metadata, ISRC, UPC, writer/publisher splits. Your agent handles the paperwork pipeline end to end.", icon: "REG" },
  { idx: "02", title: "Brand Development", desc: "Identity depth — visual, narrative, sonic. Your agent builds the brand system so every touchpoint is coherent.", icon: "BRD" },
  { idx: "03", title: "Revenue Strategy", desc: "Streaming, sync, publishing, live, merch. Your agent maps the revenue mix and tracks every line.", icon: "REV" },
  { idx: "04", title: "Sync Licensing", desc: "Catalog prepared for sync: metadata clean, stems organized, rights documented. Your agent keeps you placement-ready.", icon: "SNC" },
  { idx: "05", title: "Publishing Admin", desc: "Register with PROs, manage splits, track royalties. Your agent ensures every dollar finds its way home.", icon: "PUB" },
  { idx: "06", title: "Distribution", desc: "Release setup, distributor management, delivery confirmation. Your agent ships the product.", icon: "DST" },
  { idx: "07", title: "Business Infrastructure", desc: "Entity, contracts, splits, rights chain. Your agent builds the legal spine so deals close faster.", icon: "BIZ" },
  { idx: "08", title: "Outbound Outreach", desc: "Playlist curators, sync supervisors, booking agents, brand partners. Your agent runs outbound so you don't.", icon: "OUT" },
  { idx: "09", title: "Deal Intelligence", desc: "Daily intel on who's buying, who's selling, who's raising, who's signing. Your agent reads the market so you play it.", icon: "INT" },
];

const FIGHT_DATA = [
  { label: "Music AI Tools", what: "Advise on lyrics, production, marketing. Chat-only.", gap: "No execution. No outreach. No receipts. No revenue loop." },
  { label: "SDR / B2B Agents", what: "Automated outbound for SaaS and enterprise sales.", gap: "Built for B2B, not music. No music metadata, no PRO, no sync, no catalog." },
  { label: "Distributors", what: "Upload and deliver tracks to DSPs.", gap: "One function. No strategy, no outreach, no intelligence, no brand." },
  { label: "IconAgents", what: "Execution-native agent stack built for music operators.", gap: null },
];

const HOW_STEPS = [
  { idx: "01", title: "Email is the interface", desc: "No new app. No dashboard to learn. Your agent lives in your inbox — BCC'd into every thread that should run itself. Ask in plain language. Get work back.", detail: "Send your agent a goal: 'Set up my August release.' It breaks it into the 11-week protocol, sends you weekly action items, and tracks deliverables." },
  { idx: "02", title: "The agent executes", desc: "Registration, outreach, intel briefs, rollout protocols, follow-ups. Not advice — work product with receipts.", detail: "Every action your agent takes produces a receipt: what was done, when, what came back. Proof, not promises." },
  { idx: "03", title: "You see outcomes", desc: "KPI cards, daily intel, rollout progress, deal intelligence. Not a dashboard — a cockpit.", detail: "Weekly pulse: leads → emails → Discord joins → Founding 100 applications. Delivered, not asked for." },
];

const PRICING = [
  {
    name: "Artist",
    sub: "Self-serve · Monthly",
    price: "$99",
    per: "/month",
    featured: false,
    feats: [
      { head: true, label: "What you get" },
      "Rollout Agent — unlimited 11-week protocol chats",
      "Daily Intel Agent — branded briefs for your vertical",
      "Pillar configuration — weight your intel by what matters",
      "Discord community access",
      { head: true, label: "Developer rails" },
      "API key (grk_) for programmatic access",
      "Token packs — prepaid, metered usage",
    ],
    cta: "Start",
    href: "#chat",
  },
  {
    name: "Aggie",
    sub: "Real Growth · Monthly",
    price: "$500",
    per: "/month",
    featured: false,
    feats: [
      { head: true, label: "Everything in Artist, plus" },
      "Managed rollout — our team configures your 11-week protocol",
      "Priority intel — your briefs run first in the queue",
      "Audience growth campaigns — outreach, content ops, sync calls",
      "Scorecard reporting — weekly KPIs delivered to your inbox",
      { head: true, label: "Support" },
      "Direct line to the IBA team via Discord",
      "Monthly strategy review with your account manager",
    ],
    cta: "Start",
    href: "#chat",
  },
  {
    name: "Founding 100",
    sub: "Managed · Founders only",
    price: "By Application",
    per: "apply",
    featured: true,
    badge: "FOUNDERS",
    feats: [
      { head: true, label: "Everything in Aggie, plus" },
      "Managed agent — configured for your vertical by our team",
      "Branded intel — your logo, your domain, your inbox",
      "Priority rollout — your agent runs first in the queue",
      "Masterclass access — live sessions with Keyz",
      { head: true, label: "When voice launches" },
      "Discovery calls · Sales calls · Consulting · CS",
      "Same agent brain — four call modes, one CRM",
    ],
    cta: "Book a Call",
    href: "https://www.iconbreaking.com/apply/",


  },
];

const FAQ_DATA = [
  { q: "Is this a chatbot?", a: "No. Chatbots advise. IconAgents executes. Every action produces a receipt — what was done, when, what came back. The chat is one interface; the agent also sends emails, generates daily intel, runs rollout protocols, and (when voice launches) makes calls." },
  { q: "Do I need to know how to prompt?", a: "No. The agent is pre-configured for music business operations. You talk to it like a team member: 'Set up my August release.' It breaks the goal into steps and executes." },
  { q: "What's the Founding 100?", a: "The first 100 Icon Agents accounts. Managed, branded, priority agent service for established artists and teams. After 100, access closes. Founders keep their priority access forever." },
  { q: "Can I use my own brand?", a: "Yes. Founding 100 members get branded intel — your logo, your domain, your inbox. The agent runs under your brand, not ours. Your clients see you, not us." },
  { q: "What's an API key?", a: "Founding 100 and Aggie tier members get a grk_ key — a credential that lets developers integrate Icon Agents into their own tools, pipelines, or apps. Token packs are prepaid and metered: you pay for what you use." },
  { q: "What about phone calls?", a: "Voice is coming — four call modes (Discovery, Sales, Consulting, Customer Support) snap into the same agent brain. The state machine is already designed; transport adapters arrive when voice infrastructure is live. Founding 100 members get first access." },
  { q: "Who built this?", a: "Icon Breaking Agency, in partnership with Audience Genomics. Keyz the Producer's music business expertise is baked into every agent — the 11-week rollout protocol, the pillar taxonomy, the intel framework. Not a generic AI wrapper." },
];

/* ─── §000 — IACompounding ──────────────────────────────────────── */

function IACompounding() {
  const [rate, setRate] = useState(1.0);
  useEffect(() => {
    let r = 1.0;
    const interval = setInterval(() => {
      r += 0.0001;
      setRate(r);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="sec-head-row">
        <div>
          <div className="sec-tag">// §000 · THE COMPOUNDING</div>
          <h2 className="sec-title">Every day your agent runs,<br/><span className="gold">it gets sharper.</span></h2>
        </div>
        <p>Daily intel compounds into market intelligence. Outreach compounds into a pipeline. Rollouts compound into a release calendar. The agent doesn't forget — it builds on yesterday's work.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '40px' }}>
        <div className="data-card">
          <div className="data-card-label">// DAILY INTEL</div>
          <div className="data-card-value gold">{(rate * 365).toFixed(2)}<span className="data-card-unit">× annual</span></div>
          <div className="data-card-desc">17 signals/day × 5 pillars × 365 days = 6,205 data points per year per client. Every signal classified, weighted, and delivered.</div>
        </div>
        <div className="data-card">
          <div className="data-card-label">// OUTREACH</div>
          <div className="data-card-value gold">∞<span className="data-card-unit">compounding</span></div>
          <div className="data-card-desc">Every email sent, every reply received, every relationship built — logged, tagged, and fed back into the next outreach cycle.</div>
        </div>
        <div className="data-card">
          <div className="data-card-label">// RELEASE CALENDAR</div>
          <div className="data-card-value gold">11<span className="data-card-unit">weeks × N</span></div>
          <div className="data-card-desc">Each rollout feeds the next. The 11-week protocol compounds: week 11's recap becomes week 1's intelligence for the next release.</div>
        </div>
      </div>
    </div>
  );
}

/* ─── §001 — IACapabilities ────────────────────────────────────── */

function IACapabilities() {
  return (
    <div className="cap-grid">
      {CAPABILITIES.map(cap => (
        <div key={cap.idx} className="cap-card">
          <div className="cap-idx">// {cap.idx}</div>
          <div className="cap-icon">{cap.icon}</div>
          <h3 className="cap-title">{cap.title}</h3>
          <p className="cap-desc">{cap.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── §002 — IAFight ───────────────────────────────────────────── */

function IAFight() {
  return (
    <div className="fight-table">
      {FIGHT_DATA.map(row => (
        <div key={row.label} className={`fight-row ${row.gap === null ? 'winner' : ''}`}>
          <div className="fight-label">{row.label}</div>
          <div className="fight-what">{row.what}</div>
          <div className="fight-gap">
            {row.gap === null
              ? <span className="green">✓ The execution-native agent stack for music.</span>
              : <span className="red">{row.gap}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── §003 — IAHow ─────────────────────────────────────────────── */

function IAHow() {
  return (
    <div className="how-grid">
      {HOW_STEPS.map(step => (
        <div key={step.idx} className="how-card">
          <div className="how-idx">// {step.idx}</div>
          <h3 className="how-title">{step.title}</h3>
          <p className="how-desc">{step.desc}</p>
          <div className="how-detail">{step.detail}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── §004 — IAFounding ────────────────────────────────────────── */

function IAFounding() {
  return (
    <div className="founding-grid">
      <div>
        <div className="founding-tag">// FOUNDING 100 · COHORT</div>
        <div className="founding-display">
          <span className="gold">FOUNDING</span>
          <br/>
          <span className="num">100</span>
        </div>
        <div className="founding-counter">
          <span className="filled">27</span>
          <span className="of">/ 100 SLOTS FILLED</span>
          <div className="bar"><div className="bar-fill"></div></div>
        </div>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '15px', lineHeight: 1.6, color: 'var(--text-2)', maxWidth: '440px' }}>
          The first 100 Icon Agents accounts receive managed onboarding and
          permanent priority access. After 100, access closes. Founders keep their status forever —
          and get first access to voice, consulting mode, and enterprise rails as they launch.
        </p>
        <div style={{ marginTop: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="https://www.iconbreaking.com/apply/" className="btn btn-ghost">Book a Call <span className="arrow">→</span></a>
        </div>
      </div>
      <div>
        <ul className="founding-list">
          <li><span className="gold">✦</span> Managed onboarding — our team configures your vertical from day one</li>
          <li><span className="gold">✦</span> Managed agent — our team configures your vertical, pillars, and delivery</li>
          <li><span className="gold">✦</span> Branded intel — your logo, your domain, your inbox</li>
          <li><span className="gold">✦</span> Priority rollout — your agent runs first in the queue</li>
          <li><span className="gold">✦</span> Masterclass access — live sessions with Keyz the Producer</li>
          <li><span className="gold">✦</span> Discord community — direct line to the team and other founders</li>
          <li><span className="gold">✦</span> First access to voice modes — Discovery, Sales, Consulting, CS</li>
          <li><span className="gold">✦</span> Developer rails — API key, SDK, and MCP as they ship</li>
          <li><span className="gold">✦</span> Receipt-backed onboarding — proof of every action from day one</li>
        </ul>
      </div>
    </div>
  );
}

/* ─── §005 — IAPricing ─────────────────────────────────────────── */

function IAPricing() {
  return (
    <div className="tiers">
      {PRICING.map(tier => (
        <div key={tier.name} className={`tier ${tier.featured ? 'featured' : ''}`}>
          {tier.badge && <div className="tier-badge">{tier.badge}</div>}
          <div className="tier-name">{tier.name}</div>
          <div className="tier-sub">{tier.sub}</div>
          <div className="tier-price">
            <span className="amt">{tier.price}</span>
            <span className="per">{tier.per}</span>
          </div>
          <ul className="tier-feats">
            {tier.feats.map((f, i) =>
              typeof f === 'object' && f.head
                ? <li key={i} className="head">{f.label}</li>
                : <li key={i}>{f}</li>
            )}
          </ul>
          <div className="tier-cta-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a href={tier.href} className={`btn ${tier.featured ? 'btn-ghost' : 'btn-ghost'} tier-cta`} style={{ flex: '1 1 auto' }}>
              {tier.cta} <span className="arrow">→</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── §006 — IAChat (live, wired to TMI) ───────────────────────── */

function IAChat() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "You're live with Icon Agent — Keyz's inbox team. Ask me about your rollout, metadata, or the 11-week release protocol. Drop your email and I'll send the full framework.", tag: "ICON AGENT" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `ia-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const [email, setEmail] = useState('');
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    setInput('');
    setLoading(true);

    const newMsgs = [...messages, { role: 'user', text }];
    setMessages(newMsgs);

    try {
      const res = await fetch('https://themusicindustry.ai/api/iba/rollout-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          surface: 'iconagents',
          email: email || undefined,
        }),
      });
      const data = await res.json();

      if (data.ok && data.reply) {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: data.reply,
          tag: 'ICON AGENT',
          tagLine: data.rail ? `rail: ${data.rail}` : null,
          cta: data.cta || null,
        }]);

        // Show email capture after first user message if no email yet
        if (!email && !emailSent && newMsgs.filter(m => m.role === 'user').length >= 1) {
          setShowEmailCapture(true);
        }
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: "Connection issue — try again in a moment.", tag: 'SYSTEM' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "Connection issue — try again in a moment.", tag: 'SYSTEM' }]);
    }
    setLoading(false);
  }, [messages, loading, sessionId, email, emailSent]);

  const submitEmail = async () => {
    if (!email.trim()) return;
    await send(`My email is ${email}`);
    setEmailSent(true);
    setShowEmailCapture(false);
  };

  const suggestions = [
    "Week 4 of my rollout",
    "What metadata do I need?",
    "How do I join the Founding 100?",
    "What's the 11-week protocol?",
  ];

  return (
    <div className="chat">
      <div className="chat-head">
        <div className="av">IA</div>
        <div className="who">Icon Agent <span>· LIVE</span></div>
        <div className="live">● ONLINE</div>
      </div>
      <div className="chat-body" ref={bodyRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            {msg.tag && <span className="tag">{msg.tag}</span>}
            {msg.text}
            {msg.tagLine && <span className="tag-line">{msg.tagLine}</span>}
            {msg.cta && (
              <a href={msg.cta.url} style={{
                display: 'inline-block', marginTop: '8px',
                background: 'var(--gold)', color: '#0a0a0a',
                padding: '5px 12px', borderRadius: '6px',
                fontFamily: 'var(--f-display)', fontSize: '11px',
                letterSpacing: '1px', textTransform: 'uppercase',
                textDecoration: 'none', fontWeight: '700'
              }}>{msg.cta.label} →</a>
            )}
          </div>
        ))}
        {loading && (
          <div className="msg bot">
            <span className="tag">ICON AGENT</span>
            <span style={{ animation: 'pulse 1s infinite' }}>typing...</span>
          </div>
        )}
      </div>

      {showEmailCapture && !emailSent && (
        <div className="lead-capture show">
          <p>Drop your email — I'll send you the full 11-week protocol + Discord invite.</p>
          <div className="lead-row">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitEmail()}
            />
            <button className="lead-btn" onClick={submitEmail}>Send</button>
          </div>
        </div>
      )}

      <div className="sugg">
        {suggestions.map(s => (
          <button key={s} onClick={() => send(s)}>{s}</button>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask Icon Agent anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
        />
        <button className="send" onClick={() => send(input)}>Send</button>
      </div>
    </div>
  );
}

/* ─── §007 — IAFAQ ─────────────────────────────────────────────── */

function IAFAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="faq-list">
      {FAQ_DATA.map((item, i) => (
        <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
          <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
            <span className="faq-idx">// {String(i + 1).padStart(2, '0')}</span>
            <span className="faq-text">{item.q}</span>
            <span className="faq-arrow">{open === i ? '−' : '+'}</span>
          </div>
          {open === i && (
            <div className="faq-a">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── §008 — IASkills (Agent Stack Showcase) ───────────────────── */

const SKILLS_DATA = [
  {
    idx: "01",
    icon: "ROL",
    name: "Rollout Agent",
    desc: "11-week music release protocol. Pre-save to recap. Your agent runs the rollout, tracks deliverables, and compounds each release into the next.",
    status: "live",
  },
  {
    idx: "02",
    icon: "INT",
    name: "Daily Intel Agent",
    desc: "Five-pillar market intelligence delivered to your inbox every morning. Capital, AI/Music, Web3, Industry Structure, Top Signal — weighted to your vertical.",
    status: "live",
  },
  {
    idx: "03",
    icon: "SCR",
    name: "Scorecard Agent",
    desc: "Masterclass registrant readiness scoring. Artist identity, catalog, metadata, release plan, market positioning — one score, one next step.",
    status: "live",
  },
  {
    idx: "04",
    icon: "DSC",
    name: "Discovery Agent",
    desc: "Qualify inbound leads by phone. Consent, fit, budget, timing. Routes warm leads to sales or Discord — cold leads back to nurture.",
    status: "soon",
  },
  {
    idx: "05",
    icon: "SAL",
    name: "Sales Agent",
    desc: "Close cycle execution. Follow-ups, booking, price ladder. Same Bella law: price last, no-repeat, Discord/masterclass CTAs throughout.",
    status: "soon",
  },
  {
    idx: "06",
    icon: "CON",
    name: "Consulting Agent",
    desc: "Scanner briefs, work packets, strategic review. Agent joins the call, scans the vision, leaves to execute the work — returns with deliverables.",
    status: "soon",
  },
];

function IASkills() {
  return (
    <div className="skills-grid">
      {SKILLS_DATA.map(skill => (
        <div key={skill.idx} className={`skill-card ${skill.status}`}>
          <div className="skill-header">
            <div className="skill-idx">// {skill.idx}</div>
            <div className={`skill-badge badge-${skill.status}`}>
              {skill.status === 'live' ? '● LIVE' : 'SOON'}
            </div>
          </div>
          <div className="skill-icon">{skill.icon}</div>
          <h3 className="skill-name">{skill.name}</h3>
          <p className="skill-desc">{skill.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── §009 — IASDK (Developer Access) ─────────────────────────── */

const SDK_ENDPOINTS = [
  { method: "POST", path: "/api/iba/rollout-chat", desc: "Create or continue a rollout-agent chat session", status: "live" },
  { method: "GET",  path: "/api/v1/intel/{client}/{date}", desc: "Retrieve a daily intel brief by date", status: "live" },
  { method: "GET",  path: "/api/v1/intel/{client}/latest", desc: "Get the most recent intel brief", status: "live" },
  { method: "GET",  path: "/api/v1/intel/{client}", desc: "List recent intel briefs", status: "live" },
  { method: "POST", path: "/api/v1/config/{client}/pillars", desc: "Update pillar weights for a vertical", status: "live" },
  { method: "GET",  path: "/api/v1/config/{client}/pillars", desc: "Get current pillar configuration", status: "live" },
  { method: "POST", path: "/api/v1/chat/completions", desc: "LLM completion via metered relay (grk_ key)", status: "live" },
  { method: "POST", path: "/api/v1/tokens/buy", desc: "Purchase prepaid token pack ($50/$100/$200)", status: "live" },
  { method: "GET",  path: "/api/v1/tokens/balance", desc: "Check token balance and usage", status: "live" },
  { method: "POST", path: "/api/v1/skill-chat", desc: "Chat with a specific skill (rollout, daily-intel, scorecard)", status: "live" },
];

const SDK_CODE = `import { IconAgent } from './iconagents-sdk.mjs';

// Initialize with your grk_ API key
const agent = new IconAgent({
  apiKey: 'grk_...',
  rail: 'themusicindustry.ai'
});

// ── Rollout Agent: 11-week release protocol
const session = await agent.rollout.createSession({
  artist: 'Your Artist',
  releaseDate: '2026-09-15'
});
const reply = await session.send('Week 4 — what do I do?');

// ── Daily Intel: market intelligence
const intel = await agent.intel.get({ date: '2026-07-24' });
console.log(intel.verdict);
// → "UMG's catalog deal signals a shift..."

// ── Configure: weight your pillars
await agent.config.pillars({
  'Capital & Deals': 0.25,
  'AI/Music': 0.20,
  'Web3/Blockchain': 0.15,
  'Industry Structure': 0.25,
  'Top Signal': 0.15
});

// ── Skill Chat: talk to any registered skill
const scorecardReply = await agent.chat({
  skill: 'scorecard',
  message: 'Score my artist readiness'
});`;

function IASdk() {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('code');

  const copyCode = () => {
    navigator.clipboard.writeText(SDK_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sdk-section">
      <div className="sdk-tabs">
        <button
          className={`sdk-tab ${tab === 'code' ? 'active' : ''}`}
          onClick={() => setTab('code')}
        >Quick Start</button>
        <button
          className={`sdk-tab ${tab === 'endpoints' ? 'active' : ''}`}
          onClick={() => setTab('endpoints')}
        >API Reference</button>
      </div>

      {tab === 'code' && (
        <div className="sdk-code-block">
          <div className="sdk-code-header">
            <span className="sdk-code-filename">iconagents-sdk.mjs</span>
            <button className="sdk-copy-btn" onClick={copyCode}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre className="sdk-code"><code>{SDK_CODE}</code></pre>
        </div>
      )}

      {tab === 'endpoints' && (
        <div className="sdk-endpoints">
          <div className="sdk-endpoints-header">
            <span>METHOD</span>
            <span>ENDPOINT</span>
            <span>DESCRIPTION</span>
            <span>STATUS</span>
          </div>
          {SDK_ENDPOINTS.map((ep, i) => (
            <div key={i} className="sdk-endpoint-row">
              <span className={`sdk-method method-${ep.method.toLowerCase()}`}>{ep.method}</span>
              <span className="sdk-path">{ep.path}</span>
              <span className="sdk-desc">{ep.desc}</span>
              <span className={`sdk-ep-status ${ep.status}`}>
                {ep.status === 'live' ? '● LIVE' : 'SOON'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="sdk-note">
        <span className="sdk-note-tag">// FOUNDING 100 ACCESS</span>
        <p>API keys (grk_) are provisioned when you join the Founding 100. Self-serve members get read-only intel access. Full execution and chat requires a Founding 100 seat.</p>
        <a href="/apply/" className="sdk-cta">Get your API key →</a>
      </div>
    </div>
  );
}
