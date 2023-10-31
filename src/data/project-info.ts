import { JSON } from './json';
import { IssueInfo } from './issue-info';

export class ProjectInfo {
	createdAt: string = '';
	updatedAt: string = '';
	number: string = '';
	id: string = '';
	title: string = '';
	issues: IssueInfo[] = [];

	static fromJson(json: JSON): ProjectInfo {
		return <ProjectInfo>{
			...json,
			issues: json.items.nodes.map((x: JSON) => IssueInfo.fromJson(x))
		};
	}
}
