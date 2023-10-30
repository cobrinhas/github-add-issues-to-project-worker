import { graphql } from '@octokit/graphql';
import { GraphQlQueryResponseData } from '@octokit/graphql/dist-types/types';
import { IssueInfo, IssueState, IssueVisibility } from './data';

export async function createdBy(
	githubToken: string,
	owner: string,
	state: IssueState,
	visibility: IssueVisibility,
	queryPageSize: number
): Promise<IssueInfo[]> {
	return await searchIssues(
		githubToken,
		`type:issue ${visibility} author:${owner} ${state}`,
		queryPageSize
	);
}

export async function assigneeTo(
	githubToken: string,
	owner: string,
	state: IssueState,
	visibility: IssueVisibility,
	queryPageSize: number
): Promise<IssueInfo[]> {
	return await searchIssues(
		githubToken,
		`type:issue ${visibility} assignee:${owner} ${state}`,
		queryPageSize
	);
}

async function searchIssues(
	githubToken: string,
	queryString: string,
	queryPageSize: number
): Promise<IssueInfo[]> {
	const firstResult = await searchIssuesAfterCursor(
		githubToken,
		`${queryString}`,
		'',
		queryPageSize
	);

	if (!firstResult.search.pageInfo.hasNextPage) {
		return firstResult.search.edges as IssueInfo[];
	}

	let result = firstResult.search.edges as IssueInfo[];
	let continueSearch = true;
	let endCursor = `after: "${firstResult.search.pageInfo.endCursor}"`;

	while (continueSearch) {
		const newResult = await searchIssuesAfterCursor(
			githubToken,
			`${queryString}`,
			endCursor,
			queryPageSize
		);

		result = result.concat(newResult.search.edges);

		continueSearch = newResult.search.pageInfo.hasNextPage;

		endCursor = `after: "${newResult.search.pageInfo.endCursor}"`;
	}

	return result;
}

async function searchIssuesAfterCursor(
	githubToken: string,
	queryString: string,
	afterArg: string,
	queryPageSize: number
): Promise<GraphQlQueryResponseData> {
	const graphqlWithAuth = graphql.defaults({
		headers: {
			authorization: `Bearer ${githubToken}`
		}
	});

	return await graphqlWithAuth(
		`
			query($first: Int){
				search(first: $first, type: ISSUE, ${afterArg}, query: "${queryString}") {
                    issueCount
                    pageInfo {
						hasNextPage
						endCursor
                    }
                    edges {
						node {
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
        `,
		{
			first: Number(`${queryPageSize}`)
		}
	);
}
