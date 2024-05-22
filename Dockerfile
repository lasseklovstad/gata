FROM maven:3.9.6-eclipse-temurin-21-alpine AS build-backend
ENV HOME=/usr/src/app
COPY src $HOME/src
COPY pom.xml $HOME

RUN --mount=type=cache,target=/root/.m2 mvn -f $HOME/pom.xml clean package -DskipTests

FROM eclipse-temurin:21.0.3_9-jdk-alpine as stage
ENV HOME=/usr/src/app
RUN mkdir -p application
WORKDIR application
COPY --from=build-backend $HOME/target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM eclipse-temurin:21.0.3_9-jdk-alpine
WORKDIR application
COPY --from=stage application/dependencies/ ./
COPY --from=stage application/spring-boot-loader/ ./
COPY --from=stage application/snapshot-dependencies/ ./
COPY --from=stage application/application/ ./

EXPOSE 8080

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]


