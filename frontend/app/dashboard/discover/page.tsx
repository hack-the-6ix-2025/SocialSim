import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

interface Simulation {
  sim_id: string
  created_at: string
  name: string
  description: string
  thumbnail_url: string
}

async function getSimulations(): Promise<Simulation[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching simulations:', error)
    return []
  }
  
  return data || []
}

export default async function DiscoverPage() {
  const simulations = await getSimulations()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Simulations</h1>
        <p className="text-muted-foreground">
          Explore and practice with various simulation scenarios. Choose from different fields and situations to enhance your professional skills.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-12">
        {simulations.map((simulation) => (
          <Link
            key={simulation.sim_id}
            href={`/dashboard/discover/${simulation.sim_id}`}
            className="group block"
          >
            <div className="space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                {simulation.thumbnail_url ? (
                  <Image
                    src={simulation.thumbnail_url}
                    alt={simulation.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No thumbnail</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg line-clamp-2 group-hover:text-gray-500 transition-colors">
                  {simulation.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {simulations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No simulations available yet.</p>
        </div>
      )}
    </div>
  )
} 