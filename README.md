# github-add-issues-to-project-worker

Scheduled Cloudflare Worker that all public issues created by an user to a projects user

---

This worker was bootstrapped using [worker brick](https://github.com/dart-pacotes/.brick) and configured with [wrangler](https://github.com/cloudflare/wrangler) CLI. You can install it via NPM: `npm install -g wrangler`

## Development

Run the local server via `npm run start`

Trigger an instant cronjob via `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"`

## Deploy

Setup worker environment variables with the following one-line:

```bash
IFS='='; ENV_FILE=.dev.vars; cat $ENV_FILE | while read line || [[ -n $line ]]; do read -ra envy <<< $line; wrangler secret put ${envy[0]} <<< ${envy[1]} ; done
```

Deploy to Cloudflare via `npm run deploy`

### Contact

This template was prepared by:

- João Freitas, @freitzzz
- Rute Santos, @rutesantos4

Contact us if you need help on your project!
