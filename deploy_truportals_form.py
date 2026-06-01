#!/usr/bin/env python3
"""Deploy TruPortals native form to iconbreaking.com.

Usage:
    python3 deploy_truportals_form.py --form-id FORM_ID_HERE [--dry-run]

What it does:
    1. Replaces the local JS waitlist form (handleWaitlist) with native TruPortals embed.
    2. Updates the section anchor from #waitlist to #iba-application.
    3. Updates all CTAs pointing to #waitlist to point to #iba-application.
    4. Removes the handleWaitlist JS function.
    5. Validates HTML parse.
    6. Prints a diff summary.
    7. Writes index.html in place (unless --dry-run).

Run once the IBA Founding 100 Qualification Form is built in TruPortals UI
and the form ID is returned.
"""
from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

INDEX = Path(__file__).parent / 'index.html'


# ---------------------------------------------------------------------------
# Replacement blocks
# ---------------------------------------------------------------------------

def truportals_aside(form_id: str) -> str:
    """Native TruPortals form section replacing the local waitlist aside."""
    return f"""      <aside class="waitlist" id="iba-application" aria-label="Apply for IBA Founding 100">
        <div class="waitlist-head"><div><div class="label">Apply now</div><h2>IBA Founding 100.</h2></div><div class="date">June 4 · 7PM ET</div></div>
        <p class="promise"><b>Tell us about your release.</b> We review every application and reach out personally if it's a strong fit. Qualified applicants receive a direct booking link for a strategy call with the IBA team.</p>
        <iframe
          src="https://api.leadconnectorhq.com/widget/form/{form_id}"
          style="width:100%;min-height:860px;border:none"
          id="iba-qual-form"
          data-layout="{{'id':'{form_id}'}}"
          data-trigger-type="alwaysShow"
          data-activation-type="alwaysActivated"
          data-deactivation-type="neverDeactivate"
          data-form-name="IBA Founding 100 Qualification Form"
          data-height="auto"
          data-layout-iframe-id="iba-qual-form"
          data-form-id="{form_id}"
          title="IBA Founding 100 Qualification Form"
          loading="lazy">
        </iframe>
      </aside>"""


FORM_EMBED_SCRIPT = '<script src="https://link.msgsndr.com/js/form_embed.js"></script>'

# Matches the entire local waitlist aside block
ASIDE_PATTERN = re.compile(
    r'<aside class="waitlist" id="waitlist"[^>]*>.*?</aside>',
    re.DOTALL
)

# Matches the entire handleWaitlist function in the script block
HANDLE_WAITLIST_PATTERN = re.compile(
    r'function handleWaitlist\(e\)\{.*?\}',
    re.DOTALL
)

# CTA link pointing to old anchor
OLD_CTA_ANCHOR = 'href="#waitlist"'
NEW_CTA_ANCHOR = 'href="#iba-application"'


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--form-id', required=True, help='TruPortals form ID from the UI')
    ap.add_argument('--dry-run', action='store_true', help='Print changes without writing')
    args = ap.parse_args()

    form_id = args.form_id.strip()
    if not form_id or len(form_id) < 8:
        print(f'ERROR: form-id looks wrong: {form_id!r}', file=sys.stderr)
        return 1

    html = INDEX.read_text()
    original = html

    # 1. Replace the local waitlist aside with TruPortals embed
    new_aside = truportals_aside(form_id)
    match = ASIDE_PATTERN.search(html)
    if not match:
        print('ERROR: could not find waitlist aside block in index.html', file=sys.stderr)
        return 1
    html = ASIDE_PATTERN.sub(new_aside, html, count=1)
    print(f'[1] Replaced local waitlist aside with TruPortals embed (form: {form_id})')

    # 2. Inject form_embed.js before </body>
    if FORM_EMBED_SCRIPT not in html:
        html = html.replace('</body>', f'{FORM_EMBED_SCRIPT}\n</body>', 1)
        print('[2] Injected form_embed.js before </body>')
    else:
        print('[2] form_embed.js already present — skipped')

    # 3. Update CTA anchors
    cta_count = html.count(OLD_CTA_ANCHOR)
    html = html.replace(OLD_CTA_ANCHOR, NEW_CTA_ANCHOR)
    print(f'[3] Updated {cta_count} CTA anchor(s): #waitlist → #iba-application')

    # 4. Remove handleWaitlist JS function
    fn_match = HANDLE_WAITLIST_PATTERN.search(html)
    if fn_match:
        html = HANDLE_WAITLIST_PATTERN.sub('', html, count=1)
        print('[4] Removed handleWaitlist JS function')
    else:
        print('[4] handleWaitlist not found — already removed or pattern mismatch')

    # 5. Parse validation
    try:
        HTMLParser().feed(html)
        print('[5] HTML parse: OK')
    except Exception as e:
        print(f'[5] HTML parse ERROR: {e}', file=sys.stderr)
        return 1

    # 6. Sanity checks
    assert f'id="iba-application"' in html, 'new section anchor missing'
    assert form_id in html, 'form_id not present in output'
    assert 'handleWaitlist' not in html, 'handleWaitlist still present'
    assert f'href="#waitlist"' not in html, 'old CTA anchor still present'
    print('[6] Sanity checks: passed')

    if args.dry_run:
        print('\n[DRY RUN] No files written.')
        # Print first 400 chars around the new aside for spot-check
        idx = html.find('id="iba-application"')
        print('\n--- new section (excerpt) ---')
        print(html[max(0, idx-50):idx+400])
        return 0

    # 7. Write
    INDEX.write_text(html)
    orig_lines = original.count('\n')
    new_lines = html.count('\n')
    print(f'\n[7] Written: {INDEX} ({orig_lines} → {new_lines} lines)')
    print(f'\nEmbed URL: https://api.leadconnectorhq.com/widget/form/{form_id}')
    print('Next: git add index.html && git commit && git push')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
