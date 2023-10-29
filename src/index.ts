import { Env, fromEnv } from './config';

export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext
	): Promise<void> {
		const config = fromEnv(env);

		console.info(`Hello ${config.githubAccessToken}!`);

		return Promise.resolve();
	}
};
