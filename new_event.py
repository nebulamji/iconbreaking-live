#!/usr/bin/env python3
"""themusicindustry.ai — Event Page Generator for iconbreaking.com

Usage:
    python3 new_event.py --config events/iba-june4.yaml [--dry-run]
    python3 new_event.py --slug jay-z-0611 --name "IBA x Jay-Z" --partner "Jay-Z" \
                         --date "2026-06-11T19:00:00-04:00" --topic "Release strategy"

Generates iconbreaking.com/events/{slug}/index.html from the current index.html template.
The Worker intake endpoint is set to: https://themusicindustry.ai/intake/{slug}

After generation:
    git add events/{slug}/ && git commit -m "Add event page: {slug}" && git push
"""
from __future__ import annotations

import argparse
import re
import sys
import json
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

REPO = Path(__file__).parent
INDEX = REPO / "index.html"
INTAKE_BASE = "https://themusicindustry.ai/intake"


# ---------------------------------------------------------------------------
# Event config
# ---------------------------------------------------------------------------

def load_config(args: argparse.Namespace) -> dict:
    if args.config:
        cfg_path = Path(args.config)
        if not cfg_path.exists():
            print(f"ERROR: config file not found: {cfg_path}", file=sys.stderr)
            sys.exit(1)
        if HAS_YAML:
            import yaml
            return yaml.safe_load(cfg_path.read_text())
        else:
            import json
            return json.loads(cfg_path.read_text())
    return {
        "slug": args.slug,
        "name": args.name,
        "partner": args.partner or "",
        "date": args.date,
        "topic": args.topic or "",
        "calendar_url": args.calendar_url or "https://api.leadconnectorhq.com/widget/booking/aSM698WpQIKlovyq438E",
    }


# ---------------------------------------------------------------------------
# Date formatting
# ---------------------------------------------------------------------------

def format_date_display(iso: str) -> str:
    """'2026-06-11T19:00:00-04:00' → 'June 11 · 7PM ET'"""
    try:
        # strip offset for parsing
        base = re.sub(r'[+-]\d{2}:\d{2}$', '', iso)
        dt = datetime.fromisoformat(base)
        hour = dt.hour % 12 or 12
        ampm = "AM" if dt.hour < 12 else "PM"
        month = dt.strftime("%B")
        return f"{month} {dt.day} · {hour}{ampm} ET"
    except Exception:
        return iso


def format_js_timestamp(iso: str) -> str:
    """ISO → JS Date string for countdown"""
    return iso


# ---------------------------------------------------------------------------
# Template substitution
# ---------------------------------------------------------------------------

def build_event_page(template_html: str, cfg: dict) -> str:
    slug = cfg["slug"]
    name = cfg["name"]
    partner = cfg.get("partner", "")
    date_iso = cfg["date"]
    topic = cfg.get("topic", "")
    calendar_url = cfg.get("calendar_url", "")
    date_display = format_date_display(date_iso)
    intake_url = f"{INTAKE_BASE}/{slug}"

    html = template_html

    # ── Title and meta ──
    html = re.sub(
        r'<title>[^<]*</title>',
        f'<title>{name}</title>',
        html
    )
    html = re.sub(
        r'<meta name="description" content="[^"]*"',
        f'<meta name="description" content="{topic or name}"',
        html
    )
    html = re.sub(
        r'<meta property="og:title" content="[^"]*"',
        f'<meta property="og:title" content="{name}"',
        html
    )
    html = re.sub(
        r'<meta property="og:description" content="[^"]*"',
        f'<meta property="og:description" content="{topic or name}"',
        html
    )

    # ── Ticker ──
    html = re.sub(
        r'(<div class="ticker">).*?(</div>)',
        f'\\1<strong>{date_display}</strong> — {name}\\2',
        html, flags=re.DOTALL, count=1
    )

    # ── Eyebrow line ──
    html = re.sub(
        r'Release strategy masterclass / powered by Aggie',
        f'{name}',
        html
    )

    # ── Hero headline ──
    html = re.sub(
        r'<h1>.*?</h1>',
        f'<h1>{name}</h1>',
        html, flags=re.DOTALL, count=1
    )

    # ── Lede ──
    html = re.sub(
        r'<p class="lede">.*?</p>',
        f'<p class="lede">{topic}</p>',
        html, flags=re.DOTALL, count=1
    )

    # ── Waitlist section: heading and date label ──
    html = re.sub(
        r'<h2>Get June 4 access\.</h2>',
        f'<h2>{name}</h2>',
        html
    )
    html = re.sub(
        r'(<div class="date">)[^<]*(</div>)',
        f'\\1{date_display}\\2',
        html, count=1
    )

    # ── Promise copy in form section ──
    html = re.sub(
        r'(<p class="promise">).*?(</p>)',
        f'\\1<b>Register now.</b> Tell us your role and release window. The access link will be sent to your email.\\2',
        html, flags=re.DOTALL, count=1
    )

    # ── Button label ──
    html = re.sub(
        r'Register Now</button>',
        f'Register Now →</button>',
        html
    )

    # ── Success box ──
    html = re.sub(
        r"You're on the list\.",
        "You're registered.",
        html
    )
    html = re.sub(
        r"Registration received\. We'll send the June 4 access link and reminders to the email you entered\. Questions: judson@iconbreaking\.com\.",
        f"Registration confirmed. We'll send the access link for {name} to your email.",
        html
    )

    # ── Worker endpoint → themusicindustry.ai intake ──
    html = re.sub(
        r"fetch\('https://themusicindustry\.ai/intake/[^']*'",
        f"fetch('{intake_url}'",
        html
    )
    # Also update the source field in the JSON payload
    html = re.sub(
        r"source:'[^']*-registration'",
        f"source:'{slug}-registration'",
        html
    )
    html = re.sub(
        r"event:'[^']*'",
        f"event:'{slug}'",
        html
    )

    # ── Footer email ──
    # Keep as-is (judson@iconbreaking.com) — correct for all IBA events

    # ── Countdown target time ──
    html = re.sub(
        r"new Date\('2026-06-04T19:00:00-04:00'\)",
        f"new Date('{date_iso}')",
        html
    )

    return html


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", help="Path to event YAML/JSON config file")
    ap.add_argument("--slug", help="URL-safe event slug, e.g. jay-z-0611")
    ap.add_argument("--name", help="Event display name")
    ap.add_argument("--partner", help="Partner name(s)")
    ap.add_argument("--date", help="ISO8601 date, e.g. 2026-06-11T19:00:00-04:00")
    ap.add_argument("--topic", help="Short event description")
    ap.add_argument("--calendar-url", help="GHL booking or calendar link")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not args.config and not (args.slug and args.name and args.date):
        ap.error("Provide --config or --slug + --name + --date")

    cfg = load_config(args)
    slug = cfg["slug"]

    if not re.match(r'^[a-z0-9][a-z0-9\-]{1,60}$', slug):
        print(f"ERROR: slug must be lowercase alphanumeric + hyphens: {slug!r}", file=sys.stderr)
        return 1

    template = INDEX.read_text()
    event_html = build_event_page(template, cfg)

    # Validate
    try:
        HTMLParser().feed(event_html)
    except Exception as e:
        print(f"ERROR: HTML parse failed: {e}", file=sys.stderr)
        return 1

    # Sanity checks
    intake_url = f"{INTAKE_BASE}/{slug}"
    assert intake_url in event_html, f"intake URL not found: {intake_url}"
    assert slug in event_html, "slug not found in output"

    out_dir = REPO / "events" / slug
    out_file = out_dir / "index.html"

    if args.dry_run:
        print(f"[DRY RUN] Would write: {out_file}")
        print(f"  Intake URL: {intake_url}")
        print(f"  Event date: {cfg['date']} → {format_date_display(cfg['date'])}")
        # Print first 600 chars of the form section as spot-check
        m = re.search(r'<aside class="waitlist".*?</aside>', event_html, re.DOTALL)
        if m:
            print(f"\n--- form section (excerpt) ---\n{m.group()[:500]}")
        return 0

    out_dir.mkdir(parents=True, exist_ok=True)
    out_file.write_text(event_html)
    print(f"[OK] Written: {out_file}")
    print(f"     Live URL: https://www.iconbreaking.com/events/{slug}/")
    print(f"     Intake:   {intake_url}")
    print(f"     Date:     {format_date_display(cfg['date'])}")
    print(f"\nNext:")
    print(f"  git add events/{slug}/")
    print(f"  git commit -m 'Add event page: {slug}'")
    print(f"  git push")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
