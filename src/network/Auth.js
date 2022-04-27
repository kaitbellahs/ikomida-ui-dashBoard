import {
    Network
} from "@tian/components";
import {
    get
} from 'svelte/store';
import {
    Auth
} from '../stores/Auth';

export async function doLogin(areaCode, phone, password) {
    return Network.instance.post("/auth", null, {
        areaCode,
        phone,
        password
    });
}

export async function updatePassword(object) {
    return Network.instance.post("/password", get(Auth), object);
}

export async function requestPasswordPhoneValidation(object) {
    return Network.instance.post("/requestPasswordPhoneValidation", null, object);
}
export async function validatePasswordPhoneValidationCode(object) {
    return Network.instance.post("/validatePasswordPhoneValidationCode", null, object);
}

export async function requestPassword(object) {
    return Network.instance.post("/requestPassword", null, object);
}