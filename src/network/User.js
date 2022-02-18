import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';
import {
    Network
} from "@tian/components";

export async function countUsers() {
    let response = await Network.instance.get("/usersCount", get(Auth));
    if (response.success) {
        return response.data
    }
    return 0;
}