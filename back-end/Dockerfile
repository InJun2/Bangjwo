# Step 1: Build Stage
FROM gradle:7.6-jdk17 AS builder
WORKDIR /app
COPY . .
RUN gradle clean build -x test

# Step 2: Runtime Stage
FROM openjdk:17-jdk-slim
WORKDIR /app

# Install curl
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# APM Agent 추가
COPY elastic-apm-agent-1.53.0.jar /elastic-apm-agent.jar

# 애플리케이션 JAR 복사
COPY --from=builder /app/build/libs/bangjwo-0.0.1-SNAPSHOT.jar app.jar

# Run Application with APM agent
ENTRYPOINT ["java", "-javaagent:/elastic-apm-agent.jar", "-Delastic.apm.service_name=bangjwo-app", "-Delastic.apm.server_url=http://apm-server:8200", "-Delastic.apm.environment=production", "-Delastic.apm.application_packages=com.bangjwo", "-jar", "app.jar"]

