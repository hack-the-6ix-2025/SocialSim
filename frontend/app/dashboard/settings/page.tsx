"use client"

import { Button } from "@/components/ui/button"
import { IconLogout } from "@tabler/icons-react"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export default function SettingsPage() {
	const [userInfo, setUserInfo] = useState<any[] | null>(null)

	// useEffect(() => {
	//   const fetchInstruments = async () => {
	//     const supabase = await createClient()
	//     const { data } = await supabase.from("simulations").select()
	//     setUserInfo(data)
	//   }
	//   fetchInstruments()
	// }, [])

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">Settings</h1>
			<p>See your past simulations, scores, and links to detailed analytics.</p>
			<h1>{JSON.stringify(userInfo)}</h1>
		</div>
	)
}
