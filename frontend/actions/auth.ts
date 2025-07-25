"use server"

import { createClient } from "@/utils/supabase/server"

// interface RedirectInfo {
// 	firstTime: string
// 	redirectTo: string
// }

export async function signInWithGoogle(redirectTo: string) {
	const supabase = await createClient()
	const redirectUrl = `http://localhost:3000/auth/callback?next=${redirectTo}`

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: redirectUrl,
		},
	})

	if (error) throw error
	return data
}

export async function signOut() {
	const supabase = await createClient()
	const { error } = await supabase.auth.signOut()
	if (error) throw error
}
