import { api } from "@/lib/axios-instance";

export default class APIRFID {
  public static async getAktivasiRFID({id}: { id: string }) {
    const axios = api();
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL_PUBLIC_RFID}/public/web/rfid/aktivasi/${id}`,
    );
    const data = response.data;
    return data;
  }

  public static async getAllAbsensi() {
    const axios = api();
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL_RFID}/web/rfid/absensi`,
    );
    const data = response.data;
    return data;
  }
}
