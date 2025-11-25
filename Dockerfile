# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Run Stage
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/.env.template ./.env.template
COPY --from=build /app/package.json ./package.json

EXPOSE 3000


ENV PORT=3000
ENV NODE_ENV=production


CMD ["npm", "start"]
