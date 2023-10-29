export interface Env {
	GITHUB_ACCESS_TOKEN: string;
	GITHUB_USERNAME: string;
	FIRST_N_ELEMENTS: string;
}

export interface Config {
	githubAccessToken: string;
	githubUsername: string;
	firstNElements: string;
}

export function fromEnv(env: Env): Config {
	return {
		githubAccessToken: env.GITHUB_ACCESS_TOKEN,
		githubUsername: env.GITHUB_USERNAME,
		firstNElements: env.FIRST_N_ELEMENTS
	};
}
