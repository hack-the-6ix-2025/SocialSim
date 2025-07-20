import { NextResponse } from "next/server"
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server"
import { createClient as clientCreateClient } from "@/utils/supabase/client"

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url)
	const code = searchParams.get("code")
	// if "next" is in param, use it as the redirect URL
	let next = searchParams.get("next") ?? "/"

	// redirect if it is user's first time
	const next_first = "/onboarding"

	if (!next.startsWith("/")) {
		// if "next" is not a relative URL, use the default
		next = "/"
	}

	// if (!next_first.startsWith("/")) {
	// 	// if "next" is not a relative URL, use the default
	// 	next_first = "/"
	// }

	if (code) {
		const supabase = await createClient()
		const { error } = await supabase.auth.exchangeCodeForSession(code)
		const {
			data: { user },
		} = await supabase.auth.getUser()
		const userId = user ? user.id : ""

		/* 
    will return an object like this
      {
        "id": "mocked-up-id",
        "aud": "authenticated",
        "role": "authenticated",
        "email": "mocked-up-email@example.com",
        "email_confirmed_at": "2023-07-04T02:39:37.434179Z",
        "phone": "",
        "confirmation_sent_at": "2023-07-04T02:39:30.517925Z",
        "confirmed_at": "2023-07-04T02:39:37.434179Z",
        "last_sign_in_at": "2023-09-07T18:30:58.389488Z",
        "app_metadata": {
        "provider": "email",
        "providers": "email"
        },
        "user_metadata": {},
        "identities": [
        {
        "id": "mocked-up-id",
        "user_id": "mocked-up-id",
        "identity_data": {
        "email": "mocked-up-email@example.com",
        "sub": "mocked-up-id"
        },
        "provider": "email",
        "last_sign_in_at": "2023-07-04T02:39:30.514698Z",
        "created_at": "2023-07-04T02:39:30.514735Z",
        "updated_at": "2023-07-04T02:39:30.514735Z"
        }
        ],
        "created_at": "2023-07-04T02:39:30.510745Z",
        "updated_at": "2023-09-13T03:46:47.780196Z"
      }
    */

		// check if it is the users first time signing in
		const supabaseClient = await clientCreateClient()
		const userInfo = await supabaseClient
			.from("profiles")
			.select("user_id")
			.eq("user_id", userId)

		console.log(userInfo)

		// if not in profile yet, redirect to onboarding page
		if (!userInfo.data || userInfo.data.length == 0) {
			next = next_first

			// create a user profile
			const { error } = await supabase
				.from("profiles")
				.insert({ user_id: userId })
			if (error) {
				console.log("Error creating profile")
				console.log(error)
			}
		}
		

		if (!error) {
			const forwardedHost = request.headers.get("x-forwarded-host") // original origin before load balancer
			const isLocalEnv = process.env.NODE_ENV === "development"
			if (isLocalEnv) {
				// we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
				return NextResponse.redirect(`${origin}${next}`)
			} else if (forwardedHost) {
				return NextResponse.redirect(`https://${forwardedHost}${next}`)
			} else {
				return NextResponse.redirect(`${origin}${next}`)
			}
		}
	}

	// return the user to an error page with instructions
	return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
