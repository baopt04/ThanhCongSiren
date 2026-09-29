import axios from "axios";
import { GHN_CONFIG } from "../../config/GhnConfig";
const ghnClient = axios.create({
    baseURL: "https://online-gateway.ghn.vn/shiip/public-api",
    headers: {
        Token: GHN_CONFIG.TOKEN,
        ShopId: GHN_CONFIG.SHOP_ID,
    },
});

export const getProvinces = async () => {
    const res = await ghnClient.get("/master-data/province");
    return res.data;
};

export const getDistricts = async (provinceId) => {
    if (!provinceId) throw new Error("provinceId is undefined");
    const res = await ghnClient.get("/master-data/district", {
        params: { province_id: provinceId },
    });
    return res.data;
};

export const getWards = async (districtId) => {
    if (!districtId) throw new Error("districtId is undefined");
    const res = await ghnClient.get("/master-data/ward", {
        params: { district_id: districtId },
    });
    return res.data;
};