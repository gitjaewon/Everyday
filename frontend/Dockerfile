FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

EXPOSE 8081
CMD ["npx", "expo", "start", "--web", "--host", "lan", "--port", "8081"]
