import {
    Network
} from "@tian/components";

export async function doLogin(areaCode, phone, password){
    return Network.instance.post("/auth", null, {
        areaCode,
        phone,
        password
    });
}