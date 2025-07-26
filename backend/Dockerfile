# 1. Basis-Image mit Java 21
FROM eclipse-temurin:21-jdk

# 2. Arbeitsverzeichnis setzen
WORKDIR /app

# 3. JAR ins Image kopieren (nutze Platzhalter)
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar

# 4. Port freigeben
EXPOSE 8080

# 5. Anwendung starten
ENTRYPOINT ["java", "-jar", "app.jar"]
