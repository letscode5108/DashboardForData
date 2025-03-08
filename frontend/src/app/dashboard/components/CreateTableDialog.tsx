// app/dashboard/components/CreateTableDialog.tsx
"use client";

import { useState } from "react";
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

export default function CreateTableDialog({ isOpen, onClose, onCreateTable }) {
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState([
    { name: "", type: "string" }
  ]);
  const [errors, setErrors] = useState({ name: false, columns: [] });

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

  const handleSubmit = () => {
    if (!validateForm()) return;

    onCreateTable({
      name: tableName,
      columns: columns
    });

    // Reset form
    setTableName("");
    setColumns([{ name: "", type: "string" }]);
    setErrors({ name: false, columns: [] });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Table</DialogTitle>
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
              placeholder="Enter table name"
            />
            {errors.name && (
              <p className="text-xs text-red-500">Table name is required</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Columns *</Label>
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
                    disabled={columns.length <= 1}
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
          <Button onClick={handleSubmit}>
            Create Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}