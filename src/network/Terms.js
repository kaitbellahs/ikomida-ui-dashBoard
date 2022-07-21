import {
    Network
} from "@ikomida/components";

export async function getTermsOfUse() {
    const response = await Network.instance.get("/term/termsOfUse");
    if (response && response?.success) {
        return response?.data
    }
    return null;
}