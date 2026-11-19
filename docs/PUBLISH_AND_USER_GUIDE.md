# Get Ticket — Complete Handbook: How It Works, How to Use & How to Publish on GitHub

**Repository:** <https://github.com/rknz/geticket>  
**Current Version:** `v2.4.0` (Option A — Local Planner, Release Reminders & Official Handoff Mode)

---

## 1. How Get Ticket Functions

Get Ticket is a **local-first browser extension** (built as two separate builds from one shared TypeScript core: **Chrome/Edge Desktop MV3** and **Kiwi Browser Android**).

### What happens under the hood
1. **Local Storage (`packages/storage` + `chrome.storage.local`):**
   - Your saved Journey Profiles, ranked class preferences, seat-direction settings, language (`বাংলা`/`EN`), and theme (`Light`/`Dark`/`System`) are validated with **Zod** and saved privately inside your browser's local storage. Nothing is sent to any external server.
2. **Journey & Preference Engine (`packages/shared-core`):**
   - Evaluates travel-class priority (`#1`, `#2`, `#3`), outbound/return seat preferences, and (only if you explicitly turn it on) the optional `SEAT-001` (`1–30 / 31+`) tentative heuristic (`Tentative owner preference — not verified`).
3. **Ticket Release Planner & Browser Alarms (`packages/scheduler`, `packages/notifications`):**
   - Calculates your advance-sale release date (default 10 days before your journey date, customizable time) and schedules a local `chrome.alarms` reminder with native browser notifications (or an in-app fallback if browser notifications are unavailable).
4. **User-Controlled Official Handoff (`packages/railway-engine`, `packages/security`):**
   - Prepares your trip summary on a visual **Active Trip Pass** (`Ready for official booking`) and opens `https://eticket.railway.gov.bd/` only when you click the button.
   - All allowlisted links are strictly restricted to HTTPS `eticket.railway.gov.bd` and `railway.gov.bd`.
   - **What it intentionally does NOT do:** No live Railway API scraping or automated polling (prohibited without official authorization), no credential/OTP/cookie/card storage, and no CAPTCHA or payment automation.

---

## 2. How to Use Get Ticket (Desktop & Mobile)

### Installing on Computer (Google Chrome & Microsoft Edge)
1. Download [`get-ticket-desktop-chrome-edge-v2.4.0.zip`](https://github.com/rknz/geticket/raw/main/releases/desktop/get-ticket-desktop-chrome-edge-v2.4.0.zip) and **extract** it to a permanent folder.
2. Open `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge).
3. Turn **Developer mode** **ON** → click **Load unpacked** → select the extracted folder (containing `manifest.json`).
4. Pin **Get Ticket (Desktop)** to the toolbar.

### Installing on Mobile (Android — Kiwi Browser)
1. Install **Kiwi Browser** on your Android phone.
2. Download [`get-ticket-android-kiwi-v2.4.0.zip`](https://github.com/rknz/geticket/raw/main/releases/android/get-ticket-android-kiwi-v2.4.0.zip) — **do NOT extract it**.
3. Open Kiwi → tap **`⋮`** → **Extensions** → turn **Developer mode** **ON**.
4. Tap **+ (from .zip/.crx/.user.js)** and choose `get-ticket-android-kiwi-v2.4.0.zip`.
5. Launch anytime via **`⋮`** → **Get Ticket (Kiwi Android)** → **Open Full Dashboard**.

### Daily Usage Walkthrough
1. **Home (`শুরু করুন`):** Read the 3-step quick guide, switch between saved trips, or tap **Plan New Trip**.
2. **Plan Trip (`নতুন যাত্রা`):**
   - Search and pick **From** and **To** stations from the dropdown (or tap a **Popular Corridor** chip / **Swap** button).
   - Tap your date directly on the **visual Calendar Picker** (or use quick buttons: `Tomorrow`, `+3 Days`, `+7 Days`, `+10 Days`).
   - Search and select preferred intercity trains from the static reference list.
   - Choose Priority #1 Class, number of tickets (`1–3`), leg (`Outbound`/`Return`), and Release Reminder time, then click **Save Trip Profile**.
3. **Preferences (`পছন্দ ও সিট`):** Reorder travel classes (`↑`/`↓`), enable/disable classes, set outbound/return seat preferences, and optionally toggle `SEAT-001`.
4. **Reminders & Sources (`রিমাইন্ডার ও উৎস`):** Click **Schedule Browser Reminder** to set a local alarm, or open official Bangladesh Railway schedule and fare reference pages.
5. **Active Trip Pass (Sidebar / Popup):** Click **Copy Trip Checklist** to copy your route/class notes, then click **Open Official e-Ticket Site** to complete **Login → Search → Select → CAPTCHA / OTP → Pay** manually.
6. **Settings (`সেটিংস ও সাহায্য`):** Switch between **বাংলা / English**, **System / Light / Dark**, or clear all local data anytime.

---

## 3. How to Publish Updates & Releases on GitHub

Whenever you make changes to the codebase and want to publish a new version to **https://github.com/rknz/geticket**:

### Step A — Verify & Build Locally
```powershell
pnpm install
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

### Step B — Package Both Extensions as Clean POSIX `.zip` Archives
Run from the repository root (`c:\New folder\htdocs\getticket`) to update `releases/desktop/`, `releases/android/`, and `releases/checksums/SHA256SUMS.txt`:

```powershell
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
function New-PosixZip([string]$sourceDir, [string]$zipPath) {
  Remove-Item -Force -ErrorAction SilentlyContinue $zipPath
  $zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    $base = (Resolve-Path $sourceDir).Path.TrimEnd('\') + '\'
    foreach ($file in (Get-ChildItem -Path $sourceDir -Recurse -File)) {
      $rel = $file.FullName.Substring($base.Length).Replace('\', '/')
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  } finally { $zip.Dispose() }
}
New-PosixZip 'apps\desktop-extension\dist' 'releases\desktop\get-ticket-desktop-chrome-edge-v2.4.0.zip'
New-PosixZip 'apps\android-extension\dist' 'releases\android\get-ticket-android-kiwi-v2.4.0.zip'
```

### Step C — Commit, Tag & Push to GitHub
```powershell
git add -A
git commit -m "release: update Get Ticket extension (v2.4.0)"
git push origin main
git tag -a v2.4.1 -m "Get Ticket v2.4.1"
git push origin v2.4.1
```

### Step D — Create an Official GitHub Release Page (Optional UI Download Tab)
1. Open <https://github.com/rknz/geticket/releases/new>.
2. Choose your tag (e.g., `v2.4.0` or your newest tag).
3. Enter a release title (e.g., **`Get Ticket v2.4.0`**) and short release notes.
4. Drag and drop all three files from `releases/` into **Attach binaries**:
   - `releases/desktop/get-ticket-desktop-chrome-edge-v2.4.0.zip`
   - `releases/android/get-ticket-android-kiwi-v2.4.0.zip`
   - `releases/checksums/SHA256SUMS.txt`
5. Click **Publish release**.
