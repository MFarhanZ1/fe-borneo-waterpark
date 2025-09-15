import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import APIRFID from "@/services/api/public/rfid.service";
import DashboardLayout from "@/components/globals/layouts/dashboard-layout";
import {
	ActivityIcon,
	AlertTriangleIcon,
	BackpackIcon,
	DatabaseIcon,
	FileDownIcon,
	PackageOpenIcon,
	SearchIcon,
	UsersIcon,
} from "lucide-react";

// --- DEFINISI TIPE DATA ---
// Pindahkan ApiResponse ke sini agar bisa digunakan di useQuery
interface ApiResponse {
	response: boolean;
	message: string;
	data: Absensi[];
}

interface Jabatan {
	id: string;
	nama: string;
}
// ... (Tipe data lainnya tetap sama)
interface Mahasiswa {
	nim: string;
	nama: string;
	email: string;
	jabatan: Jabatan;
}

interface Kartu {
	id: string;
	status: string;
	nim: string;
	mahasiswa: Mahasiswa;
}

interface Kegiatan {
	id: string;
	nama: string;
	tanggal_mulai: string;
	tanggal_selesai: string;
	lokasi: string;
}

interface Absensi {
	id: number;
	waktu_absen: string;
	rfid_id: string;
	id_kegiatan: string | null;
	kegiatan: Kegiatan | null;
	kartu: Kartu;
}

// --- KOMPONEN ILUSTRASI SAAT DATA KOSONG (Tetap sama) ---
// --- Reusable Components ---
const StatCard = ({ title, value, icon, description }: any) => (
	<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
		<div className="flex flex-row items-center justify-between space-y-0 pb-2">
			<h3 className="tracking-tight text-sm font-medium text-muted-foreground">
				{title}
			</h3>
			{icon}
		</div>
		<div>
			<div className="text-2xl font-bold">{value}</div>
			<p className="text-xs text-muted-foreground">{description}</p>
		</div>
	</div>
);

const EmptyState = ({ message, title }: { message: string; title: string }) => (
	<div className="text-center p-16">
		<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
			<PackageOpenIcon className="h-10 w-10 text-muted-foreground" />
		</div>
		<h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
		<p className="mt-2 text-sm text-muted-foreground">{message}</p>
	</div>
);

// --- KOMPONEN UTAMA ---
const DaftarAbsensiPage: React.FC = () => {
	const {
		// PERUBAHAN: Ganti nama `data` menjadi `attendanceData` agar lebih jelas
		data: attendanceData,
		isLoading,
		isError,
		error,
	} = useQuery<ApiResponse, Error, Absensi[]>({
		// Tipe data diperbarui
		queryKey: ["absensi"],
		queryFn: () => APIRFID.getAllAbsensi(),
		staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
		// PERBAIKAN: Gunakan `select` untuk mengekstrak array dari properti `data`
		select: (response) => response.data || [],
	});

	const [filteredData, setFilteredData] = useState<Absensi[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [selectedKegiatan, setSelectedKegiatan] = useState<string>("all");

	// PERUBAHAN: `useMemo` sekarang hanya bertugas membuat daftar kegiatan unik
	const kegiatanList = useMemo(() => {
		if (!attendanceData) {
			return [];
		}
		const uniqueKegiatanMap = new Map<string, Kegiatan>();
		attendanceData.forEach((item) => {
			if (item.kegiatan && !uniqueKegiatanMap.has(item.kegiatan.id)) {
				uniqueKegiatanMap.set(item.kegiatan.id, item.kegiatan);
			}
		});
		return Array.from(uniqueKegiatanMap.values());
	}, [attendanceData]);

	// `useEffect` untuk filtering tetap sama, bergantung pada `attendanceData`
	useEffect(() => {
		// Gunakan `attendanceData` yang sudah diurutkan dari `useQuery`
		let results = attendanceData || [];

		if (selectedKegiatan !== "all") {
			results = results.filter((item) => item.id_kegiatan === selectedKegiatan);
		}

		console.log(results);
		console.log(selectedKegiatan);

		if (searchTerm) {
			const lowercasedFilter = searchTerm.toLowerCase();
			results = results.filter(
				(item) =>
					item.kartu?.mahasiswa?.nama
						.toLowerCase()
						.includes(lowercasedFilter) || item.kartu?.nim?.includes(searchTerm)
			);
		}

		// Urutkan data di sini sebelum di-render
		const sortedResults = [...results].sort(
			(a, b) =>
				new Date(b.waktu_absen).getTime() - new Date(a.waktu_absen).getTime()
		);

		setFilteredData(sortedResults);
	}, [searchTerm, selectedKegiatan, attendanceData]);

	const handleExportToExcel = () => {
		// ... (Fungsi Ekspor tidak perlu diubah) ...
		if (!attendanceData || attendanceData.length === 0) {
			return;
		}

		const groupedByKegiatan: { [key: string]: Absensi[] } =
			attendanceData.reduce((acc, item) => {
				const key = item.id_kegiatan || "absensi_harian";
				if (!acc[key]) {
					acc[key] = [];
				}
				acc[key].push(item);
				return acc;
			}, {} as { [key: string]: Absensi[] });

		const wb = XLSX.utils.book_new();

		for (const key in groupedByKegiatan) {
			const absensiKegiatan = groupedByKegiatan[key];
			const namaKegiatan =
				absensiKegiatan[0]?.kegiatan?.nama || "Absensi Harian";

			const sheetData = absensiKegiatan.map((item) => ({
				"Nama Mahasiswa": item.kartu?.mahasiswa?.nama ?? "N/A",
				NIM: item.kartu?.nim ?? "N/A",
				Jabatan: item.kartu?.mahasiswa?.jabatan?.nama ?? "N/A",
				Kegiatan: item.kegiatan?.nama ?? "Absensi Harian",
				"Waktu Absen": new Date(item.waktu_absen).toLocaleString("id-ID", {
					year: "numeric",
					month: "long",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				}),
			}));

			const ws = XLSX.utils.json_to_sheet(sheetData);
			const columnWidths = [
				{ wch: 30 },
				{ wch: 15 },
				{ wch: 25 },
				{ wch: 30 },
				{ wch: 25 },
			];
			ws["!cols"] = columnWidths;

			const safeSheetName = namaKegiatan
				.replace(/[\/\\?*\[\]]/g, "")
				.substring(0, 31);
			XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
		}

		XLSX.writeFile(wb, "Laporan_Kehadiran_HIMATIF.xlsx");
	};

	// Render JSX (tidak ada perubahan signifikan, hanya pastikan menggunakan variabel yang benar)
	return (
		<DashboardLayout>
			<div className="bg-transparent text-foreground font-sans">
				{/* Header / Control Bar */}
				<header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="container mx-auto flex max-w-7xl flex-col gap-4 py-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-col gap-1.5 -mb-2.5">
							<div className="mb-4 flex gap-5">
								<div className="flex">
									<span className="bg-white flex justify-center items-center shadow-sm text-gray-800 dark:text-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 text-md font-medium tracking-tight">
										<span
											className={`inline-block animate-pulse w-3 h-3 rounded-full mr-2 bg-yellow-400`}
										/>
										<BackpackIcon className="w-4 h-4 mr-1.5" />
										<span>Daftar Absensi Pengurus HIMA-TIF UIN Suska Riau</span>
									</span>
								</div>
							</div>
						</div>
						<div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
							<div className="relative flex-grow">
								<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
								<input
									type="text"
									placeholder="Cari Nama atau NIM..."
									className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
							<select
								className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-48"
								value={selectedKegiatan}
								onChange={(e) => setSelectedKegiatan(e.target.value)}
								disabled={kegiatanList.length === 0 || isLoading}
							>
								<option value="all">Semua Kegiatan</option>
								{kegiatanList.map((kegiatan) => (
									<option key={kegiatan.id} value={kegiatan.id}>
										{kegiatan.nama}
									</option>
								))}
							</select>
							<button
								onClick={handleExportToExcel}
								disabled={
									!attendanceData || attendanceData.length === 0 || isLoading
								}
								className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
							>
								<FileDownIcon className="h-4 w-4" />
								<span>Ekspor</span>
							</button>
						</div>
					</div>
				</header>

				<main className="container mx-auto max-w-7xl py-3">
					{/* Stat Cards */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
						<StatCard
							title="Total Kehadiran (Filter)"
							value={isLoading ? "..." : filteredData.length}
							description="Jumlah data sesuai filter"
							icon={<UsersIcon className="h-5 w-5 text-muted-foreground" />}
						/>
						<StatCard
							title="Total Kegiatan"
							value={isLoading ? "..." : kegiatanList.length}
							description="Jumlah kegiatan terdaftar"
							icon={<ActivityIcon className="h-5 w-5 text-muted-foreground" />}
						/>
						<StatCard
							title="Semua Catatan Kehadiran"
							value={isLoading ? "..." : attendanceData?.length || 0}
							description="Total data di database"
							icon={<DatabaseIcon className="h-5 w-5 text-muted-foreground" />}
						/>
					</div>

					{/* Content Area */}
					<div className="rounded-lg border bg-card text-card-foreground shadow-sm">
						{isLoading && (
							<div className="p-16 text-center text-muted-foreground animate-pulse">
								Memuat data kehadiran...
							</div>
						)}

						{isError && (
							<div className="p-8 text-center text-destructive flex flex-col items-center gap-4">
								<AlertTriangleIcon className="h-12 w-12" />
								<div>
									<h3 className="font-bold text-lg">Gagal Memuat Data</h3>
									<p className="text-sm">
										{error?.message ?? "Terjadi kesalahan pada server."}
									</p>
								</div>
							</div>
						)}

						{!isLoading && !isError && (
							<div className="overflow-x-auto">
								{filteredData.length > 0 ? (
									<table className="w-full caption-bottom text-sm">
										<thead className="[&_tr]:border-b">
											<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
													Nama
												</th>
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
													NIM
												</th>
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
													Jabatan
												</th>
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
													Kegiatan
												</th>
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
													Waktu Absen
												</th>
											</tr>
										</thead>
										<tbody className="[&_tr:last-child]:border-0">
											{filteredData.map((item) => (
												<tr
													key={item.id}
													className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
												>
													<td className="p-4 align-middle font-medium text-foreground">
														{item.kartu?.mahasiswa?.nama ?? (
															<span className="text-destructive">
																Data Error
															</span>
														)}
													</td>
													<td className="p-4 align-middle text-muted-foreground">
														{item.kartu?.nim ?? "-"}
													</td>
													<td className="p-4 align-middle text-muted-foreground">
														{item.kartu?.mahasiswa?.jabatan?.nama ?? "-"}
													</td>
													<td className="p-4 align-middle text-foreground">
														{item.kegiatan?.nama ?? (
															<span className="text-muted-foreground italic">
																Absensi Harian
															</span>
														)}
													</td>
													<td className="p-4 align-middle text-muted-foreground">
														{new Date(item.waktu_absen).toLocaleString(
															"id-ID",
															{
																dateStyle: "long",
																timeStyle: "medium",
															}
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<EmptyState
										title="Data Tidak Ditemukan"
										message={
											searchTerm || selectedKegiatan !== "all"
												? "Tidak ada data yang cocok dengan pencarian atau filter Anda."
												: "Belum ada data kehadiran untuk ditampilkan saat ini."
										}
									/>
								)}
							</div>
						)}
					</div>
				</main>
			</div>
		</DashboardLayout>
	);
};

export default DaftarAbsensiPage;
