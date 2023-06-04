export interface Post {
	title: string;
	excerpt: string;
	timestamp: number;
	slug: string;
}

export type HeaderData = {
	text: string;
	level: 1 | 2 | 3 | 4 | 5 | 6;
};

export type ParagraphData = {
	text: string;
};

export type ImageData = {
	caption: string;
	file: {
		url: string;
	};
};

export type QuoteData = {
	text: string;
	caption: string;
};

export type Block = {
	id: string;
} & (
	| {
			data: HeaderData;
			type: 'header';
	  }
	| {
			data: ParagraphData;
			type: 'paragraph';
	  }
	| {
			data: ImageData;
			type: 'image';
	  }
	| {
			data: QuoteData;
			type: 'quote';
	  }
);
