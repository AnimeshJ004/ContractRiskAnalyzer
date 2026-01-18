# --- Stage 1: Build React Frontend ---
FROM node:20 AS frontend-builder
WORKDIR /app/client

# Copy frontend dependency files
COPY client/package.json client/package-lock.json ./
RUN npm install

# Copy frontend source code and build
COPY client/ ./
RUN npm run build


# --- Stage 2: Build Spring Boot Backend ---
# CHANGE 1: Use a supported maven image
FROM maven:3.8.5-openjdk-17 AS backend-builder
WORKDIR /app

# Copy pom.xml and install dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy backend source code
COPY src ./src

# Copy React build to Spring Boot static resources
COPY --from=frontend-builder /app/client/dist ./src/main/resources/static

# Build the JAR file
RUN mvn clean package -DskipTests


# --- Stage 3: Run the Application ---
# CHANGE 2: Use Eclipse Temurin instead of the deprecated 'openjdk'
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy the JAR from the build stage
COPY --from=backend-builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]