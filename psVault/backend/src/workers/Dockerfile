FROM node:18-alpine

WORKDIR /app

RUN npm install -g pm2

COPY package*.json ./
RUN npm install --production

COPY . .

CMD ["pm2-runtime", "src/workers/ecosystem.config.cjs"]
