# Local development
Run local db: 
``docker run --name gata-db-postgres -e POSTGRES_PASSWORD=password -d -p 5433:5432 postgres:14.2``

legg til env for java: AUTH0_CLIENT_ID=xxx;AUTH0_CLIENT_SECRET=xxx
## Local profile
Legg til profile dev to disable forcing https

#Deploy
#### Heroku (Old)
Add heroku remote ``heroku git:remote -a gataersamla`` and push to master of heroku: `git push heroku main`.
Get all remotes: ``git remote -v``
#### Deploy with github actions
``
 git push
``
# Database
## Apply Database change
``
mvn clean install -DskipTests
mvn liquibase:update
``

eller bare start backend :P

## Generate a changelog From Diffs Between a Database and Persistence Entities
Start med å endre ``diffChangeLogFile`` i `liquibase.properties` til riktig nummer.
Det kan være fordelaktig å hente ut databasen fra prod og starte docker databasen på riktig port.
Deretter kjør:
``
mvn clean install -DskipTests
mvn liquibase:diff
``
Legg til filen i ``db.changelog-master.xml``

## Generate changelog
``mvn liquibase:generateChangeLog``

# Domene
### domene.shop.no
20 epostpakker
TOTALPRIS: 210kr per år
https://domene.shop/pricelist
### syse
60kr (1år), 120kr (2år) en epost: 4kr/måned = 48kr/år 1 epost
TOTALPRIS: 168kr/år
SMTP: tornado.mail
### one.com
Har kjøpt opp syse, men er litt dyrere
99kr (1år), 189kr (2år) en epost: 0 kr (1år) , 100kr(2år) 5 eposter
TOTALPRIS: 289kr/år
### domene.no 
Prisen inkluderer epost, 5gb lagring,
SSL, backup, antivirus og spamfilter
79kr (1år), 369kr (2år)

### proisp
361,25kr/år

# Autentisering med Auth0
Google app er registrert her: https://console.cloud.google.com/
Facebook app er registrert her: https://developers.facebook.com/apps/406253220837238/settings/basic/

Administrer Auth0 her https://manage.auth0.com/ og log inn med github konto.

Domene er registrert på domeneshop: https://domene.shop/admin

# Dokku
````bash
ssh root@gataersamla.no
dokku apps:create gata
dokku config:set DB_HOST=...

dokku config:set --no-restart gata DOKKU_LETSENCRYPT_EMAIL=lasse.klovstad@gmail.com
dokku letsencrypt:enable gata
dokku letsencrypt:cron-job --add


docker exec "dokku.postgres.gatadatabase" su - postgres -c "dropdb gatadatabase"
docker exec "dokku.postgres.gatadatabase" su - postgres -c "createdb -E utf8  gatadatabase"
````

## Connect to db and creating backup
````bash
# General db commands
dokku postgres:info gatadatabase
dokku postgres:expose gatadatabase
dokku postgres:unexpose gatadatabase

# Create backup to local machine
dokku postgres:export gatadatabase > /tmp/gatadatabase-7.export
scp root@gataersamla.no:/tmp/gatadatabase-7.export C:\pg_dump

# Delete existing backups on server
ls /tmp
rm -rf /tmp/gatadatabase*.export

# Upload from local machine and apply backup
scp C:\pg_dump\gatadatabase-1.export root@gataersamla.no:/tmp
dokku postgres:import gatadatabase < /tmp/gatadatabase-1.export

# restore backup to local database for development
pg_restore -p 5433 -h localhost -d postgres -U postgres gatadatabase-7.export
````

## Max upload size nginx
```bash
dokku nginx:set gata client-max-body-size 50m
dokku proxy:build-config gata
```

# Docker compose
````bash
# run with custom env file for prod
docker compose --env-file ./.env.prod up --build -d


````

## Kotlin info
### Lambda
In Kotlin, lambda always goes in curly braces. https://medium.com/@s.badamestani/lambda-in-kotlin-a6fc055a2c88



