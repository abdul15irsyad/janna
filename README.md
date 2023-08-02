# Janna

Nest JS Boilerplate

## Tech Stack

- `PostgreSQL`
- `TypeORM`
- `GraphQL` & `REST`
- `Redis` (Caching)
- `I18n` (Translation)

## Installing

1. clone repository

   ```bash
   git clone git@github.com:abdul15irsyad/janna.git
   ```

2. install dependencies with `yarn` (or package manager that you used)

   ```bash
   cd janna
   yarn install
   ```

3. configure environment, copy from `.env.example` to `.env` and adjust to your setup (database, redis, SMTP, etc)

   ```bash
   cp .env.example .env
   ```

4. create database based on `DB_NAME` in `.env` file

5. running `migration` and default `seeder`

   ```bash
   yarn migrate:run && yarn seed:all
   ```

6. start application
   ```bash
   yarn start
   ```
   or with `development` mode
   ```bash
   yarn start:dev
   ```

## Running with docker compose

try running the application with docker compose

```bash
docker compose up -d
```

#### "Hope it is useful" :-)
