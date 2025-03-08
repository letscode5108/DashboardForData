// src/app/page.tsx
'use client';

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, PlusCircle } from 'lucide-react';
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Register</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <Database className="h-16 w-16 mb-4 text-primary" />
        <h1 className="text-4xl font-bold mb-2">Table Management Dashboard</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-xl">
          Create, view, and manage your data tables with Google Sheets integration
        </p>
        
        
        
        
        
        
        
        
        
        
        
        
      </div>










    </div>

     









  )
}