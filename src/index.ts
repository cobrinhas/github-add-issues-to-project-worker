import { Env, fromEnv } from './config';
import { IssueId, IssueState, IssueVisibility, ProjectInfo } from './data';
import { assigneeTo, createdBy } from './issues';
import { getProjectByNumber, addIssues2Project } from './projects';

export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext
	): Promise<void> {
		const config = fromEnv(env);

		const allOpenIssues: IssueId[] = await getAllIssues(
			config.githubAccessToken,
			config.githubProjectOwnerUsername,
			config.queryPageSize
		);

		const projectInfo: ProjectInfo = await getProjectByNumber(
			config.githubAccessToken,
			config.githubProjectOwnerUsername,
			config.githubProjectNumber,
			config.queryPageSize
		);

		const projectIssuesIds = projectInfo.issues;

		const issues2Add = [
			...new Set(allOpenIssues.filter((x) => !projectIssuesIds.includes(x)))
		];

		return addIssues2Project(
			config.githubAccessToken,
			config.githubProjectOwnerUsername,
			projectInfo.id,
			issues2Add.map((x) => x)
		).then();
	}
};

async function getAllIssues(
	githubAccessToken: string,
	githubUsername: string,
	queryPageSize: number
): Promise<IssueId[]> {
	const createdByResult: IssueId[] = await createdBy(
		githubAccessToken,
		githubUsername,
		IssueState.Open,
		IssueVisibility.Public,
		queryPageSize
	);

	const assigneeToResult: IssueId[] = await assigneeTo(
		githubAccessToken,
		githubUsername,
		IssueState.Open,
		IssueVisibility.Public,
		queryPageSize
	);

	return createdByResult.concat(assigneeToResult);
}
