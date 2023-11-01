# github-add-issues-to-project-worker

Scheduled Cloudflare Worker that all public issues created by an user to a projects user

---

## Why?

With the increase of repositories within different organizations, it became hard to keep up with all the issues we created. To simplify the management of our work, we decided to start using the GitHub Project, where we can display all our issues from different organizations in different views (table, board, etc).

The GitHub Project already has some automation to add to the projects the issues created within an organization, nevertheless, this is not a great fit since we want from multiple organizations.

We then had the idea to create a cron job that gets all the issues created or assigned to us and adds them to the project.

This worker was bootstrapped using [worker brick](https://github.com/dart-pacotes/.brick) and configured with [wrangler](https://github.com/cloudflare/wrangler) CLI. You can install it via NPM: `npm install -g wrangler`

## Hooks

This repository is configured with client-side Git hooks that automatically format + lint the codebase before each push. You can install it by running the following command:

```bash
./hooks/INSTALL
```

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
