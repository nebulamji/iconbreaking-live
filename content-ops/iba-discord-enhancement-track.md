# IBA Discord — Agentic Enhancement Track

**Channel routing (source of truth):**
- `#work-chat` (id: 1517179320664326376) — operator workroom
- `#announcements` (id: 1517621540357931149) — approved broadcasts only
- `#founding-100` (id: 100067) — member-facing updates
- `#opted-in` (id: 127215) — raw lead signals
- `#call-booked` (id: 984842) — confirmed call signals
- `#content-strategy` (id: 1517609530715017326) — content pipeline
- `#social-posts` (id: 1517621540357931149) — community share, manual-first
- `#projects` (id: 271353, forum) — project threads
- `#general` — quiet unless explicitly directed

---

## Enhancement 1 — Opt-in → Discord Ping
**Status: In progress**

Form at `iconbreaking.com/test1` → webhook → `#opted-in` with lead data.

When someone opts in:
1. Discord receives ping in `#opted-in` with full lead info
2. `#call-booked` fires when a call is scheduled
3. `#founding-100` fires when member status is confirmed

**Next step:** Confirm webhook URL is live and test with a manual submission.

---

## Enhancement 2 — Role-Gated Command Expansion
**Status: Partial (expanded commands staged)**

| Command | Access | Action |
|---------|--------|--------|
| `@IconAgent pull leads` | Admin | Last 20 opt-ins with source/date |
| `@IconAgent send update` | Admin | Draft → admin approves → sends to target channel |
| `@IconAgent schedule` | Admin | Schedules a message for future time in target channel |
| `@IconAgent build page` | Admin | Triggers page build from template, returns staging URL |
| `@IconAgent pull pipeline` | Admin | Call/lead/book count for the week |
| `@IconAgent content draft` | Admin | 10 content ideas → `#content-strategy` for approval |
| `@IconAgent report` | Admin | Posts weekly digest to `#work-chat` |

**Gate:** All external actions require explicit admin approval before execution.

---

## Enhancement 3 — Lead Routing
**Status: Active**

- `#opted-in` — raw form submission signals
- `#call-booked` — confirmed call signals
- `#founding-100` — member status updates
- `#announcements` — approved broadcasts only

---

## Enhancement 4 — Content Pipeline
**Status: Partial (approval rail staged)**

Current: Content ideas → `#content-strategy` → manual post to `#social-posts`.

**Staged automation:** Admin reaction ✅ → auto-post to `#social-posts`. No reaction in 48h → auto-reminder in `#work-chat`.

---

## Enhancement 5 — Weekly Reporting Digest
**Status: Staged**

Every Monday 9am ET → `#work-chat`:

```
IBA WEEKLY — [date]

LEADS: Opt-ins: N / Calls booked: N / Calls completed: N
MEMBERS: New F100: N / Total: N
CONTENT: Posts: N / Best performer: [title] / Pending: N
PIPELINE: Hot leads: N / Follow-up needed: N
```

Cron trigger → generate from D1 data → Discord webhook.

---

## Enhancement 6 — Member Onboarding Flow
**Status: Staged**

Trigger: Member joins or moved to `#founding-100`.

Sequence:
1. Welcome in `#founding-100` + masterclass replay link
2. CRM contact created
3. DM sequence: Day 0 welcome → Day 3 content drop → Day 7 call CTA

**Gate:** External sends require admin approval before first send.

---

## Enhancement 7 — Forum Stubs
**Status: Staged**

Trigger: New campaign launched by admin command.

Behavior: IconAgent creates `#projects` thread automatically with project brief, owner, deadline, status.

---

## Ship Order

1. Ship Enhancement 1 — confirm opt-in webhook live
2. Enhancement 5 — weekly digest (lowest complexity, highest signal)
3. Enhancement 4 automation — content approval reaction rail
4. Enhancement 2 — activate commands one at a time
5. Enhancement 6 — member onboarding
6. Enhancement 7 — forum stub automation

---

*Updated: 2026-06-25 | Owner: IconAgent | Lane: IBA/Faraji/IconAgents*