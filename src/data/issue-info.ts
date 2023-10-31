import { JSON } from './json';

export class IssueInfo {
	createdAt: string | undefined;
	title: string | undefined;
	url: string | undefined;
	number: string | undefined;
	id: string | undefined;
	repository: Repository | undefined;

	static fromJson(json: JSON): IssueInfo {
		return <IssueInfo>{ ...json.content };
	}
}

class Repository {
	name: string | undefined;
}
