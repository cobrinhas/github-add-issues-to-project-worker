export interface Env {
	GITHUB_ACCESS_TOKEN: string;
	GITHUB_USERNAME: string;
	QUERY_PAGE_SIZE: string;
}

export interface Config {
	githubAccessToken: string;
	githubUsername: string;
	queryPageSize: number;
}

export function fromEnv(env: Env): Config {
	return {
		githubAccessToken: env.GITHUB_ACCESS_TOKEN,
		githubUsername: env.GITHUB_USERNAME,
		queryPageSize: Number.parseInt(env.QUERY_PAGE_SIZE ?? 10)
	};
}
