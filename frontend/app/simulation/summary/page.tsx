"use client";


import { Button } from "@/components/ui/button";
import { FiRefreshCw, FiBarChart2 } from "react-icons/fi";

export default function SummaryPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simulation Summary</h1>
      <p className="mb-8">View your stats, feedback, and analytics for your simulation history.</p>
      <div className="flex gap-6 mt-6">
        <Button
          variant="outline"
          className="border-2 border-gray-200 bg-white text-gray-900 font-semibold px-7 py-3 text-base flex items-center gap-2 shadow-none hover:bg-gray-50"
          onClick={() => window.location.href = '/simulation/sim'}
        >
          <FiRefreshCw className="text-xl" />
          Restart Simulation
        </Button>
        <Button
          variant="default"
          className="bg-black text-white font-semibold px-7 py-3 text-base flex items-center gap-2 hover:bg-gray-900"
          onClick={() => window.location.href = '/dashboard/analytics'}
        >
          <FiBarChart2 className="text-xl" />
          View Analytics
        </Button>
      </div>
    </div>
  )
} 