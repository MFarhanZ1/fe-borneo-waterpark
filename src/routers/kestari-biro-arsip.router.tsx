import { Navigate } from "react-router-dom";
import ProtectedRoute from "./protected.router";
import DaftarAbsensiPage from "@/pages/kestari-biro-arsip/daftar-absensi.page";
import ManajemenKegiatanPage from "@/pages/kestari-biro-arsip/manajemen-kegiatan.page";

export const mahasiswaRouter = [
  {
    path: "/kestari-biro-arsip",
    element: <Navigate to="/kestari-biro-arsip/daftar-absensi" />,
  },
  {
    path: "/kestari-biro-arsip/daftar-absensi",
    element: (
      <ProtectedRoute roles={["kestari-biro-arsip"]}>
        <DaftarAbsensiPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/kestari-biro-arsip/manajemen-kegiatan",
    element: (
      <ProtectedRoute roles={["kestari-biro-arsip"]}>
        <ManajemenKegiatanPage />
      </ProtectedRoute>
    ),
  }
];
