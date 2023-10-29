import { graphql } from '@octokit/graphql';
import { GraphQlQueryResponseData } from '@octokit/graphql/dist-types/types';
import { IssueInfo, IssueState } from './data';

export async function createdBy(
	githubToken: string,
	owner: string,
	state: IssueState
): Promise<IssueInfo[]> {
	return await searchIssues(
		githubToken,
		`type:issue is:public author:${owner} ${state}`
	);
}

export async function assigneeTo(
	githubToken: string,
	owner: string,
	state: IssueState
): Promise<IssueInfo[]> {
	return await searchIssues(
		githubToken,
		`type:issue is:public assignee:${owner} ${state}`
	);
}

async function searchIssues(
	githubToken: string,
	queryString: string
): Promise<IssueInfo[]> {
	const firstResult = await searchIssuesAfterCursor(
		githubToken,
		`${queryString}`,
		''
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
			endCursor
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
	afterArg: string
): Promise<GraphQlQueryResponseData> {
	const graphqlWithAuth = graphql.defaults({
		headers: {
			authorization: `Bearer ${githubToken}`
		}
	});

	return await graphqlWithAuth(
		`
            query{
                search(first: 10, type: ISSUE, ${afterArg}, query: "${queryString}") {
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
        `
	);
}
