FROM node:24-bookworm-slim AS base

LABEL fly_launch_runtime="Remix"
RUN npm install -g pnpm

# Remix app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV APP_DATABASE_URL=/data/sqlite.db
ENV IMAGE_DIR=/data/images
ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA

FROM base AS production-deps
WORKDIR /app
ADD package.json pnpm-lock.yaml ./
RUN pnpm i --prod --frozen-lockfile


# Throw-away build stage to reduce size of final image
FROM base as build
ADD package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile
# Copy application code
COPY --link . .

# Mount the secret and set it as an environment variable and run the build
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
  export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
  pnpm build


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app/build /app/build
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/instrument.server.mjs /app/instrument.server.mjs
COPY --from=build /app/server.mjs /app/server.mjs
COPY --from=build /app/migrations /app/migrations

RUN mkdir /data
# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]