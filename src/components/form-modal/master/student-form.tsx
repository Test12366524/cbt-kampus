"use client";

import * as React from "react";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Combobox } from "@/components/ui/combo-box";

import type { School } from "@/types/master/school";
import type { Class } from "@/types/master/class";

import { useGetSchoolListQuery } from "@/services/master/school.service";
import { useGetClassListQuery } from "@/services/master/class.service";
import {
  useCreateStudentMutation,
  useGetStudentByIdQuery,
  useUpdateStudentMutation,
} from "@/services/admin/student.service";

type Mode = "create" | "update";

interface StudentFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: (mode: Mode) => void;
  studentId?: number;
  defaultSchoolId?: number | null;
  defaultClassId?: number | null;
}

const ROLE_STUDENT_ID = 3;

type StudentUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

type StudentDetailApi = {
  id: number;
  user_id: number;
  school_id: number | null;
  class_id: number | null;
  status: boolean;
  created_at: string;
  updated_at: string;
  user?: StudentUser | null;
  school?: { id: number; name: string } | null;
  class?: { id: number; name: string } | null;
};

type WithData<T> = { data: T };
function unwrap<T>(x: T | WithData<T> | undefined): T | undefined {
  if (!x) return undefined;
  return (x as WithData<T>).data !== undefined
    ? (x as WithData<T>).data
    : (x as T);
}

export default function StudentForm({
  open,
  onOpenChange,
  onSuccess,
  studentId,
  defaultSchoolId = null,
  defaultClassId = null,
}: StudentFormProps) {
  const isEdit = Number.isInteger(studentId);

  const { data: detail, isFetching: loadingDetail } = useGetStudentByIdQuery(
    (studentId ?? 0) as number,
    { skip: !open || !isEdit, refetchOnMountOrArgChange: true }
  );
  const student = React.useMemo(
    () => unwrap<StudentDetailApi>(detail),
    [detail]
  );

  const [schoolId, setSchoolId] = React.useState<number | null>(
    defaultSchoolId
  );
  const [classId, setClassId] = React.useState<number | null>(defaultClassId);
  const [name, setName] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [passwordConf, setPasswordConf] = React.useState<string>("");
  const [status, setStatus] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!open || !isEdit || !student) return;
    setSchoolId(student.school_id ?? null);
    setClassId(student.class_id ?? null);
    setName(student.user?.name ?? "");
    setEmail(student.user?.email ?? "");
    setPhone(student.user?.phone ?? ("" as string));
    setStatus(Boolean(student.status));
    setPassword("");
    setPasswordConf("");
  }, [open, isEdit, student]);

  React.useEffect(() => {
    if (open && !isEdit) {
      setSchoolId(defaultSchoolId);
      setClassId(defaultClassId);
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setPasswordConf("");
      setStatus(true);
    }
  }, [open, isEdit, defaultSchoolId, defaultClassId]);

  const [schoolSearch, setSchoolSearch] = React.useState<string>("");
  const { data: schoolListResp, isFetching: loadingSchools } =
    useGetSchoolListQuery(
      { page: 1, paginate: 30, search: schoolSearch },
      { refetchOnMountOrArgChange: true }
    );
  const schools: School[] = schoolListResp?.data ?? [];

  const [classSearch, setClassSearch] = React.useState<string>("");
  const { data: classListResp, isFetching: loadingClasses } =
    useGetClassListQuery(
      { page: 1, paginate: 50, search: classSearch },
      { refetchOnMountOrArgChange: true }
    );
  const classes: Class[] = classListResp?.data ?? [];

  const [createStudent, { isLoading: creating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: updating }] = useUpdateStudentMutation();
  const submitting = creating || updating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schoolId) {
      void Swal.fire({
        icon: "warning",
        title: "Pilih Sekolah",
        text: "Field sekolah wajib diisi.",
      });
      return;
    }
    if (!classId) {
      void Swal.fire({
        icon: "warning",
        title: "Pilih Kelas",
        text: "Field kelas wajib diisi.",
      });
      return;
    }
    if (!name.trim()) {
      void Swal.fire({ icon: "warning", title: "Nama wajib diisi" });
      return;
    }
    if (!email.trim()) {
      void Swal.fire({ icon: "warning", title: "Email wajib diisi" });
      return;
    }

    if (!isEdit && !phone.trim()) {
      void Swal.fire({
        icon: "warning",
        title: "Nomor HP wajib diisi",
        text: "Mohon isi No. HP saat membuat akun siswa.",
      });
      return;
    }
    
    if (!isEdit) {
      if (!password) {
        void Swal.fire({ icon: "warning", title: "Password wajib diisi" });
        return;
      }
      if (password !== passwordConf) {
        void Swal.fire({
          icon: "warning",
          title: "Konfirmasi password tidak cocok",
        });
        return;
      }
    } else if (password || passwordConf) {
      if (password !== passwordConf) {
        void Swal.fire({
          icon: "warning",
          title: "Konfirmasi password tidak cocok",
        });
        return;
      }
    }

    try {
      if (isEdit) {
        const payload: {
          school_id?: number;
          class_id?: number;
          name?: string;
          email?: string;
          phone?: string | null;
          status?: boolean;
          role_id?: number;
          password?: string;
          password_confirmation?: string;
        } = {
          school_id: schoolId ?? undefined,
          class_id: classId ?? undefined,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() ? phone.trim() : null,
          status,
          role_id: ROLE_STUDENT_ID,
        };
        if (password) {
          payload.password = password;
          payload.password_confirmation = passwordConf;
        }

        await updateStudent({ id: studentId as number, payload }).unwrap();
        onSuccess("update");
      } else {
        const payload = {
          school_id: schoolId!,
          class_id: classId!,
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConf,
          status,
          role_id: ROLE_STUDENT_ID,
          phone: phone.trim() ? phone.trim() : null,
        };
        await createStudent(payload).unwrap();
        onSuccess("create");
      }

      onOpenChange(false);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Terjadi kesalahan. Coba lagi.";
      void Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: message,
      });
    }
  };

  // Lindungi interaksi Popover/Command di dalam Dialog non-modal
  const handleInteractOutside: React.ComponentProps<
    typeof DialogContent
  >["onInteractOutside"] = (e) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("[cmdk-root]") ||
      target.closest("[data-radix-popover-content]") ||
      target.closest("[role=dialog] [role=listbox]")
    ) {
      e.preventDefault();
    }
  };

  return (
    <>
      {/* ⬇️ Custom overlay/masking (visual only), tetap allow click-through */}
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[48] bg-black/40 pointer-events-none"
        />
      )}

      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        <DialogContent
          className="sm:max-w-lg z-[50]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={handleInteractOutside}
        >
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Siswa" : "Tambah Siswa"}</DialogTitle>
          </DialogHeader>

          {loadingDetail && isEdit ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat data...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* school */}
              <div className="space-y-2">
                <Label>Sekolah</Label>
                <Combobox<School>
                  value={schoolId}
                  onChange={(v) => setSchoolId(v)}
                  onSearchChange={setSchoolSearch}
                  data={schools}
                  isLoading={loadingSchools}
                  placeholder="Pilih Sekolah"
                  getOptionLabel={(s) => s.name}
                />
              </div>

              {/* class */}
              <div className="space-y-2">
                <Label>Kelas</Label>
                <Combobox<Class>
                  value={classId}
                  onChange={(v) => setClassId(v)}
                  onSearchChange={setClassSearch}
                  data={classes}
                  isLoading={loadingClasses}
                  placeholder="Pilih Kelas"
                  getOptionLabel={(c) => c.name}
                />
              </div>

              {/* name */}
              <div className="space-y-2">
                <Label>Nama</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama siswa"
                />
              </div>

              {/* email */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                />
              </div>

              {/* phone */}
              <div className="space-y-2">
                <Label>No. HP</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              {/* password */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Password{isEdit ? " (isi jika ganti)" : ""}</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      isEdit
                        ? "Biarkan kosong jika tidak ganti"
                        : "Min. 6 karakter"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Konfirmasi Password{isEdit ? " (isi jika ganti)" : ""}
                  </Label>
                  <Input
                    type="password"
                    value={passwordConf}
                    onChange={(e) => setPasswordConf(e.target.value)}
                    placeholder={
                      isEdit
                        ? "Biarkan kosong jika tidak ganti"
                        : "Ulangi password"
                    }
                  />
                </div>
              </div>

              {/* status */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="text-xs text-muted-foreground">
                    Aktif/nonaktifkan akun siswa
                  </div>
                </div>
                <Switch checked={status} onCheckedChange={setStatus} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEdit ? "Simpan Perubahan" : "Simpan"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}