// app/dashboard/tables/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Link } from "lucide-react";
import ConnectGoogleSheetDialog from "../../components/ConnectGoogleSheetDialog";
import { use } from 'react';




export default function TableViewPage({ params }) {
  const router = useRouter();
  const { id } = use (params);
  
  const [table, setTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectSheetOpen, setIsConnectSheetOpen] = useState(false);

  useEffect(() => {
    fetchTableData();
  }, [id]);

  const fetchTableData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}tables/${id}`);
      if (!response.ok) throw new Error('Failed to fetch table');
      
      const data = await response.json();
      setTable(data.table);
      setTableData(data.data || []);
    } catch (error) {
      console.error('Error fetching table data:', error);
    } finally {
    
    setIsLoading(false);
}
};

const handleSync = async () => {
try {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}tables/${id}/sync-google-sheet`, {
    method: 'POST',
  });
  fetchTableData();
} catch (error) {
  console.error('Error syncing Google Sheet:', error);
}
};

const goBack = () => {
router.push('/dashboard');
};

if (isLoading) {
return (
  <div className="container mx-auto p-6 flex justify-center items-center h-64">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
  </div>
);
}

if (!table) {
return (
  <div className="container mx-auto p-6">
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <p className="text-lg text-gray-500 mb-4">Table not found</p>
          <Button onClick={goBack}>Back to Dashboard</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
}










return (
<div className="container mx-auto p-6">
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center">
      <Button variant="ghost" onClick={goBack} className="mr-2">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>
      <h1 className="text-2xl font-bold">{table.name}</h1>
    </div>
    <div className="flex gap-2">
      {table.googleSheetConfig?.sheetId ? (
        <Button 
          variant="outline" 
          onClick={handleSync}
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync
        </Button>
      ) : (
        <Button 
          variant="outline" 
          onClick={() => setIsConnectSheetOpen(true)}
          className="flex items-center"
        >
          <Link className="h-4 w-4 mr-2" />
          Connect Sheet
        </Button>
      )}
    </div>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>Table Data</CardTitle>
      {table.googleSheetConfig?.sheetId && (
        <p className="text-sm text-gray-500">
          Connected to Google Sheet: {table.googleSheetConfig.tabName}
        </p>
      )}
    </CardHeader>
    <CardContent>
      {tableData.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">No data available</p>
          {table.googleSheetConfig?.sheetId ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSync}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync with Google Sheet
            </Button>
          ) : (
            <p className="text-sm text-gray-400">
              Connect to a Google Sheet to import data
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {table.columns.map((column) => (
                  <TableHead key={column.name}>
                    {column.name}
                    {column.fromGoogleSheet && (
                      <span className="ml-1 text-xs text-blue-500">(GS)</span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {table.columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column.name}`}>
                      {formatCellValue(row[column.name], column.type)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </CardContent>
  </Card>

  <ConnectGoogleSheetDialog
    isOpen={isConnectSheetOpen}
    onClose={() => setIsConnectSheetOpen(false)}
    tableId={id}
    onRefresh={fetchTableData}
  />
</div>
);
}

// Helper function to format cell values based on their type
function formatCellValue(value, type) {
if (value === undefined || value === null) {
return '-';
}

switch (type) {
case 'boolean':
  return value ? 'Yes' : 'No';
case 'date':
  try {
    return new Date(value).toLocaleDateString();
  } catch (e) {
    return value;
  }
case 'number':
  return typeof value === 'number' ? value.toLocaleString() : value;
default:
  return value;
}
}