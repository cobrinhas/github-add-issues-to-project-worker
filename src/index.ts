import { Env, fromEnv } from './config';
import { IssueInfo, IssueState } from './data';
import { assigneeTo, createdBy } from './issues';

export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext
	): Promise<void> {
		const config = fromEnv(env);

		console.info(`githubUsername: ${config.githubUsername}`);
		console.info(`firstNElements: ${config.firstNElements ?? '10'}`);

		await getAllIssues(
			config.githubAccessToken,
			config.githubUsername,
			config.firstNElements ?? '10'
		).then((result) => {
			console.log(`getAllIssues => ${result.length}`);
			for (let index = 0; index < result.length; index++) {
				const element = result[index];
				console.log(element);
			}
		});

		return Promise.resolve();
	}
};

async function getAllIssues(
	githubAccessToken: string,
	githubUsername: string,
	firstNElements: string
): Promise<IssueInfo[]> {
	const createdByResult: IssueInfo[] = await createdBy(
		githubAccessToken ?? '',
		githubUsername,
		IssueState.Open,
		firstNElements
	);

	const assigneeToResult: IssueInfo[] = await assigneeTo(
		githubAccessToken ?? '',
		githubUsername,
		IssueState.Open,
		firstNElements
	);

	console.log(`createdBy => ${createdByResult.length}`);
	console.log(`assigneeTo => ${assigneeToResult.length}`);

	return createdByResult.concat(assigneeToResult);
}
