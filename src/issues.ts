import { graphql } from '@octokit/graphql';
import { GraphQlQueryResponseData } from '@octokit/graphql/dist-types/types';
import { IssueInfo, IssueState } from './data';

export async function createdBy(
	githubToken: string,
	owner: string,
	state: IssueState,
	firstNElement: string
): Promise<IssueInfo[]> {
	return await searchIssues(
		githubToken,
		`type:issue is:public author:${owner} ${state}`,
		firstNElement
	);
}

export async function assigneeTo(
	githubToken: string,
	owner: string,
	state: IssueState,
	firstNElement: string
): Promise<IssueInfo[]> {
	return await searchIssues(
		githubToken,
		`type:issue is:public assignee:${owner} ${state}`,
		firstNElement
	);
}

async function searchIssues(
	githubToken: string,
	queryString: string,
	firstNElement: string
): Promise<IssueInfo[]> {
	const firstResult = await searchIssuesAfterCursor(
		githubToken,
		`${queryString}`,
		'',
		firstNElement
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
			firstNElement
		);

		result = result.concat(newResult.search.edges);

		if (!newResult.search.pageInfo.hasNextPage) {
			continueSearch = false;
		}
		endCursor = `after: "${newResult.search.pageInfo.endCursor}"`;
	}

	return result;
}

async function searchIssuesAfterCursor(
	githubToken: string,
	queryString: string,
	afterArg: string,
	firstNElement: string
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
			first: Number(`${firstNElement}`)
		}
	);
}
