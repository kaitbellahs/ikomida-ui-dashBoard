import {
	Preferences
} from '@capacitor/preferences';

const ikomidaIDKey = 'ikomidaID';

export default {
	set: async (id: string) => await Preferences.set({
		key: ikomidaIDKey,
		value: id
	}),
	get: async () => (await Preferences.get({
		key: ikomidaIDKey
	})).value
};