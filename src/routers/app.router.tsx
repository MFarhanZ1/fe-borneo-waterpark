import { createBrowserRouter } from "react-router-dom";
import { generalRouter } from "./general.router";
import { mahasiswaRouter } from "./admin-waterpark.router";
import { dosenRouter } from "./dosen.router";

const router = createBrowserRouter([
	...generalRouter,
	...mahasiswaRouter,
	...dosenRouter,
]);

export default router;