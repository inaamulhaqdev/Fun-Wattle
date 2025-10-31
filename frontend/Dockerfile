FROM node:20-slim

WORKDIR /

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Expo / Metro ports
EXPOSE 19000 19001 8081

CMD ["npx", "expo", "start", "--tunnel"]
