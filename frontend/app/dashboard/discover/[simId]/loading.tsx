import { Skeleton } from '@/components/ui/skeleton'

export default function SimulationLoading() {
  return (
    <div className="min-h-screen">
      {/* Banner Skeleton */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content Skeleton */}
      <div className="p-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Title Skeleton */}
          <Skeleton className="h-12 w-3/4" />
          
          {/* Description Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/5" />
          </div>
          
          {/* Button Skeleton */}
          <div className="pt-6">
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    </div>
  )
} 