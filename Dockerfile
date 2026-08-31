# Multi-Stage Production Dockerfile for LifeStream Enterprise V4.0
FROM node:20-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
COPY --from=builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
