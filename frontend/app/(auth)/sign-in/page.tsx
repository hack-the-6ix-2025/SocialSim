"use client"

// import { signInWithGoogle } from "@/actions/auth"
import { LoginForm } from "@/components/login-form"

export default function Page() {
	// async function handleSignIn() {
	// 	const { url } = await signInWithGoogle("/dashboard")

	// 	// redirect to res
	// 	if (url) {
	// 		window.location.href = url
	// 	}
	// }

	return (
	<div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
	)
}
