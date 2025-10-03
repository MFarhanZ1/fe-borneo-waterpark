import { Navigate } from "react-router-dom";
import ProtectedRoute from "./protected.router";
import TiketManagement from "@/pages/admin-waterpark/tiket-masuk/page";
import BarangManagement from "@/pages/admin-waterpark/barang-disewakan/page";

export const mahasiswaRouter = [
  {
    path: "/admin-waterpark",
    element: <Navigate to="/admin-waterpark/daftar-absensi" />,
  },
  {
    path: "/admin-waterpark/tiket-masuk",
    element: (
      <ProtectedRoute roles={["admin-waterpark"]}>
        <TiketManagement />
      </ProtectedRoute>
    ),  
  },
  {
    path: "/admin-waterpark/barang-disewakan",
    element: (
      <ProtectedRoute roles={["admin-waterpark"]}>
        <BarangManagement />
      </ProtectedRoute>
    ),}
];
