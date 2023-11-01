export interface Env {
	GITHUB_ACCESS_TOKEN: string;
	GITHUB_PROJECT_OWNER_USERNAME: string;
	GITHUB_ISSUES_OWNER_USERNAMES: string;
	GITHUB_PROJECT_NUMBER: string;
	QUERY_PAGE_SIZE: string;
}

export interface Config {
	githubAccessToken: string;
	githubProjectOwnerUsername: string;
	githubIssuesOwnerUsernames: string[];
	githubProjectNumber: number;
	queryPageSize: number;
}

const issuesOwnerUsernamesSeparator: string = ',';

export function fromEnv(env: Env): Config {
	return {
		githubAccessToken: env.GITHUB_ACCESS_TOKEN,
		githubProjectOwnerUsername: env.GITHUB_PROJECT_OWNER_USERNAME,
		githubIssuesOwnerUsernames: env.GITHUB_ISSUES_OWNER_USERNAMES.split(
			issuesOwnerUsernamesSeparator
		),
		githubProjectNumber: Number.parseInt(env.GITHUB_PROJECT_NUMBER),
		queryPageSize: Number.parseInt(env.QUERY_PAGE_SIZE ?? 10)
	};
}
