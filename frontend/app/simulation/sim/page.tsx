"use client"

import { Button } from "@/components/ui/button"
import { CVIProvider } from "../../../components/cvi/components/cvi-provider"
import { Conversation } from "../../../components/cvi/components/conversation"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface Simulation {
  sim_id: string
  name: string
  description: string
  system_prompt: string
  category: string
}

export default function SimulationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const conversationUrlFromParams = searchParams.get("conversationUrl")
  const simIdFromParams = searchParams.get("simId")

  /* 
      1. User clicks "Start conversation"
          ↓
      2. createPersona() → Tavus API → Returns persona_id
          ↓
      3. createConversation(persona_id) → Tavus API → Returns conversation_url
          ↓
      4. setConversationUrl(url) → Triggers useEffect in Conversation component
          ↓
      5. joinCall({ url }) → Daily.co → Joins video room
          ↓
      6. Tavus AI replica joins the room (user_id contains 'tavus-replica')
          ↓
      7. useReplicaIDs() detects AI participant
          ↓
      8. MainVideo shows AI replica, PreviewVideos shows your camera
          ↓
      9. Real-time conversation begins!
  */

  // conversation url for joining the conversation
  const [conversationUrl, setConversationUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [showControls, setShowControls] = useState(true)
  const [simulation, setSimulation] = useState<Simulation | null>(null)
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(false)

  // Fetch simulation data if simId is provided
  const fetchSimulation = async (simId: string) => {
    try {
      setIsLoadingSimulation(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from("simulations")
        .select("sim_id, name, description, system_prompt, category")
        .eq("sim_id", simId)
        .single()

      if (error || !data) {
        console.error("Error fetching simulation:", error)
        setStatus("Error: Could not load simulation data")
        return
      }

      setSimulation(data)
      setStatus("Simulation loaded successfully")
    } catch (error) {
      console.error("Error fetching simulation:", error)
      setStatus("Error: Could not load simulation data")
    } finally {
      setIsLoadingSimulation(false)
    }
  }

  // Check if conversation URL was passed via URL params
  useEffect(() => {
    if (conversationUrlFromParams) {
      setConversationUrl(conversationUrlFromParams)
      setStatus("Conversation URL received from URL parameters")
      setShowControls(false)
    }
  }, [conversationUrlFromParams])

  // Fetch simulation data if simId is provided
  useEffect(() => {
    if (simIdFromParams) {
      fetchSimulation(simIdFromParams)
    }
  }, [simIdFromParams])

  const createPersona = async (simulationData?: Simulation) => {
    try {
      console.log("Creating persona...")
      const response = await fetch("/api/tavus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "createPersona",
          simulation: simulationData,
        }),
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response text:", errorText)

        console.log("Response status:", response.status)

        if (response.status === 402) {
          throw new Error("Out of credits")
        } else {
          throw new Error(
            `HTTP error! status: ${response.status} - ${errorText} out of credits`
          )
        }
      }

      const data = await response.json()
      console.log("Raw response data:", data)
      console.log("Data type:", typeof data)
      console.log("Data keys:", Object.keys(data))
      return data
    } catch (error) {
      console.error("Error creating persona:", error)
      throw error
    }
  }

  const createConversation = async (personaId: string) => {
    try {
      console.log("Creating conversation with persona:", personaId)
      const response = await fetch("/api/tavus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "createConversation",
          personaId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} (Out of credits)`)
      }

      const data = await response.json()
      console.log("Conversation created:", data)
      return data
    } catch (error) {
      console.error("Error creating conversation:", error)
      throw error
    }
  }

  const handleStartConversation = async () => {
    try {
      setIsLoading(true)
      setStatus("Creating persona...")
      console.log("Starting conversation flow...")

      const personaData = await createPersona(simulation || undefined)
      console.log("Persona data received:", personaData)

      if (personaData && personaData.persona_id) {
        setStatus("Creating conversation...")
        console.log("Persona ID:", personaData.persona_id)
        const conversationData = await createConversation(
          personaData.persona_id
        )
        console.log("Conversation data received:", conversationData)

        if (conversationData && conversationData.conversation_url) {
          setStatus("Joining conversation...")
          console.log(
            "Setting conversation URL:",
            conversationData.conversation_url
          )
          setConversationUrl(conversationData.conversation_url)
          setShowControls(false)
        } else {
          console.error("No conversation URL in response:", conversationData)
          setStatus("Error: No conversation URL received")
        }
      } else {
        console.error("No persona ID in response:", personaData)
        setStatus("Error: No persona ID received")
      }
    } catch (error) {
      console.error("Error starting conversation:", error)
      setStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleConversationLeave = () => {
    setConversationUrl("")
    setStatus("Conversation ended")
    setShowControls(true)
  }

  const handleNext = () => {
    // Pass simulation data to summary page
    const summaryUrl = simulation
      ? `/simulation/summary?simId=${
          simulation.sim_id
        }&name=${encodeURIComponent(
          simulation.name
        )}&category=${encodeURIComponent(simulation.category)}`
      : "/simulation/summary"
    router.push(summaryUrl)
  }

  const handleRestart = () => {
    // Restart the same simulation
    if (simIdFromParams) {
      router.push(`/simulation/sim?simId=${simIdFromParams}`)
    } else {
      router.push("/simulation/sim")
    }
  }

  return (
    <>
      <CVIProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {simulation
                      ? simulation.name
                      : "AI Conversation Simulation"}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {simulation
                      ? simulation.description
                      : "Practice your communication skills with an AI replica"}
                  </p>
                </div>
                {!conversationUrl && (
                  <Button
                    onClick={() => router.push("/dashboard/discover")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Discover
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
            {showControls && (
              <div className="text-center mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
                  {status === "Conversation ended" ? (
                    // Conversation ended state
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Simulation Completed!
                      </h2>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        Great job! Your{" "}
                        {simulation?.name || "conversation simulation"} has been
                        completed. You can now review your session and see your
                        performance summary.
                      </p>

                      {/* Simulation Overview */}
                      {simulation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h3 className="font-semibold text-blue-900 mb-2">
                            Simulation Overview
                          </h3>
                          <div className="space-y-2 text-sm text-blue-800">
                            <div>
                              <strong>Scenario:</strong> {simulation.name}
                            </div>
                            <div>
                              <strong>Category:</strong> {simulation.category}
                            </div>
                            <div>
                              <strong>Description:</strong>{" "}
                              {simulation.description}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : isLoadingSimulation ? (
                    // Loading simulation state
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Loading Simulation...
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        Please wait while we load your simulation data.
                      </p>
                    </div>
                  ) : (
                    // Initial state
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Ready to Start Your Conversation?
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        {simulation
                          ? `Begin an interactive conversation with our AI replica for the "${simulation.name}" simulation. This scenario will help you practice your communication skills in a safe, controlled environment. The AI will respond naturally to your questions and engage in meaningful dialogue based on the ${simulation.category} scenario.`
                          : `Begin an interactive conversation with our AI replica. This simulation will help you practice your communication skills in a safe, controlled environment. The AI will respond naturally to your questions and engage in meaningful dialogue.`}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {status === "Conversation ended" ? (
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={handleRestart}
                          variant="outline"
                          size="lg"
                          className="px-8 py-3 text-lg font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Restart Simulation
                          </div>
                        </Button>
                        <Button
                          onClick={handleNext}
                          size="lg"
                          className="px-8 py-3 text-lg font-medium"
                        >
                          <div className="flex items-center gap-2">
                            View Summary
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleStartConversation}
                        disabled={isLoading || isLoadingSimulation}
                        size="lg"
                        className="w-full sm:w-auto px-8 py-3 text-lg font-medium"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating Conversation...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {simulation
                              ? `Start ${simulation.name} Simulation`
                              : "Start Conversation"}
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        )}
                      </Button>
                    )}

                    {status && status !== "Conversation ended" && (
                      <div
                        className={`p-4 rounded-lg text-sm mt-4 ${
                          status.includes("Error")
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {conversationUrl && (
              <div className="h-[600px] -mt-16 mb-24">
                <Conversation
                  onLeave={handleConversationLeave}
                  conversationUrl={conversationUrl}
                />
              </div>
            )}
          </div>
        </div>
      </CVIProvider>
    </>
  )
}
