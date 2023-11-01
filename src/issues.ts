import { graphql } from '@octokit/graphql';
import { GraphQlQueryResponseData } from '@octokit/graphql/dist-types/types';
import { IssueId, IssueInfo, IssueState, IssueVisibility } from './data';

export async function createdBy(
	githubToken: string,
	owners: string[],
	state: IssueState,
	visibility: IssueVisibility,
	queryPageSize: number
): Promise<IssueId[]> {
	const authors: string = owners.map((x) => `author:${x}`).join(' ');
	return await searchIssues(
		githubToken,
		`type:issue ${visibility} ${authors} ${state}`,
		queryPageSize
	);
}

export async function assigneeTo(
	githubToken: string,
	owners: string[],
	state: IssueState,
	visibility: IssueVisibility,
	queryPageSize: number
): Promise<IssueId[]> {
	const assignees = owners.map((x) => `assignee:${x}`).join(' ');
	return await searchIssues(
		githubToken,
		`type:issue ${visibility} ${assignees} ${state}`,
		queryPageSize
	);
}

async function searchIssues(
	githubToken: string,
	queryString: string,
	queryPageSize: number
): Promise<IssueId[]> {
	const firstResult = await searchIssuesAfterCursor(
		githubToken,
		`${queryString}`,
		queryPageSize
	);

	const result = firstResult.search.edges.map(
		(x: JSON) => IssueInfo.fromJson(x).id
	);

	if (!firstResult.search.pageInfo.hasNextPage) {
		return result;
	}

	let continueSearch = true;
	let endCursor = `after: "${firstResult.search.pageInfo.endCursor}"`;

	while (continueSearch) {
		const newResult = await searchIssuesAfterCursor(
			githubToken,
			`${queryString}`,
			queryPageSize,
			endCursor
		);

		result.push(
			...newResult.search.edges.map((x: JSON) => IssueInfo.fromJson(x).id)
		);

		continueSearch = newResult.search.pageInfo.hasNextPage;

		endCursor = `after: "${newResult.search.pageInfo.endCursor}"`;
	}

	return result;
}

async function searchIssuesAfterCursor(
	githubToken: string,
	queryString: string,
	queryPageSize: number,
	afterArg: string = ''
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
