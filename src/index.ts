import { Env, fromEnv } from './config';
import { IssueInfo, IssueState, IssueVisibility } from './data';
import { assigneeTo, createdBy } from './issues';
import { getProjectByNumber } from './projects';

export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext
	): Promise<void> {
		const config = fromEnv(env);

		console.info(`githubUsername: ${config.githubUsername}`);
		console.info(`queryPageSize: ${config.queryPageSize}`);

		await getAllIssues(
			config.githubAccessToken,
			config.githubUsername,
			config.queryPageSize
		).then((result) => {
			console.log(`getAllIssues => ${result.length}`);
			for (let index = 0; index < result.length; index++) {
				const element = result[index];
				console.log(element);
			}
		});

		return await getProjectByNumber(
			config.githubAccessToken,
			config.githubUsername,
			config.githubProjectNumber
		).then((result) => {
			console.log(result);
		});
	}
};

async function getAllIssues(
	githubAccessToken: string,
	githubUsername: string,
	queryPageSize: number
): Promise<IssueInfo[]> {
	const createdByResult: IssueInfo[] = await createdBy(
		githubAccessToken,
		githubUsername,
		IssueState.Open,
		IssueVisibility.Public,
		queryPageSize
	);

	const assigneeToResult: IssueInfo[] = await assigneeTo(
		githubAccessToken,
		githubUsername,
		IssueState.Open,
		IssueVisibility.Public,
		queryPageSize
	);

	console.log(`createdBy => ${createdByResult.length}`);
	console.log(`assigneeTo => ${assigneeToResult.length}`);

	return createdByResult.concat(assigneeToResult);
}
