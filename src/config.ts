export interface Env {
	GITHUB_ACCESS_TOKEN: string;
}

export interface Config {
	githubAccessToken: string;
}

export function fromEnv(env: Env): Config {
	return {
		githubAccessToken: env.GITHUB_ACCESS_TOKEN
	};
}
