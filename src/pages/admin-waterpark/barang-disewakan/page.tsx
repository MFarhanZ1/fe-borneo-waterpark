import DashboardLayout from "@/components/globals/layouts/dashboard-layout";
import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
	FormEvent,
	ChangeEvent,
    useRef,
} from "react";

// =========================================================
// 1. TYPE DEFINITIONS (Berdasarkan skema OpenAPI 'Barang')
// =========================================================

// Interface untuk data yang dikirim saat CREATE/UPDATE (tanpa ID dan URL)
interface BarangCreate {
	nama: string;
	akronim: string;
	harga: number;
}

// Interface untuk data yang lengkap dari API
interface Barang extends BarangCreate {
	id: number;
	url_gambar: string; // URL gambar setelah diupload
}

// State untuk Form yang juga menampung file gambar
interface FormState extends BarangCreate {
	gambar: File | null;
}

// Data awal untuk form
const INITIAL_FORM_DATA: FormState = {
	nama: "",
	akronim: "",
	harga: 0,
	gambar: null,
};

const BASE_URL = import.meta.env.VITE_API_URL + "/barang/";

// =========================================================
// 2. API FUNCTIONS (Inline)
// =========================================================

const api = {
	// READ ALL
	readAllBarang: async (): Promise<Barang[]> => {
		const response = await fetch(BASE_URL);
		if (!response.ok) throw new Error("Gagal mengambil data barang.");
		return response.json();
	},

	// CREATE (Menggunakan FormData karena ada file upload)
	createNewBarang: async (formData: FormData): Promise<Barang> => {
		const response = await fetch(BASE_URL, {
			method: "POST",
			body: formData, // Tidak perlu set Content-Type, browser akan set multipart/form-data
		});
		if (response.status === 422) {
			const errorData = await response.json();
			throw new Error(`Validation Error: ${JSON.stringify(errorData.detail)}`);
		}
		if (!response.ok) throw new Error("Gagal membuat barang baru.");
		return response.json();
	},

	// UPDATE (Menggunakan FormData karena ada file upload opsional)
	updateExistingBarang: async (
		id: number,
		formData: FormData
	): Promise<Barang> => {
		const response = await fetch(`${BASE_URL}${id}`, {
			method: "PUT",
			body: formData, // Tidak perlu set Content-Type
		});
		if (response.status === 422) {
			const errorData = await response.json();
			throw new Error(`Validation Error: ${JSON.stringify(errorData.detail)}`);
		}
		if (!response.ok) throw new Error("Gagal memperbarui barang.");
		return response.json();
	},

	// DELETE
	deleteExistingBarang: async (id: number): Promise<Barang> => {
		const response = await fetch(`${BASE_URL}${id}`, {
			method: "DELETE",
		});
		if (!response.ok) throw new Error("Gagal menghapus barang.");
		return response.json();
	},
};

// =========================================================
// 3. MAIN COMPONENT
// =========================================================

const BarangManagement: React.FC = () => {
	// State untuk data barang dan loading
	const [barangs, setBarangs] = useState<Barang[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// State untuk form (Create/Update)
	const [editingBarang, setEditingBarang] = useState<Barang | null>(null);
	const [formData, setFormData] = useState<FormState>(INITIAL_FORM_DATA);
	const [formLoading, setFormLoading] = useState<boolean>(false);

	// State untuk Search
	const [searchTerm, setSearchTerm] = useState<string>("");

	// --- Data Fetching ---
	const fetchBarangs = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await api.readAllBarang();
			setBarangs(data.sort((a, b) => a.id - b.id));
		} catch (err) {
			console.error(err);
			setError("Gagal memuat data barang. Pastikan API berjalan.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchBarangs();
	}, [fetchBarangs]);

    const fileInputRef = useRef<HTMLInputElement>(null); // <--- BARIS BARU

	// --- Form Handlers ---
	const resetForm = () => {
		setEditingBarang(null);
		setFormData(INITIAL_FORM_DATA);
		// RESET INPUT FILE MENGGUNAKAN REF
		if (fileInputRef.current) {
			fileInputRef.current.value = ""; // <--- BARIS PENTING
		}
	};

	useEffect(() => {
		if (editingBarang) {
			// Isi form data dari data yang diedit, tapi reset file gambar
			setFormData({
				nama: editingBarang.nama,
				akronim: editingBarang.akronim,
				harga: editingBarang.harga,
				gambar: null,
			});
		} else {
			resetForm();
		}
	}, [editingBarang]);

	const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "number" ? parseInt(value) || 0 : value,
		}));
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files ? e.target.files[0] : null;
		setFormData((prev) => ({
			...prev,
			gambar: file,
		}));
	};

	const buildFormData = (): FormData => {
		const data = new FormData();
		data.append("nama", formData.nama);
		data.append("akronim", formData.akronim);
		data.append("harga", formData.harga.toString());

		// --- LOGIKA PERBAIKAN DI SINI ---
		if (editingBarang) {
			// MODE UPDATE
			if (formData.gambar) {
				// Kasus 1: Ada file baru yang di-upload, kirim file tersebut.
				data.append("gambar", formData.gambar);
			}
			// Kasus 2: Tidak ada file baru (formData.gambar adalah null).
			// Dalam mode UPDATE, kita TIDAK MENGIRIMKAN field 'gambar' sama sekali.
			// Backend akan secara otomatis mempertahankan nilai 'url_gambar' yang lama.

			// Catatan: Jika backend Anda MENGHARUSKAN file 'null' dikirim untuk mempertahankan gambar,
			// barulah Anda perlu menambahkan logic Blob seperti sebelumnya, tetapi
			// di API yang baik, field opsional harus diabaikan jika tidak ada perubahan.
		} else {
			// MODE CREATE
			// Gambar selalu wajib (sudah divalidasi di handleFormSubmit)
			if (formData.gambar) {
				data.append("gambar", formData.gambar);
			}
		}

		return data;
	};

	const handleFormSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setFormLoading(true);

		// Validasi minimal untuk file di mode CREATE
		if (!editingBarang && !formData.gambar) {
			alert("Harap upload gambar untuk barang baru.");
			setFormLoading(false);
			return;
		}

		try {
			const dataToSubmit = buildFormData();
			let result: Barang;

			if (editingBarang) {
				// UPDATE Logic
				result = await api.updateExistingBarang(editingBarang.id, dataToSubmit);
				setBarangs((prev) =>
					prev.map((t) => (t.id === result.id ? result : t))
				);
				alert(`Barang ID ${result.id} berhasil diperbarui.`);
			} else {
				// CREATE Logic
				result = await api.createNewBarang(dataToSubmit);
				setBarangs((prev) => [...prev, result].sort((a, b) => a.id - b.id));
				alert("Barang baru berhasil dibuat.");
			}
			resetForm();
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Terjadi kesalahan tidak dikenal.";
			alert(`Operasi Gagal: ${errorMessage}`);
			console.error(err);
		} finally {
			setFormLoading(false);
		}
	};

	// --- Table Action Handlers ---
	const handleEdit = (barang: Barang) => {
		setEditingBarang(barang);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleDelete = async (id: number) => {
		if (!window.confirm(`Yakin ingin menghapus Barang ID ${id}?`)) return;

		setLoading(true);
		try {
			await api.deleteExistingBarang(id);
			setBarangs((prev) => prev.filter((t) => t.id !== id));
			alert(`Barang ID ${id} berhasil dihapus.`);
		} catch (err) {
			alert(
				`Hapus Gagal: ${
					err instanceof Error ? err.message : "Terjadi kesalahan"
				}`
			);
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	// --- Search Filtering ---
	const filteredBarangs = useMemo(() => {
		if (!searchTerm) return barangs;
		const lowerCaseSearch = searchTerm.toLowerCase();

		return barangs.filter(
			(barang) =>
				barang.nama.toLowerCase().includes(lowerCaseSearch) ||
				barang.akronim.toLowerCase().includes(lowerCaseSearch) ||
				barang.harga.toString().includes(lowerCaseSearch) ||
				barang.id.toString().includes(lowerCaseSearch)
		);
	}, [barangs, searchTerm]);

	return (
		<DashboardLayout>
			<div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
				<header className="mb-8 text-center border-b pb-4">
					<h1 className="text-3xl font-extrabold text-green-700">
						🧺 Manajemen Barang Disewakan
					</h1>
					<p className="text-md text-gray-500">
						API CRUD Frontend untuk Barang Sewa Borneo Waterpark
					</p>
				</header>

				<div className="flex flex-col lg:flex-row gap-8 max-w-screen-xl mx-auto">
					{/* ========================================================= */}
					{/* KIRI: FORM INPUT (CREATE/UPDATE) */}
					{/* ========================================================= */}
					<div className="lg:w-1/3 p-6 bg-white rounded-xl shadow-lg h-fit border-t-4 border-green-500 sticky top-8">
						<h2 className="text-xl font-bold mb-6 text-gray-800">
							{editingBarang
								? `✏️ Edit Barang ID: ${editingBarang.id}`
								: "➕ Barang Baru"}
						</h2>

						<form onSubmit={handleFormSubmit} className="space-y-4">
							{/* Nama Barang */}
							<div>
								<label
									className="block text-sm font-medium text-gray-700 mb-1"
									htmlFor="nama"
								>
									Nama Barang
								</label>
								<input
									type="text"
									name="nama"
									id="nama"
									value={formData.nama}
									onChange={handleTextChange}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
									placeholder="Contoh: Ban Pelampung Single"
									required
									disabled={formLoading}
								/>
							</div>

							{/* Akronim */}
							<div>
								<label
									className="block text-sm font-medium text-gray-700 mb-1"
									htmlFor="akronim"
								>
									Akronim
								</label>
								<input
									type="text"
									name="akronim"
									id="akronim"
									value={formData.akronim}
									onChange={handleTextChange}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
									placeholder="Contoh: 100k, 150k, 200k..."
									required
									disabled={formLoading}
								/>
							</div>

							{/* Harga */}
							<div>
								<label
									className="block text-sm font-medium text-gray-700 mb-1"
									htmlFor="harga"
								>
									Harga Sewa (Rp)
								</label>
								<input
									type="number"
									name="harga"
									id="harga"
									value={formData.harga}
									onChange={handleTextChange}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
									required
									min="0"
									disabled={formLoading}
								/>
							</div>

							{/* Gambar */}
							<div className="pt-2">
								<label
									className="block text-sm font-medium text-gray-700 mb-1"
									htmlFor="gambar"
								>
									Gambar Barang{" "}
									{editingBarang
										? "(Kosongkan untuk tetap menggunakan gambar lama)"
										: ""}
								</label>
								<input
									type="file"
									name="gambar"
                                    ref={fileInputRef}
									id="gambar"
									accept="image/*"
									onChange={handleFileChange}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition duration-150"
									required={!editingBarang} // Gambar wajib jika membuat baru
									disabled={formLoading}
								/>
								{editingBarang && editingBarang.url_gambar && (
									<p className="text-xs text-gray-500 mt-1">
										Gambar lama:{" "}
										<a
											href={
												import.meta.env.VITE_API_URL + editingBarang.url_gambar
											}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-500 hover:underline"
										>
											Lihat Gambar
										</a>
									</p>
								)}
							</div>

							<div className="flex justify-between pt-4">
								{editingBarang && (
									<button
										type="button"
										onClick={resetForm}
										disabled={formLoading}
										className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition duration-150 disabled:opacity-50"
									>
										Batal Edit
									</button>
								)}
								<button
									type="submit"
									disabled={formLoading}
									className={`py-2 px-4 text-white font-semibold rounded-lg shadow-md transition duration-150 ${
										formLoading
											? "bg-green-400 cursor-not-allowed"
											: "bg-green-600 hover:bg-green-700"
									}`}
								>
									{formLoading
										? "Memproses..."
										: editingBarang
										? "Simpan Perubahan"
										: "Buat Barang"}
								</button>
							</div>
						</form>
					</div>

					{/* ========================================================= */}
					{/* KANAN: TABLE DAN SEARCH (READ/DELETE) */}
					{/* ========================================================= */}
					<div className="lg:w-2/3 space-y-6">
						<h2 className="text-xl font-bold text-gray-800">
							Daftar Barang Disewakan ({filteredBarangs.length} Item)
						</h2>

						{/* Search Input */}
						<div className="p-4 bg-white rounded-lg shadow-md">
							<input
								type="text"
								placeholder="Cari berdasarkan Nama, Akronim, atau Harga..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
								disabled={loading}
							/>
						</div>

						{/* Table View */}
						<div className="overflow-x-auto bg-white rounded-lg shadow-xl">
							{loading && !formLoading && (
								<div className="p-8 text-center text-green-600 font-medium">
									Memuat data...
								</div>
							)}
							{error && (
								<div className="p-8 text-center text-red-600 font-medium border-l-4 border-red-500">
									Error: {error}
								</div>
							)}

							{!loading && !error && filteredBarangs.length === 0 && (
								<div className="p-8 text-center text-gray-500">
									{searchTerm
										? `Tidak ditemukan barang untuk "${searchTerm}".`
										: "Belum ada data barang."}
								</div>
							)}

							{!loading && !error && filteredBarangs.length > 0 && (
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-100">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
												ID
											</th>
											<th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
												Nama
											</th>
											<th className="py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
												Gambar
											</th>
											<th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
												Akronim
											</th>
											<th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
												Harga (Rp)
											</th>
											<th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
												Aksi
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{filteredBarangs.map((barang) => (
											<tr
												key={barang.id}
												className="hover:bg-green-50 transition duration-100"
											>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{barang.id}
												</td>
												<td className="px-6 py-4 text-sm text-gray-600">
													{barang.nama}
													{/* Tambahkan link gambar kecil di tabel */}
												</td>
												<td className="py-4 whitespace-nowrap flex justify-center items-center text-sm text-gray-600">
													<img
														src={
															import.meta.env.VITE_API_URL + barang.url_gambar
														}
														className="text-xs text-blue-500 w-1/2 hover:underline"
													/>
												</td>
												<td className="whitespace-nowrap text-sm text-center text-gray-600">
													{barang.akronim}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-red-700">
													{barang.harga.toLocaleString("id-ID")}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
													<button
														onClick={() => handleEdit(barang)}
														className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold disabled:opacity-50"
														disabled={loading || formLoading}
													>
														Edit
													</button>
													<button
														onClick={() => handleDelete(barang.id)}
														className="text-red-600 hover:text-red-900 font-semibold disabled:opacity-50"
														disabled={loading || formLoading}
													>
														Hapus
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default BarangManagement;
