// app/dashboard/components/TableList.tsx
"use client";

import { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Pencil, Trash2, Link, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import TableDetailDialog from "./TableDetailDialog";
import ConnectGoogleSheetDialog from "./ConnectGoogleSheetDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

export default function TableList({ tables, onRefresh }) {
  const router = useRouter();
  const [selectedTable, setSelectedTable] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConnectSheetOpen, setIsConnectSheetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleViewTable = (tableId) => {
    router.push(`/dashboard/tables/${tableId}`);
  };

  const handleEditTable = (table) => {
    setSelectedTable(table);
    setIsDetailOpen(true);
  };

  const handleConnectSheet = (table) => {
    setSelectedTable(table);
    setIsConnectSheetOpen(true);
  };

  const handleDeleteTable = (table) => {
    setSelectedTable(table);
    setIsDeleteOpen(true);
  };

  const handleSyncSheet = async (tableId) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}tables/${tableId}/sync-google-sheet`, {
        method: 'POST',
      });
      onRefresh();
    } catch (error) {
      console.error('Error syncing Google Sheet:', error);
    }
  };

  const confirmDeleteTable = async () => {
    if (!selectedTable) return;
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}tables/${selectedTable._id}`, {
        method: 'DELETE',
      });
      setIsDeleteOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  if (tables.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 mb-4">No tables found</p>
        <p className="text-sm text-gray-400">Create a new table to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Columns</TableHead>
              <TableHead>Data Source</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => (
              <TableRow key={table._id}>
                <TableCell className="font-medium">{table.name}</TableCell>
                <TableCell>{table.columns?.length || 0} columns</TableCell>
                <TableCell>
                  {table.googleSheetConfig?.sheetId ? (
                    <div className="flex items-center">
                      <span className="mr-2">Google Sheet</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleSyncSheet(table._id)}
                        title="Sync with Google Sheet"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-gray-500">Dashboard only</span>
                  )}
                </TableCell>
                <TableCell>
                  {table.updatedAt ? (
                    formatDistanceToNow(new Date(table.updatedAt), { addSuffix: true })
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewTable(table._id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditTable(table)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleConnectSheet(table)}>
                        <Link className="mr-2 h-4 w-4" />
                        Connect to Google Sheet
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteTable(table)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedTable && (
        <>
          <TableDetailDialog 
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            table={selectedTable}
            onRefresh={onRefresh}
          />
          
          <ConnectGoogleSheetDialog
            isOpen={isConnectSheetOpen}
            onClose={() => setIsConnectSheetOpen(false)}
            tableId={selectedTable._id}
            onRefresh={onRefresh}
          />
          
          <DeleteConfirmDialog
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={confirmDeleteTable}
            tableName={selectedTable.name}
          />
        </>
      )}
    </>
  );
}