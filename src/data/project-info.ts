import { IssueInfo } from './issue-info';

export class ProjectInfo {
	createdAt: string | undefined;
	updatedAt: string | undefined;
	number: string | undefined;
	id: string | undefined;
	title: string | undefined;
	issues: IssueInfo[] = [];

	static fromJson(json: { [key: string]: any }): ProjectInfo {
		return <ProjectInfo>{
			...json,
			issues: json.items.nodes.map((x: { [key: string]: any }) =>
				IssueInfo.fromJson(x)
			)
		};
	}
}
