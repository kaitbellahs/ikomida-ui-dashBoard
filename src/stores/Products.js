import {
    writable
} from 'svelte/store';
import {
    Storage
} from '@capacitor/storage';

function _store() {
    const {
        subscribe,
        update
    } = writable({items: [], timeout: 0});

    return {
        subscribe,
        addItem: (item) => update(_items => [..._items, item]),
        updateItems: newItems => update(_items => newItems),
    };
}

export const Store = _store();