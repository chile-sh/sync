# Sync - [sync.chile.sh](https://sync.chile.sh)

Encrypted message sharing tool. No account required.

## Pre-requisites

- Node 12+ with Yarn
- Redis

## Clone & Install

```bash
git clone git@github.com:chile-sh/sync.git

cd sync && yarn
```

## Config

```bash
# Modify with your own env vars
cp .env.example .env
```

## Run

```bash
yarn start
```

## Deploy

```bash
# pm2 deploy {env} {command}
pm2 deploy production setup # if setting up a new instance
pm2 deploy production update
```

## Test

```bash
yarn test
```

# License

GNU General Public License v3.0
