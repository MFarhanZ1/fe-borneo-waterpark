import { SideBarNavMenuItemsProps } from "@/interfaces/components/globals/sidebars/side-bar-nav-menu.interface";
import {
  BackpackIcon,
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
      ],
    },
  ],
};
