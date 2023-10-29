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

		console.info(`Hello ${config.githubAccessToken}!`);

		await getAllIssues(config.githubAccessToken, 'rutesantos4').then(
			(result) => {
				console.log(`getAllIssues => ${result.length}`);
				for (let index = 0; index < result.length; index++) {
					const element = result[index];
					console.log(element);
				}
			}
		);

		return Promise.resolve();
	}
};

async function getAllIssues(
	githubAccessToken: string,
	user: string
): Promise<IssueInfo[]> {
	const createdByResult: IssueInfo[] = await createdBy(
		githubAccessToken ?? '',
		user,
		IssueState.Open
	);

	const assigneeToResult: IssueInfo[] = await assigneeTo(
		githubAccessToken ?? '',
		user,
		IssueState.Open
	);

	console.log(`createdBy => ${createdByResult.length}`);
	console.log(`assigneeTo => ${assigneeToResult.length}`);

	return createdByResult.concat(assigneeToResult);
}
