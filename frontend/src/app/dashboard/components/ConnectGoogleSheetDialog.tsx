// app/dashboard/components/ConnectGoogleSheetDialog.tsx
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

export default function ConnectGoogleSheetDialog({ isOpen, onClose, tableId, onRefresh }) {
  const [sheetId, setSheetId] = useState("");
  const [tabName, setTabName] = useState("");
  const [errors, setErrors] = useState({ sheetId: false, tabName: false });
  const [isConnecting, setIsConnecting] = useState(false);

  const validateForm = () => {
    const newErrors = { sheetId: false, tabName: false };
    let isValid = true;

    if (!sheetId.trim()) {
      newErrors.sheetId = true;
      isValid = false;
    }

    if (!tabName.trim()) {
      newErrors.tabName = true;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsConnecting(true);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}tables/${tableId}/connect-google-sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId,
          tabName
        })
      });
      
      onClose();
      onRefresh();
    } catch (error) {
      console.error('Error connecting to Google Sheet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    setSheetId("");
    setTabName("");
    setErrors({ sheetId: false, tabName: false });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to Google Sheet</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="sheet-id" className={errors.sheetId ? "text-red-500" : ""}>
              Google Sheet ID *
            </Label>
            <Input
              id="sheet-id"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              className={errors.sheetId ? "border-red-500" : ""}
              placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            />
            {errors.sheetId ? (
              <p className="text-xs text-red-500">Sheet ID is required</p>
            ) : (
              <p className="text-xs text-gray-500">
                Find this in your Google Sheet URL: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tab-name" className={errors.tabName ? "text-red-500" : ""}>
              Sheet Tab Name *
            </Label>
            <Input
              id="tab-name"
              value={tabName}
              onChange={(e) => setTabName(e.target.value)}
              className={errors.tabName ? "border-red-500" : ""}
              placeholder="e.g. Sheet1"
            />
            {errors.tabName && (
              <p className="text-xs text-red-500">Tab name is required</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isConnecting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}