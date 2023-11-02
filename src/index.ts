import { GraphqlResponseError } from '@octokit/graphql';
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

		try {
			const allOpenIssues: IssueId[] = await getAllIssues(
				config.githubAccessToken,
				config.githubIssuesOwnerUsernames,
				config.queryPageSize
			);

			if (allOpenIssues.length == 0) {
				console.log('no open issues');
				return Promise.resolve();
			}

			const projectInfo: ProjectInfo = await getProjectByNumber(
				config.githubAccessToken,
				config.githubProjectOwnerUsername,
				config.githubProjectNumber,
				config.queryPageSize
			);

			const projectIssuesIds: IssueId[] = projectInfo.issues;

			const issues2Add: IssueId[] = [
				...new Set(allOpenIssues.filter((x) => !projectIssuesIds.includes(x)))
			];

			if (issues2Add.length == 0) {
				console.log('no open issues to be added');
				return Promise.resolve();
			}

			return await addIssues2Project(
				config.githubAccessToken,
				config.githubProjectOwnerUsername,
				projectInfo.id,
				issues2Add
			).then();
		} catch (error) {
			console.error(error);
		}
	}
};

async function getAllIssues(
	githubAccessToken: string,
	githubIssuesOwnerUsernames: string[],
	queryPageSize: number
): Promise<IssueId[]> {
	const createdByResult: IssueId[] = await createdBy(
		githubAccessToken,
		githubIssuesOwnerUsernames,
		IssueState.Open,
		IssueVisibility.Public,
		queryPageSize
	);

	const assigneeToResult: IssueId[] = await assigneeTo(
		githubAccessToken,
		githubIssuesOwnerUsernames,
		IssueState.Open,
		IssueVisibility.Public,
		queryPageSize
	);

	return createdByResult.concat(assigneeToResult);
}
