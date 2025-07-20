import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SimulationNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Simulation Not Found</h1>
          <p className="text-muted-foreground">
            The simulation you're looking for doesn't exist or may have been removed.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild>
            <Link href="/dashboard/discover">
              Back to Discover
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 