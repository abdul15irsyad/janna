# Stage 1: Build the NestJS application
FROM node:18.17.0-alpine as builder

ENV NODE_ENV build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# Stage 2: Build the image
FROM node:18.17.0-alpine as production

ENV NODE_ENV production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

EXPOSE 3000

CMD ["node", "dist/main"]
