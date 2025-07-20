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
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Settings</h1>
				<p className="text-muted-foreground">
					Manage your account preferences, notification settings, and application configuration.
				</p>
			</div>
			<h1>{JSON.stringify(userInfo)}</h1>
		</div>
	)
}
