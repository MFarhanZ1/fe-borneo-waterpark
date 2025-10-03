import { SideBarNavMenuItemsProps } from "@/interfaces/components/globals/sidebars/side-bar-nav-menu.interface";
import {
  BackpackIcon,
  CameraIcon,
  FactoryIcon,
  FishIcon,
} from "lucide-react";

export const SideBarNavMenuItems: SideBarNavMenuItemsProps = {
  "admin-waterpark": [
    {
      label: "Manajemen",
      menus: [
        {
          title: "Kelola Tiket Masuk",
          url: "/admin-waterpark/tiket-masuk",
          icon: BackpackIcon,
        },
        {
          title: "Kelola Barang Disewakan",
          url: "/admin-waterpark/barang-disewakan",
          icon: FishIcon,
        },
        {
          title: "Kelola Fasilitas Tersedia",
          url: "/admin-waterpark/fasilitas-tersedia",
          icon: FactoryIcon,
        },
        {
          title: "Kelola Dokumentasi Kustomer",
          url: "/admin-waterpark/dokumentasi-cust",
          icon: CameraIcon,
        }
      ],
    },
  ],
};
