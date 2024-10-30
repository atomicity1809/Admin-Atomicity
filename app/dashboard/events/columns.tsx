import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  registeredUsers: string[];
  isAvailableToReg: boolean;
};

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "registeredUsers",
    header: "Registrations",
    cell: ({ row }) => {
      const amount = row.original.registeredUsers.length;
      return <div className="font-medium">{amount}</div>;
    },
  },
  {
    accessorKey: "isAvailableToReg",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div className={`font-medium ${row.original.isAvailableToReg ? 'text-green-600' : 'text-red-600'}`}>
          {row.original.isAvailableToReg ? 'Active' : 'Inactive'}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const event = row.original;
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          </DropdownMenuTrigger>
        </DropdownMenu>
      );
    },
  },
];