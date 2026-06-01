# Remote access with Tailscale

Goal: let the marathon app (running on this Mac) be reachable from your wife's
iPhone **anywhere** — not just on the home Wi-Fi — without exposing it to the
public internet.

## How it fits the existing setup

Nothing about the app changes. The stack stays exactly as it is:

```
iPhone  --(Tailscale encrypted tunnel)-->  this Mac :80 (Apache)  -->  127.0.0.1:8000 (FastAPI)
```

Apache's vhost already answers on *any* hostname (`ProxyPreserveHost On`,
default `*:80` vhost), so the moment Tailscale gives this Mac a name, that name
works on port 80 with no extra config.

Tailscale is **private by design**: only devices signed into *your* account can
reach the app, so — unlike a public AWS URL — no login screen is required.

> ⚠️ Tailscale only solves *remote access*. This Mac is still the server, so it
> must stay **awake and plugged in**. See "Keep the Mac awake" at the bottom.

---

## One-time setup

### Step 1 — Create a Tailscale account (free)

1. Go to <https://login.tailscale.com/start>.
2. Sign in with **Google** (use grahamtsinger@gmail.com). There's no separate
   Tailscale password — it rides on your Google login.
3. This creates your "tailnet" (your private network). The **Personal** plan is
   free: up to 100 devices / 3 users. We need 2 devices. Never hit a limit.

### Step 2 — Install Tailscale on this Mac (the server)

```bash
brew install --cask tailscale-app
```

This installs a `.pkg`, so it will ask for your **admin password**, and macOS
will ask you to **approve a system extension**:

- A dialog points you to **System Settings → General → Login Items & Extensions**
  (or **Privacy & Security**). Click **Allow** for Tailscale.

Then launch it:

```bash
open -a Tailscale
```

A Tailscale icon appears in the menu bar. Click it → **Log in…** → it opens a
browser → confirm with the same Google account from Step 1.

After login, the menu bar shows this Mac as connected. Verify from the terminal:

```bash
tailscale status
```

You'll see this Mac and its Tailscale IP (a `100.x.x.x` address) and its
MagicDNS name (something like `grahams-mbp.<tailnet>.ts.net`). Note both — that
name is what the phone will use.

> **This tailnet's actual values** (filled in after first connect):
> - Name: `grahams-mbp.tailb0586c.ts.net`
> - IP:   `100.81.246.118`

> The `tailscale` CLI lives at
> `/Applications/Tailscale.app/Contents/MacOS/Tailscale`. The cask symlinks it
> as `tailscale`; if `tailscale` isn't found, use the full path or add the
> symlink.

### Step 3 — Make sure Tailscale starts at login

The GUI app adds itself as a Login Item automatically, but confirm:

- **System Settings → General → Login Items & Extensions** → Tailscale should be
  listed under "Open at Login." This is what makes remote access survive reboots.

### Step 4 — Install Tailscale on the iPhone

1. App Store → search **Tailscale** → install.
2. Open it → **Sign in** with the **same Google account** (grahamtsinger@gmail.com).
   Both devices must be on the *same* account/tailnet.
3. Toggle the VPN **On** when prompted (iOS asks to add a VPN configuration —
   allow it). Tailscale runs quietly in the background; it is not a
   battery/data hog for a private app like this.

### Step 5 — Open the app from the iPhone

In Safari on the iPhone, go to (whichever Tailscale gave you in Step 2):

```
http://grahams-mbp.tailb0586c.ts.net
```

or the always-works fallback, the Tailscale IP:

```
http://100.81.246.118
```

No `:8000` and no `:80` needed — Apache serves it on port 80. With MagicDNS the
short name `http://grahams-mbp` may also work.

> Tip: have her add it to the iPhone Home Screen (Safari → Share → **Add to Home
> Screen**) so it behaves like an app icon.

---

## Optional: clean HTTPS URL (no "not secure" warning)

Plain `http://` works fine on a private tailnet, but if you want the lock icon
and a clean name, Tailscale can issue a real cert for this Mac for free:

1. In the admin console (<https://login.tailscale.com/admin/dns>) enable
   **MagicDNS** and **HTTPS Certificates** (both usually on by default).
2. Serve the app over HTTPS on the tailnet:
   ```bash
   tailscale serve --bg 80
   ```
   This puts the app at `https://grahams-mbp.<tailnet>.ts.net` (Tailscale
   terminates TLS and forwards to the local port 80 Apache is already on).
3. Stop serving with `tailscale serve --bg off` if you ever want to revert.

---

## Keep the Mac awake (required)

Tailscale gives remote access, but a sleeping Mac serves nothing. Prevent sleep
while on power:

```bash
# Never sleep the system while plugged in (display can still sleep):
sudo pmset -c sleep 0

# Also keep running with the lid closed (clamshell) — needs power adapter:
sudo pmset -c disablesleep 1   # toggle 0 to undo
```

Check current settings:

```bash
pmset -g custom
```

To undo all of this later: `sudo pmset -c sleep 5` (or your preferred minutes)
and `sudo pmset -c disablesleep 0`.

---

## Troubleshooting

- **Phone can't reach the app:** confirm both devices show in `tailscale status`
  on the Mac (or the admin console), and that the iPhone's Tailscale toggle is
  **On**. Try the `100.x.x.x` IP directly to rule out DNS.
- **Worked at home, not away:** that's the bug Tailscale fixes — if it only
  works at home, the phone is reaching the app over LAN, not Tailscale. Turn off
  Wi-Fi on the phone (use cellular) to truly test the tunnel.
- **App not responding at all (even on the Mac):** the app/Apache may be down —
  see `status.sh` / `startup.sh` in this folder. Tailscale doesn't start the app.
- **Reverting Tailscale entirely:** `tailscale down` to disconnect; uninstall the
  app via Finder or `brew uninstall --cask tailscale-app`.

---

## What this does NOT change

- The SQLite database stays on this Mac. **No data migration.**
- The daily iCloud backup (`deploy/backup_db.sh` via launchd) is unaffected.
- The app, Apache, and launchd setup are untouched.
