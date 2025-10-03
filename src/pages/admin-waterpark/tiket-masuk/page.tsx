import DashboardLayout from '@/components/globals/layouts/dashboard-layout';
import React, { useState, useEffect, useCallback, useMemo, FormEvent, ChangeEvent } from 'react';

// =========================================================
// 1. TYPE DEFINITIONS
// =========================================================

type BerlakuUntuk = 'Weekend' | 'Weekday' | 'Anak_Anak_dibawah_80_cm';

interface TiketCreate {
    berlaku_untuk: BerlakuUntuk;
    akronim: string;
    harga: number;
}

interface Tiket extends TiketCreate {
    id: number;
}

// Opsi untuk dropdown
const BERLAKU_UNTUK_OPTIONS: { value: BerlakuUntuk, label: string }[] = [
    { value: 'Weekday', label: 'Hari Kerja (Weekday)' },
    { value: 'Weekend', label: 'Akhir Pekan (Weekend)' },
    { value: 'Anak_Anak_dibawah_80_cm', label: 'Anak < 80 cm' },
];

const BASE_URL = import.meta.env.VITE_API_URL + '/tiket/'; // Ganti dengan URL API Anda

// =========================================================
// 2. API FUNCTIONS (Inline)
// =========================================================

const api = {
    // READ
    readAllTiket: async (): Promise<Tiket[]> => {
        const response = await fetch(BASE_URL);
        if (!response.ok) throw new Error('Gagal mengambil data tiket.');
        return response.json();
    },

    // CREATE
    createNewTiket: async (tiketData: TiketCreate): Promise<Tiket> => {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tiketData),
        });
        if (!response.ok) throw new Error('Gagal membuat tiket baru.');
        return response.json();
    },

    // UPDATE
    updateExistingTiket: async (id: number, tiketData: TiketCreate): Promise<Tiket> => {
        const response = await fetch(`${BASE_URL}${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tiketData),
        });
        if (!response.ok) throw new Error('Gagal memperbarui tiket.');
        return response.json();
    },

    // DELETE
    deleteExistingTiket: async (id: number): Promise<Tiket> => {
        const response = await fetch(`${BASE_URL}${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Gagal menghapus tiket.');
        return response.json();
    },
};

// =========================================================
// 3. MAIN COMPONENT
// =========================================================

const TiketManagement: React.FC = () => {
    // State untuk data tiket
    const [tikets, setTikets] = useState<Tiket[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // State untuk form (Create/Update)
    const [editingTiket, setEditingTiket] = useState<Tiket | null>(null);
    const [formData, setFormData] = useState<TiketCreate>({
        berlaku_untuk: 'Weekday',
        akronim: '',
        harga: 0,
    });
    const [formLoading, setFormLoading] = useState<boolean>(false);

    // State untuk Search
    const [searchTerm, setSearchTerm] = useState<string>('');

    // --- Data Fetching ---
    const fetchTikets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.readAllTiket();
            setTikets(data.sort((a, b) => a.id - b.id)); // Sort by ID
        } catch (err) {
            console.error(err);
            setError('Gagal memuat data tiket. Pastikan API berjalan.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTikets();
    }, [fetchTikets]);

    // --- Form Handlers ---
    const resetForm = () => {
        setEditingTiket(null);
        setFormData({ berlaku_untuk: 'Weekday', akronim: '', harga: 0 });
    };

    useEffect(() => {
        if (editingTiket) {
            setFormData({
                berlaku_untuk: editingTiket.berlaku_untuk,
                akronim: editingTiket.akronim,
                harga: editingTiket.harga,
            });
        } else {
            resetForm();
        }
    }, [editingTiket]);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value,
        }));
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (editingTiket) {
                // UPDATE Logic
                const updatedTiket = await api.updateExistingTiket(editingTiket.id, formData);
                setTikets(prev => prev.map(t => t.id === updatedTiket.id ? updatedTiket : t));
                alert(`Tiket ID ${updatedTiket.id} berhasil diperbarui.`);
            } else {
                // CREATE Logic
                const newTiket = await api.createNewTiket(formData);
                setTikets(prev => [...prev, newTiket].sort((a, b) => a.id - b.id));
                alert('Tiket baru berhasil dibuat.');
            }
            resetForm();
        } catch (err) {
            alert(`Operasi Gagal: ${err instanceof Error ? err.message : 'Terjadi kesalahan'}`);
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    // --- Table Action Handlers ---
    const handleEdit = (tiket: Tiket) => {
        setEditingTiket(tiket);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Yakin ingin menghapus Tiket ID ${id}?`)) return;

        setLoading(true); // Gunakan loading utama untuk mencegah aksi lain saat menghapus
        try {
            await api.deleteExistingTiket(id);
            setTikets(prev => prev.filter(t => t.id !== id));
            alert(`Tiket ID ${id} berhasil dihapus.`);
        } catch (err) {
            alert(`Hapus Gagal: ${err instanceof Error ? err.message : 'Terjadi kesalahan'}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Search Filtering ---
    const filteredTikets = useMemo(() => {
        if (!searchTerm) return tikets;
        const lowerCaseSearch = searchTerm.toLowerCase();

        return tikets.filter(tiket =>
            tiket.akronim.toLowerCase().includes(lowerCaseSearch) ||
            tiket.berlaku_untuk.toLowerCase().includes(lowerCaseSearch.replace(/\s/g, '_')) || // Handle enum space conversion
            tiket.harga.toString().includes(lowerCaseSearch)
        );
    }, [tikets, searchTerm]);

    return (
        <DashboardLayout>
            <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
                <header className="mb-8 text-center border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-blue-700">
                        🎟️ Manajemen Tiket Masuk
                    </h1>
                    <p className="text-md text-gray-500">Borneo Waterpark API CRUD Frontend</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 max-w-screen-xl mx-auto">
                    {/* ========================================================= */}
                    {/* KIRI: FORM INPUT (CREATE/UPDATE) */}
                    {/* ========================================================= */}
                    <div className="lg:w-1/3 p-6 bg-white rounded-xl shadow-lg h-fit border-t-4 border-blue-500 sticky top-8">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">
                            {editingTiket ? `✏️ Edit Tiket ID: ${editingTiket.id}` : '➕ Buat Tiket Baru'}
                        </h2>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="berlaku_untuk">Berlaku Untuk</label>
                                <select
                                    name="berlaku_untuk"
                                    id="berlaku_untuk"
                                    value={formData.berlaku_untuk}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    required
                                    disabled={formLoading}
                                >
                                    {BERLAKU_UNTUK_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="akronim">Akronim</label>
                                <input
                                    type="text"
                                    name="akronim"
                                    id="akronim"
                                    value={formData.akronim}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    placeholder="Contoh: 20k, 35k, 40k..."
                                    required
                                    disabled={formLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="harga">Harga (Rp)</label>
                                <input
                                    type="number"
                                    name="harga"
                                    id="harga"
                                    value={formData.harga}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    required
                                    min="0"
                                    disabled={formLoading}
                                />
                            </div>

                            <div className="flex justify-between pt-4">
                                {editingTiket && (
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
                                    className={`py-2 px-4 text-white font-semibold rounded-lg shadow-md transition duration-150 ${formLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {formLoading ? 'Memproses...' : (editingTiket ? 'Simpan Perubahan' : 'Buat Tiket')}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ========================================================= */}
                    {/* KANAN: TABLE DAN SEARCH (READ/DELETE) */}
                    {/* ========================================================= */}
                    <div className="lg:w-2/3 space-y-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Daftar Tiket ({filteredTikets.length} Item)
                        </h2>

                        {/* Search Input */}
                        <div className="p-4 bg-white rounded-lg shadow-md">
                            <input
                                type="text"
                                placeholder="Cari berdasarkan Akronim, Berlaku Untuk, atau Harga..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                            />
                        </div>

                        {/* Table View */}
                        <div className="overflow-x-auto bg-white rounded-lg shadow-xl">
                            {loading && !formLoading && (
                                <div className="p-8 text-center text-blue-600 font-medium">
                                    Memuat data...
                                </div>
                            )}
                            {error && (
                                <div className="p-8 text-center text-red-600 font-medium border-l-4 border-red-500">
                                    Error: {error}
                                </div>
                            )}
                            
                            {!loading && !error && filteredTikets.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    {searchTerm ? `Tidak ditemukan tiket untuk "${searchTerm}".` : "Belum ada data tiket."}
                                </div>
                            )}

                            {!loading && !error && filteredTikets.length > 0 && (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Akronim</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Berlaku Untuk</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Harga (Rp)</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTikets.map((tiket) => (
                                            <tr key={tiket.id} className="hover:bg-blue-50 transition duration-100">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tiket.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tiket.akronim}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {tiket.berlaku_untuk.replace(/_/g, ' ')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-700">
                                                    {tiket.harga.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(tiket)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold disabled:opacity-50"
                                                        disabled={loading || formLoading}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(tiket.id)}
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

export default TiketManagement;