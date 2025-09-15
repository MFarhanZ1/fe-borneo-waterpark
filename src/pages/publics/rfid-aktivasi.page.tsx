import APIRFID from "@/services/api/public/rfid.service";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

// Ikon untuk status SUKSES (tidak berubah)
const SuccessIcon = () => (
	<svg
		className="w-24 h-24 text-green-500"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
		></path>
	</svg>
);

// Ikon untuk status GAGAL (tidak berubah)
const ErrorIcon = () => (
	<svg
		className="w-24 h-24 text-red-500"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
		></path>
	</svg>
);

// Tipe untuk data yang diharapkan dari API
interface AktivasiResponse {
	message: string;
	data: {
		id: string;
		nim: string;
		status: string;
		nama: string;
		waktu_aktivasi: string;
		jabatan: {
			nama: string;
		};
	};
}

const RFIDAktivasiPage = () => {
	const formattedDate = (date: string) => new Date(date).toLocaleString("id-ID", {
		dateStyle: "full",
		timeStyle: "short",
	});
	const [searchParams] = useSearchParams();
	const id = searchParams.get("id");

	// 2. Gunakan method Anda langsung di dalam `queryFn`
	const { data, isLoading, isError, error } = useQuery<AktivasiResponse, Error>(
		{
			queryKey: ["aktivasi-rfid", id],
			queryFn: () => APIRFID.getAktivasiRFID({ id: id! }),
			enabled: !!id,
			staleTime: Infinity,
			retry: false,
		}
	);

	// 3. Logika render tidak perlu diubah sama sekali
	if (isLoading) {
		return (
			<main className="bg-gray-50 flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h1 className="text-2xl text-gray-700">Memproses aktivasi...</h1>
				</div>
			</main>
		);
	}

	if (isError) {
		return (
			<main className="bg-gray-50 flex items-center justify-center min-h-screen p-4">
				<div className="bg-white w-full max-w-2xl mx-auto rounded-xl shadow-lg p-6 md:p-10 space-y-8 text-center">
					<div className="flex justify-center">
						<ErrorIcon />
					</div>
					<h1 className="text-3xl text-gray-800">Aktivasi Gagal</h1>
					<p className="mt-2 text-lg text-gray-600 bg-red-100 p-3 rounded-md">
						{(error as any)?.response?.data.message ||
							"Terjadi kesalahan dalam aktivasi kartu RFID."}
					</p>
					<a
						href="/"
						className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
					>
						Kembali ke Beranda
					</a>
				</div>
			</main>
		);
	}

	return (
		<main className="bg-gray-50 flex items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
			<div className="bg-white w-full max-w-2xl mx-auto rounded-xl shadow-lg p-6 sm:p-8 md:p-10 space-y-6">
				<div className="flex justify-center">
					<SuccessIcon />
				</div>
				<div className="text-center">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
						{data?.message || "Aktivasi Berhasil!"}
					</h1>
					<p className="mt-2 text-base sm:text-lg text-gray-600">
						Kartu RFID Anda telah aktif dan siap digunakan.
					</p>
				</div>
				<hr />
				<div className="space-y-4">
					<h2 className="text-lg sm:text-xl font-semibold text-gray-700">
						Detail Kartu Anda
					</h2>
					<div className="border border-gray-200 rounded-lg p-4 space-y-4">
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
							<span className="font-medium text-gray-500 text-sm">
								Nomor Kartu RFID
							</span>
							<span className="font-mono text-gray-800 font-semibold break-all text-left sm:text-right">{`RFID-${data?.data?.id}`}</span>
						</div>
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
							<span className="font-medium text-gray-500 text-sm">
								NIM Terkait
							</span>
							<span className="font-mono text-gray-800 font-semibold break-all text-left sm:text-right">
								{data?.data?.nim}
							</span>
						</div>
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
							<span className="font-medium text-gray-500 text-sm">
								Nama Pengurus
							</span>
							<span className="text-gray-800 font-semibold break-words text-left sm:text-right">
								{data?.data?.nama}
							</span>
						</div>
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
							<span className="font-medium text-gray-500 text-sm">
								Jabatan Pengurus
							</span>
							<span className="text-gray-800 font-semibold break-words text-left sm:text-right">
								{data?.data?.jabatan?.nama}
							</span>
						</div>
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
							<span className="font-medium text-gray-500 text-sm">Status</span>
							<span className="flex items-center gap-2 font-semibold bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mt-1 sm:mt-0 self-start sm:self-center">
								<span className="w-2 h-2 bg-green-500 rounded-full"></span>
								{data?.data?.status}
							</span>
						</div>
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
							<span className="font-medium text-gray-500 text-sm">
								Waktu Aktivasi
							</span>
							<span className="text-gray-800 text-left sm:text-right">
								{formattedDate(data?.data?.waktu_aktivasi || "")}
							</span>
						</div>
					</div>
				</div>
				<div className="pt-4">
					<a
						href="/"
						className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
					>
						Kembali ke Beranda
					</a>
				</div>
			</div>
		</main>
	);
};

export default RFIDAktivasiPage;
