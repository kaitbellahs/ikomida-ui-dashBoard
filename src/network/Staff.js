import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';
import {
    Network
} from "@ikomida/components";

export async function getStaff(timestamp = 0) {
    const response = await Network.instance.get(`/vendor/staff/${timestamp}`, get(Auth));
    if (response && response?.success) {
        return response?.data ?? [];
    }
    return [];
}

export async function addStaff(object) {
    return Network.instance.post("/vendor/staff", get(Auth), object);
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