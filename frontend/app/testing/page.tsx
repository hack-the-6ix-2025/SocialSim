// 'use client'

// import { Button } from "@/components/ui/button"
// import { useRouter } from "next/navigation"
// import { useState } from "react"

// export default function Testing() {

//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(false)
//   const [status, setStatus] = useState("")

//   const handleStartConversation = async () => {
//     try {
//       setIsLoading(true)
//       setStatus("Redirecting to simulation...")
      
//       // Redirect to the simulations/sim page
//       router.push('/simulation/sim')
      
//     } catch (error) {
//       console.error("Error redirecting:", error)
//       setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
//       <div style={{ marginBottom: "20px" }}>
//         <Button 
//           onClick={handleStartConversation} 
//           disabled={isLoading}
//           style={{ marginRight: "10px" }}
//         >
//           {isLoading ? "Redirecting..." : "Start Tavus Session"}
//         </Button>
//         <Button 
//           onClick={async () => {
//             try {
//               const response = await fetch("/api/tavus", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ action: "test" })
//               })
//               const data = await response.json()
//               console.log("Test response:", data)
//               setStatus(`API Test: ${data.message || 'Success'}`)
//             } catch (error) {
//               console.error("Test error:", error)
//               setStatus(`API Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
//             }
//           }}
//           variant="outline"
//         >
//           Test API
//         </Button>
//       </div>

//       {status && (
//         <div style={{ 
//           padding: "10px", 
//           marginBottom: "20px", 
//           backgroundColor: status.includes("Error") ? "#fef2f2" : "#f0f9ff",
//           color: status.includes("Error") ? "#dc2626" : "#0369a1",
//           borderRadius: "8px",
//           border: `1px solid ${status.includes("Error") ? "#fecaca" : "#bae6fd"}`
//         }}>
//           {status}
//         </div>
//       )}

//       <div style={{ 
//         padding: "20px", 
//         backgroundColor: "#f8fafc", 
//         borderRadius: "8px",
//         border: "1px solid #e2e8f0"
//       }}>
//         <h3 style={{ marginBottom: "10px", fontWeight: "bold" }}>Instructions:</h3>
//         <p style={{ marginBottom: "10px" }}>
//           Click "Start Tavus Session" to begin a conversation with an AI replica. 
//           This will redirect you to the simulation page where you can interact with the AI.
//         </p>
//         <p>
//           The simulation page will handle creating the persona, starting the conversation, 
//           and managing the video call interface.
//         </p>
//       </div>
//     </div>
//   )
// } 