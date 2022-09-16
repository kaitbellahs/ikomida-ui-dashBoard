import {
	writable
} from 'svelte/store';

function createStatusBar() {
	const {
		subscribe,
		set
	} = writable({
		style: null,
		visible: true,
		height: 0,
		bottomPadding: 0,
	});

	return {
		subscribe,
		setStatusBar: (info) => set(info)
	};
}

export const StatusBar = createStatusBar();

function createSettings() {
	const {
		subscribe,
		update
	} = writable({
		popups: {
			newOrder: true,
			paymentStatus: true
		},
		profile: {
			contractName: null,
			mainPicture: null,
		}
	});

	return {
		subscribe,
		set: (data) => update(old => { return { ...old, ...data } })
	};
}

export const Settings = createSettings();