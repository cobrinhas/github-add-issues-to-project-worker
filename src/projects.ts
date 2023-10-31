import { GraphQlQueryResponseData, graphql } from '@octokit/graphql';
import { ProjectInfo, AddedIssueInfo } from './data';

export async function getProjectByNumber(
	githubToken: string,
	owner: string,
	projectNumber: number,
	queryPageSize: number
): Promise<ProjectInfo> {
	const projectInfo = async () => {
		const firstResult = await searchProjectByNumber(
			githubToken,
			owner,
			projectNumber,
			queryPageSize
		);

		if (!firstResult.user.projectV2.items.pageInfo.hasNextPage) {
			return ProjectInfo.fromJson(firstResult.user.projectV2);
		}

		const nodes = firstResult.user.projectV2.items.nodes;
		let continueSearch = true;
		let endCursor = `after: "${firstResult.user.projectV2.items.pageInfo.endCursor}"`;

		while (continueSearch) {
			const newResult = await searchProjectByNumber(
				githubToken,
				owner,
				projectNumber,
				queryPageSize,
				endCursor
			);

			nodes.push(...newResult.user.projectV2.items.nodes);

			continueSearch = newResult.user.projectV2.items.pageInfo.hasNextPage;

			endCursor = `after: "${newResult.user.projectV2.items.pageInfo.endCursor}"`;
		}

		return ProjectInfo.fromJson(firstResult.user.projectV2);
	};

	return projectInfo().then((result) => {
		result.issues = result.issues.filter((i) => Object.keys(i).length > 0);
		return result;
	});
}

export async function addIssues2Project(
	githubToken: string,
	owner: string,
	projectId: string,
	issuesId: string[]
): Promise<AddedIssueInfo[]> {
	let result: AddedIssueInfo[] = [];

	for (let index = 0; index < issuesId.length; index++) {
		const issueId = issuesId[index];
		const newAdded = await addIssue2Project(
			githubToken,
			owner,
			projectId,
			issueId
		);
		result = result.concat(newAdded.addProjectV2ItemById);
	}

	return result;
}

async function addIssue2Project(
	githubToken: string,
	owner: string,
	projectId: string,
	issueId: string
): Promise<GraphQlQueryResponseData> {
	const graphqlWithAuth = graphql.defaults({
		headers: {
			authorization: `Bearer ${githubToken}`
		}
	});

	return await graphqlWithAuth(
		`
        mutation($userLogin: String!, $projectId: ID!, $issueId: ID!) {
            addProjectV2ItemById(input: {clientMutationId: $userLogin projectId: $projectId contentId: $issueId}) {
                clientMutationId 
                item {
                    id
                }
            }
          }
        `,
		{
			userLogin: `${owner}`,
			projectId: `${projectId}`,
			issueId: `${issueId}`
		}
	);
}

async function searchProjectByNumber(
	githubToken: string,
	owner: string,
	projectNumber: number,
	queryPageSize: number,
	afterArg = ''
): Promise<GraphQlQueryResponseData> {
	const graphqlWithAuth = graphql.defaults({
		headers: {
			authorization: `Bearer ${githubToken}`
		}
	});

	return await graphqlWithAuth(
		`
        query($userLogin: String!, $number: Int!, $first: Int){
            user(login: $userLogin){
              projectV2(number: $number) {
                createdAt
                updatedAt
                id
                title
                number
                items(first: $first, ${afterArg}) {
                    pageInfo {
						hasNextPage
						endCursor
                    }
                    nodes {
                        content {
                            ... on Issue {
								createdAt
                                title
                                url
                                number
                                id
								repository {
									name
								}
                            }
                        }
                    }
                }
              }
            }
          }
        `,
		{
			userLogin: `${owner}`,
			number: Number(`${projectNumber}`),
			first: Number(`${queryPageSize}`)
		}
	);
}
