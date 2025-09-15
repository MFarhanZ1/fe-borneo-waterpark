import { Navigate } from "react-router-dom";
import ProtectedRoute from "./protected.router";
import MahasiswaPAPage from "@/pages/dosen/murojaah/mahasiswa-pa/page";
import DetailMahasiswaPAPage from "@/pages/dosen/murojaah/mahasiswa-pa/detail/page";

export const dosenRouter = [
  {
    path: "/dosen/murojaah",
    element: <Navigate to="/dosen/murojaah/mahasiswa-pa"/>,
  },
  {
    path: "/dosen/murojaah/mahasiswa-pa",
    element: (
      <ProtectedRoute roles={["dosen"]}>
        <MahasiswaPAPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dosen/murojaah/mahasiswa-pa/:nim",
    element: (
      <ProtectedRoute roles={["dosen"]}>
        <DetailMahasiswaPAPage />
      </ProtectedRoute>
    ),
  }
];
