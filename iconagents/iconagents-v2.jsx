/* ═══════════════════════════════════════════════════════════════
   IconAgents v2 — React Components
   ═══════════════════════════════════════════════════════════════
   8 components mounted by index.html:
     IACompounding · IACapabilities · IAFight · IAHow
     IAFounding · IAPricing · IAChat · IAFAQ

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
    name: "Signal",
    sub: "Entry · One-time",
    price: "$7",
    per: "one-time",
    featured: false,
    feats: [
      { head: true, label: "What you get" },
      "Sample daily intel brief for your vertical",
      "One rollout-agent chat session",
      "Taste the system — no commitment",
      { head: true, label: "What it doesn't include" },
      "Ongoing delivery",
      "Agent configuration",
      "API access",
    ],
    cta: "Try it",
    href: "#chat",
  },
  {
    name: "Agent",
    sub: "Self-serve · Monthly",
    price: "$97",
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
    name: "Founding 100",
    sub: "Managed · Founders only",
    price: "$500",
    per: "/month",
    featured: true,
    badge: "FOUNDERS",
    feats: [
      { head: true, label: "Everything in Agent, plus" },
      "Managed agent — configured for your vertical by our team",
      "Branded intel — your logo, your domain, your inbox",
      "Priority rollout — your agent runs first in the queue",
      "Masterclass access — live sessions with Keyz",
      { head: true, label: "When voice launches" },
      "Discovery calls · Sales calls · Consulting · CS",
      "Same agent brain — four call modes, one CRM",
    ],
    cta: "Apply",
    href: "https://www.iconbreaking.com/apply/",
  },
];

const FAQ_DATA = [
  { q: "Is this a chatbot?", a: "No. Chatbots advise. IconAgents executes. Every action produces a receipt — what was done, when, what came back. The chat is one interface; the agent also sends emails, generates daily intel, runs rollout protocols, and (when voice launches) makes calls." },
  { q: "Do I need to know how to prompt?", a: "No. The agent is pre-configured for music business operations. You talk to it like a team member: 'Set up my August release.' It breaks the goal into steps and executes." },
  { q: "What's the Founding 100?", a: "The first 100 Icon Agents accounts. Founder pricing locks permanently — $500/month for managed, branded, priority agent service. After 100, the price increases for new accounts. Founders keep their rate forever." },
  { q: "Can I use my own brand?", a: "Yes. Founding 100 members get branded intel — your logo, your domain, your inbox. The agent runs under your brand, not ours. Your clients see you, not us." },
  { q: "What's an API key?", a: "Founding 100 and Agent tier members get a grk_ key — a credential that lets developers integrate Icon Agents into their own tools, pipelines, or apps. Token packs are prepaid and metered: you pay for what you use." },
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
          The first 100 Icon Agents accounts receive founder pricing, managed onboarding, and
          permanent rate lock. After 100, price increases. Founders keep their rate forever —
          and get first access to voice, consulting mode, and enterprise rails as they launch.
        </p>
        <div style={{ marginTop: '28px' }}>
          <a href="https://www.iconbreaking.com/apply/" className="btn btn-primary">Apply for Founding 100 <span className="arrow">→</span></a>
        </div>
      </div>
      <div>
        <ul className="founding-list">
          <li><span className="gold">✦</span> Founder pricing locks permanently — $500/month, never increases</li>
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
          <a href={tier.href} className={`btn ${tier.featured ? 'btn-primary' : 'btn-ghost'} tier-cta`}>
            {tier.cta} <span className="arrow">→</span>
          </a>
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
