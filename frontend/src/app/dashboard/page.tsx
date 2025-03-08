'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/services/auth.service';
import { User } from '@/app/types/auth.types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import TableList from "./components/TableList";
import CreateTableDialog from "./components/CreateTableDialog";

















export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      
      if (!storedUser || !accessToken) {
        router.push('/login');
        return;
      }
      
      try {
        setUser(JSON.parse(storedUser));
        fetchTables();
      } catch (err) {
        router.push('/login');
      }
    }
  }, [router]);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}tables`);
      if (!response.ok) throw new Error('Failed to fetch tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTable = async (tableData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableData)
      });
      if (!response.ok) throw new Error('Failed to create table');
      
      setIsCreateDialogOpen(false);
      await fetchTables();
    } catch (error) {
      console.error('Error creating table:', error);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }
      
      const response = await logoutUser(accessToken);
      
      if (response.success) {
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        router.push('/login');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-3">
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Table
            </Button>
            <Button onClick={handleLogout} variant="outline" disabled={isLoading}>
              {isLoading ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome, {user.fullName}!</CardTitle>
            <CardDescription>You are successfully logged in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user._id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Tables</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : (
              <TableList tables={tables} onRefresh={fetchTables} />
            )}
          </CardContent>
        </Card>

        <CreateTableDialog 
          isOpen={isCreateDialogOpen} 
          onClose={() => setIsCreateDialogOpen(false)}
          onCreateTable={handleCreateTable}
        />
      </div>
    </div>
  );
}













































// // src/app/dashboard/page.tsx
// 'use client';

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { logoutUser } from '@/app/services/auth.service'
// import { User } from '@/app/types/auth.types'
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"

// export default function Dashboard() {
//   const router = useRouter()
//   const [user, setUser] = useState<User | null>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     // Check if user is logged in
//     if (typeof window !== 'undefined') {
//       const storedUser = localStorage.getItem('user')
//       const accessToken = localStorage.getItem('accessToken')
      
//       if (!storedUser || !accessToken) {
//         router.push('/login')
//         return
//       }
      
//       try {
//         setUser(JSON.parse(storedUser))
//       } catch (err) {
//         router.push('/login')
//       }
//     }
//   }, [router])

//   const handleLogout = async () => {
//     setIsLoading(true)
//     setError(null)
    
//     try {
//       const accessToken = localStorage.getItem('accessToken')
//       if (!accessToken) {
//         throw new Error('No access token found')
//       }
      
//       const response = await logoutUser(accessToken)
      
//       if (response.success) {
//         // Clear localStorage
//         localStorage.removeItem('accessToken')
//         localStorage.removeItem('refreshToken')
//         localStorage.removeItem('user')
        
//         router.push('/login')
//       } else {
//         setError(response.message)
//       }
//     } catch (err) {
//       setError('An error occurred during logout')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   if (!user) {
//     return <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">Loading...</div>
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 p-4">
//       <div className="max-w-4xl mx-auto">
//         <div className="mb-6 flex items-center justify-between">
//           <h1 className="text-3xl font-bold">Dashboard</h1>
//           <Button onClick={handleLogout} variant="outline" disabled={isLoading}>
//             {isLoading ? 'Logging out...' : 'Logout'}
//           </Button>
//         </div>
        
//         {error && (
//           <Alert variant="destructive" className="mb-6">
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}
        
//         <Card>
//           <CardHeader>
//             <CardTitle>Welcome, {user.fullName}!</CardTitle>
//             <CardDescription>You are successfully logged in</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               <p><strong>Username:</strong> {user.username}</p>
//               <p><strong>Email:</strong> {user.email}</p>
//               <p><strong>User ID:</strong> {user._id}</p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }