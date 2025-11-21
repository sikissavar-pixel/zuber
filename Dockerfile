FROM node:20-alpine
WORKDIR /app

# Copy application backend into image (avoid submodule issues)
COPY app_backend ./app_backend

WORKDIR /app/app_backend
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "start"]