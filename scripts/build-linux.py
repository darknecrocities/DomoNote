#!/usr/bin/env python3
"""
DomoNote -- Linux Packaging & Binary Generator
Creates:
  1. domonote_1.0.2_amd64.deb (Standard Debian / Ubuntu package)
  2. DomoNote-Linux-x86_64.AppImage (Self-extracting universal Linux binary)
  3. DomoNote-Linux-x64.tar.gz (Portable archive)
  4. DomoNote-Setup.sh (1-click installer)
"""

import os
import sys
import tarfile
import gzip
import io
import shutil
import hashlib
import subprocess
from pathlib import Path

# Force UTF-8 stdout/stderr on Windows runners (avoids cp1252 charmap encoding errors)
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
DOWNLOADS = ROOT / "public" / "downloads"
DOWNLOADS.mkdir(parents=True, exist_ok=True)

VERSION = "1.0.2"

def main():
    print(f"[DomoNote] Packaging Linux artifacts for v{VERSION}...")
    if not (DIST / "index.html").exists():
        print("[Error] dist/index.html not found. Run npm run build first.")
        sys.exit(1)

    # -- 1. Create DomoNote-Setup.sh -------------------------------------------
    setup_sh_src = ROOT / "scripts" / "setup-linux.sh"
    setup_sh_dest = DOWNLOADS / "DomoNote-Setup.sh"
    shutil.copy(setup_sh_src, setup_sh_dest)
    setup_sh_dest.chmod(0o755)
    print(f"  [OK] Created {setup_sh_dest.name}")

    # -- 2. Create Portable Linux Archive (tar.gz) -----------------------------
    stage_dir = ROOT / "build_linux_stage"
    if stage_dir.exists():
        shutil.rmtree(stage_dir)
    stage_dir.mkdir(parents=True)

    app_root = stage_dir / "domonote"
    app_root.mkdir(parents=True)

    # Copy web assets excluding downloads
    web_dir = app_root / "web"
    web_dir.mkdir(parents=True)
    for item in DIST.iterdir():
        if item.name == "downloads":
            continue
        if item.is_dir():
            shutil.copytree(item, web_dir / item.name)
        else:
            shutil.copy2(item, web_dir / item.name)

    # Copy icon and launcher
    icon_src = ROOT / "public" / "official_domonote.png"
    shutil.copy2(icon_src, app_root / "icon.png")

    # Create launch script
    run_script = app_root / "domonote"
    run_script.write_text(f"""#!/usr/bin/env bash
# DomoNote v{VERSION} Linux Launcher
DIR="$( cd "$( dirname "${{BASH_SOURCE[0]}}" )" && pwd )"
cd "$DIR/web"

PORT=5892
# Check if port is already used
if command -v python3 >/dev/null 2>&1; then
    echo "[DomoNote] Starting local static server on http://127.0.0.1:$PORT..."
    python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
    PID=$!
    sleep 0.8
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://127.0.0.1:$PORT"
    elif command -v google-chrome >/dev/null 2>&1; then
        google-chrome --app="http://127.0.0.1:$PORT" &
    elif command -v firefox >/dev/null 2>&1; then
        firefox "http://127.0.0.1:$PORT" &
    fi
    echo "[DomoNote] Running. Press Ctrl+C to close."
    wait $PID
else
    echo "[Error] python3 is required to run the local server."
    exit 1
fi
""", encoding="utf-8")
    run_script.chmod(0o755)

    # Desktop entry file
    desktop_file = app_root / "domonote.desktop"
    desktop_file.write_text(f"""[Desktop Entry]
Name=DomoNote
Comment=Your Personal AI Secretary for meetings, documents, and notes
Exec=bash -c "cd '%k' && ./domonote"
Icon=icon
Terminal=false
Type=Application
Categories=Office;Development;Utility;
Keywords=Notes;AI;Meeting;Transcript;Markdown;
StartupNotify=true
""", encoding="utf-8")
    desktop_file.chmod(0o755)

    # Create DomoNote-Linux-x64.tar.gz
    tar_path = DOWNLOADS / "DomoNote-Linux-x64.tar.gz"
    with tarfile.open(tar_path, "w:gz") as tar:
        tar.add(app_root, arcname="domonote")
    print(f"  [OK] Created {tar_path.name}")

    # -- 3. Create domonote_1.0.2_amd64.deb ------------------------------------
    deb_stage = stage_dir / "deb"
    deb_stage.mkdir(parents=True)
    debian_dir = deb_stage / "DEBIAN"
    debian_dir.mkdir(parents=True)

    usr_bin = deb_stage / "usr" / "bin"
    usr_bin.mkdir(parents=True)
    usr_share = deb_stage / "usr" / "share" / "domonote"
    usr_share.mkdir(parents=True)
    usr_apps = deb_stage / "usr" / "share" / "applications"
    usr_apps.mkdir(parents=True)
    usr_icons = deb_stage / "usr" / "share" / "icons" / "hicolor" / "512x512" / "apps"
    usr_icons.mkdir(parents=True)

    # Control file
    control_content = f"""Package: domonote
Version: {VERSION}
Section: utils
Priority: optional
Architecture: amd64
Maintainer: DomoNote <support@domonote.app>
Depends: bash, python3
Description: DomoNote - Your Personal AI Secretary
 Capture it. Understand it. Keep it. Real-time multilingual meeting recorder,
 notes, and document synthesis.
"""
    (debian_dir / "control").write_text(control_content, encoding="utf-8")

    # Post-install script
    postinst_content = """#!/usr/bin/env bash
set -e
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database -q || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -q -t -f /usr/share/icons/hicolor || true
fi
exit 0
"""
    postinst = debian_dir / "postinst"
    postinst.write_text(postinst_content, encoding="utf-8")
    postinst.chmod(0o755)

    # Binary in /usr/bin/domonote
    bin_launcher = usr_bin / "domonote"
    bin_launcher.write_text("""#!/usr/bin/env bash
PORT=5892
cd /usr/share/domonote
python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
PID=$!
sleep 0.8
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://127.0.0.1:$PORT"
elif command -v google-chrome >/dev/null 2>&1; then
    google-chrome --app="http://127.0.0.1:$PORT" &
fi
wait $PID
""", encoding="utf-8")
    bin_launcher.chmod(0o755)

    # Share web assets
    for item in (app_root / "web").iterdir():
        if item.is_dir():
            shutil.copytree(item, usr_share / item.name)
        else:
            shutil.copy2(item, usr_share / item.name)

    # Desktop file
    deb_desktop = usr_apps / "domonote.desktop"
    deb_desktop.write_text(f"""[Desktop Entry]
Name=DomoNote
Comment=Your Personal AI Secretary for meetings, documents, and notes
Exec=/usr/bin/domonote
Icon=domonote
Terminal=false
Type=Application
Categories=Office;Development;Utility;
Keywords=Notes;AI;Meeting;Transcript;Markdown;
StartupNotify=true
""", encoding="utf-8")
    deb_desktop.chmod(0o644)

    # Icon
    shutil.copy2(icon_src, usr_icons / "domonote.png")

    # Pack control.tar.gz
    control_tar_path = stage_dir / "control.tar.gz"
    with tarfile.open(control_tar_path, "w:gz") as tar:
        for f in debian_dir.iterdir():
            tar.add(f, arcname=f"./{f.name}")

    # Pack data.tar.gz
    data_tar_path = stage_dir / "data.tar.gz"
    with tarfile.open(data_tar_path, "w:gz") as tar:
        for f in ["usr"]:
            tar.add(deb_stage / f, arcname=f"./{f}")

    # debian-binary
    deb_binary = stage_dir / "debian-binary"
    deb_binary.write_bytes(b"2.0\n")

    # Assemble genuine Debian .deb archive
    deb_output = DOWNLOADS / f"domonote_{VERSION}_amd64.deb"
    with open(deb_output, "wb") as f:
        f.write(b"!<arch>\n")
        files_to_pack = [
            ("debian-binary", deb_binary.read_bytes()),
            ("control.tar.gz", control_tar_path.read_bytes()),
            ("data.tar.gz", data_tar_path.read_bytes()),
        ]
        for name, data in files_to_pack:
            # 16-byte filename formatted as name/ or name
            name_header = f"{name:<16}".encode("ascii")[:16]
            mtime_header = f"{int(0):<12}".encode("ascii")[:12]
            uid_header = f"{0:<6}".encode("ascii")[:6]
            gid_header = f"{0:<6}".encode("ascii")[:6]
            mode_header = f"{'100644':<8}".encode("ascii")[:8]
            size_header = f"{len(data):<10}".encode("ascii")[:10]
            header = name_header + mtime_header + uid_header + gid_header + mode_header + size_header + b"`\n"
            f.write(header)
            f.write(data)
            if len(data) % 2 != 0:
                f.write(b"\n")
    print(f"  [OK] Created {deb_output.name} ({deb_output.stat().st_size / (1024*1024):.1f} MB)")

    # -- 4. Create DomoNote-Linux-x86_64.AppImage ------------------------------
    # A standalone self-executing AppImage wrapper
    appimage_output = DOWNLOADS / "DomoNote-Linux-x86_64.AppImage"
    
    # We create an AppDir structure
    appdir = stage_dir / "AppDir"
    appdir.mkdir(parents=True)
    shutil.copytree(usr_share, appdir / "usr" / "share" / "domonote")
    shutil.copy2(icon_src, appdir / "domonote.png")
    shutil.copy2(icon_src, appdir / ".DirIcon")
    shutil.copy2(deb_desktop, appdir / "domonote.desktop")

    apprun = appdir / "AppRun"
    apprun.write_text("""#!/usr/bin/env bash
HERE="$(dirname "$(readlink -f "${0}")")"
cd "$HERE/usr/share/domonote"

PORT=5892
if command -v python3 >/dev/null 2>&1; then
    python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
    PID=$!
    sleep 0.8
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://127.0.0.1:$PORT"
    elif command -v google-chrome >/dev/null 2>&1; then
        google-chrome --app="http://127.0.0.1:$PORT" &
    fi
    wait $PID
else
    echo "[Error] python3 is required to launch the DomoNote server."
    exit 1
fi
""", encoding="utf-8")
    apprun.chmod(0o755)

    # Bundle AppDir into a self-extracting shell executable AppImage
    appimage_tar = stage_dir / "appdir.tar.gz"
    with tarfile.open(appimage_tar, "w:gz") as tar:
        for f in appdir.iterdir():
            tar.add(f, arcname=f.name)

    appimage_header = f"""#!/usr/bin/env bash
# DomoNote AppImage Self-Executing Bundle v{VERSION}
set -e
TMPDIR=$(mktemp -d -t domonote-appimage-XXXXXX)
trap 'rm -rf "$TMPDIR"' EXIT
sed '1,/^#__ARCHIVE_BELOW__/d' "$0" | tar -xz -C "$TMPDIR"
"$TMPDIR/AppRun" "$@"
exit 0
#__ARCHIVE_BELOW__
"""
    with open(appimage_output, "wb") as out_f:
        out_f.write(appimage_header.encode("utf-8"))
        with open(appimage_tar, "rb") as in_tar:
            shutil.copyfileobj(in_tar, out_f)
    appimage_output.chmod(0o755)
    print(f"  [OK] Created {appimage_output.name}")

    # Cleanup stage
    shutil.rmtree(stage_dir, ignore_errors=True)

    # -- 5. Generate SHA256SUMS.txt --------------------------------------------
    print("[DomoNote] Generating SHA256 checksums...")
    checksum_lines = []
    for item in sorted(DOWNLOADS.iterdir()):
        if item.name in ["SHA256SUMS.txt", ".DS_Store"]:
            continue
        if item.is_file():
            h = hashlib.sha256(item.read_bytes()).hexdigest()
            checksum_lines.append(f"{h}  {item.name}")
            print(f"  {h[:12]}...  {item.name}")

    sums_file = DOWNLOADS / "SHA256SUMS.txt"
    sums_file.write_text("\n".join(checksum_lines) + "\n", encoding="utf-8")
    print(f"  [OK] Written {sums_file.name}")

    # Sync to dist/downloads as well
    dist_downloads = DIST / "downloads"
    if dist_downloads.exists():
        shutil.rmtree(dist_downloads)
    shutil.copytree(DOWNLOADS, dist_downloads)
    print("  [OK] Synchronized downloads to dist/downloads")

if __name__ == "__main__":
    main()
