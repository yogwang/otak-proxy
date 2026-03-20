<p align="center">
  <h1 align="center">otak-proxy</h1>
  <p align="center">One-click proxy management for VS Code, Git, npm, and integrated terminals.</p>
</p>

---

Toggle proxy settings from the status bar. Auto-sync with your system proxy or set one manually.

![otak-proxy](images/otak-proxy.png)

## Quick Start

### Auto Mode (System Proxy)

1. Install the extension.
2. Click the status bar and select **Auto**.
3. Done — it stays in sync with your system proxy.

### Manual Mode

1. Install the extension.
2. Click the status bar and select **Manual**.
3. Enter your proxy URL (for example: `http://proxy.example.com:8080`).

The extension updates VS Code, Git, and npm proxy settings, plus proxy environment variables for VS Code integrated terminals.

## Features

- **Three modes** — Off, Manual, or Auto (syncs with system proxy).
- **Status bar toggle** — One click to switch modes.
- **Per-target proxy control** — Enable or disable proxy independently for VS Code, Git, npm, and integrated terminals.
- **Auto-sync** — Detects system/browser proxy changes in real time.
- **Connection validation** — Tests proxy connectivity before enabling.
- **Integrated terminal env** — Sets HTTP(S)_PROXY for new VS Code terminals.
- **UI i18n** — English, Japanese, Chinese (Simplified), Chinese (Traditional, Taiwan), Korean, Vietnamese.

UI language follows your VS Code display language.

## How It Works

### Status Bar

Click the proxy indicator to cycle through modes:

```
Off → Manual → Auto → Off
```

### Status Indicators

- `Proxy: Off` — Disabled
- `Manual: http://...` — Using configured proxy
- `Auto: http://...` — Synced with system proxy
- `Auto (Fallback): http://...` — System unavailable, using manual
- `Auto: OFF` — Waiting for proxy availability

### Per-Target Proxy Control

By default, the proxy applies to all four targets: **VS Code**, **Git**, **npm**, and **Terminal**.

You can toggle individual targets:
- From the **status bar tooltip** — click a target name to enable/disable it.
- From the **Command Palette** — run `otak: Toggle VSCode/Git/npm/Terminal Proxy Target`.
- From **Settings** — set `otakProxy.targets.vscode`, `.git`, `.npm`, or `.terminal` to `false`.

When a target is disabled, its proxy configuration is automatically cleared.

### Integrated Terminal Environment

When proxy is enabled, otak-proxy injects the following variables into **newly created** VS Code integrated terminals:

- `HTTP_PROXY` / `HTTPS_PROXY`
- `http_proxy` / `https_proxy`

Existing terminals keep their current environment; reopen a terminal if you want the new values to apply.

## Configuration

```json
{
  "otakProxy.proxyUrl": "http://proxy.example.com:8080",
  "otakProxy.pollingInterval": 30,
  "otakProxy.enableFallback": true,
  "otakProxy.targets.vscode": true,
  "otakProxy.targets.git": true,
  "otakProxy.targets.npm": true,
  "otakProxy.targets.terminal": true
}
```

### Settings

- **`otakProxy.proxyUrl`**: Manual proxy URL (default: unset)
- **`otakProxy.pollingInterval`**: System proxy check interval in seconds (default: `30`)
- **`otakProxy.enableFallback`**: Fall back to manual when system unavailable (default: `true`)
- **`otakProxy.targets.vscode`**: Apply proxy to VS Code settings (default: `true`)
- **`otakProxy.targets.git`**: Apply proxy to Git global configuration (default: `true`)
- **`otakProxy.targets.npm`**: Apply proxy to npm configuration (default: `true`)
- **`otakProxy.targets.terminal`**: Inject proxy env variables into new integrated terminals (default: `true`)

## Commands

Access via the Command Palette (`Cmd/Ctrl+Shift+P`):

- `otak: Toggle Proxy`
- `otak: Test Proxy`
- `otak: Import System Proxy`
- `otak: Toggle VSCode Proxy Target`
- `otak: Toggle Git Proxy Target`
- `otak: Toggle npm Proxy Target`
- `otak: Toggle Terminal Proxy Target`

## Requirements

- VS Code 1.9.0 or higher
- Git (in PATH)

## Installation

1. Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-proxy).
2. Click the status bar and choose **Auto** or **Manual**.

## Security & Privacy

### Local Changes

- Updates VS Code, Git, and npm proxy settings.
- Sets HTTP(S)_PROXY environment variables for new integrated terminals.

### Credentials

- No account or API key is required.
- If your proxy requires credentials, include them in the URL you provide.

### Network Activity

- Connection validation checks reachability before enabling a proxy.

## Troubleshooting

- **Proxy not working**: Verify the URL includes `http://` or `https://` and run `Test Proxy`.
- **Git not detected**: Confirm Git is installed and available in PATH (`git --version`).
- **Auto mode not detecting changes**: Verify system proxy settings and adjust `otakProxy.pollingInterval`.

## Related Extensions

- **[otak-monitor](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-monitor)** — Real-time system monitoring in VS Code.
- **[otak-committer](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-committer)** — AI-assisted commit messages, pull requests, and issues.
- **[otak-restart](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-restart)** — Quick reload shortcuts.
- **[otak-clock](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-clock)** — Dual time zone clock for VS Code.
- **[otak-pomodoro](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-pomodoro)** — Pomodoro timer in VS Code.
- **[otak-zen](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-zen)** — Minimal, distraction-free VS Code UI.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- **[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=odangoo.otak-proxy)**
- **[GitHub](https://github.com/tsuyoshi-otake/otak-proxy)**
- **[Issues](https://github.com/tsuyoshi-otake/otak-proxy/issues)**
