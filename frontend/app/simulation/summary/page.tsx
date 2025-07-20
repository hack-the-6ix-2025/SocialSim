"use client";

import { Button } from "@/components/ui/button";
import { FiRefreshCw, FiBarChart2, FiArrowLeft } from "react-icons/fi";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SummaryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [simulationInfo, setSimulationInfo] = useState<{
    simId?: string
    name?: string
    category?: string
  } | null>(null)

  useEffect(() => {
    const simId = searchParams.get("simId")
    const name = searchParams.get("name")
    const category = searchParams.get("category")
    
    if (simId || name || category) {
      setSimulationInfo({
        simId: simId || undefined,
        name: name ? decodeURIComponent(name) : undefined,
        category: category ? decodeURIComponent(category) : undefined
      })
    }
  }, [searchParams])

  const handleRestart = () => {
    if (simulationInfo?.simId) {
      router.push(`/simulation/sim?simId=${simulationInfo.simId}`)
    } else {
      router.push('/simulation/sim')
    }
  }

  const handleViewAnalytics = () => {
    router.push('/dashboard/analytics')
  }

  const handleBackToDiscover = () => {
    router.push('/dashboard/discover')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-primary">
        {simulationInfo?.name ? `${simulationInfo.name} - Summary` : 'Simulation Summary'}
      </h1>
      
      {simulationInfo && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-accent-foreground mb-2">Simulation Details</h2>
          <div className="space-y-1 text-sm text-accent-foreground/80">
            {simulationInfo.name && <div><strong>Scenario:</strong> {simulationInfo.name}</div>}
            {simulationInfo.category && <div><strong>Category:</strong> {simulationInfo.category}</div>}
          </div>
        </div>
      )}
      
      <p className="mb-8">
        {simulationInfo?.name 
          ? `View your stats, feedback, and analytics for the "${simulationInfo.name}" simulation.`
          : 'View your stats, feedback, and analytics for your simulation history.'
        }
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Button
          variant="outline"
          className="border-2 border-gray-200 bg-white text-gray-900 font-semibold px-7 py-3 text-base flex items-center gap-2 shadow-none hover:bg-gray-50"
          onClick={handleRestart}
        >
          <FiRefreshCw className="text-xl" />
          {simulationInfo?.name ? `Restart ${simulationInfo.name}` : 'Restart Simulation'}
        </Button>
        <Button
          variant="default"
          className="bg-black text-white font-semibold px-7 py-3 text-base flex items-center gap-2 hover:bg-gray-900"
          onClick={handleViewAnalytics}
        >
          <FiBarChart2 className="text-xl" />
          View Analytics
        </Button>
        <Button
          variant="ghost"
          className="text-gray-600 font-semibold px-7 py-3 text-base flex items-center gap-2 hover:bg-gray-100"
          onClick={handleBackToDiscover}
        >
          <FiArrowLeft className="text-xl" />
          Back to Discover
        </Button>
      </div>
    </div>
  )
} 