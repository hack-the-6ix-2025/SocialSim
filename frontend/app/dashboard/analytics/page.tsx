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
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useSearchParams } from 'next/navigation'

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
  const searchParams = useSearchParams()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [recentPerformance, setRecentPerformance] = useState<any[]>([])
  const [categoryPerformance, setCategoryPerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [trendData, setTrendData] = useState<any[]>([])
  const [selectedSimulation, setSelectedSimulation] = useState<string | null>(null)

  // Handle URL parameters
  useEffect(() => {
    const simulationParam = searchParams.get('simulation')
    if (simulationParam) {
      setSelectedSimulation(simulationParam)
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('http://127.0.0.1:8000/sessions/all/history/')
        if (!res.ok) throw new Error('Failed to fetch session history')
        const data = await res.json()
        console.log('Fetched session data:', data)

        // Map backend fields to recent performance format
        const mapped = data.map((item: any) => ({
          simulation_name: item.associated_simulation ?? '',
          category: item.category ?? '',
          score: item.score ?? 0,
          duration: item.actual_duration ?? 0,
          completed_at: item.created_at ?? '',
          completion_status: item.completion_status ?? '',
        }))
        setRecentPerformance(mapped)

        // Group by category and calculate count and average score
        const categoryMap: Record<string, { count: number; totalScore: number }> = {}
        data.forEach((item: any) => {
          const cat = item.category ?? 'Uncategorized'
          if (!categoryMap[cat]) {
            categoryMap[cat] = { count: 0, totalScore: 0 }
          }
          categoryMap[cat].count += 1
          categoryMap[cat].totalScore += item.score ?? 0
        })
        const categories = Object.entries(categoryMap).map(([category, { count, totalScore }]) => ({
          category,
          count,
          score: count > 0 ? (totalScore / count) : 0
        }))
        setCategoryPerformance(categories)

        // Sort by created_at and map to { date, score }
        const trend = data
          .map((item: any) => ({
            date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
            score: item.score ?? 0
          }))
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setTrendData(trend)

        // Calculate analyticsData metrics
        const total_simulations = data.length
        const completedSessions = data.filter((item: any) => item.completion_status === 'completed')
        const average_score = completedSessions.length > 0 ? (completedSessions.reduce((sum: number, item: any) => sum + (item.score ?? 0), 0) / completedSessions.length) : 0
        const completion_rate = total_simulations > 0 ? (completedSessions.length / total_simulations) * 100 : 0
        const time_spent = data.reduce((sum: number, item: any) => sum + (item.actual_duration ?? 0), 0)
        // Dummy improvement rate for now
        const improvement_rate = 0
        // Top categories
        const top_categories = categories.slice(0, 3)
        // Recent performance
        const recent_performance = mapped.slice(0, 5).map((item: any) => ({
          date: item.completed_at,
          score: item.score,
          simulation_name: item.simulation_name
        }))
        // Monthly stats (dummy for now)
        const monthly_stats: any[] = []

        setAnalyticsData({
          total_simulations,
          average_score: Math.round(average_score),
          completion_rate: Math.round(completion_rate),
          time_spent,
          improvement_rate,
          top_categories,
          recent_performance,
          monthly_stats
        })
      } catch (err) {
        setRecentPerformance([])
        setCategoryPerformance([])
        setTrendData([])
        setAnalyticsData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

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
          {selectedSimulation 
            ? `Viewing analytics for simulation: ${selectedSimulation}`
            : 'View your stats, feedback, and analytics for your simulation history. Track your progress and identify areas for improvement.'
          }
        </p>
        {selectedSimulation && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> This page shows analytics for all simulations. For detailed simulation-specific analytics, 
              the data would be filtered by the selected simulation ID: <code className="bg-blue-100 px-1 rounded">{selectedSimulation}</code>
            </p>
          </div>
        )}
      </div>

      {/* Filters and Search removed as requested */}

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
        {/* Performance Chart (now uses backend data) */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your score progression over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
              {trendData.length > 1 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData} margin={{ left: 16, right: 16, top: 16, bottom: 16 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center w-full">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Not enough data for a trend chart</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance (now uses backend data) */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Your scores by simulation category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryPerformance.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-muted-foreground">{category.score.toFixed(1)}%</span>
                </div>
                <Progress value={category.score} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{category.count} simulations</span>
                  <span>Avg: {category.score.toFixed(1)}%</span>
                </div>
              </div>
            ))}
            {categoryPerformance.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No category performance data available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance Table (now uses backend data) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
          <CardDescription>Your latest simulation results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPerformance.map((performance, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{performance.score}</span>
                  </div>
                  <div>
                    <p className="font-medium">{performance.simulation_name}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(performance.completed_at)}</p>
                  </div>
                </div>
                <Badge variant={performance.score >= 80 ? "default" : performance.score >= 60 ? "secondary" : "destructive"}>
                  {performance.score >= 80 ? "Excellent" : performance.score >= 60 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
            ))}
            {recentPerformance.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No simulation history available yet.</p>
              </div>
            )}
            {loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading history...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}