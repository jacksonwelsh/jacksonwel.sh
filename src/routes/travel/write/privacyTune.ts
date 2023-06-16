export class PrivacyTune implements EditorJS.BlockTune {
	api: EditorJS.API;
	isPrivate: boolean;

	constructor({ api }: { api: EditorJS.API }) {
		this.api = api;
		this.isPrivate = false;
	}

	render() {
		return {
			icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>`,
			label: 'Private',
			toggle: true,
			isActive: this.isPrivate,
			onActivate: () => {
				this.isPrivate = !this.isPrivate;
			}
		};
	}

	save() {
		return {
			isPrivate: this.isPrivate
		};
	}

	static get isTune() {
		return true;
	}
}
