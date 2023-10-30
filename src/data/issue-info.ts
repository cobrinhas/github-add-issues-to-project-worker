export class IssueInfo {
	createdAt: string | undefined;
	title: string | undefined;
	url: string | undefined;
	number: string | undefined;
	id: string | undefined;
	repository: Repository | undefined;
}

class Repository {
	name: string | undefined;
}
