import { Navigate } from "react-router-dom";
import ProtectedRoute from "./protected.router";
import TiketManagement from "@/pages/admin-waterpark/tiket-masuk/page";
import BarangManagement from "@/pages/admin-waterpark/barang-disewakan/page";
import FasilitasManagement from "@/pages/admin-waterpark/fasilitas-tersedia/page";
import DokumentasiManagement from "@/pages/admin-waterpark/dokumentasi-cust/page";

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
		),
	},
  {
    path: "/admin-waterpark/fasilitas-tersedia",
    element: (
      <ProtectedRoute roles={["admin-waterpark"]}>
        <FasilitasManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin-waterpark/dokumentasi-cust",
    element: (
      <ProtectedRoute roles={["admin-waterpark"]}>
        <DokumentasiManagement />
      </ProtectedRoute>
    ),
  }
];
