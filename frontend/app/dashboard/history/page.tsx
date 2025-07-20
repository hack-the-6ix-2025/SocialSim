'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Calendar, Clock, Award, Filter, Download, Eye, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface SimulationHistory {
  id: string
  simulation_name: string
  category: string
  completed_at: string
  score: number
  duration: number // minutes
  status: 'completed' | 'in_progress' | 'abandoned'
  feedback: string
  attempts: number
  best_score: number
}

export default function HistoryPage() {
  const [simulationHistory, setSimulationHistory] = useState<SimulationHistory[]>([])
  const [filteredHistory, setFilteredHistory] = useState<SimulationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('completed_at')

  useEffect(() => {
    async function fetchHistory() {
      const supabase = createClient()
      
      // Mock data for now - replace with actual API calls
      const mockData: SimulationHistory[] = [
        {
          id: '1',
          simulation_name: 'Crisis Management Leadership',
          category: 'Leadership',
          completed_at: '2024-01-15T14:30:00Z',
          score: 85,
          duration: 45,
          status: 'completed',
          feedback: 'Excellent decision-making under pressure. Strong communication skills demonstrated.',
          attempts: 1,
          best_score: 85
        },
        {
          id: '2',
          simulation_name: 'Team Conflict Resolution',
          category: 'Communication',
          completed_at: '2024-01-14T10:15:00Z',
          score: 72,
          duration: 38,
          status: 'completed',
          feedback: 'Good approach to conflict resolution. Could improve active listening skills.',
          attempts: 2,
          best_score: 72
        },
        {
          id: '3',
          simulation_name: 'Strategic Planning Workshop',
          category: 'Problem Solving',
          completed_at: '2024-01-13T16:45:00Z',
          score: 91,
          duration: 52,
          status: 'completed',
          feedback: 'Outstanding strategic thinking. Excellent analysis and planning capabilities.',
          attempts: 1,
          best_score: 91
        },
        {
          id: '4',
          simulation_name: 'Project Management Challenge',
          category: 'Team Management',
          completed_at: '2024-01-12T09:20:00Z',
          score: 68,
          duration: 41,
          status: 'completed',
          feedback: 'Good project structure. Needs improvement in risk assessment.',
          attempts: 3,
          best_score: 68
        },
        {
          id: '5',
          simulation_name: 'Decision Making Under Uncertainty',
          category: 'Decision Making',
          completed_at: '2024-01-11T13:10:00Z',
          score: 79,
          duration: 35,
          status: 'completed',
          feedback: 'Solid decision-making process. Good use of available information.',
          attempts: 1,
          best_score: 79
        },
        {
          id: '6',
          simulation_name: 'Leadership Communication',
          category: 'Communication',
          completed_at: '2024-01-10T11:30:00Z',
          score: 88,
          duration: 48,
          status: 'completed',
          feedback: 'Excellent communication skills. Clear and inspiring leadership style.',
          attempts: 1,
          best_score: 88
        }
      ]
      
      setSimulationHistory(mockData)
      setFilteredHistory(mockData)
      setLoading(false)
    }

    fetchHistory()
  }, [])

  useEffect(() => {
    let filtered = simulationHistory

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.simulation_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.category.toLowerCase() === categoryFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'completed_at':
          return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
        case 'score':
          return b.score - a.score
        case 'duration':
          return a.duration - b.duration
        case 'name':
          return a.simulation_name.localeCompare(b.simulation_name)
        default:
          return 0
      }
    })

    setFilteredHistory(filtered)
  }, [searchQuery, statusFilter, categoryFilter, sortBy, simulationHistory])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>
      case 'abandoned':
        return <Badge variant="destructive">Abandoned</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">History</h1>
          <p className="text-muted-foreground">
            See your past simulations, scores, and detailed analytics. Review your performance and track your learning progress over time.
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">History</h1>
        <p className="text-muted-foreground">
          See your past simulations, scores, and detailed analytics. Review your performance and track your learning progress over time.
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="problem solving">Problem Solving</SelectItem>
              <SelectItem value="team management">Team Management</SelectItem>
              <SelectItem value="decision making">Decision Making</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed_at">Date</SelectItem>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{simulationHistory.filter(s => s.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">
              {((simulationHistory.filter(s => s.status === 'completed').length / simulationHistory.length) * 100).toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(simulationHistory.reduce((acc, s) => acc + s.score, 0) / simulationHistory.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all simulations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(simulationHistory.reduce((acc, s) => acc + s.duration, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Time spent practicing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...simulationHistory.map(s => s.score))}%
            </div>
            <p className="text-xs text-muted-foreground">
              Highest achieved score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Simulation History</CardTitle>
              <CardDescription>
                {filteredHistory.length} simulation{filteredHistory.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Simulation</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.simulation_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.attempts} attempt{item.attempts !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getScoreColor(item.score)}`}>
                      {item.score}%
                    </span>
                  </TableCell>
                  <TableCell>{formatDuration(item.duration)}</TableCell>
                  <TableCell>{formatDate(item.completed_at)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' 
                  ? 'No simulations found matching your filters.' 
                  : 'No simulation history available yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 