import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import React from "react"

export default async function layout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<SidebarProvider
				style={
					{
						"--sidebar-width": "calc(var(--spacing) * 56)",
						"--header-height": "calc(var(--spacing) * 12)",
					} as React.CSSProperties
				}
			>
				<AppSidebar variant="inset" />
				<SidebarInset>
					<SiteHeader />
					<div>{children}</div>
				</SidebarInset>
			</SidebarProvider>
		</>
	)
}
