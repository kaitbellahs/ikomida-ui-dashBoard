import {
    Network,
    Stores,
} from "@ikomida/components";


export async function getStaff(refresh = false) {
    return await Network.instance.loadMore(Stores.Cache.Types.STAFF, '/vendor/staff', true, refresh)
}

export async function addStaff(object) {
    const response = await Network.instance.post("/vendor/staff", true, object);
    if (response?.success) {
        await Network.instance.clearCache(Stores.Cache.Types.STAFF)
    }
    return response
}

export async function updateStaff(object) {
    return Network.instance.put("/vendor/staff", true, object);
}

export async function removeStaff(id) {
    return Network.instance.remove(`/vendor/staff/${id}`, true);
}

export async function GetAddressByCep(cep) {
    return Network.instance.get(`/cep/${cep}`, true);
}