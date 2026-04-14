FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install

COPY backend ./backend
RUN npm run build --workspace backend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 4000
CMD ["npm", "run", "start", "--workspace", "backend"]
