import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Metadata } from 'next'
import { StartSimulationButton } from './start-simulation-button'

interface Simulation {
  sim_id: string
  created_at: string
  name: string
  description: string
  thumbnail_url: string
}

async function getSimulation(simId: string): Promise<Simulation | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('sim_id', simId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data
}

interface SimulationPageProps {
  params: {
    simId: string
  }
}

export async function generateMetadata({ params }: SimulationPageProps): Promise<Metadata> {
  const { simId } = await params
  const simulation = await getSimulation(simId)
  
  if (!simulation) {
    return {
      title: 'Simulation Not Found',
    }
  }
  
  return {
    title: simulation.name,
    description: simulation.description,
  }
}

export default async function SimulationPage({ params }: SimulationPageProps) {
  const { simId } = await params
  const simulation = await getSimulation(simId)
  
  if (!simulation) {
    notFound()
  }

  return (
    <div className="p-7">
      {/* Banner Image */}
      <div className="relative h-64 md:h-80 lg:h-80 w-full">
        {simulation.thumbnail_url ? (
          <Image
            src={simulation.thumbnail_url}
            alt={simulation.name}
            fill
            className="object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-lg">No thumbnail available</span>
          </div>
        )}
        <div className="absolute inset-0" />
      </div>

      {/* Content */}
      <div className="p-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Title */}
          <h1 className="text-4xl font-bold">{simulation.name}</h1>
          
          {/* Description */}
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {simulation.description}
            </p>
          </div>
          
          {/* Start Simulation Button */}
          <div className="pt-6">
            <StartSimulationButton simId={simId} />
          </div>
        </div>
      </div>
    </div>
  )
} 