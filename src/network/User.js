import {
    Network,
} from "@ikomida/components";

export async function countUsers() {
    let response = await Network.instance.get("/usersCount", true);
    if (response?.success) {
        return response?.data
    }
    return 0;
}