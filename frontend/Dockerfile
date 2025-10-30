FROM node:20-slim

WORKDIR /app

# Freshly Install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Expo / Metro ports
EXPOSE 19000 19001 8081

CMD ["npx", "expo", "start", "--tunnel"]
