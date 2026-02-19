<p align="center">
  <img src="public/GhostInk.png" alt="GhostInk" width="100%" />
</p>

<h1 align="center">GhostInk</h1>

<p align="center"><em>"Hide data in plain sight"</em></p>

Emoji steganography tool that hides secret text inside emojis using Unicode Tag Characters (U+E0001–U+E007F). The hidden data is completely invisible, the emoji looks identical to the original.

```
👻  +  secret message  =  👻  (with hidden data inside)
```

## How it works

Unicode defines a range of invisible characters called **Tag Characters** (U+E0001 to U+E007F). They take up zero visual space and are already used natively to create subdivision flags like Scotland and Wales.

GhostInk maps each character of your secret message to its corresponding tag character and appends them after any visible emoji. The result looks identical to the original emoji but carries hidden data.

## Features

- **Encode** : Pick an emoji, type a secret message, get an identical-looking emoji with hidden data
- **Decode** : Paste any suspicious emoji to extract hidden text
- **Stash** : Save encoded emojis with labels for later retrieval from the Decode panel
- **Codepoint analysis** : Color-coded breakdown of visible, hidden, and cancel tag characters
- **Accent normalization** : Automatically converts accented characters to ASCII equivalents
- **Pre-built examples** : Try decoding sample emojis to see it in action
- **Educational section** : Learn how tag characters work and which platforms preserve them
- **Authentication** : Single-user login system with onboarding, account management, and rate-limited login
- **Security** : bcrypt password hashing, secure session cookies, security headers, restrictive file permissions

## Platform compatibility

| Platform  | Status                   |
| --------- | ------------------------ |
| Twitter/X | Preserves tag characters |
| Signal    | Preserves tag characters |
| Email     | Preserves tag characters |
| WhatsApp  | May strip tag characters |
| Telegram  | Strips tag characters    |
| Discord   | Strips tag characters    |

## Stack

- **Backend**: [Flask](https://flask.palletsprojects.com/) + [Hypercorn](https://hypercorn.readthedocs.io/) + [Flask-Login](https://flask-login.readthedocs.io/) + [vite-fusion](https://github.com/BansheeTech/vite_fusion)
- **Frontend**: React 18 + TailwindCSS 3 + Vite

## Install (Docker)

```bash
git clone https://github.com/SurceBeats/GhostInk.git
cd GhostInk
docker compose up -d
```

Open `http://localhost:12500` and create your account.

Your data (`ghostink.ini`, `stash.json`) persists in `./ghostink_docker_volume`.

## Development

Configure `RUN` and `PORT` at the top of `app.py`:

```python
RUN = "DEV"       # "DEV" or "PROD"
PORT = 12500
```

```bash
pip install -r requirements.txt
npm install

# Build once first (generates manifest.json required by vite-fusion)
npm run build

# Terminal 1: Vite dev server
npm run dev

# Terminal 2: Flask server
python3 app.py
```

## License

[AGPL-3.0](LICENSE)

## Author

[SurceBeats](https://github.com/SurceBeats/)
