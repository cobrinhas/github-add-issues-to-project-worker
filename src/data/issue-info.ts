import { JSON } from './json';

export type IssueId = string;

export class IssueInfo {
	createdAt: string = '';
	title: string = '';
	url: string = '';
	number: string = '';
	id: IssueId = '';
	repository: Repository | undefined;

	static fromJson(json: JSON): IssueInfo {
		return <IssueInfo>{ ...(json.content ?? json.node) };
	}
}

class Repository {
	name: string = '';
}
