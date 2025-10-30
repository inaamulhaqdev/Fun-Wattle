FROM node:lts-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 8000
EXPOSE 8888

CMD ["npx", "expo", "start", "--web", "--host", "lan", "--port", "8000"]