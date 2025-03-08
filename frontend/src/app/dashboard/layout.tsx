// app/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Table, 
  Database, 
  Settings, 
  Menu, 
  X,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header with toggle button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
        <div className="font-semibold text-xl">Dashboard</div>
        <div className="w-10"></div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            fixed inset-y-0 left-0 z-50 w-64 bg-white border-r p-4 transform transition-transform duration-200 ease-in-out
            md:relative md:translate-x-0
          `}
        >
          {/* Logo */}
          <div className="flex items-center h-12 mb-8 mt-2">
            <span className="text-xl font-bold">Table Dashboard</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <NavItem 
              href="/dashboard" 
              icon={<Home size={20} />} 
              label="Dashboard" 
              isActive={pathname === "/dashboard"}
              onClick={() => setIsSidebarOpen(false)}
            />
            <NavItem 
              href="/dashboard/tables" 
              icon={<Table size={20} />} 
              label="Tables" 
              isActive={pathname.startsWith("/dashboard/tables")}
              onClick={() => setIsSidebarOpen(false)}
            />
            
            
            
            
            
            
            
            
            
            
            
            
            
           
          </nav>

          {/* Logout button at bottom */}
          <div className="absolute bottom-8 left-4 right-4">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => console.log("Logout clicked")}
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-1 md:p-0 min-h-screen">
          {/* Overlay for mobile sidebar */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

// Navigation item component
function NavItem({ href, icon, label, isActive, onClick }) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`
        flex items-center py-2 px-3 rounded-md transition-colors
        ${isActive 
          ? "bg-blue-50 text-blue-700 font-medium" 
          : "text-gray-600 hover:bg-gray-100"
        }
      `}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}