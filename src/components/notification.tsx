"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from "@/services/notification.service";
import { displayDate } from "@/lib/format-utils";

export default function NotificationPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useGetNotificationsQuery({
    page,
    paginate: 10,
  });

  const [markAsRead] = useMarkNotificationAsReadMutation();

  const notifications = data?.data || [];
  const lastPage = data?.last_page || 1;
  const totalData = data?.total || 0;
  const perPage = data?.per_page || 10;
  const totalPages = Math.ceil(totalData / perPage);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead({ id }).unwrap();
      refetch();
    } catch (err) {
      console.error("Gagal menandai sebagai dibaca:", err);
    }
  };

  const handleDownload = (id: string, link: string) => {
    const url = String(link || "").trim();
    if (!url || url === "#") return;

    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();

    markAsRead({ id })
      .unwrap()
      .then(() => refetch())
      .catch((err) => {
        console.error("Gagal menandai sebagai dibaca:", err);
      });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Notifikasi</h1>
      <p className="text-xs text-white">
        * Jika belum ada button download, harap refresh halaman
      </p>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm" suppressHydrationWarning>
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Judul</th>
                <th className="px-4 py-2">Deskripsi</th>
                <th className="px-4 py-2">Waktu</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center p-4 text-muted-foreground"
                  >
                    Memuat notifikasi...
                  </td>
                </tr>
              ) : (
                <>
                  {notifications.map((n, index) => (
                    <tr key={n.id} className="border-t">
                      <td className="px-4 py-2">
                        {(page - 1) * perPage + index + 1}
                      </td>
                      <td className="px-4 py-2 font-medium">{n.data.type}</td>
                      <td className="px-4 py-2">{n.data.message}</td>
                      <td className="px-4 py-2">{displayDate(n.created_at)}</td>
                      <td className="px-4 py-2">
                        <Badge variant={n.read_at ? "default" : "secondary"}>
                          {n.read_at ? "Dibaca" : "Baru"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        {!n.read_at &&
                          (() => {
                            const url = String(n?.data?.url ?? "").trim();
                            const isMarkOnly = url === "" || url === "#";

                            return isMarkOnly ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsRead(n.id)}
                              >
                                Tandai Dibaca
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleDownload(n.id, url)}
                              >
                                Unduh File
                              </Button>
                            );
                          })()}
                      </td>
                    </tr>
                  ))}
                  {notifications.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center p-4 text-muted-foreground"
                      >
                        Tidak ada notifikasi.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </CardContent>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between gap-2 bg-muted">
          <div className="text-sm text-muted-foreground">
            Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              variant="outline"
            >
              Sebelumnya
            </Button>
            <Button
              disabled={page >= lastPage}
              onClick={() => setPage((prev) => prev + 1)}
              variant="outline"
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
