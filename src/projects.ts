import { GraphQlQueryResponseData, graphql } from '@octokit/graphql';
import { ProjectInfo } from './data/project-info';

export async function getProjectByNumber(
	githubToken: string,
	owner: string,
	projectNumber: number
): Promise<ProjectInfo> {
	const projectInfo = async () => {
		const firstResult = await searchProjectByNumber(
			githubToken,
			owner,
			projectNumber
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

async function searchProjectByNumber(
	githubToken: string,
	owner: string,
	projectNumber: number,
	afterArg = ''
): Promise<GraphQlQueryResponseData> {
	const graphqlWithAuth = graphql.defaults({
		headers: {
			authorization: `Bearer ${githubToken}`
		}
	});

	return await graphqlWithAuth(
		`
        query($userLogin: String!, $number: Int!){
            user(login: $userLogin){
              projectV2(number: $number) {
                createdAt
                updatedAt
                id
                title
                number
                items(first: 10, ${afterArg}) {
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
			number: Number(`${projectNumber}`)
		}
	);
}
