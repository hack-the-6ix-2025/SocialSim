"use client"

import * as React from "react"
import {
	IconCamera,
	IconChartBar,
	IconFileAi,
	IconFileDescription,
	IconFolder,
	IconHelp,
	IconInnerShadowTop,
	IconReport,
	IconSearch,
	IconSettings,
	IconUsers,
	IconDiamond,
	IconBrandLine
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "",
	},
	navMain: [
		{
			title: "Discover",
			url: "/dashboard/discover",
			icon: IconSearch,
		},
		{
			title: "Analytics",
			url: "/dashboard/analytics",
			icon: IconChartBar,
		},
		{
			title: "History",
			url: "/dashboard/history",
			icon: IconReport,
		},
		{
			title: "My Simulations",
			url: "/dashboard/my-simulations",
			icon: IconFolder,
		},
	],
	navClouds: [
		{
			title: "Capture",
			icon: IconCamera,
			isActive: true,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Proposal",
			icon: IconFileDescription,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Prompts",
			icon: IconFileAi,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "/dashboard/settings",
			icon: IconSettings,
		},
		{
			title: "Get Help",
			url: "/dashboard/help",
			icon: IconHelp,
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<Link href="/dashboard">
								<IconBrandLine className="!size-5" />
								<span className="text-base font-semibold">
									Social Sim
								</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
		</Sidebar>
	)
}
