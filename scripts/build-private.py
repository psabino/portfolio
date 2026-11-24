#!/usr/bin/env python3
"""Build password-protected pages from private/ into the site root.

For every private/*.html:
  1. Embed private images (src="images/...", resolved inside private/) as data URIs,
     so no confidential image is ever published as a separate file.
  2. Rewrite public paths ("../style.css", "../images/...") to site-root paths.
  3. Refuse to continue if anything still points into private/.
  4. Encrypt the result with StatiCrypt into the site root (e.g. ./nda-project.html).

Usage:
  python3 scripts/build-private.py            # embed + encrypt (needs Node.js)
  python3 scripts/build-private.py --preview  # embed only, writes private/_preview/ to check locally

Password: set STATICRYPT_PASSWORD in a git-ignored .env file at the project root,
or StatiCrypt will ask for it. Never pass it on the command line.
"""
import base64
import mimetypes
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRIVATE = ROOT / "private"
STATICRYPT = "staticrypt@3.5.4"

ATTR_RE = re.compile(r'(\b(?:src|href)=")([^"]*)(")')
URL_RE = re.compile(r'(url\(["\']?)([^"\')]+)(["\']?\))')
EXTERNAL = ("http://", "https://", "data:", "mailto:", "tel:", "#")


def fail(msg):
    sys.exit(f"build-private: {msg}")


def embed(path_str, source):
    file = (PRIVATE / path_str).resolve()
    if PRIVATE not in file.parents:
        fail(f"{source.name}: '{path_str}' points outside private/")
    if not file.is_file():
        fail(f"{source.name}: image not found: private/{path_str}")
    mime = mimetypes.guess_type(file.name)[0] or "application/octet-stream"
    return f"data:{mime};base64," + base64.b64encode(file.read_bytes()).decode()


def transform(html, source):
    def fix(prefix, value, suffix, is_src):
        if value.startswith(EXTERNAL) or value == "":
            return prefix + value + suffix
        if value.startswith("../"):
            return prefix + value[3:] + suffix          # public file at site root
        if is_src:
            return prefix + embed(value, source) + suffix  # private image → embedded
        fail(f"{source.name}: link '{value}' must start with '../' (public) "
             "or be an external URL")

    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)  # drop notes/commented examples
    html = ATTR_RE.sub(lambda m: fix(m[1], m[2], m[3], m[1].startswith("src")), html)
    html = URL_RE.sub(lambda m: fix(m[1], m[2], m[3], True), html)
    return html


def main():
    preview = "--preview" in sys.argv
    sources = sorted(PRIVATE.glob("*.html"))
    if not sources:
        fail("no .html files in private/")

    out_dir = PRIVATE / "_preview" if preview else Path(tempfile.mkdtemp())
    out_dir.mkdir(exist_ok=True)
    try:
        for src in sources:
            html = transform(src.read_text(encoding="utf-8"), src)
            (out_dir / src.name).write_text(html, encoding="utf-8")
            print(f"embedded: {src.name}")

        if preview:
            # Preview sits in private/_preview/, so point public files back at the root.
            for f in out_dir.glob("*.html"):
                t = f.read_text(encoding="utf-8")
                t = ATTR_RE.sub(lambda m: m[1] + ("../../" + m[2]
                    if not m[2].startswith(EXTERNAL) and m[2] and not m[2].startswith("data:")
                    else m[2]) + m[3], t)
                f.write_text(t, encoding="utf-8")
            print(f"preview written to {out_dir.relative_to(ROOT)}/ (unencrypted, git-ignored)")
            return

        if not shutil.which("npx"):
            fail("Node.js (npx) not found — install Node.js first")

        files = [str(out_dir / s.name) for s in sources]
        subprocess.run(
            ["npx", "--yes", STATICRYPT, *files,
             "-d", str(ROOT),
             "--template-title", "Protected project",
             "--template-instructions", "This case study is under NDA. Enter the password to view it.",
             "--template-color-primary", "#00AEEF"],
            cwd=ROOT, check=True,
        )

        # Sanity check: the published files must not contain this page's readable
        # markup or any of its embedded images. (StatiCrypt's own password screen
        # has small built-in icons, so a generic "data:image" check is not enough.)
        for s in sources:
            plain = (out_dir / s.name).read_text(encoding="utf-8")
            leaks = ["section-title", "hero-title"]
            leaks += [m[:120] for m in re.findall(r"data:[^\"')]+", plain)]
            out = (ROOT / s.name).read_text(encoding="utf-8")
            if any(marker in out for marker in leaks):
                (ROOT / s.name).unlink()
                fail(f"{s.name}: output still readable — deleted it, nothing published")
            print(f"encrypted: {s.name}")
    finally:
        if not preview:
            shutil.rmtree(out_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
