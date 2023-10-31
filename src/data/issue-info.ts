import { JSON } from './json';

export class IssueInfo {
	createdAt: string = '';
	title: string = '';
	url: string = '';
	number: string = '';
	id: string = '';
	repository: Repository | undefined;

	static fromJson(json: JSON): IssueInfo {
		return <IssueInfo>{ ...(json.content ?? json.node) };
	}
}

class Repository {
	name: string = '';
}
