# Local development
Run local db: 
``docker run --name gata-db-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:14.2``

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

# Apply Database change
``
mvn clean install -DskipTests
mvn liquibase:update
``
eller bare start backend :P

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
dokku postgres:export gatadatabase > /tmp/gatadatabase-1.export
scp root@gataersamla.no:/tmp/gatadatabase-1.export C:\pg_dump

# Delete existing backups on server
ls /tmp
rm -rf /tmp/gatadatabase*.export

# Upload from local machine and apply backup
scp C:\pg_dump\gatadatabase-1.export root@gataersamla.no:/tmp
dokku postgres:import gatadatabase < /tmp/gatadatabase-1.export

# restore backup to local database for development
pg_restore -h localhost -d postgres -U postgres gatadatabase-1.export
````



