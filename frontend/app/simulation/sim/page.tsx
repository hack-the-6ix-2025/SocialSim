"use client"

import { Button } from "@/components/ui/button"
import { CVIProvider } from "../../../components/cvi/components/cvi-provider"
import { Conversation } from "../../../components/cvi/components/conversation"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft } from "lucide-react"

export default function SimulationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const conversationUrlFromParams = searchParams.get("conversationUrl")

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

  // Check if conversation URL was passed via URL params
  useEffect(() => {
    if (conversationUrlFromParams) {
      setConversationUrl(conversationUrlFromParams)
      setStatus("Conversation URL received from URL parameters")
      setShowControls(false)
    }
  }, [conversationUrlFromParams])

  const createPersona = async () => {
    try {
      console.log("Creating persona...")
      const response = await fetch("/api/tavus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "createPersona",
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
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
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
        throw new Error(`HTTP error! status: ${response.status}`)
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

      const personaData = await createPersona()
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

  const handleGoBack = () => {
    router.push("/simulation/summary")
  }

  const handleConversationLeave = () => {
    setConversationUrl("")
    setStatus("Conversation ended")
    setShowControls(true)
  }

  const handleNext = () => {
    router.push("/simulation/summary")
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
                    AI Conversation Simulation
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Practice your communication skills with an AI replica
                  </p>
                </div>
                {conversationUrl && (
                  <Button
                    onClick={handleGoBack}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
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
                        Conversation Ended
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        Great job! Your conversation simulation has been completed.
                        You can now review your session and see your performance summary.
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
                        Begin an interactive conversation with our AI replica.
                        This simulation will help you practice your communication
                        skills in a safe, controlled environment. The AI will
                        respond naturally to your questions and engage in
                        meaningful dialogue.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {status === "Conversation ended" ? (
                      <Button
                        onClick={handleNext}
                        size="lg"
                        className="w-full sm:w-auto px-8 py-3 text-lg font-medium"
                      >
                        <div className="flex items-center gap-2">
                          Next
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStartConversation}
                        disabled={isLoading}
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
                            Start Conversation
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        )}
                      </Button>
                    )}

                    {status && status !== "Conversation ended" && (
                      <div
                        className={`p-4 rounded-lg text-sm ${
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
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-medium text-gray-900">
                    Live Conversation
                  </h3>
                  <p className="text-sm text-gray-600">
                    You're now in an active conversation with the AI replica
                  </p>
                </div>
                <div className="h-[700px]">
                  <Conversation
                    onLeave={handleConversationLeave}
                    conversationUrl={conversationUrl}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CVIProvider>
    </>
  )
}
