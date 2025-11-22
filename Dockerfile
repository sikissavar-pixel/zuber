# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend ./frontend

WORKDIR /app/frontend

RUN npm install
RUN npm run build

# ---------- Production Stage ----------
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/frontend ./

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]