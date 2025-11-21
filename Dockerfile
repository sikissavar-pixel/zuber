FROM node:20-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY backend .
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "run", "start"]