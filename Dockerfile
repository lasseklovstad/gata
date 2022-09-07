FROM maven:3.6-openjdk-17 AS build
COPY gata-frontend /usr/src/app/gata-frontend
COPY src /usr/src/app/src
COPY pom.xml /usr/src/app

RUN mvn -f /usr/src/app/pom.xml clean package -DskipTests


FROM gcr.io/distroless/java17-debian11
COPY --from=build /usr/src/app/target/web-0.0.1-SNAPSHOT.jar /usr/app/web-0.0.1-SNAPSHOT.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/usr/app/web-0.0.1-SNAPSHOT.jar"]
