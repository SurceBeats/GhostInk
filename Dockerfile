FROM python:3.11-slim

# Python env vars
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# WD
WORKDIR /app

# Python deps
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Node deps + build
COPY package.json package-lock.json* ./
RUN npm install
COPY . /app_build
RUN cd /app_build && cp -r /app/node_modules . && npm run build

# Copy stuff
RUN mkdir -p /app_defaults && cp -r /app_build/* /app_defaults/ && rm -rf /app_build /app/node_modules

# Anti-entry-point
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Port
EXPOSE 12500

# Boo!
ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "app.py"]
