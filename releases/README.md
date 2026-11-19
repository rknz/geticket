# Get Ticket v2.4.0 — Download & Verification Guide

All downloadable release packages are separated cleanly by platform so Android files, Desktop files, and text/documentation files never get mixed up:

```text
releases/
  android/
    get-ticket-android-kiwi-v2.4.0.zip          # Mobile (Kiwi Browser on Android)
  desktop/
    get-ticket-desktop-chrome-edge-v2.4.0.zip   # Computer (Chrome & Edge on Windows 11)
  checksums/
    SHA256SUMS.txt                              # File integrity checksums
  README.md                                     # This guide
```

---

## 1. Direct Download Links (GitHub)

| Your Device | Download File | Direct GitHub Download Link | Expected Size |
| --- | --- | --- | --- |
| **Android Mobile (Kiwi Browser)** | `get-ticket-android-kiwi-v2.4.0.zip` | <https://github.com/rknz/geticket/raw/main/releases/android/get-ticket-android-kiwi-v2.4.0.zip> | ~142.7 KB (`142,740` bytes) |
| **Computer (Chrome / Edge)** | `get-ticket-desktop-chrome-edge-v2.4.0.zip` | <https://github.com/rknz/geticket/raw/main/releases/desktop/get-ticket-desktop-chrome-edge-v2.4.0.zip> | ~142.7 KB (`142,700` bytes) |
| **Integrity Checksums** | `SHA256SUMS.txt` | <https://github.com/rknz/geticket/raw/main/releases/checksums/SHA256SUMS.txt> | 209 bytes |

---

## 2. What to Look For During Download

Before installing, verify these four things:

1. **Right file for your device:**
   - On **Android**, make sure the filename contains **`android-kiwi`** (`get-ticket-android-kiwi-v2.4.0.zip`).
   - On **Computer**, make sure the filename contains **`desktop-chrome-edge`** (`get-ticket-desktop-chrome-edge-v2.4.0.zip`).
2. **File extension is `.zip` (not `.html`):**
   - If you click a file page on GitHub instead of the direct download link above, click the **Download raw file** button (top-right of the GitHub preview) so you download the real `.zip` archive (~133 KB), not a small webpage.
3. **Do NOT extract on Android / DO extract on Computer:**
   - **Android (Kiwi Browser):** Keep `get-ticket-android-kiwi-v2.4.0.zip` as a `.zip` file. Kiwi loads `.zip` directly.
   - **Computer (Chrome & Edge):** Extract `get-ticket-desktop-chrome-edge-v2.4.0.zip` into a permanent folder and verify `manifest.json` is directly inside that folder.
4. **Optional SHA-256 verification:**
   - `get-ticket-desktop-chrome-edge-v2.4.0.zip`:
     `f91ebbe7aacf0cf2b2261603db9d94986bc036db35f11d3008aa2a307e8a3c62`
   - `get-ticket-android-kiwi-v2.4.0.zip`:
     `f995c2e8e6216ab8739c014c85787c95a3346a606e3e3c7fd07518bfa03dac2b`
   - On Windows PowerShell you can check with:
     ```powershell
     Get-FileHash -Algorithm SHA256 .\get-ticket-desktop-chrome-edge-v2.4.0.zip
     ```

---

## 3. Quick Installation & Usage

### Computer (Google Chrome & Microsoft Edge)
1. Extract `get-ticket-desktop-chrome-edge-v2.4.0.zip` to a permanent folder (e.g., `C:\Extensions\get-ticket-desktop\`).
2. Open `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge).
3. Turn **ON** **Developer mode**.
4. Click **Load unpacked** and select the extracted folder (containing `manifest.json`).
5. Pin **Get Ticket (Desktop)** to the toolbar and click it → **Open Dashboard**.

### Mobile (Kiwi Browser on Android)
1. Install **Kiwi Browser** on Android and download `get-ticket-android-kiwi-v2.4.0.zip` (do not extract).
2. Open Kiwi → tap **`⋮`** → **Extensions** → turn **ON** **Developer mode**.
3. Tap **+ (from .zip/.crx/.user.js)** → select `get-ticket-android-kiwi-v2.4.0.zip`.
4. Open via **`⋮`** → **Get Ticket (Kiwi Android)** → **Open Dashboard**.

### Using Get Ticket (Current Live Functionality)
1. **Create a Journey Profile (`New Journey`):** Enter From, To, Date of Journey, Priority 1 Class, Passengers (`1–3`), Outbound/Return leg, and your configurable release reminder time.
2. **Rank Preferences (`Preferences`):** Reorder travel classes, set outbound/return seat preferences, and optionally enable the unverified `SEAT-001` (`1–30 / 31+`) tentative sort (`Tentative owner preference — not verified`).
3. **Use Release Reminders (`Monitoring`):** View your advance-sale reminder date/time and browser lifecycle notices.
4. **Book Safely (`Results` → `Open Official e-Ticket Site`):** Opens `https://eticket.railway.gov.bd/` so you complete **Login → Search → Select → CAPTCHA / OTP → Pay** manually.
5. **Language & Theme (`Settings`):** Switch between **বাংলা (Bangla)** / **English** and **System / Light / Dark**.

For full details, permissions, and troubleshooting, see [`docs/INSTALLATION_GUIDE_CHROME_EDGE_KIWI.md`](../docs/INSTALLATION_GUIDE_CHROME_EDGE_KIWI.md).
