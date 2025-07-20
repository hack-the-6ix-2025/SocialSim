'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Eye, RefreshCw, Search, Calendar, Clock, BarChart3 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface HistoryEntry {
  id: string
  user_id: string
  simulation_id: string
  created_at: string
  simulations: {
    sim_id: string
    name: string
    description: string
    thumbnail_url: string
    category: string
  }
}

export default function HistoryPage() {
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [timeRange, setTimeRange] = useState('30d')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    async function fetchHistory() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setHistoryEntries([])
          return
        }

        // Fetch history entries with simulation details using Supabase join
        const { data, error } = await supabase
          .from('history')
          .select(`
            id,
            user_id,
            simulation_id,
            created_at,
            simulations (
              sim_id,
              name,
              description,
              thumbnail_url,
              category
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching history:', error)
          setHistoryEntries([])
        } else {
          // Transform the data to match the expected interface
          const transformedData = (data || []).map((entry: any) => ({
            id: entry.id,
            user_id: entry.user_id,
            simulation_id: entry.simulation_id,
            created_at: entry.created_at,
            simulations: Array.isArray(entry.simulations) ? entry.simulations[0] : entry.simulations
          }))
          setHistoryEntries(transformedData)
        }
      } catch (err) {
        console.error('Error fetching history:', err)
        setHistoryEntries([])
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const created = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    if (diffInHours < 720) return `${Math.floor(diffInHours / 168)}w ago`
    return `${Math.floor(diffInHours / 720)}mo ago`
  }

  const filteredHistory = historyEntries.filter((item) => {
    // Search filter
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.simulations.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.simulations.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.simulations.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Category filter
    const matchesCategory =
      categoryFilter === 'all' ||
      item.simulations.category.toLowerCase() === categoryFilter.toLowerCase()
    
    // Time range filter
    let matchesTime = true
    if (timeRange !== 'all') {
      const now = new Date()
      const created = new Date(item.created_at)
      let days = 0
      if (timeRange === '7d') days = 7
      else if (timeRange === '30d') days = 30
      else if (timeRange === '90d') days = 90
      else if (timeRange === '1y') days = 365
      if (days > 0) {
        const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        matchesTime = diff <= days
      }
    }
    
    return matchesSearch && matchesCategory && matchesTime
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Simulation History</h1>
        <p className="text-muted-foreground">
          See your past simulations and track your learning progress over time.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search simulations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="Medical">Medical</SelectItem>
              <SelectItem value="Disaster Response">Disaster Response</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="problem-solving">Problem Solving</SelectItem>
              <SelectItem value="team-management">Team Management</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* History Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHistory.map((entry, index) => (
          <Card 
            key={entry.id} 
            className={`hover:shadow-lg transition-shadow ${
              index % 3 === 0 
                ? 'border-l-4 border-l-blue-500' 
                : index % 3 === 1 
                ? 'border-l-4 border-l-purple-500'
                : 'border-l-4 border-l-indigo-500'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {entry.simulations.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {entry.simulations.description.length > 100 
                      ? `${entry.simulations.description.substring(0, 100)}...`
                      : entry.simulations.description
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`${
                    entry.simulations.category.toLowerCase() === 'medical' 
                      ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                      : entry.simulations.category.toLowerCase() === 'disaster response'
                      ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                      : entry.simulations.category.toLowerCase() === 'leadership'
                      ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : entry.simulations.category.toLowerCase() === 'communication'
                      ? 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                      : entry.simulations.category.toLowerCase() === 'problem-solving'
                      ? 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
                      : entry.simulations.category.toLowerCase() === 'team-management'
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {entry.simulations.category}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  {getRelativeTime(entry.created_at)}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(entry.created_at)}
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/dashboard/analytics?simulation=${entry.simulation_id}`}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/discover/${entry.simulation_id}`}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || categoryFilter !== 'all' || timeRange !== 'all'
              ? 'No simulations found matching your filters.'
              : 'No simulation history available yet. Start by exploring simulations in the Discover section.'
            }
          </p>
          {!searchQuery && categoryFilter === 'all' && timeRange === 'all' && (
            <Button asChild className="mt-4">
              <Link href="/dashboard/discover">
                Discover Simulations
              </Link>
            </Button>
          )}
        </div>
      )}
      
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      )}
    </div>
  )
}
