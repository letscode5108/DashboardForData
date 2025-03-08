// app/dashboard/components/TableDetailDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const COLUMN_TYPES = [
  { value: "string", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" }
];

export default function TableDetailDialog({ isOpen, onClose, table, onRefresh }) {
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState([]);
  const [dashboardOnlyData, setDashboardOnlyData] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({ name: false, columns: [] });

  useEffect(() => {
    if (table) {
      setTableName(table.name || "");
      
      // Filter out columns from Google Sheet as they can't be modified
      const dashboardColumns = table.columns?.filter(col => !col.fromGoogleSheet) || [];
      setColumns(dashboardColumns.length > 0 ? dashboardColumns : [{ name: "", type: "string" }]);
      
      // Set dashboard-only data if available
      setDashboardOnlyData(table.dashboardOnlyData || []);
    }
  }, [table]);

  const handleAddColumn = () => {
    setColumns([...columns, { name: "", type: "string" }]);
  };

  const handleRemoveColumn = (index) => {
    if (columns.length <= 1) return;
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleUpdateColumn = (index, field, value) => {
    const updatedColumns = [...columns];
    updatedColumns[index] = { ...updatedColumns[index], [field]: value };
    setColumns(updatedColumns);
  };

  const validateForm = () => {
    const newErrors = { name: false, columns: [] };
    let isValid = true;

    if (!tableName.trim()) {
      newErrors.name = true;
      isValid = false;
    }

    columns.forEach((column, index) => {
      if (!column.name.trim()) {
        newErrors.columns[index] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsUpdating(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}tables/${table._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tableName,
          columns: columns
        })
      });
      
      onClose();
      onRefresh();
    } catch (error) {
      console.error('Error updating table:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateTableData = async (data) => {
    setIsUpdating(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}tables/${table._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboardOnlyData: data })
      });
      
      onRefresh();
      return true;
    } catch (error) {
      console.error('Error updating table data:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Example method to update dashboard data
  const handleUpdateDashboardData = async (data) => {
    // This is a placeholder - you would typically update dashboardOnlyData
    // based on user interactions in your UI
    const updatedData = [...dashboardOnlyData];
    
    // For example, adding a new item
    // updatedData.push({ id: Date.now(), value: "New value" });
    
    const success = await updateTableData(updatedData);
    if (success) {
      setDashboardOnlyData(updatedData);
    }
  };

  // Get Google Sheet columns that cannot be modified
  const googleSheetColumns = table?.columns?.filter(col => col.fromGoogleSheet) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Table</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="table-name" className={errors.name ? "text-red-500" : ""}>
              Table Name *
            </Label>
            <Input
              id="table-name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">Table name is required</p>
            )}
          </div>

          {googleSheetColumns.length > 0 && (
            <div className="space-y-2">
              <Label>Google Sheet Columns (Read-only)</Label>
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                {googleSheetColumns.map((column, index) => (
                  <div key={`gs-${index}`} className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium text-gray-700">{column.name}</div>
                    <div className="text-sm text-gray-500">{column.type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Dashboard Columns {columns.length > 0 && "*"}</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddColumn}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Column
              </Button>
            </div>

            {columns.map((column, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    value={column.name}
                    onChange={(e) => handleUpdateColumn(index, "name", e.target.value)}
                    className={errors.columns[index] ? "border-red-500" : ""}
                    placeholder="Column name"
                  />
                  {errors.columns[index] && (
                    <p className="text-xs text-red-500">Required</p>
                  )}
                </div>
                <div className="col-span-5">
                  <Select
                    value={column.type}
                    onValueChange={(value) => handleUpdateColumn(index, "type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMN_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveColumn(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



















































// // app/dashboard/components/TableDetailDialog.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { 
//   Dialog, 
//   DialogContent, 
//   DialogHeader, 
//   DialogTitle, 
//   DialogFooter 
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue 
// } from "@/components/ui/select";
// import { Plus, Trash2 } from "lucide-react";

// const COLUMN_TYPES = [
//   { value: "string", label: "Text" },
//   { value: "number", label: "Number" },
//   { value: "boolean", label: "Boolean" },
//   { value: "date", label: "Date" }
// ];

// export default function TableDetailDialog({ isOpen, onClose, table, onRefresh }) {
//   const [tableName, setTableName] = useState("");
//   const [columns, setColumns] = useState([]);
//   const [errors, setErrors] = useState({ name: false, columns: [] });

//   useEffect(() => {
//     if (table) {
//       setTableName(table.name || "");
      
//       // Filter out columns from Google Sheet as they can't be modified
//       const dashboardColumns = table.columns?.filter(col => !col.fromGoogleSheet) || [];
//       setColumns(dashboardColumns.length > 0 ? dashboardColumns : [{ name: "", type: "string" }]);
//     }
//   }, [table]);

//   const handleAddColumn = () => {
//     setColumns([...columns, { name: "", type: "string" }]);
//   };

//   const handleRemoveColumn = (index) => {
//     if (columns.length <= 1) return;
//     setColumns(columns.filter((_, i) => i !== index));
//   };

//   const handleUpdateColumn = (index, field, value) => {
//     const updatedColumns = [...columns];
//     updatedColumns[index] = { ...updatedColumns[index], [field]: value };
//     setColumns(updatedColumns);
//   };

//   const validateForm = () => {
//     const newErrors = { name: false, columns: [] };
//     let isValid = true;

//     if (!tableName.trim()) {
//       newErrors.name = true;
//       isValid = false;
//     }

//     columns.forEach((column, index) => {
//       if (!column.name.trim()) {
//         newErrors.columns[index] = true;
//         isValid = false;
//       }
//     });

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     try {
//       await fetch(`${process.env.NEXT_PUBLIC_API_URL}tables/${table._id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name: tableName,
//           columns: columns
//         })
//       });
      
//       onClose();
//       onRefresh();
//     } catch (error) {
//       console.error('Error updating table:', error);
//     }
//   };

//   // Get Google Sheet columns that cannot be modified
//   const googleSheetColumns = table?.columns?.filter(col => col.fromGoogleSheet) || [];

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-lg">
//         <DialogHeader>
//           <DialogTitle>Edit Table</DialogTitle>
//         </DialogHeader>

//         <div className="grid gap-4 py-4">
//           <div className="grid gap-2">
//             <Label htmlFor="table-name" className={errors.name ? "text-red-500" : ""}>
//               Table Name *
//             </Label>
//             <Input
//               id="table-name"
//               value={tableName}
//               onChange={(e) => setTableName(e.target.value)}
//               className={errors.name ? "border-red-500" : ""}
//             />
//             {errors.name && (
//               <p className="text-xs text-red-500">Table name is required</p>
//             )}
//           </div>

//           {googleSheetColumns.length > 0 && (
//             <div className="space-y-2">
//               <Label>Google Sheet Columns (Read-only)</Label>
//               <div className="bg-gray-50 p-3 rounded-md space-y-2">
//                 {googleSheetColumns.map((column, index) => (
//                   <div key={`gs-${index}`} className="grid grid-cols-2 gap-2">
//                     <div className="text-sm font-medium text-gray-700">{column.name}</div>
//                     <div className="text-sm text-gray-500">{column.type}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="space-y-4">
//             <div className="flex justify-between items-center">
//               <Label>Dashboard Columns {columns.length > 0 && "*"}</Label>
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 size="sm" 
//                 onClick={handleAddColumn}
//               >
//                 <Plus className="h-4 w-4 mr-1" /> Add Column
//               </Button>
//             </div>

//             {columns.map((column, index) => (
//               <div key={index} className="grid grid-cols-12 gap-2 items-center">
//                 <div className="col-span-5">
//                   <Input
//                     value={column.name}
//                     onChange={(e) => handleUpdateColumn(index, "name", e.target.value)}
//                     className={errors.columns[index] ? "border-red-500" : ""}
//                     placeholder="Column name"
//                   />
//                   {errors.columns[index] && (
//                     <p className="text-xs text-red-500">Required</p>
//                   )}
//                 </div>
//                 <div className="col-span-5">
//                   <Select
//                     value={column.type}
//                     onValueChange={(value) => handleUpdateColumn(index, "type", value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {COLUMN_TYPES.map((type) => (
//                         <SelectItem key={type.value} value={type.value}>
//                           {type.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="col-span-2 flex justify-end">
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => handleRemoveColumn(index)}
//                   >
//                     <Trash2 className="h-4 w-4 text-red-500" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit}>
//             Save Changes
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }