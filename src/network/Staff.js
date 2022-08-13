import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';
import {
    Network
} from "@ikomida/components";

export async function getStaff(refresh = false) {
    return await Network.instance.loadMore(Network.cacheTypes.STAFF, '/vendor/staff', get(Auth), refresh)
}

export async function addStaff(object) {
    const response = await Network.instance.post("/vendor/staff", get(Auth), object);
    if (response?.success) {
        await Network.instance.clearCache(Network.cacheTypes.STAFF)
    }
    return response
}

export async function updateStaff(object) {
    return Network.instance.put("/vendor/staff", get(Auth), object);
}

export async function removeStaff(id) {
    return Network.instance.remove(`/vendor/staff/${id}`, get(Auth));
}

export async function GetAddressByCep(cep) {
    return Network.instance.get(`/cep/${cep}`, get(Auth));
}