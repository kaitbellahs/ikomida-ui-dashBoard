import {
    Network,
    Stores,
    Types,
} from "@ikomida/shared-frontend";

export async function addStaff(object: Types.Interfaces.IUser) {
    const response = await Network.instance?.post("/vendor/staff", true, object);
    if (response?.success) {
        await Network.instance?.clearCache(Stores.Cache.Types.STAFF)
    }
    return response
}

export async function updateStaff(object: Types.Interfaces.IUser) {
    return Network.instance?.put("/vendor/staff", true, object);
}

export async function removeStaff(id: string) {
    return Network.instance?.remove(`/vendor/staff/${id}`, true);
}

export async function GetAddressByCep(cep: string) {
    return Network.instance?.get(`/cep/${cep}`, true);
}