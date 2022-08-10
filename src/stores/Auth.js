import {
	writable
} from 'svelte/store';
import {
	Preferences } from '@capacitor/preferences';

const authToken = 'AuthToken';
const ikomidaIDKey = 'ikomidaID';

function createAuth() {
	const {
		subscribe,
		set
	} = writable(null, async (setter) => {
		let token = null;
		try {
			const ret = await Preferences.get({
				key: authToken
			});
			token = ret.value;
		} catch (error) {
			token = null;
			//TODO: -- report errors
		}
		if (token === "" || !token) token = null;
		setter(token);
	});

	return {
		subscribe,
		setToken: async (payload) => {
			try {
				set(payload);
				await Preferences.set({
					key: authToken,
					value: payload
				});
			} catch (error) {
				//TODO: -- report errors
			}
		}
	};
}

export const Auth = createAuth();
export const ikomidaID = {
	set: async (id) => await Preferences.set({
		key: ikomidaIDKey,
		value: id
	}),
	get: async () => (await Preferences.get({
		key: ikomidaIDKey
	})).value
};

function createUserInfo() {
	const {
		subscribe,
		set
	} = writable({
		avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAArHbV6gqS70hTQBiPnvI-mRMZw85ItexDw&usqp=CAU",
		name: ""
	});

	return {
		subscribe,
		setUserInfo: (info) => set(info)
	};
}

export const UserInfo = createUserInfo();

function createPushNotificationToken() {
	const {
		subscribe,
		set
	} = writable();

	return {
		subscribe,
		setToken: (token) => set(token)
	};
}

export const PushNotificationToken = createPushNotificationToken();