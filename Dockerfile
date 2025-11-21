FROM node:20-alpine
WORKDIR /app

# Copy backend source first to ensure package.json is present in context
COPY backend ./backend

WORKDIR /app/backend
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "start"]