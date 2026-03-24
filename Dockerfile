FROM eclipse-temurin:21-jdk

# Install Node.js 22
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs

WORKDIR /app
COPY . .

# Build React Frontend
WORKDIR /app/chaos-dashboard
RUN npm install
RUN npm run build

# Build Java Backend
WORKDIR /app
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Setup Node Middleman
WORKDIR /app/tinyfish-chaos-agent
RUN npm install

# Expose Hugging Face Port
EXPOSE 7860

# Run the master startup script
WORKDIR /app
RUN chmod +x start.sh
CMD ["./start.sh"]