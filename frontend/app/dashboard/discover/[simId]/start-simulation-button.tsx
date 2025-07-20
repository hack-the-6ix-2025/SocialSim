"use client"

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface StartSimulationButtonProps {
  simId: string
}

export function StartSimulationButton({ simId }: StartSimulationButtonProps) {
  const router = useRouter()

  const handleStartSimulation = () => {
    router.push(`/simulation/sim?simId=${simId}`)
  }

  return (
    <Button 
      size="lg" 
      className="px-8 py-3 text-lg"
      onClick={handleStartSimulation}
    >
      Start Simulation
    </Button>
  )
} 