import { NextRequest, NextResponse } from 'next/server'

const TAVUS_API_KEY = process.env.TAVUS_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { action, personaId } = await request.json()

    console.log("Action:", action, "PersonaId:", personaId)

    if (!TAVUS_API_KEY) {
      console.error("TAVUS_API_KEY is not defined")
      return NextResponse.json(
        { error: "TAVUS_API_KEY is not defined" },
        { status: 500 }
      )
    }

    if (action === 'createPersona') {
      console.log("Making request to Tavus API with key:", TAVUS_API_KEY ? "Key exists" : "No key")
      
      const requestBody = {
        persona_name: "Interviewer",
        system_prompt:
          "As an Interviewer, you are a skilled professional who conducts thoughtful and structured interviews. Your aim is to ask insightful questions, listen carefully, and assess responses objectively to identify the best candidates.",
        pipeline_mode: "full",
        context:
          "You have a track record of conducting interviews that put candidates at ease, draw out their strengths, and help organizations make excellent hiring decisions.",
        default_replica_id: "rfe12d8b9597",
        layers: {
          perception: {
            perception_model: "raven-0",
          },
          stt: {
            stt_engine: "tavus-advanced",
            smart_turn_detection: true,
          },
        },
      }
      
      console.log("Request body:", JSON.stringify(requestBody, null, 2))
      
      const response = await fetch("https://tavusapi.com/v2/personas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TAVUS_API_KEY,
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Tavus API response status:", response.status)
      console.log("Tavus API response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Tavus API error response:", errorText)
        return NextResponse.json(
          { error: `Tavus API error: ${response.status} - ${errorText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      console.log("Persona creation response:", data)
      console.log("Returning to client:", data)
      return NextResponse.json(data)
    }

    if (action === 'createConversation') {
      if (!personaId) {
        console.error("personaId is required for createConversation")
        return NextResponse.json(
          { error: "personaId is required" },
          { status: 400 }
        )
      }

      const requestBody = {
        persona_id: personaId,
        conversation_name: "Interview User",
      }
      
      console.log("Creating conversation with body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("https://tavusapi.com/v2/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TAVUS_API_KEY,
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Tavus conversation API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Tavus conversation API error response:", errorText)
        return NextResponse.json(
          { error: `Tavus API error: ${response.status} - ${errorText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      console.log("Conversation creation response:", data)
      return NextResponse.json(data)
    }

    if (action === 'test') {
      return NextResponse.json({
        message: "API route is working",
        apiKeyExists: !!TAVUS_API_KEY,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: createPersona, createConversation, test" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error in Tavus API route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
