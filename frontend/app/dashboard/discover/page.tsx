'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface Simulation {
  sim_id: string
  created_at: string
  name: string
  description: string
  thumbnail_url: string
}

export default function DiscoverPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [filteredSimulations, setFilteredSimulations] = useState<Simulation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSimulations() {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching simulations:', error)
        setSimulations([])
      } else {
        setSimulations(data || [])
      }
      setLoading(false)
    }

    fetchSimulations()
  }, [])

  useEffect(() => {
    const filtered = simulations.filter((simulation) =>
      simulation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      simulation.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredSimulations(filtered)
  }, [searchQuery, simulations])

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Simulations</h1>
          <p className="text-muted-foreground">
            Explore and practice with various simulation scenarios. Choose from different fields and situations to enhance your professional skills.
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading simulations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Simulations</h1>
        <p className="text-muted-foreground">
          Explore and practice with various simulation scenarios. Choose from different fields and situations to enhance your professional skills.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search simulations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            {filteredSimulations.length} simulation{filteredSimulations.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-12">
        {filteredSimulations.map((simulation) => (
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

      {filteredSimulations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'No simulations found matching your search.' : 'No simulations available yet.'}
          </p>
        </div>
      )}
    </div>
  )
} 