# Stage 1: Build the application
FROM node:18 AS build
# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package.json package-lock.json ./

# Install application dependencies (force fresh fetch to avoid cached integrity issues)
RUN npm config set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 1000 \
    && npm config set fetch-retry-maxtimeout 60000 \
    && npm cache clean --force \
    && npm install --prefer-online --no-audit --progress=false
# Force mysql2 (MySQL 8 auth) and remove legacy mysql if present
RUN npm uninstall -s mysql || true && npm install -s mysql2

# Install pm2 globally
RUN npm install -g pm2

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 80 to the outside world
EXPOSE 3000
EXPOSE 80
# Command to start the application with pm2
#CMD ["pm2-runtime", "index.js", "--name", "backendapi"]
CMD ["pm2-runtime", "start", "index.js", "--name", "backendapi"]
