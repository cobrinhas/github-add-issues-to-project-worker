import { Env, fromEnv } from './config';
import { IssueInfo, IssueState, IssueVisibility, ProjectInfo } from './data';
import { assigneeTo, createdBy } from './issues';
import { getProjectByNumber, addIssues2Project } from './projects';

export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext
	): Promise<void> {
		const config = fromEnv(env);

		console.info(`githubUsername: ${config.githubUsername}`);
		console.info(`queryPageSize: ${config.queryPageSize}`);

		const allOpenIssues: IssueInfo[] = await getAllIssues(
			config.githubAccessToken,
			config.githubUsername,
			config.queryPageSize
		);

		console.log(`getAllIssues => ${allOpenIssues.length}`);
		for (let index = 0; index < allOpenIssues.length; index++) {
			const element = allOpenIssues[index];
			console.log(element);
		}
		console.log(`\n\n`);

		const projectInfo: ProjectInfo = await getProjectByNumber(
			config.githubAccessToken,
			config.githubUsername,
			config.githubProjectNumber,
			config.queryPageSize
		);
		
		const projectIssuesIds = projectInfo.issues.map((x) => x.id)

		let issues2Add = allOpenIssues.filter(
			(x) => !projectIssuesIds.includes(x.id)
		);

		issues2Add = [...new Set(issues2Add)];

		const issuesAdded = await addIssues2Project(
			config.githubAccessToken,
			config.githubUsername,
			projectInfo.id,
			issues2Add.map((x) => x.id)
		);

		return Promise.resolve();
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
