import { api } from "@/lib/axios-instance";

export default class APIKegiatan {
  public static async getAll() {
    const axios = api();
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL_RFID}/web/kegiatan`,
    );
    const data = response.data;
    return data;
  }

  public static async post({nama, lokasi, tanggal_mulai, tanggal_selesai}: { nama: string, lokasi: string, tanggal_mulai: string, tanggal_selesai: string}) {
    const axios = api();
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL_RFID}/web/kegiatan`,
      {
        nama,
        lokasi,
        tanggal_mulai,
        tanggal_selesai
      },
    );
    const data = response.data;
    return data;
  }
}
