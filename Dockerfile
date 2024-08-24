# Stage 1: Build the application
FROM node:18 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the build output and package.json from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]

