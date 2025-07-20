import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AuthCodeErrorPage() {
	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-md">
				<Card>
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl text-center text-destructive">
							Authentication Error
						</CardTitle>
						<CardDescription className="text-center">
							There was an error during the authentication process. Please try signing in again.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button asChild className="w-full">
							<Link href="/sign-in">
								Try Again
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	)
} 