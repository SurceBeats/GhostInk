import os
import json
import time
import bcrypt
import secrets
import asyncio
import configparser

from datetime import datetime, timezone
from urllib.parse import urlparse, urljoin

from flask import Flask, render_template, send_from_directory, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from hypercorn.asyncio import serve
from hypercorn.config import Config
from hypercorn.middleware import AsyncioWSGIMiddleware
from vite_fusion import register_vite_assets

RUN = "PROD"  # "DEV" / "PROD"
PORT = 12500
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INI_PATH = os.path.join(_BASE_DIR, "ghostink.ini")
STASH_PATH = os.path.join(_BASE_DIR, "stash.json")

app = Flask(__name__)

app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = RUN == "PROD"


# INI Helpers
def _read_ini():
    cfg = configparser.ConfigParser()
    cfg.read(INI_PATH)
    return cfg


def _write_ini(cfg):
    with open(INI_PATH, "w") as f:
        cfg.write(f)
    os.chmod(INI_PATH, 0o600)


def _ensure_secret_key():
    cfg = _read_ini()
    if not cfg.has_section("app"):
        cfg.add_section("app")
    if not cfg.get("app", "secret_key", fallback=None):
        cfg.set("app", "secret_key", secrets.token_hex(32))
        _write_ini(cfg)
    app.secret_key = cfg.get("app", "secret_key")


def _user_exists():
    cfg = _read_ini()
    return bool(cfg.get("auth", "username", fallback=None))


def _is_safe_redirect(target):
    ref = urlparse(request.host_url)
    test = urlparse(urljoin(request.host_url, target))
    return test.scheme in ("http", "https") and ref.netloc == test.netloc


# Rate Limiter (IP - mem)
_login_attempts = {}
RATE_LIMIT_MAX = 5
RATE_LIMIT_WINDOW_SECS = 60


def _is_rate_limited(ip):
    now = time.time()
    attempts = _login_attempts.get(ip, [])
    attempts = [t for t in attempts if now - t < RATE_LIMIT_WINDOW_SECS]
    _login_attempts[ip] = attempts
    return len(attempts) >= RATE_LIMIT_MAX


def _record_attempt(ip):
    _login_attempts.setdefault(ip, []).append(time.time())


# Stash helpers
def _read_stash():
    if not os.path.exists(STASH_PATH):
        return []
    with open(STASH_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_stash(data):
    with open(STASH_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.chmod(STASH_PATH, 0o600)


_ensure_secret_key()

# Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"


class User(UserMixin):
    def __init__(self, username):
        self.id = username


@login_manager.user_loader
def load_user(user_id):
    cfg = _read_ini()
    stored = cfg.get("auth", "username", fallback=None)
    if stored and stored == user_id:
        return User(stored)
    return None


# Vite-Fusion Assets
register_vite_assets(
    app,
    dev_mode=(RUN == "DEV"),
    dev_server_url="http://localhost:5174",
    dist_path="/src/dist",
    manifest_path="src/dist/.vite/manifest.json",
)


# /setup if no user
@app.before_request
def check_setup():
    allowed = ("setup", "login", "static", "send_src_static", "send_src_dist")
    if not _user_exists() and request.endpoint not in allowed:
        return redirect(url_for("setup"))


@app.after_request
def security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if RUN == "PROD":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# Atuh
@app.route("/setup", methods=["GET", "POST"])
def setup():
    if _user_exists():
        return redirect(url_for("login"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        confirm = request.form.get("confirm", "")

        if not username:
            flash("Username is required.", "error")
            return redirect(url_for("setup"))
        if len(password) < 4:
            flash("Password must be at least 4 characters.", "error")
            return redirect(url_for("setup"))
        if password != confirm:
            flash("Passwords do not match.", "error")
            return redirect(url_for("setup"))

        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

        cfg = _read_ini()
        if not cfg.has_section("auth"):
            cfg.add_section("auth")
        cfg.set("auth", "username", username)
        cfg.set("auth", "password_hash", hashed)
        _write_ini(cfg)

        flash("Account created. Please log in.", "success")
        return redirect(url_for("login"))

    return render_template("setup.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if not _user_exists():
        return redirect(url_for("setup"))

    if current_user.is_authenticated:
        return redirect(url_for("index"))

    if request.method == "POST":
        ip = request.remote_addr
        if _is_rate_limited(ip):
            flash("Too many login attempts. Try again in a minute.", "error")
            return redirect(url_for("login"))

        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        cfg = _read_ini()
        stored_user = cfg.get("auth", "username", fallback=None)
        stored_hash = cfg.get("auth", "password_hash", fallback="")

        if username == stored_user and bcrypt.checkpw(password.encode(), stored_hash.encode()):
            login_user(User(username))
            next_page = request.args.get("next")
            if next_page and _is_safe_redirect(next_page):
                return redirect(next_page)
            return redirect(url_for("index"))

        _record_attempt(ip)
        flash("Invalid username or password.", "error")
        return redirect(url_for("login"))

    return render_template("login.html")


@app.route("/account", methods=["POST"])
@login_required
def account():
    data = request.get_json(silent=True) or {}
    new_username = data.get("username", "").strip()
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    cfg = _read_ini()
    stored_hash = cfg.get("auth", "password_hash", fallback="")

    if not bcrypt.checkpw(current_password.encode(), stored_hash.encode()):
        return jsonify({"ok": False, "msg": "Current password is incorrect."}), 400

    if new_username:
        cfg.set("auth", "username", new_username)

    if new_password:
        if len(new_password) < 4:
            return jsonify({"ok": False, "msg": "New password must be at least 4 characters."}), 400
        if new_password != confirm_password:
            return jsonify({"ok": False, "msg": "New passwords do not match."}), 400
        cfg.set("auth", "password_hash", bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode())

    _write_ini(cfg)

    if new_username:
        login_user(User(new_username))

    return jsonify({"ok": True, "msg": "Account updated.", "username": cfg.get("auth", "username")})


@app.route("/stash", methods=["GET"])
@login_required
def stash_list():
    return jsonify(_read_stash())


@app.route("/stash", methods=["POST"])
@login_required
def stash_add():
    data = request.get_json(silent=True) or {}
    label = data.get("label", "").strip()
    emoji = data.get("emoji", "")
    if not label or not emoji:
        return jsonify({"ok": False, "msg": "Label and emoji are required."}), 400
    entry = {
        "id": secrets.token_hex(6),
        "label": label,
        "emoji": emoji,
        "created": datetime.now(timezone.utc).isoformat(),
    }
    stash = _read_stash()
    stash.append(entry)
    _write_stash(stash)
    return jsonify(entry), 201


@app.route("/stash/<entry_id>", methods=["DELETE"])
@login_required
def stash_delete(entry_id):
    stash = _read_stash()
    stash = [e for e in stash if e["id"] != entry_id]
    _write_stash(stash)
    return jsonify({"ok": True})


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))


# /dist routes
@app.route("/src/static/<path:path>")
def send_src_static(path):
    return send_from_directory(os.path.join(app.root_path, "src", "static"), path)


@app.route("/src/dist/<path:path>")
def send_src_dist(path):
    return send_from_directory(os.path.join(app.root_path, "src", "dist"), path)


# Main app routes
@app.route("/")
@login_required
def index():
    return render_template("index.html", dev_mode=(RUN == "DEV"), username=current_user.id)


if __name__ == "__main__":
    print(
        r"""
   ██████╗ ██╗  ██╗ ██████╗ ███████╗████████╗██╗███╗   ██╗██╗  ██╗
  ██╔════╝ ██║  ██║██╔═══██╗██╔════╝╚══██╔══╝██║████╗  ██║██║ ██╔╝
  ██║  ███╗███████║██║   ██║███████╗   ██║   ██║██╔██╗ ██║█████╔╝
  ██║   ██║██╔══██║██║   ██║╚════██║   ██║   ██║██║╚██╗██║██╔═██╗
  ╚██████╔╝██║  ██║╚██████╔╝███████║   ██║   ██║██║ ╚████║██║  ██╗
   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝

  Hide data in plain sight.

  Repo:     https://github.com/SurceBeats/GhostInk
  Twitter:  @SurceBeats
  Contact:  claudio@banshee.pro
"""
    )
    if RUN == "DEV":
        app.run(host="0.0.0.0", debug=True, port=PORT)
    else:
        hypercorn_config = Config()
        hypercorn_config.loglevel = "WARNING"
        hypercorn_config.include_server_header = False
        hypercorn_config.bind = [f"0.0.0.0:{PORT}"]

        async def ghostink_asgi(scope, receive, send):
            asgi = AsyncioWSGIMiddleware(app)
            await asgi(scope, receive, send)

        asyncio.run(serve(ghostink_asgi, hypercorn_config))
