// ═══════════════════════════════════════════════════════════════
//  Icon Agents SDK v1.0.0
//  The execution-native AI agent stack for the music business.
//  ═══════════════════════════════════════════════════════════════
//
//  Usage:
//    import { IconAgent } from './iconagents-sdk.mjs';
//    const agent = new IconAgent({ apiKey: 'grk_...', rail: 'themusicindustry.ai' });
//    const session = await agent.rollout.createSession({ artist: 'Faraji' });
//    const reply = await session.send('Week 4 of my rollout');
//    const intel = await agent.intel.get({ date: '2026-07-24' });
//
//  Membrane: Never exposes GetRida, Worker, Cloudflare, D1, DeepSeek, GHL, CompanyOS.
//  The client sees: Icon Agent, Icon Breaking, TheMusicIndustry.ai, outcomes.
//  ═══════════════════════════════════════════════════════════════

const DEFAULT_RAIL = 'themusicindustry.ai';
const API_PREFIX = '/api/v1';
const IBA_PREFIX = '/api/iba';

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'IconAgentApiError';
    this.status = status;
    this.body = body;
  }
}

// ── Internal fetch wrapper ───────────────────────────────────────
async function apiFetch(baseUrl, path, options = {}) {
  const url = `https://${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) {
    throw new ApiError(
      body?.error || body?.message || `HTTP ${res.status}`,
      res.status,
      body
    );
  }
  return body;
}

// ═══════════════════════════════════════════════════════════════
//  Rollout Session — 11-week release protocol chat
// ═══════════════════════════════════════════════════════════════
class RolloutSession {
  constructor(rail, apiKey, sessionId, metadata = {}) {
    this.rail = rail;
    this.apiKey = apiKey;
    this.sessionId = sessionId;
    this.metadata = metadata;
    this.messages = [];
  }

  async send(message, options = {}) {
    const body = {
      message,
      session_id: this.sessionId,
      surface: options.surface || 'sdk',
      email: options.email || this.metadata.email || undefined,
      week_hint: options.weekHint || undefined,
    };
    const result = await apiFetch(this.rail, `${IBA_PREFIX}/rollout-chat`, {
      method: 'POST',
      headers: this._authHeaders(),
      body: JSON.stringify(body),
    });
    this.messages.push({ role: 'user', text: message });
    if (result.reply) {
      this.messages.push({ role: 'bot', text: result.reply, tag: 'ICON AGENT' });
    }
    return result;
  }

  async sendWeek(weekNumber) {
    return this.send(`Tell me about week ${weekNumber}`, { weekHint: String(weekNumber) });
  }

  getHistory() {
    return [...this.messages];
  }

  _authHeaders() {
    return this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {};
  }
}

// ═══════════════════════════════════════════════════════════════
//  Rollout Agent — manages chat sessions for the 11-week protocol
// ═══════════════════════════════════════════════════════════════
class RolloutAgent {
  constructor(rail, apiKey) {
    this.rail = rail;
    this.apiKey = apiKey;
  }

  createSession(options = {}) {
    const sessionId = options.sessionId || `sdk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return new RolloutSession(this.rail, this.apiKey, sessionId, options);
  }

  async quickAsk(message, options = {}) {
    const session = this.createSession(options);
    return session.send(message, options);
  }

  async getFullProtocol(email) {
    const session = this.createSession({ email });
    return session.send('Give me the full 11-week rollout protocol');
  }
}

// ═══════════════════════════════════════════════════════════════
//  Intel Agent — daily intelligence briefs
// ═══════════════════════════════════════════════════════════════
class IntelAgent {
  constructor(rail, apiKey, clientSlug) {
    this.rail = rail;
    this.apiKey = apiKey;
    this.clientSlug = clientSlug;
  }

  async get(options = {}) {
    const date = options.date || new Date().toISOString().slice(0, 10);
    // Endpoint: GET /api/v1/intel/{client}/{date} (to be built on Worker)
    // Falls back to chat-based intel if endpoint not yet available
    try {
      return await apiFetch(this.rail, `${API_PREFIX}/intel/${this.clientSlug}/${date}`, {
        method: 'GET',
        headers: this._authHeaders(),
      });
    } catch (e) {
      if (e.status === 404 || e.status === 501) {
        // Fallback: ask the rollout-chat for today's intel
        const session = new RolloutSession(this.rail, this.apiKey, `intel-${date}`);
        return session.send(`Give me today's daily intel brief for ${date}`);
      }
      throw e;
    }
  }

  async getPillars() {
    try {
      return await apiFetch(this.rail, `${API_PREFIX}/config/${this.clientSlug}/pillars`, {
        method: 'GET',
        headers: this._authHeaders(),
      });
    } catch (e) {
      if (e.status === 404 || e.status === 501) {
        return { pillars: ['Capital & Deals', 'AI/Music', 'Web3/Blockchain', 'Industry Structure', 'Top Signal'], status: 'default' };
      }
      throw e;
    }
  }

  async configurePillars(weights) {
    return apiFetch(this.rail, `${API_PREFIX}/config/${this.clientSlug}/pillars`, {
      method: 'POST',
      headers: this._authHeaders(),
      body: JSON.stringify({ weights }),
    });
  }

  _authHeaders() {
    return this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {};
  }
}

// ═══════════════════════════════════════════════════════════════
//  Token Management — prepaid token packs
// ═══════════════════════════════════════════════════════════════
class TokenManager {
  constructor(rail, apiKey) {
    this.rail = rail;
    this.apiKey = apiKey;
  }

  async getBalance() {
    return apiFetch(this.rail, `${API_PREFIX}/tokens/balance`, {
      method: 'GET',
      headers: this._authHeaders(),
    });
  }

  async getCheckoutUrl(packId) {
    // Returns a Stripe checkout URL for the given pack ($50/$100/$200)
    return apiFetch(this.rail, `${API_PREFIX}/tokens/checkout?pack=${packId}`, {
      method: 'GET',
      headers: this._authHeaders(),
    });
  }

  async getUsage() {
    return apiFetch(this.rail, `${API_PREFIX}/usage`, {
      method: 'GET',
      headers: this._authHeaders(),
    });
  }

  _authHeaders() {
    return this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {};
  }
}

// ═══════════════════════════════════════════════════════════════
//  MCP Client — call the MCP server from the SDK
// ═══════════════════════════════════════════════════════════════
class McpClient {
  constructor(rail, apiKey) {
    this.rail = rail;
    this.apiKey = apiKey;
  }

  async listTools() {
    return apiFetch(this.rail, '/mcp', {
      method: 'GET',
      headers: this._authHeaders(),
    });
  }

  async callTool(name, args = {}) {
    return apiFetch(this.rail, '/mcp', {
      method: 'POST',
      headers: this._authHeaders(),
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: `sdk-${Date.now()}`,
        method: 'tools/call',
        params: { name, arguments: args },
      }),
    });
  }

  async send({ transport, to, message, subject, from }) {
    return this.callTool('send_message', { transport, to, message, subject, from });
  }

  async bookMeeting({ prospectEmail, topic, startTime, prospectName, durationMin }) {
    return this.callTool('book_meeting', {
      prospect_email: prospectEmail,
      topic,
      start_time: startTime,
      prospect_name: prospectName,
      duration_min: durationMin,
    });
  }

  async getUsage() {
    return this.callTool('get_usage', {});
  }

  _authHeaders() {
    return this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {};
  }
}

// ═══════════════════════════════════════════════════════════════
//  Icon Agent — top-level SDK entry point
// ═══════════════════════════════════════════════════════════════
export class IconAgent {
  constructor(options = {}) {
    this.apiKey = options.apiKey || null;
    this.rail = options.rail || DEFAULT_RAIL;
    this.clientSlug = options.clientSlug || null;
    this.vertical = options.vertical || 'music';

    // Sub-agents
    this.rollout = new RolloutAgent(this.rail, this.apiKey);
    this.intel = new IntelAgent(this.rail, this.apiKey, this.clientSlug);
    this.tokens = new TokenManager(this.rail, this.apiKey);
    this.mcp = new McpClient(this.rail, this.apiKey);
  }

  // Quick access to rollout chat
  async ask(message, options = {}) {
    return this.rollout.quickAsk(message, options);
  }

  // Start a rollout session (11-week protocol)
  startRollout(options = {}) {
    return this.rollout.createSession(options);
  }

  // Get daily intel
  async getIntel(options = {}) {
    return this.intel.get(options);
  }

  // Configure intel pillars
  async configurePillars(weights) {
    return this.intel.configurePillars(weights);
  }

  // Get token balance
  async getBalance() {
    return this.tokens.getBalance();
  }

  // Get API usage
  async getUsage() {
    return this.tokens.getUsage();
  }

  // List MCP tools
  async listMcpTools() {
    return this.mcp.listTools();
  }

  // Health check
  async health() {
    try {
      const result = await apiFetch(this.rail, '/api/iba/rollout-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'ping', session_id: `health-${Date.now()}`, surface: 'sdk-health' }),
      });
      return { ok: true, rail: this.rail, model: result.rail || 'unknown' };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}

// ── Named exports ────────────────────────────────────────────────
export { RolloutSession, RolloutAgent, IntelAgent, TokenManager, McpClient, ApiError };
export default IconAgent;
