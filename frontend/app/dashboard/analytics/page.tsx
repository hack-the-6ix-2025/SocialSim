'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Search, TrendingUp, TrendingDown, Target, Clock, Award, BarChart3, Calendar, Filter } from 'lucide-react'

interface AnalyticsData {
  total_simulations: number
  average_score: number
  completion_rate: number
  time_spent: number
  improvement_rate: number
  top_categories: Array<{
    category: string
    count: number
    score: number
  }>
  recent_performance: Array<{
    date: string
    score: number
    simulation_name: string
  }>
  monthly_stats: Array<{
    month: string
    simulations_completed: number
    average_score: number
  }>
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchAnalytics() {
      const supabase = createClient()
      
      // Mock data for now - replace with actual API calls
      const mockData: AnalyticsData = {
        total_simulations: 24,
        average_score: 78.5,
        completion_rate: 92.3,
        time_spent: 1560, // minutes
        improvement_rate: 12.5,
        top_categories: [
          { category: 'Leadership', count: 8, score: 82.5 },
          { category: 'Communication', count: 6, score: 76.2 },
          { category: 'Problem Solving', count: 5, score: 79.8 },
          { category: 'Team Management', count: 3, score: 71.4 },
          { category: 'Decision Making', count: 2, score: 85.1 }
        ],
        recent_performance: [
          { date: '2024-01-15', score: 85, simulation_name: 'Crisis Management' },
          { date: '2024-01-14', score: 72, simulation_name: 'Team Leadership' },
          { date: '2024-01-13', score: 91, simulation_name: 'Strategic Planning' },
          { date: '2024-01-12', score: 68, simulation_name: 'Conflict Resolution' },
          { date: '2024-01-11', score: 79, simulation_name: 'Project Management' }
        ],
        monthly_stats: [
          { month: 'Jan 2024', simulations_completed: 8, average_score: 78.5 },
          { month: 'Dec 2023', simulations_completed: 6, average_score: 75.2 },
          { month: 'Nov 2023', simulations_completed: 5, average_score: 72.8 },
          { month: 'Oct 2023', simulations_completed: 3, average_score: 68.9 },
          { month: 'Sep 2023', simulations_completed: 2, average_score: 65.4 }
        ]
      }
      
      setAnalyticsData(mockData)
      setLoading(false)
    }

    fetchAnalytics()
  }, [])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            View your stats, feedback, and analytics for your simulation history. Track your progress and identify areas for improvement.
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          View your stats, feedback, and analytics for your simulation history. Track your progress and identify areas for improvement.
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
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="problem-solving">Problem Solving</SelectItem>
              <SelectItem value="team-management">Team Management</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Simulations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.total_simulations}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData?.improvement_rate}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.average_score}%</div>
            <p className="text-xs text-muted-foreground">
              +2.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.completion_rate}%</div>
            <p className="text-xs text-muted-foreground">
              +1.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(analyticsData?.time_spent || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your score progression over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Performance chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Your scores by simulation category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData?.top_categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-muted-foreground">{category.score}%</span>
                </div>
                <Progress value={category.score} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{category.count} simulations</span>
                  <span>Avg: {category.score}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
          <CardDescription>Your latest simulation results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData?.recent_performance.map((performance, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{performance.score}</span>
                  </div>
                  <div>
                    <p className="font-medium">{performance.simulation_name}</p>
                    <p className="text-sm text-muted-foreground">{performance.date}</p>
                  </div>
                </div>
                <Badge variant={performance.score >= 80 ? "default" : performance.score >= 60 ? "secondary" : "destructive"}>
                  {performance.score >= 80 ? "Excellent" : performance.score >= 60 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 