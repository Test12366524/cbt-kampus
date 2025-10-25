import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface CostParameterFormProps {
  onClose: () => void;
  onSubmit: (data: CostParameter) => void;
  initialData?: CostParameter;
}

type CostType = "Tetap" | "Persentase";

interface CostParameter {
  id: string;
  productName: string;
  costType: CostType;
  costValue: string;
  startDate: string;
  endDate: string;
}

export default function FormCreateCostParameter({
  onClose,
  onSubmit,
  initialData,
}: CostParameterFormProps) {
  const isEdit = !!initialData;
  const [formState, setFormState] = useState<CostParameter>({
    id: "",
    productName: "",
    costType: "Tetap",
    costValue: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (isEdit && initialData) {
      setFormState(initialData);
    } else {
      const newId = `P${String(Date.now()).slice(-5)}`;
      setFormState((prev) => ({ ...prev, id: newId }));
    }
  }, [initialData, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validasi eksplisit costType agar sesuai dengan union
    const validCostType =
      formState.costType === "Tetap" || formState.costType === "Persentase"
        ? formState.costType
        : "Tetap";

    const submittedData: CostParameter = {
      ...formState,
      costType: validCostType,
    };

    onSubmit(submittedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg w-full max-w-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Parameter Biaya" : "Buat Parameter Biaya Baru"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>ID Parameter</Label>
            <Input name="id" value={formState.id} disabled />
          </div>
          <div>
            <Label>Nama Produk</Label>
            <Input
              name="productName"
              value={formState.productName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Jenis Biaya</Label>
            <select
              name="costType"
              value={formState.costType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-neutral-700 border-gray-300 dark:border-gray-600"
            >
              <option value="Tetap">Tetap</option>
              <option value="Persentase">Persentase</option>
            </select>
          </div>
          <div>
            <Label>Nilai Biaya</Label>
            <Input
              name="costValue"
              value={formState.costValue}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Tanggal Efektif</Label>
            <Input
              type="date"
              name="startDate"
              value={formState.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Tanggal Akhir</Label>
            <Input
              type="date"
              name="endDate"
              value={formState.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black text-sm"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 rounded bg-neutral-600 text-white hover:bg-neutral-700 text-sm"
            >
              {isEdit ? "Update" : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
