import { useState } from "react";
import {
	Plus,
	MapPin,
	Calendar,
	Clock,
	ArrowLeft,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import APIKegiatan from "@/services/api/public/kegiatan.service";
import { queryClient } from "@/lib/query-client";
import DashboardLayout from "@/components/globals/layouts/dashboard-layout";

// --- KegiatanList Component (Tidak ada perubahan signifikan) ---
function KegiatanList({ kegiatan, onAddNew }: any) {
	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);

		const dateOptions = {
			day: "2-digit",
			month: "short",
			year: "numeric",
		} as const; // Tambahkan 'as const' di sini

		const timeOptions = {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		} as const; // Dan di sini

		return {
			date: date.toLocaleDateString("id-ID", dateOptions),
			time: date.toLocaleTimeString("id-ID", timeOptions).replace(/\./g, ":"),
		};
	};

	const getStatus = (tanggalMulai: any, tanggalSelesai: any) => {
		const now = new Date();
		const mulai = new Date(tanggalMulai);
		const selesai = new Date(tanggalSelesai);
		if (now >= mulai && now <= selesai) return "ongoing";
		if (now < mulai) return "upcoming";
		return "finished";
	};

	return (
		<div>
			<div className="mx-auto">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-2xl font-bold text-foreground">
							Daftar Kegiatan
						</h1>
						<p className="text-gray-500">
							Kelola semua kegiatan Anda di satu tempat
						</p>
					</div>
					<Button onClick={onAddNew} className="flex items-center gap-2">
						<Plus className="h-4 w-4" />
						Tambah Kegiatan
					</Button>
				</div>

				{kegiatan.length === 0 ? (
					<Card>
						<CardContent className="p-12 text-center">
							<div className="text-gray-500 mb-4">
								<Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p className="font-semibold">
									Belum ada kegiatan yang tersimpan
								</p>
								<p className="text-sm">
									Klik tombol "Tambah Kegiatan" untuk memulai
								</p>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4">
						{kegiatan.map((item: any) => {
							const mulaiFormatted = formatDateTime(item.tanggal_mulai);
							const selesaiFormatted = formatDateTime(item.tanggal_selesai);
							const status = getStatus(
								item.tanggal_mulai,
								item.tanggal_selesai
							);

							return (
								<Card
									key={item.id}
									className="hover:shadow-lg transition-shadow duration-300"
								>
									<CardHeader className="pb-4">
										<div className="flex items-start justify-between">
											<div className="space-y-2">
												<CardTitle className="text-lg">{item.nama}</CardTitle>
												<div className="flex items-center gap-2 text-gray-500">
													<MapPin className="h-4 w-4" />
													<span>{item.lokasi}</span>
												</div>
											</div>
											<div>
												{status === "ongoing" && (
													<Badge
														variant="default"
														className="bg-green-100 text-green-800"
													>
														Sedang Berlangsung
													</Badge>
												)}
												{status === "upcoming" && (
													<Badge variant="secondary">Akan Datang</Badge>
												)}
												{status === "finished" && (
													<Badge variant="outline">Selesai</Badge>
												)}
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
											<div className="flex items-center gap-3">
												<div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
													<Calendar className="h-4 w-4" />
												</div>
												<div>
													<p className="text-sm text-gray-500">Mulai</p>
													<p className="font-semibold">{mulaiFormatted.date}</p>
													<div className="flex items-center gap-1 text-sm text-gray-500">
														<Clock className="h-3 w-3" />
														{mulaiFormatted.time}
													</div>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
													<Calendar className="h-4 w-4" />
												</div>
												<div>
													<p className="text-sm text-gray-500">Selesai</p>
													<p className="font-semibold">
														{selesaiFormatted.date}
													</p>
													<div className="flex items-center gap-1 text-sm text-gray-500">
														<Clock className="h-3 w-3" />
														{selesaiFormatted.time}
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

// --- KegiatanForm Component (Direvisi menggunakan useMutation) ---
function KegiatanForm({ onBack, addKegiatanMutation }: any) {
	const [formData, setFormData] = useState({
		nama: "",
		lokasi: "",
		tanggalMulai: "",
		tanggalSelesai: "",
	});

	const { isPending, error } = addKegiatanMutation;

	const handleSubmit = (e: any) => {
		e.preventDefault();

		const payload = {
			nama: formData.nama,
			lokasi: formData.lokasi,
			tanggal_mulai: new Date(formData.tanggalMulai).toISOString(),
			tanggal_selesai: new Date(formData.tanggalSelesai).toISOString(),
		};

		addKegiatanMutation.mutate(payload);
	};

	const handleChange = (field: any, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div>
			<div className="mx-auto">
				<div className="flex items-center gap-4 mb-6">
					<Button
						variant="outline"
						size="icon"
						onClick={onBack}
						aria-label="Kembali"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-2xl font-bold text-foreground">
						Tambah Kegiatan Baru
					</h1>
				</div>
				<Card className="shadow-md">
					<CardHeader>
						<CardTitle>Detail Kegiatan</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="nama">Nama Kegiatan</Label>
								<Input
									id="nama"
									type="text"
									placeholder="Contoh: Rapat Anggaran Tahunan"
									value={formData.nama}
									onChange={(e) => handleChange("nama", e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lokasi">Lokasi Kegiatan</Label>
								<Input
									id="lokasi"
									type="text"
									placeholder="Contoh: Ruang Meeting A"
									value={formData.lokasi}
									onChange={(e) => handleChange("lokasi", e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="tanggalMulai">Tanggal & Waktu Mulai</Label>
								<Input
									id="tanggalMulai"
									type="datetime-local"
									value={formData.tanggalMulai}
									onChange={(e) => handleChange("tanggalMulai", e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="tanggalSelesai">Tanggal & Waktu Selesai</Label>
								<Input
									id="tanggalSelesai"
									type="datetime-local"
									value={formData.tanggalSelesai}
									onChange={(e) =>
										handleChange("tanggalSelesai", e.target.value)
									}
									required
								/>
							</div>
							{error && <p className="text-sm text-red-600">{error.message}</p>}
							<div className="flex flex-col sm:flex-row gap-4 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={onBack}
									className="flex-1"
									disabled={isPending}
								>
									Batal
								</Button>
								<Button type="submit" className="flex-1" disabled={isPending}>
									{isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Menyimpan...
										</>
									) : (
										"Simpan Kegiatan"
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// --- Main Page Component (Direvisi menggunakan TanStack Query) ---
export default function ManajemenKegiatanPage() {
	const [view, setView] = useState("list");

	// 1. Menggunakan useQuery untuk mengambil data
	const {
		data: kegiatan,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["kegiatan"], // Kunci unik untuk query ini
		queryFn: APIKegiatan.getAll, // Fungsi yang akan dijalankan untuk fetch data
		select: (data) =>
			// Opsi untuk mentransformasi data setelah fetch berhasil (misal: sorting)
			[...data].sort(
				(a, b) =>
					new Date(a.tanggal_mulai).getTime() -
					new Date(b.tanggal_mulai).getTime()
			),
	});

	// 2. Menggunakan useMutation untuk menambahkan data baru
	const addKegiatanMutation = useMutation({
		mutationFn: APIKegiatan.post,
		onSuccess: () => {
			// Jika berhasil, invalidasi query 'kegiatan' agar data di-refetch otomatis
			queryClient.invalidateQueries({ queryKey: ["kegiatan"] });
			// Kembali ke halaman list
			setView("list");
			// Di sini bisa ditambahkan notifikasi sukses, misal dengan react-hot-toast
			// toast.success('Kegiatan berhasil ditambahkan!');
		},
		onError: (err) => {
			// Handle error, misal dengan notifikasi
			console.error("Gagal menambahkan kegiatan:", err);
			// toast.error(err.message);
		},
	});

	// Render loading state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
			</div>
		);
	}

	// Render error state
	if (isError) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700 p-4">
				<div className="text-center">
					<h2 className="text-lg font-semibold mb-2">Terjadi Kesalahan</h2>
					<p>{error.message}</p>
					<p className="text-sm mt-2">
						Pastikan server backend Anda (localhost:5000) sedang berjalan.
					</p>
				</div>
			</div>
		);
	}

	// Render view berdasarkan state
	if (view === "form") {
		return (
			<DashboardLayout>
				<KegiatanForm
					onBack={() => setView("list")}
					addKegiatanMutation={addKegiatanMutation}
				/>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<KegiatanList
				kegiatan={kegiatan || []}
				onAddNew={() => setView("form")}
			/>
		</DashboardLayout>
	);
}
