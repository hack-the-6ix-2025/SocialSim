'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Eye, RefreshCw } from 'lucide-react'

interface Session {
  session_id: string
  associated_simulation: string
  category: string
  score: number
  actual_duration: number
  created_at: string
  completion_status: string
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('http://127.0.0.1:8000/sessions/all/history/')
        if (!res.ok) throw new Error('Failed to fetch session history')
        const data = await res.json()
        setSessions(data)
      } catch (err) {
        setSessions([])
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Simulation History</h1>
        <p className="text-muted-foreground">
          See your past simulations, scores, and detailed analytics. Review your performance and track your learning progress over time.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Simulation History</CardTitle>
              <CardDescription>
                {sessions.length} simulation{sessions.length !== 1 ? 's' : ''} found
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
              {sessions.map((item) => (
                <TableRow key={item.session_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.associated_simulation}</div>
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
                  <TableCell>{formatDuration(item.actual_duration)}</TableCell>
                  <TableCell>{formatDate(item.created_at)}</TableCell>
                  <TableCell>{getStatusBadge(item.completion_status)}</TableCell>
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
          {sessions.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No simulation history available yet.
              </p>
            </div>
          )}
          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
