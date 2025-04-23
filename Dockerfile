# FROM node:lts-slim AS base
 
# ENV PNPM_HOME="/pnpm"
# ENV PATH="$PNPM_HOME:$PATH"
# RUN corepack enable

# FROM base AS deps
# WORKDIR /app
# COPY package.json pnpm-lock.yaml ./
# RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
# RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --prod
 
# FROM base AS build
# WORKDIR /app
# COPY package.json pnpm-lock.yaml ./
# RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
# RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
# COPY . .
# RUN pnpm build
 
# FROM base
# WORKDIR /app
# COPY --from=deps /app/node_modules /app/node_modules
# COPY --from=build /app/dist /app/dist
# ENV NODE_ENV production


# EXPOSE 3000
# CMD ["pnpm", "start"]
FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS prod

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package*.json ./

RUN pnpm fetch --frozen-lockfile
RUN pnpm install --frozen-lockfile
RUN ls -l
COPY . /app

ENV NODE_ENV=production
RUN pnpm run build

FROM base
COPY --from=prod /app/node_modules /app/node_modules
COPY --from=prod /app/dist /app/dist
COPY --from=prod /app/package*.json /app
EXPOSE 3000
CMD [ "pnpm", "start" ]