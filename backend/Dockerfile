# use the official Node image
# see all versions at https://hub.docker.com/_/node/tags
FROM node:20-alpine as base
WORKDIR /usr/src/app

# build the app
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
# copy all (non-ignored) project files into the image
COPY . .
ENV NODE_ENV=production
RUN pnpm exec nitro build --preset node-server

# copy production build into final image
FROM base AS release
COPY --from=build /usr/src/app/.output .
COPY --from=build /usr/src/app/db ./db

# run the app
USER node
EXPOSE 3000/tcp
ENTRYPOINT [ "node", "server/index.mjs" ]