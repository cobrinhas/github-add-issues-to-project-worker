import { JSON } from './json';
import { IssueInfo } from './issue-info';

export class ProjectInfo {
	createdAt: string | undefined;
	updatedAt: string | undefined;
	number: string | undefined;
	id: string | undefined;
	title: string | undefined;
	issues: IssueInfo[] = [];

	static fromJson(json: JSON): ProjectInfo {
		return <ProjectInfo>{
			...json,
			issues: json.items.nodes.map((x: JSON) => IssueInfo.fromJson(x))
		};
	}
}
