FROM node:18-alpine
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN apk add --no-cache bash
RUN corepack enable && pnpm install --frozen-lockfile

COPY tsconfig.json nest-cli.json ./
COPY . .

RUN pnpm build
CMD ["pnpm", "start"]
EXPOSE 3000
