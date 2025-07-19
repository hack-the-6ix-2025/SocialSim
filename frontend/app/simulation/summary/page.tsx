"use client";

import { NavUser } from "@/components/nav-user";
import Link from "next/link";

export default function SummaryPage() {
  // Example user data; replace with real user data as needed
  const user = {
    name: "Erin Hu",
    email: "ehu28548@gmail.com",
    avatar: "https://ui-avatars.com/api/?name=Erin+Hu"
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col min-w-full">
      <div className="w-full flex items-center justify-between px-8 py-4 border-b bg-white">
        <nav className="flex items-center gap-2 text-gray-500 text-sm font-medium">
          <Link href="/dashboard">Dashboard</Link>
          <span className="mx-1">/</span>
          <Link href="/simulation/sim">Simulation</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900">Summary</span>
        </nav>
        <div className="flex items-center">
          <NavUser user={user} />
        </div>
      </div>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Simulation Summary</h1>
        <p></p>
      </main>
    </div>
  );
}