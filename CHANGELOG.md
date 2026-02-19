# Changelog

## 0.0.1: Initial Release

### Added

- Emoji steganography engine using Unicode Tag Characters (U+E0001–U+E007F)
- Encode panel with emoji picker and secret message input
- Decode panel with pre-built examples for quick testing
- Codepoint analysis viewer with color-coded breakdown (visible/hidden/cancel)
- Accent and special character normalization (e.g. a, e, n, ss, ae)
- Real-time normalization preview when input contains non-ASCII characters
- Collapsible "How does it work?" educational section with platform compatibility info
- Dark theme UI with responsive layout
- Copy to clipboard functionality
- Flask + vite-fusion + React 18 + TailwindCSS 3 stack
- Configurable RUN mode (DEV/PROD) and PORT in app.py
- Single-user authentication system (Flask-Login + bcrypt)
  - Onboarding page (`/setup`) on first run to create account
  - Login page (`/login`) with session management
  - Account modal to change username and password (auto-logout after changes)
  - Rate limiting on login (5 attempts per minute per IP)
- Stash system for saving encoded emojis
  - Save to Stash button in Encode panel with custom labels
  - Collapsible Stash list in Decode panel to load saved entries
  - Delete entries from stash
  - Persistent storage in `stash.json`
- Favicon (ghost emoji)

### Security

- bcrypt password hashing with auto-generated salt
- Flask secret key auto-generated and persisted in `ghostink.ini`
- Secure session cookies (HttpOnly, SameSite=Lax, Secure in prod)
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, HSTS in prod)
- Open redirect protection on login `next` parameter
- Restrictive file permissions (0600) on `ghostink.ini` and `stash.json`
- All API routes protected with `@login_required`
