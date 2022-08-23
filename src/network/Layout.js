import {
    Network
} from "@ikomida/components";

export async function getLayout() {
    return Network.instance.get("/layout");
}

export async function updateLayout(object) {
    return Network.instance.put("/layout", true, object);
}