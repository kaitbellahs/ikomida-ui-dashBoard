import {
    Network, Types
} from "@ikomida/shared-frontend";

export async function doLogin(areaCode: string, phone: string, password: string) {
    return Network.instance?.post("/auth", undefined, {
        areaCode,
        phone,
        password
    }, "login");
}

export async function updatePassword(object: Types.Interfaces.IUser) {
    return Network.instance?.post("/password", true, object, "updatePassword");
}

export async function requestPasswordPhoneValidation(object: Types.Interfaces.IUser) {
    return Network.instance?.post("/requestPasswordPhoneValidation", undefined, object, "requestPasswordPhoneValidation");
}
export async function validatePasswordPhoneValidationCode(object: Types.Interfaces.IUser) {
    return Network.instance?.post("/validatePasswordPhoneValidationCode", undefined, object, "validatePasswordPhoneValidationCode");
}

export async function requestPassword(object: Types.Interfaces.IUser) {
    return Network.instance?.post("/requestPassword", undefined, object, "requestPassword");
}

export async function logout() {
    return Network.instance?.logout();
}