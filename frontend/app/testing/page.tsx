'use client'

import { Button } from "@/components/ui/button"
import { CVIProvider } from "../../components/cvi/components/cvi-provider"
import { Conversation } from "../../components/cvi/components/conversation"
import { useState } from "react"

export default function Testing() {

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
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

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
        const conversationData = await createConversation(personaData.persona_id)
        console.log("Conversation data received:", conversationData)
        
        if (conversationData && conversationData.conversation_url) {
          setStatus("Joining conversation...")
          console.log("Setting conversation URL:", conversationData.conversation_url)
          setConversationUrl(conversationData.conversation_url)
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
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <CVIProvider>
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "20px" }}>
            <Button 
              onClick={handleStartConversation} 
              disabled={isLoading}
              style={{ marginRight: "10px" }}
            >
              {isLoading ? "Creating..." : "Start conversation"}
            </Button>
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch("/api/tavus", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "test" })
                  })
                  const data = await response.json()
                  console.log("Test response:", data)
                  setStatus(`API Test: ${data.message || 'Success'}`)
                } catch (error) {
                  console.error("Test error:", error)
                  setStatus(`API Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
              }}
              variant="outline"
            >
              Test API
            </Button>
          </div>

          {status && (
            <div style={{ 
              padding: "10px", 
              marginBottom: "20px", 
              backgroundColor: status.includes("Error") ? "#fef2f2" : "#f0f9ff",
              color: status.includes("Error") ? "#dc2626" : "#0369a1",
              borderRadius: "8px",
              border: `1px solid ${status.includes("Error") ? "#fecaca" : "#bae6fd"}`
            }}>
              {status}
            </div>
          )}

          {/* Manual conversation URL input */}
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="conversationUrl" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Conversation URL (or paste manually):
            </label>
            <input
              type="text"
              id="conversationUrl"
              value={conversationUrl}
              onChange={(e) => setConversationUrl(e.target.value)}
              placeholder="https://..."
              style={{ 
                width: "100%", 
                padding: "10px", 
                border: "1px solid #d1d5db", 
                borderRadius: "4px",
                fontSize: "14px"
              }}
            />
          </div>

          {conversationUrl && (
            <div style={{ 
              width: "100%", 
              height: "600px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              overflow: "hidden"
            }}>
              <Conversation 
                onLeave={() => {
                  setConversationUrl("")
                  setStatus("Conversation ended")
                }} 
                conversationUrl={conversationUrl} 
              />
            </div>
          )}
        </div>
      </CVIProvider>
    </>
  )
} 