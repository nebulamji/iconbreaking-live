#!/usr/bin/env python3
"""Backfill real iconbreaking_waitlist contacts → GHL TruPortals + event_registrations.

Reads real registrations (filters internal tests), deduplicates via GHL upsert
(idempotent by email + locationId), then writes into event_registrations.

Usage:
    python3 backfill_waitlist.py [--dry-run]
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

import requests

FARAJI_ENV = os.path.expanduser("~/.hermes/secrets/clients/faraji.env")
GHL_API = "https://services.leadconnectorhq.com"
GHL_VERSION = "2021-07-28"
LOCATION_ID = "ICdqpFpG2xL7Zl91j4D6"
EVENT_SLUG = "iba-june4"
CLIENT_ID = "faraji"
TAGS = ["IconBreaking", "IBA Founding 100", "Event Registration", "Event: IBA June 4"]
WORKER_DIR = os.path.expanduser("~/srida/cf-worker-srida")
DB_NAME = "srida-identity"

SKIP_PATTERNS = [
    "@example.com",
    "pipeline-test@",
    "brand-membrane-test@",
    "stamp+",
    "@getrida.work",
]


def load_pit() -> str:
    env = {}
    with open(FARAJI_ENV) as f:
        for line in f:
            line = line.strip()
            if line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            env[k.strip()] = v.strip().strip('"')
    pit = env.get("GHL_PIT_IBA")
    if not pit:
        print("ERROR: GHL_PIT_IBA not found in faraji.env", file=sys.stderr)
        sys.exit(1)
    return pit


def d1_query(sql: str) -> list[dict]:
    result = subprocess.run(
        ["npx", "wrangler", "d1", "execute", DB_NAME, "--command", sql, "--remote", "--json"],
        cwd=WORKER_DIR,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"D1 error: {result.stderr}", file=sys.stderr)
        sys.exit(1)
    data = json.loads(result.stdout)
    return data[0].get("results", [])


def sq(v: str | None) -> str:
    """Escape a value as a single-quoted SQLite string literal."""
    if v is None:
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"


def d1_exec_file(sql: str) -> bool:
    import tempfile
    with tempfile.NamedTemporaryFile(mode="w", suffix=".sql", delete=False) as f:
        f.write(sql)
        fname = f.name
    result = subprocess.run(
        ["npx", "wrangler", "d1", "execute", DB_NAME, "--file", fname, "--remote"],
        cwd=WORKER_DIR,
        capture_output=True,
        text=True,
    )
    os.unlink(fname)
    return result.returncode == 0


def ghl_upsert(pit: str, row: dict) -> tuple[bool, str | None, str | None]:
    name = (row.get("name") or "").strip()
    parts = name.split(" ")
    body: dict = {
        "locationId": LOCATION_ID,
        "email": row["email"].strip().lower(),
        "source": "themusicindustry.ai-intake",
        "tags": TAGS,
    }
    if name:
        body["name"] = name
        body["firstName"] = parts[0]
        body["lastName"] = " ".join(parts[1:])
    if row.get("phone"):
        body["phone"] = row["phone"].strip()

    custom_fields = [
        {"key": "event_name", "field_value": "IBA x Aggie Release Strategy Masterclass"},
        {"key": "event_slug", "field_value": EVENT_SLUG},
    ]
    if row.get("role"):
        custom_fields.append({"key": "event_role", "field_value": row["role"]})
    if row.get("release_window"):
        custom_fields.append({"key": "event_release_window", "field_value": row["release_window"]})
    body["customFields"] = custom_fields

    try:
        resp = requests.post(
            f"{GHL_API}/contacts/upsert",
            json=body,
            headers={"Authorization": f"Bearer {pit}", "Version": GHL_VERSION},
            timeout=15,
        )
        data = resp.json()
        if not resp.ok:
            return False, None, f"ghl:{resp.status_code} {data.get('message','')[:120]}"
        contact_id = (data.get("contact") or {}).get("id") or data.get("id")
        return True, contact_id, None
    except Exception as ex:
        return False, None, str(ex)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    pit = load_pit()
    print(f"[+] PIT loaded (GHL_PIT_IBA) location={LOCATION_ID}")

    rows = d1_query("SELECT * FROM iconbreaking_waitlist ORDER BY created_at ASC")
    print(f"[+] {len(rows)} rows in iconbreaking_waitlist")

    real = []
    skipped = []
    for row in rows:
        email = (row.get("email") or "").lower()
        if any(p in email for p in SKIP_PATTERNS):
            skipped.append(email)
            continue
        real.append(row)

    print(f"[+] {len(real)} real contacts, {len(skipped)} skipped (internal tests)")
    for s in skipped:
        print(f"    skip: {s}")

    if not real:
        print("[!] Nothing to backfill.")
        return 0

    print()
    results = []
    for row in real:
        email = row["email"].strip().lower()
        name = row.get("name") or ""
        print(f"  → {name} <{email}>", end="  ", flush=True)

        if args.dry_run:
            print("[DRY RUN]")
            results.append((row, True, "dry-run-id", None))
            continue

        ok, contact_id, err = ghl_upsert(pit, row)
        if ok:
            print(f"✓ GHL contact_id={contact_id}")
        else:
            print(f"✗ {err}")
        results.append((row, ok, contact_id, err))

    if args.dry_run:
        print("\n[DRY RUN] No writes made.")
        return 0

    print()
    # Write into event_registrations + update registration_count
    synced_count = 0
    for (row, ok, contact_id, err) in results:
        email = row["email"].strip().lower()
        reg_id = f"backfill:{row['id']}"
        now = datetime.now(timezone.utc).isoformat()
        crm_synced = 1 if ok else 0
        sql = (
            "INSERT OR IGNORE INTO event_registrations "
            "(id, event_slug, client_id, name, email, phone, role, release_window, social, source, crm_synced, crm_contact_id, crm_sync_error, raw_json, created_at) "
            f"VALUES ({sq(reg_id)}, {sq(EVENT_SLUG)}, {sq(CLIENT_ID)}, "
            f"{sq(row.get('name'))}, {sq(email)}, {sq(row.get('phone'))}, "
            f"{sq(row.get('role'))}, {sq(row.get('release_window'))}, {sq(row.get('links'))}, "
            f"{sq('iconbreaking-waitlist-backfill')}, {crm_synced}, "
            f"{sq(contact_id)}, {sq(err)}, {sq(json.dumps(row))}, {sq(row.get('created_at', now))})"
        )
        if d1_exec_file(sql):
            print(f"  [D1] wrote event_registrations: {email}")
            if ok:
                synced_count += 1
        else:
            print(f"  [D1] failed: {email}", file=sys.stderr)

    # Bump registration_count by number of successfully synced real contacts
    if synced_count > 0:
        now = datetime.now(timezone.utc).isoformat()
        d1_exec_file(
            f"UPDATE client_events SET registration_count = registration_count + {synced_count}, "
            f"updated_at = {sq(now)} WHERE slug = {sq(EVENT_SLUG)}"
        )
        print(f"\n[+] registration_count +{synced_count} on iba-june4")

    print(f"\n[DONE] {synced_count}/{len(real)} contacts synced to GHL + written to event_registrations")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
