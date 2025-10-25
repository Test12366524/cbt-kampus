import SettingPage from "@/components/setting-page";
import { SiteHeader } from "@/components/site-header";

export default function Page() {
  return (
    <>
      <SiteHeader title="Setting" />
      <div className="flex flex-1 flex-col">
        <div className="w-full">
            <SettingPage/>
        </div>
      </div>
    </>
  );
}
