import {
    Network
} from "@tian/components";

export async function doLogin(cell, password){
    return Network.instance.post("/auth", null, {cell, password});
}