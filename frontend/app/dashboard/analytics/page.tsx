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
  const [recentPerformance, setRecentPerformance] = useState<any[]>([])
  const [categoryPerformance, setCategoryPerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [trendData, setTrendData] = useState<any[]>([])

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
          View your stats, feedback, and analytics for your simulation history. Track your progress and identify areas for improvement.
        </p>
      </div>

      {/* Filters and Search removed as requested */}

      {/* Key Metrics with color accents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-blue-400 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Simulations</CardTitle>
            <span className="bg-blue-100 p-2 rounded-full"><Target className="h-4 w-4 text-blue-500" /></span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{analyticsData?.total_simulations}</div>
            <p className="text-xs text-blue-600">
              +{analyticsData?.improvement_rate}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-400 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Average Score</CardTitle>
            <span className="bg-green-100 p-2 rounded-full"><TrendingUp className="h-4 w-4 text-green-500" /></span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{analyticsData?.average_score}%</div>
            <p className="text-xs text-green-600">
              +2.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-400 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Completion Rate</CardTitle>
            <span className="bg-purple-100 p-2 rounded-full"><Award className="h-4 w-4 text-purple-500" /></span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{analyticsData?.completion_rate}%</div>
            <p className="text-xs text-purple-600">
              +1.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-pink-400 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-800">Time Spent</CardTitle>
            <span className="bg-pink-100 p-2 rounded-full"><Clock className="h-4 w-4 text-pink-500" /></span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{formatTime(analyticsData?.time_spent || 0)}</div>
            <p className="text-xs text-pink-600">
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
                  <span className="text-sm font-medium">
                    <Badge variant={index === 0 ? 'default' : index === 1 ? 'secondary' : 'outline'} className={index === 0 ? 'bg-blue-500 text-white' : index === 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}>
                      {category.category}
                    </Badge>
                  </span>
                  <span className="text-sm text-muted-foreground">{category.score.toFixed(1)}%</span>
                </div>
                <Progress value={category.score} className={index === 0 ? 'h-2 bg-blue-200' : index === 1 ? 'h-2 bg-green-200' : 'h-2 bg-gray-100'} />
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
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg border-l-4 "
                style={{ borderLeftColor: performance.score >= 80 ? '#2563eb' : performance.score >= 60 ? '#22c55e' : '#ef4444' }}>
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${performance.score >= 80 ? 'bg-blue-100' : performance.score >= 60 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <span className={`text-sm font-medium ${performance.score >= 80 ? 'text-blue-700' : performance.score >= 60 ? 'text-green-700' : 'text-red-700'}`}>{performance.score}</span>
                  </div>
                  <div>
                    <p className="font-medium">{performance.simulation_name}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(performance.completed_at)}</p>
                  </div>
                </div>
                <Badge variant={performance.score >= 80 ? "default" : performance.score >= 60 ? "secondary" : "destructive"} className={performance.score >= 80 ? 'bg-blue-500 text-white' : performance.score >= 60 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
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