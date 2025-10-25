import NotificationPage from "@/components/notification";
import { SiteHeader } from "@/components/site-header";

export default function Page() {
  return (
    <>
      <SiteHeader title="Notification" />
      <div className="flex flex-1 flex-col">
        <div className="w-full">
          <NotificationPage />
        </div>
      </div>
    </>
  );
}
