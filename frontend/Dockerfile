FROM node:20-slim

WORKDIR /

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install -g expo-cli
RUN npm install

# Copy source code
COPY . .

# Expose both web and dev client ports
EXPOSE 8000
EXPOSE 8888
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Start Expo with proper host binding
CMD ["npx", "expo", "start", "--web", "--host", "tunnel", "--port", "8000"]