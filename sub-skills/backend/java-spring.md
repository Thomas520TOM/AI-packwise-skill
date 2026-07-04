# Java/Spring Boot Build Sub-Skill

Build and package Java backend services using Spring Boot, Quarkus, or Micronaut.

**Current version**: Java 21 LTS / 22 / Spring Boot 3.5.x / Quarkus 3.37.x / Micronaut 5.x (2025-2026)

## When to Use

- Enterprise backend services
- REST APIs / GraphQL APIs
- Microservices architecture
- Team has Java/Kotlin experience
- Need mature ecosystem (Spring ecosystem)

## Spring Boot Build

### Maven Build

```bash
# Clean + package
mvn clean package -DskipTests
# Output: target/myapp-1.0.0.jar

# Run
java -jar target/myapp-1.0.0.jar

# Build with specific profile
mvn clean package -Pproduction
```

### Gradle Build

```bash
./gradlew clean build -x test
# Output: build/libs/myapp-1.0.0.jar

# Run
java -jar build/libs/myapp-1.0.0.jar
```

### Fat JAR vs Thin JAR

| Type | Size | Startup | Best For |
|------|------|---------|----------|
| Fat JAR (default) | 50–200MB | Standard | Simple deployment, Docker |
| Thin JAR | < 10MB | Faster (dependencies cached) | Multiple services sharing deps |
| Native Image (GraalVM) | 30–80MB | Ultra fast (< 1s) | Serverless, CLI, microservices |

### GraalVM Native Image

```bash
# Install GraalVM
sdk install java 21.0.2-graal

# Maven plugin (in pom.xml):
# <plugin>
#   <groupId>org.graalvm.buildtools</groupId>
#   <artifactId>native-maven-plugin</artifactId>
# </plugin>

mvn -Pnative native:compile
# Output: target/myapp (native binary, no JVM required)
```

## Docker

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app
COPY pom.xml .
COPY src/ src/
RUN apt-get update && apt-get install -y maven && mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```dockerfile
# GraalVM native image Docker (smaller, faster)
FROM ghcr.io/graalvm/native-image-community:21 AS builder
WORKDIR /app
COPY target/myapp .
RUN native-image --static -o myapp-native myapp

FROM debian:bookworm-slim
COPY --from=builder /app/myapp-native /myapp
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
EXPOSE 8080
CMD ["/myapp"]
```

## jpackage (Native Installers for Java Desktop/CLI Apps)

`jpackage` is a JDK 14+ tool that creates native platform installers from JAR files — no JVM required on the target machine.

```bash
# Prerequisites: JDK 17+ with jpackage (included in JDK 14+)

# 1. Build fat JAR first
mvn clean package -DskipTests

# 2. Create native installer
# Windows (.exe / .msi)
jpackage --type exe \
  --input target/ \
  --main-jar myapp-1.0.0.jar \
  --main-class com.example.Main \
  --name MyApp \
  --app-version 1.0.0 \
  --icon src/main/resources/icon.ico \
  --win-shortcut \
  --win-menu

# macOS (.pkg / .dmg)
jpackage --type dmg \
  --input target/ \
  --main-jar myapp-1.0.0.jar \
  --main-class com.example.Main \
  --name MyApp \
  --app-version 1.0.0 \
  --icon src/main/resources/icon.icns \
  --mac-package-identifier com.example.myapp

# Linux (.deb / .rpm)
jpackage --type deb \
  --input target/ \
  --main-jar myapp-1.0.0.jar \
  --main-class com.example.Main \
  --name MyApp \
  --app-version 1.0.0 \
  --icon src/main/resources/icon.png \
  --linux-shortcut
```

### jpackage vs Docker vs GraalVM Native Image

| Approach | Output | JVM Required? | Size | Startup | Best For |
|----------|--------|--------------|------|---------|----------|
| jpackage | .exe/.msi/.dmg/.deb/.rpm | No (bundled JRE) | 40-100MB | 1-3s | Desktop/CLI distribution to non-technical users |
| Docker | Container image | Yes (in container) | 100-300MB | 2-5s | Server deployment |
| GraalVM Native | Native binary | No | 30-80MB | < 1s | Serverless, CLI, microservices |
| Fat JAR | .jar file | Yes (user must install JDK) | 50-200MB | 2-8s | Developer tools, server deployment |

### jpackage with Spring Boot (Special Handling)

Spring Boot fat JARs have a nested JAR structure that `jpackage` doesn't handle well. Use the Spring Boot thin launcher or repack:

```xml
<!-- pom.xml — Use Spring Boot thin launcher -->
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <layout>ZIP</layout> <!-- Thin layout for jpackage compatibility -->
    </configuration>
</plugin>
```

```bash
# Build thin JAR + dependencies
mvn clean package -DskipTests

# jpackage with classpath
jpackage --type exe \
  --input target/ \
  --main-jar myapp-1.0.0.jar \
  --main-class org.springframework.boot.loader.launch.JarLauncher \
  --name MyApp \
  --app-version 1.0.0
```

### Common Pitfalls (jpackage)

| Issue | Fix |
|-------|-----|
| "jpackage not found" | Ensure JDK 17+ is installed (not JRE); `jpackage` is in `JAVA_HOME/bin` |
| Spring Boot JAR fails to launch | Use `layout: ZIP` in spring-boot-maven-plugin; or repack with `maven-shade-plugin` |
| Missing native libraries | Add `--java-options "-Djava.library.path=/app/libs"` |
| macOS notarization fails | Sign the .pkg with `codesign` before notarizing; jpackage doesn't auto-sign |
| Windows SmartScreen warning | Sign the .exe with EV/OV certificate after jpackage creates it |
| Large installer size | Use `--jlink-options "--strip-debug --compress zip-6"` to reduce bundled JRE size |
| Icon not showing | Ensure icon format is correct (.ico for Windows, .icns for macOS, .png for Linux) |

## Quarkus Build

```bash
# Create project (replace 3.37 with latest Quarkus version)
mvn io.quarkus.platform:quarkus-maven-plugin:3.37:create -DprojectGroupId=com.example -DprojectArtifactId=myapp

# JVM mode
mvn clean package
java -jar target/quarkus-run.jar

# Native mode (requires GraalVM)
mvn clean package -Pnative
./target/myapp
```

## Micronaut Build

```bash
# Create project
mn create-app com.example.myapp

# Build
./gradlew clean build

# Native image
./gradlew nativeCompile
# Output: build/native/nativeCompile/myapp
```

## Framework Comparison

| Feature | Spring Boot | Quarkus | Micronaut |
|---------|------------|---------|----------|
| Maturity | Most mature | Growing fast | Growing |
| Startup time | 2–8s (JVM), < 1s (native) | < 1s (native) | < 1s (native) |
| Memory | 200–500MB (JVM) | 30–80MB (native) | 30–80MB (native) |
| Native image | Supported (GraalVM) | First-class | First-class |
| Ecosystem | Largest (Spring) | Good (Vert.x-based) | Good (Netty-based) |
| Best for | Enterprise, large teams | Cloud-native, serverless | Microservices, serverless |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| JAR too large (> 200MB) | Exclude unused dependencies; use Spring Boot thin launcher |
| GraalVM reflection errors | Add `reflect-config.json`; use `@RegisterForReflection` (Quarkus) |
| Slow startup in containers | Use CDS (Class Data Sharing); consider native image |
| Port conflict | Set `server.port` in `application.properties` or `SERVER_PORT` env |
| Database connection pool exhausted | Configure HikariCP pool size; add connection timeout |
| Actuator endpoints not exposed | Add `management.endpoints.web.exposure.include=health,info` |
