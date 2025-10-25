import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

interface ActionsGroupProps {
  handleDetail?: () => void;
  handleEdit?: () => void;
  handleDelete?: () => void;
  additionalActions?: React.ReactNode;
}

const ActionsGroup = ({
  handleDetail,
  handleEdit,
  handleDelete,
  additionalActions,
}: ActionsGroupProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        {/* Basic Actions */}
        {handleDetail && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDetail}
                className="text-blue-400 border-blue-400 hover:text-blue-400 hover:bg-blue-50"
              >
                <Eye className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Detail</p>
            </TooltipContent>
          </Tooltip>
        )}

        {handleEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
                className="text-yellow-400 border-yellow-400 hover:text-yellow-400 hover:bg-yellow-50"
              >
                <Edit className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
        )}

        {handleDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hapus</p>
            </TooltipContent>
          </Tooltip>
        )}

        {additionalActions}
      </div>
    </TooltipProvider>
  );
};

export default ActionsGroup;
