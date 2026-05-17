# ── Stage 1: Build Vite app ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

COPY . .

# Accept runtime-injectable URLs as build args (defaults point to AKS ingress).
# Override in GitHub Actions via --build-arg.
ARG VITE_API_URL=https://api.loverace.app
ARG VITE_WS_URL=wss://api.loverace.app
ARG VITE_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
ARG VITE_DUMMY_DATA=false

ENV VITE_API_URL=$VITE_API_URL \
    VITE_WS_URL=$VITE_WS_URL \
    VITE_MAP_STYLE_URL=$VITE_MAP_STYLE_URL \
    VITE_DUMMY_DATA=$VITE_DUMMY_DATA

RUN npm run build
# RUN apt update && apt install -y nginx
# RUN cp -r dist/* /usr/share/nginx/html/


# ── Stage 2: Serve with nginx ──────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default config; copy ours
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built static assets
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy the assests/ folder so absolute-path references (/assests/...) resolve
COPY --from=builder /app/assests /usr/share/nginx/html/assests

# Non-root security hardening
RUN chown -R nginx:nginx /usr/share/nginx/html \
 && chown -R nginx:nginx /var/cache/nginx \
 && chown -R nginx:nginx /var/log/nginx \
 && touch /var/run/nginx.pid \
 && chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
