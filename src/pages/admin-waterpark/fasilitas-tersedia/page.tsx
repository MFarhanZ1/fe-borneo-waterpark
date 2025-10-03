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
// 1. TYPE DEFINITIONS (Berdasarkan skema OpenAPI 'Fasilitas')
// =========================================================

// Interface untuk data yang dikirim saat CREATE/UPDATE (tanpa ID dan URL)
interface FasilitasCreate {
	nama: string;
}

// Interface untuk data yang lengkap dari API
interface Fasilitas extends FasilitasCreate {
	id: number;
	url_gambar: string; // URL gambar setelah diupload
}

// State untuk Form yang juga menampung file gambar
interface FormState extends FasilitasCreate {
	gambar: File | null;
}

// Data awal untuk form
const INITIAL_FORM_DATA: FormState = {
	nama: "",
	gambar: null,
};

const BASE_URL = import.meta.env.VITE_API_URL + "/fasilitas/";

// =========================================================
// 2. API FUNCTIONS (Inline)
// =========================================================

const api = {
	// READ ALL
	readAllFasilitas: async (): Promise<Fasilitas[]> => {
		const response = await fetch(BASE_URL);
		if (!response.ok) throw new Error("Gagal mengambil data fasilitas.");
		return response.json();
	},

	// CREATE (Menggunakan FormData karena ada file upload)
	createNewFasilitas: async (formData: FormData): Promise<Fasilitas> => {
		const response = await fetch(BASE_URL, {
			method: "POST",
			body: formData, // multipart/form-data
		});
		if (response.status === 422) {
			const errorData = await response.json();
			throw new Error(`Validation Error: ${JSON.stringify(errorData.detail)}`);
		}
		if (!response.ok) throw new Error("Gagal membuat fasilitas baru.");
		return response.json();
	},

	// UPDATE (Menggunakan FormData karena ada file upload opsional)
	updateExistingFasilitas: async (
		id: number,
		formData: FormData
	): Promise<Fasilitas> => {
		const response = await fetch(`${BASE_URL}${id}`, {
			method: "PUT",
			body: formData, // multipart/form-data
		});
		if (response.status === 422) {
			const errorData = await response.json();
			throw new Error(`Validation Error: ${JSON.stringify(errorData.detail)}`);
		}
		if (!response.ok) throw new Error("Gagal memperbarui fasilitas.");
		return response.json();
	},

	// DELETE
	deleteExistingFasilitas: async (id: number): Promise<Fasilitas> => {
		const response = await fetch(`${BASE_URL}${id}`, {
			method: "DELETE",
		});
		if (!response.ok) throw new Error("Gagal menghapus fasilitas.");
		return response.json();
	},
};

// =========================================================
// 3. MAIN COMPONENT
// =========================================================

const FasilitasManagement: React.FC = () => {
	// State data dan loading
	const [fasilitas, setFasilitas] = useState<Fasilitas[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// State form
	const [editingFasilitas, setEditingFasilitas] = useState<Fasilitas | null>(
		null
	);
	const [formData, setFormData] = useState<FormState>(INITIAL_FORM_DATA);
	const [formLoading, setFormLoading] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// State Search
	const [searchTerm, setSearchTerm] = useState<string>("");

	// --- Data Fetching ---
	const fetchFasilitas = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await api.readAllFasilitas();
			setFasilitas(data.sort((a, b) => a.id - b.id));
		} catch (err) {
			console.error(err);
			setError("Gagal memuat data fasilitas. Pastikan API berjalan.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchFasilitas();
	}, [fetchFasilitas]);

	// --- Form Handlers ---
	const resetForm = () => {
		setEditingFasilitas(null);
		setFormData(INITIAL_FORM_DATA);
		// RESET INPUT FILE
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	useEffect(() => {
		if (editingFasilitas) {
			setFormData({
				nama: editingFasilitas.nama,
				gambar: null,
			});
		} else {
			resetForm();
		}
	}, [editingFasilitas]);

	const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
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

		if (formData.gambar) {
			// Jika ada file baru di form, kirim file tersebut (untuk CREATE atau UPDATE)
			data.append("gambar", formData.gambar);
		} else if (editingFasilitas) {
			// Jika mode UPDATE dan TIDAK ADA file baru (formData.gambar == null),
			// kita TIDAK MENGIRIMKAN field 'gambar' sama sekali.
			// Backend akan mempertahankan 'url_gambar' yang lama.
		} else {
			// Mode CREATE: File harus ada (dicek di handleFormSubmit)
		}

		return data;
	};

	const handleFormSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setFormLoading(true);

		// Validasi minimal untuk file di mode CREATE
		if (!editingFasilitas && !formData.gambar) {
			alert("Harap upload gambar untuk fasilitas baru.");
			setFormLoading(false);
			return;
		}

		try {
			const dataToSubmit = buildFormData();
			let result: Fasilitas;

			if (editingFasilitas) {
				// UPDATE Logic
				result = await api.updateExistingFasilitas(
					editingFasilitas.id,
					dataToSubmit
				);
				setFasilitas((prev) =>
					prev.map((t) => (t.id === result.id ? result : t))
				);
				alert(`Fasilitas ID ${result.id} berhasil diperbarui.`);
			} else {
				// CREATE Logic
				result = await api.createNewFasilitas(dataToSubmit);
				setFasilitas((prev) => [...prev, result].sort((a, b) => a.id - b.id));
				alert("Fasilitas baru berhasil dibuat.");
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
	const handleEdit = (fasilitas: Fasilitas) => {
		setEditingFasilitas(fasilitas);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleDelete = async (id: number) => {
		if (!window.confirm(`Yakin ingin menghapus Fasilitas ID ${id}?`)) return;

		setLoading(true);
		try {
			await api.deleteExistingFasilitas(id);
			setFasilitas((prev) => prev.filter((t) => t.id !== id));
			alert(`Fasilitas ID ${id} berhasil dihapus.`);
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
	const filteredFasilitas = useMemo(() => {
		if (!searchTerm) return fasilitas;
		const lowerCaseSearch = searchTerm.toLowerCase();

		return fasilitas.filter(
			(fasil) =>
				fasil.nama.toLowerCase().includes(lowerCaseSearch) ||
				fasil.id.toString().includes(lowerCaseSearch)
		);
	}, [fasilitas, searchTerm]);

	return (
		<DashboardLayout>
			<div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
				<header className="mb-8 text-center border-b pb-4">
					<h1 className="text-3xl font-extrabold text-indigo-700">
						🏖️ Manajemen Fasilitas Tersedia
					</h1>
					<p className="text-md text-gray-500">
						API CRUD Frontend untuk Fasilitas Borneo Waterpark
					</p>
				</header>

				<div className="flex flex-col lg:flex-row gap-8 max-w-screen-xl mx-auto">
					{/* ========================================================= */}
					{/* KIRI: FORM INPUT (CREATE/UPDATE) */}
					{/* ========================================================= */}
					<div className="lg:w-1/3 p-6 bg-white rounded-xl shadow-lg h-fit border-t-4 border-indigo-500 sticky top-8">
						<h2 className="text-xl font-bold mb-6 text-gray-800">
							{editingFasilitas
								? `✏️ Edit Fasilitas ID: ${editingFasilitas.id}`
								: "➕ Fasilitas Baru"}
						</h2>

						<form onSubmit={handleFormSubmit} className="space-y-4">
							{/* Nama Fasilitas */}
							<div>
								<label
									className="block text-sm font-medium text-gray-700 mb-1"
									htmlFor="nama"
								>
									Nama Fasilitas
								</label>
								<input
									type="text"
									name="nama"
									id="nama"
									value={formData.nama}
									onChange={handleTextChange}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
									placeholder="Contoh: Kolam Arus, Flying Fox"
									required
									disabled={formLoading}
								/>
							</div>

							{/* Gambar */}
							<div className="pt-2">
								<label
									className="block text-sm font-medium text-gray-700 mb-1"
									htmlFor="gambar"
								>
									Gambar Fasilitas{" "}
									{editingFasilitas
										? "(Kosongkan untuk tetap menggunakan gambar lama)"
										: ""}
								</label>
								<input
									type="file"
									name="gambar"
									id="gambar"
									ref={fileInputRef}
									accept="image/*"
									onChange={handleFileChange}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition duration-150"
									required={!editingFasilitas} // Gambar wajib jika membuat baru
									disabled={formLoading}
								/>
								{editingFasilitas && editingFasilitas.url_gambar && (
									<p className="text-xs text-gray-500 mt-1">
										Gambar lama:{" "}
										<a
											href={
												import.meta.env.VITE_API_URL +
												editingFasilitas.url_gambar
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
								{editingFasilitas && (
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
											? "bg-indigo-400 cursor-not-allowed"
											: "bg-indigo-600 hover:bg-indigo-700"
									}`}
								>
									{formLoading
										? "Memproses..."
										: editingFasilitas
										? "Simpan Perubahan"
										: "Buat Fasilitas"}
								</button>
							</div>
						</form>
					</div>

					{/* ========================================================= */}
					{/* KANAN: TABLE DAN SEARCH (READ/DELETE) */}
					{/* ========================================================= */}
					<div className="lg:w-2/3 space-y-6">
						<h2 className="text-xl font-bold text-gray-800">
							Daftar Fasilitas Tersedia ({filteredFasilitas.length} Item)
						</h2>

						{/* Search Input */}
						<div className="p-4 bg-white rounded-lg shadow-md">
							<input
								type="text"
								placeholder="Cari berdasarkan Nama Fasilitas atau ID..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
								disabled={loading}
							/>
						</div>

						{/* Table View */}
						<div className="overflow-x-auto bg-white rounded-lg shadow-xl">
							{loading && !formLoading && (
								<div className="p-8 text-center text-indigo-600 font-medium">
									Memuat data...
								</div>
							)}
							{error && (
								<div className="p-8 text-center text-red-600 font-medium border-l-4 border-red-500">
									Error: {error}
								</div>
							)}

							{!loading && !error && filteredFasilitas.length === 0 && (
								<div className="p-8 text-center text-gray-500">
									{searchTerm
										? `Tidak ditemukan fasilitas untuk "${searchTerm}".`
										: "Belum ada data fasilitas."}
								</div>
							)}

							{!loading && !error && filteredFasilitas.length > 0 && (
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
												Aksi
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{filteredFasilitas.map((fasil) => (
											<tr
												key={fasil.id}
												className="hover:bg-indigo-50 transition duration-100"
											>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{fasil.id}
												</td>
												<td className="px-6 py-4 text-sm text-gray-600">
													{fasil.nama}
												</td>
												<td className="py-4 whitespace-nowrap flex justify-center items-center text-sm text-gray-600">
													<img
														src={
															import.meta.env.VITE_API_URL + fasil.url_gambar
														}
														alt={fasil.nama}
														className="h-10 w-10 object-cover rounded-md"
														onError={(e) => {
															const target = e.target as HTMLImageElement;
															target.onerror = null;
															target.src = fasil.url_gambar; // Coba URL tanpa VITE_API_URL jika error
														}}
													/>
													<a
														href={
															import.meta.env.VITE_API_URL + fasil.url_gambar
														}
														target="_blank"
														rel="noopener noreferrer"
														className="ml-2 text-xs text-blue-500 hover:underline"
													>
														(Lihat Gbr)
													</a>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
													<button
														onClick={() => handleEdit(fasil)}
														className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold disabled:opacity-50"
														disabled={loading || formLoading}
													>
														Edit
													</button>
													<button
														onClick={() => handleDelete(fasil.id)}
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

export default FasilitasManagement;
