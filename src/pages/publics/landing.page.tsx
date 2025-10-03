import HeroSectionIMG from "@/assets/svgs/hero-section-img.svg";
import BorneoWaterparkLogo from "@/assets/svgs/borneo-waterpark-logo.svg";
import CartOutline from "@/assets/svgs/cart-outline.svg";
import UltimateMaps from "@/assets/svgs/ultimate-maps.svg";

import HeaderLandingPageComponent from "@/components/globals/headers/header-landing-page";
import LoadingComponent from "@/components/globals/loading";
import { handleGoToDashboard } from "@/utils/pages/publics/landing.page.util";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";
import { RetroGrid } from "@/components/magic-ui/retro-grid";
import { PhoneCall, Mail, MapPin } from "lucide-react";
import Particles from "@/components/react-bits/particles";
import { HashLink } from "react-router-hash-link";
import Ballpit from "@/components/react-bits/ballpit";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { cn } from "@/lib/utils";

import DomeGallery from "@/components/magic-ui/dome-gallery";
import CircularGallery from "@/components/react-bits/circular-gallery";

// --- (1) TYPESCRIPT: Menambahkan Definisi Tipe ---
// Ini mendefinisikan bentuk objek untuk informasi waterpark.
interface IWaterparkInfo {
	whatsapp: string;
	gmapsUrl: string;
}

// Ini mendefinisikan tipe data yang akan dikembalikan oleh hook useMemo.
interface IDayInfo {
	dayName: string;
	dayType: "Weekday" | "Weekend";
	ticketPrice: number;
}

const LandingPage = () => {
	const waterparkInfo: IWaterparkInfo = {
		whatsapp: "6282288326325",
		gmapsUrl: "https://maps.app.goo.gl/6kMDkQQzz3S3z2vg8",
	};

	// --- State dengan Tipe Data ---
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [paidTickets, setPaidTickets] = useState<number>(1);
	const [childTickets, setChildTickets] = useState<number>(0);

	const [hargaTiket, setHargaTiket] = useState([
		{
			berlaku_untuk: "Weekday",
			akronim: "30k",
			harga: 30000,
		},
		{
			berlaku_untuk: "Weekend",
			akronim: "40k",
			harga: 40000,
		},
		{
			berlaku_untuk: "Anak_Anak_dibawah_80_cm",
			akronim: "Gratis",
			harga: 0,
		},
	]);

	// --- useMemo dengan Tipe Data ---
	const { dayName, dayType, ticketPrice } = useMemo((): IDayInfo => {
		const dayNames = [
			"Minggu",
			"Senin",
			"Selasa",
			"Rabu",
			"Kamis",
			"Jumat",
			"Sabtu",
		];
		const today = new Date();
		const dayIndex = today.getDay();
		const isWeekend = dayIndex === 0 || dayIndex === 6;

		const hargaWeekend =
			hargaTiket.filter((item) => item.berlaku_untuk === "Weekend")[0].harga ||
			0;
		const hargaWeekday =
			hargaTiket.filter((item) => item.berlaku_untuk === "Weekday")[0].harga ||
			0;

		return {
			dayName: dayNames[dayIndex],
			dayType: isWeekend ? "Weekend" : "Weekday",
			ticketPrice: isWeekend ? hargaWeekend : hargaWeekday,
		};
	}, [hargaTiket]);

	const totalPrice = useMemo(
		() => paidTickets * ticketPrice,
		[paidTickets, ticketPrice]
	);

	// --- Fungsi Helper ---
	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	// --- Handler untuk Event ---
	const handleOpenModal = (): void => setIsModalOpen(true);
	const handleCloseModal = (): void => setIsModalOpen(false);

	const handlePaidTicketChange = (amount: number): void => {
		setPaidTickets((prev) => Math.max(0, prev + amount));
	};

	const handleChildChange = (amount: number): void => {
		setChildTickets((prev) => Math.max(0, prev + amount));
	};

	const handleWhatsAppRedirect = (): void => {
		let message = `Halo Borneo Waterpark, saya mau pesan tiket.\n\n`;
		message += `*Rincian Pesanan:*\n`;
		message += `-------------------------\n`;
		message += `Hari: *${dayName} (${dayType})*\n\n`;

		if (paidTickets > 0) {
			message += `🎟️ *Tiket Masuk*\n`;
			message += `   ${paidTickets} orang x ${formatCurrency(ticketPrice)}\n`;
		}
		if (childTickets > 0) {
			message += `👶 *Anak-anak (Gratis)*\n`;
			message += `   ${childTickets} anak\n`;
		}

		message += `-------------------------\n`;
		message += `*TOTAL: ${formatCurrency(totalPrice)}*\n\n`;
		message += `Mohon info selanjutnya. Terima kasih!`;

		const encodedMessage = encodeURIComponent(message);
		const whatsappURL = `https://wa.me/${waterparkInfo.whatsapp}?text=${encodedMessage}`;

		window.open(whatsappURL, "_blank", "noopener,noreferrer");
	};

	const auth = useAuth();

	useEffect(() => {
		fetch(`${import.meta.env.VITE_API_URL}/tiket/`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((data: any) => data.json())
			.then((data: any) => {
				setHargaTiket(data);
				console.log(data);
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
			});
	}, []);

	const [barangDisewakan, setBarangDisewakan] = useState([
		{
			nama: "Gazebo",
			akronim: "100k",
			url_gambar: "/static/images/3ad59e74-c498-4b57-9126-10a2a1e62500-gazebo-preview-88dm4maO.svg",
		},
		{
			nama: "Tikar",
			akronim: "30k",
			url_gambar: "/static/images/fe855b6a-32ad-4304-9a7f-5be51fcb0d79-tikar-preview-BNQAFj4J.svg",
		},
		{
			nama: "Loker",
			akronim: "10k",
			url_gambar: "/static/images/931b12f4-1871-40ca-a6e0-d536aeacfbfe-loker-preview-CusoLwjq.svg",
		},
		
	]);

	useEffect(() => {
		fetch(`${import.meta.env.VITE_API_URL}/barang/`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((data: any) => data.json())
			.then((data: any) => {
				setBarangDisewakan(data);
				console.log(data);
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
			});
	}, []);

	const [fasilitasTersedia, setFasilitasTersedia] = useState([
		{
			text: "Mandi Busa",
			image: "${import.meta.env.VITE_API_URL}/static/images/6f04edaf-16fa-4df4-bac2-d9347636c313-mandi-busa-preview.jpg",
		},
		{
			text: "Kawah Biru",
			image: "${import.meta.env.VITE_API_URL}/static/images/e732f81f-f037-4351-b21a-e676482c37a5-kawah-biru-preview.jpg",
		},
		{
			text: "Kolam Dewasa",
			image: "${import.meta.env.VITE_API_URL}/static/images/b5e31e5e-089c-475e-80e0-20c68b6c93ba-kolam-dewasa-preview.jpg",
		},
		{
			text: "Kolam Anak-Anak",
			image: "${import.meta.env.VITE_API_URL}/static/images/6c009562-5f18-48fa-875c-12d263bcc0ad-kolam-anak-anak-preview.jpg",
		},
	]);

	useEffect(() => {
		fetch(
			`${import.meta.env.VITE_API_URL}/fasilitas/`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		)
			.then((data: any) => data.json())
			.then((data: any) => {
				const finalData = data.map((item: any) => ({
					text: item.nama,
					image:
						import.meta.env.VITE_API_URL +
						item.url_gambar,
				}));
				setFasilitasTersedia(finalData);
				console.log(finalData);
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
			});
	}, []);

	const [dokumentasiCust, setDokumentasiCust] = useState([
		{
			src: "https://images.trvl-media.com/lodging/1000000/10000/3900/3858/18b2638a.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
			alt: "Abstract art",
		},
		{
			src: "https://awsimages.detik.net.id/community/media/visual/2024/01/27/tropikana-waterpark-cirebon_169.jpeg?w=1200",
			alt: "Modern sculpture",
		},
		{
			src: "https://www.shutterstock.com/image-illustration/empty-colorful-waterslides-resort-aquapark-600nw-2310273541.jpg",
			alt: "Digital artwork",
		},
		{
			src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW3xSxQsSK_OQzs-6FhfA-zg9ANFfyXxfjeqEfN4wjWxqgf6yytL_pbxmZ7a5V3RVnwH8&usqp=CAU",
			alt: "Contemporary art",
		},
		{
			src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYfKn3VMXhuu8bX89yi0QX6DEQmm4yhxI_mg&s",
			alt: "Geometric pattern",
		},
		{
			src: "https://img1.10bestmedia.com/Images/Photos/412869/Splashway-Waterpark_54_990x660.jpg?auto=webp&width=3840&quality=75",
			alt: "Textured surface",
		},
		{
			src: "https://www.510families.com/wp-content/uploads/2018/07/dublin-wave-2241453_o.jpg",
			alt: "Social media image",
		},
	]);

	useEffect(() => {
		fetch(
			`${import.meta.env.VITE_API_URL}/dokumentasi/`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		)
			.then((data: any) => data.json())
			.then((data: any) => {
				const finalData = data.map((item: any) => ({
					alt: item.nama,
					src:
						import.meta.env.VITE_API_URL +
						item.url_gambar,
				}));
				setDokumentasiCust(finalData);
				console.log(finalData);
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
			});
	}, []);

	const handleKeycloakAuth = () =>
		auth.isAuthenticated
			? void auth.signoutRedirect()
			: void auth.signinRedirect();

	const [dashboardURL, setDashboardURL] = useState("/");

	useEffect(() => {
		if (auth.isAuthenticated)
			setDashboardURL(handleGoToDashboard({ token: auth.user!.access_token }));
	}, [auth.isAuthenticated]);

	return (
		<div className="w-screen h-screen">
			{auth.isLoading && (
				<LoadingComponent className="fixed z-50 w-full h-full bg-black bg-opacity-60" />
			)}
			<HeaderLandingPageComponent
				isAuthenticated={auth.isAuthenticated}
				onContinueWithKeycloakClicked={handleKeycloakAuth}
				dashboardURL={dashboardURL}
			/>
			<div className="w-full h-full">
				<div id="beranda" className="flex w-screen text-center mb-10">
					<GridPattern
						className={cn(
							"[mask-image:radial-gradient(700px_circle_at_center,white,transparent)]",
							"h-[47%] top-12 opacity-60"
						)}
					/>
					<RetroGrid />
					<div className="flex w-full flex-col gap-3 justify-center items-center">
						<div className="relative w-[80%] z-30">
							<img src={HeroSectionIMG} className="w-full" />
							<div className="absolute z-40 max-w-3xl -bottom-10 left-1/2 -translate-x-1/2 w-[95%]">
								<div className="bg-white/80 backdrop-blur-md p-3 rounded-3xl shadow-lg border border-black">
									<div className="flex flex-col sm:flex-row items-center justify-between gap-2">
										{/* Pesan Tiket */}
										<div
											onClick={handleOpenModal}
											rel="noopener noreferrer"
											className="flex-1 flex items-center gap-4 p-2 rounded-lg hover:bg-slate-100 transition-colors w-full"
										>
											<img
												src={CartOutline}
												className="h-16 w-16 text-cyan-600 flex-shrink-0"
											/>
											<div className="flex flex-col justify-start items-start">
												<p className="font-semibold text-slate-800 text-2xl tracking-tight">
													Pesan Tiket Online
												</p>
												<p className="text-lg text-slate-500">
													Masuk Santai Tanpa Antri 🔥
												</p>
											</div>
										</div>

										<div className="h-12 w-[2px] rounded-xl bg-cyan-700/50 hidden sm:block"></div>
										<div className="w-full h-px bg-slate-200 sm:hidden"></div>

										{/* Temukan Lokasi */}
										<a
											href={waterparkInfo.gmapsUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="flex-1 ml-5 flex items-center gap-4 p-2 rounded-lg hover:bg-slate-100 transition-colors w-full"
										>
											<img
												src={UltimateMaps}
												className="h-16 w-16 text-cyan-600 flex-shrink-0"
											/>
											<div className="flex flex-col justify-start items-start">
												<p className="font-semibold text-2xl text-slate-800">
													Temukan Lokasi
												</p>
												<p className="text-lg text-slate-500">
													Temuin Kami di G-Maps 🎉
												</p>
											</div>
										</a>
									</div>
								</div>
							</div>
						</div>

						{/* Floating Action Buttons */}
					</div>
				</div>

				{/* Info Buka-nya Kapan */}
				<div className="flex flex-col items-center justify-center w-screen h-auto py-10 text-center">
					<div className="flex tracking-tighter z-50 font-bold text-6xl text-white items-center justify-center">
						<span className="w-auto h-auto p-2 bg-[#688BA7]">
							Buka Setiap Hari kecuali
						</span>
						<span className="underline w-auto h-auto p-2 bg-[#B4B44C]">
							Jum’at
						</span>
					</div>
					<div className="flex tracking-tighter z-50 font-bold text-5xl text-white items-center justify-center">
						<span className="w-auto h-auto p-2 bg-[#A76868]">
							Jam Operasional 09.00-18.00 WIB.
						</span>
					</div>
				<Particles
					particleColors={[
						"#A07CFE",
						"#FE8FB5",
						"#FFBE7B",
						"#40ffaa",
						"#4079ff",
					]}
					particleCount={250}
					particleSpread={10}
					speed={0.2}
					particleBaseSize={100}
					moveParticlesOnHover={false}
					alphaParticles={false}
					disableRotation={false}
				/>
				</div>

				{/* Info Tiket Masuk */}
				<div className="w-full h-[31.5rem] rounded-2xl px-24 py-8">
					<div className="w-full h-full relative rounded-2xl pt-14 pb-16 border-2 border-black">
						<div className="absolute -top-8 left-1/2 -translate-x-1/2 flex tracking-tighter z-50 font-bold text-5xl text-white items-center justify-center">
							<span className="w-auto h-auto p-2 bg-[#3F3F3F]">
								Info Tiket Masuk per Orang.
							</span>
						</div>

						<div className="flex justify-between px-14 gap-10 w-full h-full">
							<div className="w-full h-full flex justify-center items-center bg-[#F5FFD5] border-2 px-10 py-20 border-black rounded-xl">
								<div className="flex flex-col gap-3 tracking-tighter z-50 font-bold text-6xl text-white items-center justify-center">
									<span className="w-auto h-auto p-2 bg-[#3E90B6]">
										Weekday
									</span>
									<span className="text-[#3F3F3F] text-8xl">
										{
											hargaTiket.filter(
												(tiket) => tiket.berlaku_untuk === "Weekday"
											)[0].akronim
										}
									</span>
								</div>
							</div>
							<div className="w-full h-full bg-[#F5FFD5] border-2 px-10 flex justify-center items-center border-black rounded-xl">
								<div className="flex flex-col gap-3 tracking-tighter z-50 font-bold text-6xl text-white items-center justify-center">
									<div className="-mt-6 flex text-center text-4xl tracking-tighter flex-col gap-1 justify-center items-center">
										<span className="w-auto h-auto p-2 bg-[#B63E3E]">
											Anak-Anak
										</span>
										<span className="w-auto h-auto p-2 text-[1.63rem] bg-[#54B63E]">
											Tinggi di-Bawah 80 cm
										</span>
									</div>
									<span className="text-[#3F3F3F] text-8xl">
										{
											hargaTiket.filter(
												(tiket) =>
													tiket.berlaku_untuk === "Anak_Anak_dibawah_80_cm"
											)[0].akronim
										}
									</span>
								</div>
							</div>
							<div className="w-full h-full flex justify-center items-center bg-[#F5FFD5] border-2 px-10 py-20 border-black rounded-xl">
								<div className="flex flex-col gap-3 tracking-tighter z-50 font-bold text-6xl text-white items-center justify-center">
									<span className="w-auto h-auto p-2 bg-[#743EB6]">
										Weekend
									</span>
									<span className="text-[#3F3F3F] text-8xl">
										{
											hargaTiket.filter(
												(tiket) => tiket.berlaku_untuk === "Weekend"
											)[0].akronim
										}
									</span>
								</div>
							</div>
						</div>

						<div className="absolute z-40 -bottom-[3.6rem] left-1/2 -translate-x-1/2 w-auto">
							<div className="bg-white/80 backdrop-blur-md p-3 rounded-3xl shadow-lg border border-black">
								<div className="flex flex-col sm:flex-row items-center justify-between gap-2">
									{/* Pesan Tiket */}
									<div
										onClick={handleOpenModal}
										rel="noopener noreferrer"
										className="flex-1 flex items-center gap-4 p-2 rounded-lg hover:bg-slate-100 transition-colors w-full"
									>
										<img
											src={CartOutline}
											className="h-16 w-16 text-cyan-600 flex-shrink-0"
										/>
										<div className="flex flex-col justify-start items-start">
											<p className="font-semibold text-slate-800 text-2xl tracking-tight">
												Pesan Tiket Online
											</p>
											<p className="text-lg text-slate-500">
												Masuk Santai Tanpa Antri 🔥
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Modal Pemesanan Tiket */}
						{isModalOpen && (
							<div
								className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
								onClick={handleCloseModal}
							>
								<div
									className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 md:p-8 m-4"
									onClick={(e) => e.stopPropagation()}
								>
									<button
										onClick={handleCloseModal}
										className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-6 w-6"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>

									<h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
										Form Pemesanan Tiket
									</h2>
									<p className="text-slate-500 mb-6">
										Hari ini: <span className="font-bold">{dayName}</span>{" "}
										<span
											className={`font-semibold ${
												dayType === "Weekend"
													? "text-red-500"
													: "text-green-600"
											}`}
										>
											({dayType})
										</span>
										.
									</p>

									<div className="flex flex-col md:flex-row gap-8">
										<div className="w-full md:w-1/2 flex flex-col gap-6">
											<div>
												{/* --- PERUBAHAN DI SINI --- */}
												<div className="flex items-center gap-3 mb-1">
													<label className="font-semibold text-lg text-slate-700">
														Tiket Masuk
													</label>
													<span className="bg-cyan-100 text-cyan-800 text-base font-bold px-3 py-1 rounded-full">
														{formatCurrency(ticketPrice)}
													</span>
												</div>
												<p className="text-sm text-slate-500">
													Untuk dewasa & anak di atas 80cm.
												</p>
												<div className="flex items-center gap-4 mt-2">
													<button
														onClick={() => handlePaidTicketChange(-1)}
														className="w-10 h-10 bg-slate-200 rounded-full font-bold text-xl hover:bg-slate-300"
													>
														-
													</button>
													<span className="text-2xl font-bold w-12 text-center">
														{paidTickets}
													</span>
													<button
														onClick={() => handlePaidTicketChange(1)}
														className="w-10 h-10 bg-cyan-500 text-white rounded-full font-bold text-xl hover:bg-cyan-600"
													>
														+
													</button>
												</div>
											</div>
											<div>
												<label className="font-semibold text-lg text-slate-700">
													Anak-anak (di bawah 80cm)
												</label>
												<p className="text-sm text-slate-500">Gratis</p>
												<div className="flex items-center gap-4 mt-2">
													<button
														onClick={() => handleChildChange(-1)}
														className="w-10 h-10 bg-slate-200 rounded-full font-bold text-xl hover:bg-slate-300"
													>
														-
													</button>
													<span className="text-2xl font-bold w-12 text-center">
														{childTickets}
													</span>
													<button
														onClick={() => handleChildChange(1)}
														className="w-10 h-10 bg-cyan-500 text-white rounded-full font-bold text-xl hover:bg-cyan-600"
													>
														+
													</button>
												</div>
											</div>
										</div>

										<div className="w-full md:w-1/2 bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col">
											<h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
												Rincian Belanja
											</h3>
											<div className="flex-grow space-y-3">
												{paidTickets > 0 ? (
													<div className="flex justify-between items-center text-slate-600">
														<span>Tiket Masuk ({paidTickets}x)</span>
														<span className="font-medium">
															{formatCurrency(totalPrice)}
														</span>
													</div>
												) : (
													<p className="text-slate-400 text-center py-4">
														Pilih jumlah tiket masuk.
													</p>
												)}
												{childTickets > 0 && (
													<div className="flex justify-between items-center text-slate-600">
														<span>Anak-anak ({childTickets}x)</span>
														<span className="font-medium">Gratis</span>
													</div>
												)}
											</div>
											<div className="border-t mt-4 pt-4">
												<div className="flex justify-between items-center font-bold text-xl">
													<span>Total</span>
													<span>{formatCurrency(totalPrice)}</span>
												</div>
												<button
													onClick={handleWhatsAppRedirect}
													disabled={paidTickets === 0}
													className="w-full mt-4 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
												>
													Pesan Sekarang via WhatsApp
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				<InfoSections />

				{/* Info Tiket Masuk */}
				<Particles
					particleColors={[
						"#A07CFE",
						"#FE8FB5",
						"#FFBE7B",
						"#40ffaa",
						"#4079ff",
					]}
					particleCount={250}
					particleSpread={10}
					speed={0.2}
					particleBaseSize={100}
					moveParticlesOnHover={false}
					alphaParticles={false}
					disableRotation={false}
				/>
				<div className="w-full mt-16 h-[47rem] rounded-2xl px-24 py-8">
					<div className="w-full h-full relative rounded-2xl pt-14 pb-14 border-2 border-black">
						<div className="absolute -top-8 left-1/2 -translate-x-1/2 flex tracking-tighter z-50 font-bold text-5xl text-white items-center justify-center">
							<span className="w-auto h-auto p-2 bg-[#587FAD]">
								Info Harga Penyewaan.
							</span>
						</div>

						<div className="flex justify-between px-14 gap-10 w-full h-full">
							{barangDisewakan.map(
								(
									barang: { nama: string; akronim: string; url_gambar: string },
									index
								) => (
									<div
										key={index}
										className="w-full h-full flex justify-center items-center bg-[#F5FFD5] border-2 px-1 border-black rounded-xl"
									>
										<div className="flex p-5 flex-col gap-4 tracking-tighter z-50 font-bold text-6xl text-white items-center justify-center">
											<span
												className={`w-auto h-auto p-2 ${
													index === 1
														? "bg-[#963EB6]"
														: index === 2
														? "bg-[#B6763E]"
														: "bg-[#B63E40]"
												}`}
											>
												{barang.nama}
											</span>
											<img
												src={
													import.meta.env.VITE_API_URL +
													barang.url_gambar
												}
												alt=""
											/>
											<span className="text-[#3F3F3F] text-8xl">
												{barang.akronim}
											</span>
										</div>
									</div>
								)
							)}
						</div>

						<span className="text-red-900 text-center tracking-tighter font-semibold relative z-50 -bottom-4 left-10">
							*Seluruh penyewaan fasilitas tambahan dapat digunakan{" "}
							<span className="underline font-semibold italic">
								tanpa batas waktu.
							</span>
						</span>
					</div>
				</div>

				<div
					id="fasilitas-kami"
					className="flex items-center justify-center w-screen h-full pb-2 mt-10 text-center"
				>
					<Particles
						particleColors={[
							"#A07CFE",
							"#FE8FB5",
							"#FFBE7B",
							"#40ffaa",
							"#4079ff",
						]}
						particleCount={250}
						particleSpread={10}
						speed={0.2}
						particleBaseSize={100}
						moveParticlesOnHover={false}
						alphaParticles={false}
						disableRotation={false}
					/>

					<div className="relative mt-24">
						<div className="w-full text-foreground flex flex-col items-center bg-background leading-8 sm:leading-10">
							<span className="lg:inline flex flex-col tracking-tighter text-3xl md:text-5xl font-semibold px-6 md:px-16 leading-8 sm:leading-6">
								<span>Apa saja sih </span>
								<div className="relative -left-1.5 sm:left-0 text-center inline px-1.5">
									<div className="relative z-10 inline">
										Fasilitas Kami disini?
									</div>
									<div className="absolute bottom-0 left-0 w-full bg-chart-5/50 mb-0.5 h-1/3"></div>
								</div>
							</span>

							<span className="text-sm tracking-tight text-foreground/70 sm:text-lg pt-2 leading-6 sm:leading-8">
								Kita lihat bareng yuk, ada wahana apa aja sih yang ada di Borneo
								Waterpark. 😍🥰
							</span>
						</div>

						<div className="w-screen h-screen -mt-14 mb-28 z-50">
							<CircularGallery
								items={fasilitasTersedia}
								bend={3}
								textColor="#000000"
								borderRadius={0.05}
								scrollEase={0.02}
							/>
						</div>
					</div>
				</div>
				<div
					id="fasilitas-kami"
					className="flex items-center justify-center w-screen h-auto pb-2 pt-16 text-center"
				>
					<Particles
						particleColors={[
							"#A07CFE",
							"#FE8FB5",
							"#FFBE7B",
							"#40ffaa",
							"#4079ff",
						]}
						particleCount={250}
						particleSpread={10}
						speed={0.2}
						particleBaseSize={100}
						moveParticlesOnHover={false}
						alphaParticles={false}
						disableRotation={false}
					/>
					<div className="relative">
						<div className="w-full text-foreground flex flex-col items-center pb-6 bg-background leading-8 sm:leading-10">
							<span className="lg:inline flex flex-col tracking-tighter text-3xl md:text-5xl font-semibold px-6 md:px-16 leading-8 sm:leading-6">
								<span>Lihat Yuk </span>
								<div className="relative -left-1.5 sm:left-0 text-center inline px-1.5">
									<div className="relative z-10 inline">
										Dokumentasi Cust Kami.
									</div>
									<div className="absolute bottom-0 left-0 w-full bg-chart-5/50 mb-0.5 h-1/3"></div>
								</div>
							</span>

							<span className="text-sm tracking-tight text-foreground/70 sm:text-lg pt-2 leading-6 sm:leading-8">
								Rasakan suasana rekreasi di-borneo waterpark yang di-abadikan
								pelanggan kami. 😍🥰
							</span>
						</div>

						<div className="w-screen h-screen z-50">
							<DomeGallery images={dokumentasiCust} />
						</div>
					</div>
				</div>

				<footer className="flex flex-col border-t">
					<div className="z-10 px-16 pt-14">
						<div className="grid grid-cols-1 gap-8 text-center md:text-start md:grid-cols-3">
							{/* Logo and Copyright Section */}
							<div className="flex flex-col items-center space-y-4 md:items-start">
								<div className="flex items-center gap-1.5 rounded-xl">
									<img src={BorneoWaterparkLogo} className="w-8 h-8" />
									<span className="text-base font-semibold">
										Borneo
										<span className="italic font-medium">Waterpark</span>
									</span>
								</div>
								<p className="text-sm">
									Wisata Air Pekanbaru, Rekreasi Santai Bareng Keluarga.
									<br />© 2025{" "}
									{new Date().getFullYear() == 2025
										? ""
										: " - " + new Date().getFullYear()}{" "}
									All rights reserved.
								</p>
							</div>
							{/* Pages Section */}
							<div>
								<ul className="space-y-4">
									<li>
										<HashLink smooth to="/#beranda">
											Beranda
										</HashLink>
									</li>
									<li>
										<HashLink smooth to="/#fasilitas-kami">
											Fasilitas Unggulan Kami
										</HashLink>
									</li>
								</ul>
							</div>
							{/* Contact Section */}
							<div>
								<div className="flex flex-col items-center space-y-4 md:items-start">
									<div className="flex items-center gap-2">
										<PhoneCall className="w-5 h-5" />
										<a href="tel:++62 813-7617-7745" target="_blank">
											+62-822-8832-6325
										</a>
									</div>
									<div className="flex items-center gap-2">
										<Mail className="w-5 h-5" />
										<a target="_blank" href="mailto:tif@uin-suska.ac.id">
											support@borneo-waterpark.id
										</a>
									</div>
									<div className="flex items-start gap-2">
										<MapPin className="hidden mt-1 w-5 h-5 md:block flex-shrink-0" />
										<a
											target="_blank"
											href="https://maps.app.goo.gl/Qg5w1dKv5D4q657b9"
										>
											Jl. Karya Bersama No.14, Tanah Merah, Kec. Siak Hulu,
											Kabupaten Kampar, Riau 28284
										</a>
									</div>
								</div>
							</div>
						</div>
						{/* Social Media Icons */}
						<div className="flex justify-center gap-4 mt-8 ">
							<a href="#">
								<span className="sr-only">Facebook</span>
								<svg
									className="w-6 h-6"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
										clipRule="evenodd"
									/>
								</svg>
							</a>
							<a href="#">
								<span className="sr-only">Twitter</span>
								<svg
									className="w-6 h-6"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
								</svg>
							</a>
							<a href="#">
								<span className="sr-only">LinkedIn</span>
								<svg
									className="w-6 h-6"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
										clipRule="evenodd"
									/>
								</svg>
							</a>
							<a target="_blank" href="https://www.instagram.com/tifuinsuska/">
								<span className="sr-only">Instagram</span>
								<svg
									className="w-6 h-6"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
										clipRule="evenodd"
									/>
								</svg>
							</a>
						</div>
					</div>
					<div
						style={{
							position: "absolute",
							overflow: "hidden",
							minHeight: "545px",
							maxHeight: "545px",
							width: "100%",
						}}
					>
						<Ballpit
							count={100}
							gravity={0.7}
							friction={0.8}
							wallBounce={0.95}
							followCursor={true}
							colors={["#A07CFE", "#FE8FB5", "#FFBE7B", "#40ffaa", "#4079ff"]}
						/>
					</div>
				</footer>
			</div>
		</div>
	);
};

export default LandingPage;


import {
    ShieldCheck,
    Users,
    Droplets,
    SmilePlus,
    Award,
    Eye,
    Ruler,
    Footprints,
    Sun,
    LifeBuoy,
} from "lucide-react";

const InfoSections = () => {
    // Data untuk seksi "Kenapa Memilih Kami"
    const whyUsData = [
        {
            icon: <Users className="w-12 h-12 text-cyan-600 mb-4" />,
            title: "2k+ Pengunjung/Week",
            description: "Telah dipercaya oleh ribuan pengunjung setiap minggunya untuk rekreasi keluarga.",
            bgColor: "bg-cyan-50",
        },
        {
            icon: <Droplets className="w-12 h-12 text-blue-600 mb-4" />,
            title: "Air Kolam Higienis",
            description: "Kualitas air selalu kami jaga dengan sistem filtrasi modern agar tetap jernih dan aman.",
            bgColor: "bg-blue-50",
        },
        {
            icon: <SmilePlus className="w-12 h-12 text-green-600 mb-4" />,
            title: "Wahana Untuk Semua",
            description: "Dari kolam anak yang dangkal hingga seluncuran menantang, semua ada di sini!",
            bgColor: "bg-green-50",
        },
        {
            icon: <Award className="w-12 h-12 text-yellow-600 mb-4" />,
            title: "Harga Terjangkau",
            description: "Nikmati keseruan maksimal tanpa menguras kantong. Liburan jadi lebih hemat!",
            bgColor: "bg-yellow-50",
        },
    ];

    // Data untuk seksi "Informasi Keselamatan"
    const safetyTips = [
        {
            icon: <Eye className="w-8 h-8 text-cyan-700 flex-shrink-0" />,
            text: "Selalu awasi buah hati Anda saat bermain di area kolam untuk mencegah hal yang tidak diinginkan.",
        },
        {
            icon: <Ruler className="w-8 h-8 text-cyan-700 flex-shrink-0" />,
            text: "Patuhi aturan tinggi dan berat badan di setiap wahana seluncuran demi keselamatan bersama.",
        },
        {
            icon: <Footprints className="w-8 h-8 text-cyan-700 flex-shrink-0" />,
            text: "Area tepi kolam mungkin licin. Harap berjalan perlahan dan tidak berlari-larian.",
        },
        {
            icon: <Sun className="w-8 h-8 text-cyan-700 flex-shrink-0" />,
            text: "Gunakan tabir surya untuk melindungi kulit dari paparan sinar matahari langsung.",
        },
        {
            icon: <LifeBuoy className="w-8 h-8 text-cyan-700 flex-shrink-0" />,
            text: "Jika butuh bantuan, jangan ragu untuk menghubungi petugas penjaga kolam kami yang bersiaga.",
        },
    ];

    return (
        <>
            {/* Section: Kenapa Memilih Kami? */}
            <div className="w-full h-auto px-8 z-[999] sm:px-16 lg:px-24 py-16 text-center">
                <div className="flex tracking-tighter z-50 font-bold text-4xl sm:text-5xl text-slate-800 items-center justify-center mb-4">
                    <span className="w-auto h-auto px-5 py-2 z-[9999] bg-[#F5FFD5] border-2 border-black rounded-lg">
                        Keseruan Menantimu!
                    </span>
                </div>
                <p className="text-lg text-slate-800 max-w-2xl mx-auto mb-12 z-[99999]">
                    Kami bukan sekadar kolam renang biasa. Kami adalah destinasi favorit keluarga di Pekanbaru untuk menciptakan kenangan tak terlupakan.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                    {whyUsData.map((item, index) => (
                        <div key={index} className={`w-full h-full flex flex-col justify-start items-center ${item.bgColor} border-2 border-black rounded-xl p-6 transform hover:-translate-y-2 transition-transform duration-300`}>
                            {item.icon}
                            <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
                                {item.title}
                            </h3>
                            <p className="text-slate-600 text-base">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section: Informasi Keselamatan Anak */}
            <div id="info-keselamatan" className="w-full h-auto px-8 sm:px-16 lg:px-24 py-20 bg-[#F5FFD5]">
                <div className="w-full h-full relative rounded-2xl p-8 sm:p-14 border-2 border-black bg-white">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex tracking-tighter z-50 font-bold text-4xl sm:text-5xl text-white items-center justify-center">
                        <span className="w-auto h-auto p-2 bg-[#A76868]">
                            Info Keselamatan.
                        </span>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        {/* Kolom Kiri: Ikon dan Judul */}
                        <div className="flex flex-col items-center text-center lg:w-1/3">
                            <ShieldCheck className="w-24 h-24 text-green-500 mb-4" />
                            <h2 className="text-3xl font-bold tracking-tighter text-slate-800">
                                Keselamatan si Kecil, Prioritas Kami
                            </h2>
                            <p className="text-slate-600 mt-2">
                                Kami ingin semua orang bersenang-senang dengan aman. Mohon perhatikan beberapa tips berikut ini.
                            </p>
                        </div>

                        {/* Kolom Kanan: Daftar Tips */}
                        <div className="lg:w-2/3 w-full">
                            <div className="space-y-6">
                                {safetyTips.map((tip, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        {tip.icon}
                                        <p className="text-slate-700 text-left text-base sm:text-lg">
                                            {tip.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};