# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY back_end ./back_end
COPY front_end ./front_end

# Create directories for logs and qr-codes
RUN mkdir -p back_end/logs back_end/qr-codes

# Set environment to production
ENV NODE_ENV=production

# Expose the application port
EXPOSE 5000

# Run the application
CMD ["node", "back_end/server.js"]
