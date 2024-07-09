# Local test docker image

`docker build --tag 'gata-app' .`
`docker run --env-file ./.env -d -p 127.0.0.1:3000:3000 gata-app`

# Run e2e tests local
1. Delete sqlite.db file
3. Ensure `NODE_ENV` set to production in `.env` file and all other variables are set
2. run `npm run db:migrate`
3. Start app `npm run dev`
4. Start tests `npx playwright test`

# Autentisering med Auth0

Google app er registrert her: https://console.cloud.google.com/
Facebook app er registrert her: https://developers.facebook.com/apps/406253220837238/settings/basic/

Administrer Auth0 her https://manage.auth0.com/ og log inn med github konto.

Domene er registrert på domeneshop: https://domene.shop/admin

## Fly 
### Config
[See config at](https://fly.io/docs/reference/configuration/)
## Setup
````bash
fly login
fly status
## Create volume where sqlite db is persisted
fly volumes create data
## Configure fly app
fly launch --no-deploy
## Deploy fly app
fly deploy

# https://fly.io/docs/networking/custom-domain/
## Add domains
fly certs add gataersamla.no
fly certs add www.gataersamla.no
```


### Fly columes and database
```bash
# Get database file from production
fly sftp get /data/sqlite.db db-backups/sqlite_09_07_2024_prod.db
# Connect to sftp shell and upload dump file
fly sftp shell
cd tmp
put dump.sql
# Connect via ssh to run sql
apt update
apt upgrade
apt install sqlite3
sqlite3 /data/sqlite.db < dump.sql
CTRL+D to quit ssh
```

### Secrets
```bash
fly secrets set NAME="VALUE" NAME="VALUE"
```

## Test in webkit browser locally on windows
`npm run launch:webkit` launches a webkit browser for testing locally safari issues.