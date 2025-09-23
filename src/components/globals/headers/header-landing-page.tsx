import BorneoWaterparkLogo from "@/assets/svgs/borneo-waterpark-logo.svg"
import { ModeToggle } from "../../themes/mode-toggle";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, LucideLogIn, Menu } from "lucide-react";
import { HeaderLandingPageProps } from "@/interfaces/components/globals/headers/header-landing-page.interface";
import { NavMenu } from "./nav-menu";
import { NavMenuItems } from "@/constants/components/globals/headers/nav-menu-item.constant";
import { NavLink } from "react-router-dom";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavMenuMobile } from "./nav-menu-mobile";

const HeaderLandingPageComponent = ({
  onContinueWithKeycloakClicked,
  isAuthenticated,
  dashboardURL,
}: HeaderLandingPageProps) => {

  return (
    <header className="flex items-center justify-between w-full h-12 py-8 mb-5 px-40 border-b bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-pink-500/10 border-blue-600/20">
      {/* Header Logo */}
      <NavLink to={"/"} className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 hover:bg-secondary hover:text-secondary-foreground cursor-pointer hover:scale-95 px-2 duration-300 rounded-xl active:scale-105">
          <img src={BorneoWaterparkLogo} className="w-12 h-12" />        
          <span className="text-2xl text-[#313131] font-semibold tracking-tighter">
            Borneo Waterpark.
          </span>
        </div>
      </NavLink>
      {/* Nav Menu Mobile */}
      <div className="flex items-center justify-center gap-2 lg:hidden">
        <ModeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-64">
            <div className="flex flex-col gap-4 mt-4">
              <NavMenuMobile navMenu={NavMenuItems.LandingPage} />
              <div className="flex flex-col gap-2">
                {isAuthenticated && (
                  <NavLink to={dashboardURL}>
                    <Button size={"sm"} variant={"outline"} className="w-full">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Pergi Ke Dashboard
                    </Button>
                  </NavLink>
                )}

                {!isAuthenticated ? (
                  <Button
                    onClick={onContinueWithKeycloakClicked}
                    size={"sm"}
                    variant={"outline"}
                    className="w-full"
                  >
                    <LucideLogIn className="w-4 h-4" />
                    {"Mulai Sekarang"}
                  </Button>
                ) : (
                  <AlertDialogTrigger asChild>
                    <Button
                      size={"sm"}
                      variant={"destructive"}
                      className="w-full"
                    >
                      <LucideLogIn className="w-4 h-4" />
                      {"Keluar"}
                    </Button>
                  </AlertDialogTrigger>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      {/* Nav Menu Desktop */}
      <div className="items-center justify-center hidden gap-5 lg:flex">
        <NavMenu navMenu={NavMenuItems.LandingPage} />
        {/* <div className="flex items-center justify-center gap-2">
          {isAuthenticated && (
            <NavLink to={dashboardURL}>
              <Button size={"sm"} variant={"outline"}>
                <ArrowUpRight className="w-4 h-4" />
                Pergi Ke Dashboard
              </Button>
            </NavLink>
          )}
          {!isAuthenticated ? (
            <Button
              onClick={onContinueWithKeycloakClicked}
              size={"sm"}
              variant={"outline"}
            >
              <LucideLogIn className="w-4 h-4" />
              {"Mulai Sekarang"}
            </Button>
          ) : (
            <AlertDialogTrigger asChild>
              <Button size={"sm"} variant={"destructive"}>
                <LucideLogIn className="w-4 h-4" />
                {"Keluar"}
              </Button>
            </AlertDialogTrigger>
          )}
        </div> */}
      </div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah kamu yakin mau keluar?</AlertDialogTitle>
          <AlertDialogDescription>
            Jika Anda yakin ingin keluar, sesi anda untuk akun ini akan terhapus
            dan anda akan diarahkan kembali ke halaman awal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Gajadi deh</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/85"
            onClick={onContinueWithKeycloakClicked}
          >
            Iya, saya yakin
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </header>
  );
};

export default HeaderLandingPageComponent;
