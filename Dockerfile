FROM node:16 AS build-frontend
ENV HOME=/usr/src/app
WORKDIR $HOME
COPY ./gata-frontend/package*.json ./
RUN npm i
# Bundle app source
COPY ./gata-frontend .

ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_AUDIENCE

ENV VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}
ENV VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN}
ENV VITE_AUTH0_AUDIENCE=${VITE_AUTH0_AUDIENCE}
RUN npm run build

FROM maven:3.8-openjdk-17 AS build-backend
ENV HOME=/usr/src/app
COPY src $HOME/src
COPY pom.xml $HOME

RUN --mount=type=cache,target=/root/.m2 mvn -f $HOME/pom.xml clean package -DskipTests

FROM openjdk:17-jdk-alpine as stage
ENV HOME=/usr/src/app
RUN mkdir -p application
WORKDIR application
COPY --from=build-backend $HOME/target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM gcr.io/distroless/java17-debian11
WORKDIR application
COPY --from=stage application/dependencies/ ./
COPY --from=stage application/spring-boot-loader/ ./
COPY --from=stage application/snapshot-dependencies/ ./
COPY --from=stage application/application/ ./
COPY --from=build-frontend /usr/src/app/build BOOT-INF/classes/public

EXPOSE 8080

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]


