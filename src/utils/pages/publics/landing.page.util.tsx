import { getRoles } from "@/helpers/auth.helper";
import { DecodeTokenProps } from "@/interfaces/helpers/auth.interface";

const handleGoToDashboard = ({ token }: DecodeTokenProps) => {
    const userRoles = getRoles({ token });
    if (userRoles.includes("admin-waterpark")) return ("/admin-waterpark/tiket-masuk");
    else return ("/");
};

export { handleGoToDashboard };