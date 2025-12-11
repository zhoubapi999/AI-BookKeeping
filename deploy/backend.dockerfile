FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter backend build

FROM base AS runner
WORKDIR /app

# Copy necessary files
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json

EXPOSE 34863

# Ensure data directory exists
RUN mkdir -p /app/data

CMD ["node", "backend/dist/main"]
