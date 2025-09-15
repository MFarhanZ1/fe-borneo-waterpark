import { SideBarNavMenuItemsProps } from "@/interfaces/components/globals/sidebars/side-bar-nav-menu.interface";
import {
  BackpackIcon,
  LucideHistory,
} from "lucide-react";

export const SideBarNavMenuItems: SideBarNavMenuItemsProps = {
  "kestari-biro-arsip": [
    {
      label: "Arsip",
      menus: [
        {
          title: "Daftar Absensi",
          url: "/kestari-biro-arsip/daftar-absensi",
          icon: BackpackIcon,
        },
        {
          title: "Manajemen Kegiatan",
          url: "/kestari-biro-arsip/manajemen-kegiatan",
          icon: LucideHistory,
        },
      ],
    },
  ],
  dosen: [
    {
      label: "Muroja'ah",
      menus: [
        {
          title: "Mahasiswa PA",
          url: "/dosen/murojaah/mahasiswa-pa",
          icon: BackpackIcon,
        },
      ],
    },
  ],
};
