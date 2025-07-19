"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { IconLogout, IconEdit, IconCheck, IconX } from "@tabler/icons-react"
import { createClient } from "@/utils/supabase/client"
import { signOut } from "@/actions/auth"
import onboardingStepsData from "@/data/onboarding-steps.json"
import {
	getLabelByValue,
	getLabelsByValues,
	OnboardingStep,
} from "@/lib/onboarding-utils"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

interface Profile {
	id: string
	name: string
	email: string
	avatar?: string
	role?: string
	field?: string
	experience?: string
	studyLevel?: string
	goals?: string[]
	interests?: string[]
	focusAreas?: string[]
}

export default function ProfilePage() {
	const [profile, setProfile] = useState<Profile | null>(null)
	const [loading, setLoading] = useState(true)
	const [isEditMode, setIsEditMode] = useState(false)
	const [saving, setSaving] = useState(false)
	const [editData, setEditData] = useState<Partial<Profile>>({})

	const onboardingSteps: OnboardingStep[] =
		onboardingStepsData.steps as OnboardingStep[]

	useEffect(() => {
		const fetchProfile = async () => {
			const supabase = createClient()
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (!user) return setLoading(false)

			console.log("User data:", user)

			const { data, error } = await supabase
				.from("profiles")
				.select()
				.eq("user_id", user.id)
				.single()

			if (error) console.log("Error fetching profile data", error)

			const profileData = {
				id: user.id,
				name:
					user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
				email: user.email ?? "",
				avatar: user.user_metadata?.avatar_url,
				role: data?.role,
				field: data?.field,
				experience: data?.experience,
				studyLevel: data?.studyLevel,
				goals: data?.goals,
				interests: data?.interests,
				focusAreas: data?.focusAreas,
			}

			setProfile(profileData)
			setEditData(profileData)
			setLoading(false)
		}
		fetchProfile()
	}, [])

	const handleSaveAll = async () => {
		setSaving(true)
		const supabase = createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()
		if (!user) return

		// Prepare update data (only include fields that have values)
		const updateData: Record<string, string | string[] | undefined> = {}
		Object.entries(editData).forEach(([key, value]) => {
			if (
				key !== "id" &&
				key !== "name" &&
				key !== "email" &&
				key !== "avatar" &&
				value !== undefined
			) {
				updateData[key] = value
			}
		})

		const { error } = await supabase
			.from("profiles")
			.update(updateData)
			.eq("user_id", user.id)

		if (!error) {
			setProfile((prev) => (prev ? { ...prev, ...editData } : null))
			setIsEditMode(false)
		} else {
			console.error("Error saving profile:", error)
		}
		setSaving(false)
	}

	const handleCancel = () => {
		setEditData(profile || {})
		setIsEditMode(false)
	}

	const updateEditData = (
		field: keyof Profile,
		value: string | string[] | undefined
	) => {
		setEditData((prev) => ({ ...prev, [field]: value }))
	}

	if (loading)
		return (
			<div className="flex justify-center items-center h-64">Loading...</div>
		)
	if (!profile)
		return (
			<div className="flex justify-center items-center h-64">
				No profile found.
			</div>
		)

	return (
		<div className="p-8 mx-auto flex flex-col pb-16">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Profile</h1>
				<p className="text-muted-foreground">
					Manage your account settings, preferences, and professional information.
				</p>
			</div>

			<div className="flex items-center gap-6 mb-8">
				<Avatar className="h-20 w-20 border-4 border-gray-50 shadow-sm">
					<AvatarImage src={profile.avatar} alt={profile.name} />
					<AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
						{profile.name[0]?.toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div>
					<h2 className="text-2xl font-bold text-gray-900 mb-1">
						{profile.name}
					</h2>
					<p className="text-gray-600">{profile.email}</p>
				</div>
			</div>

			<div className="space-y-8">
				<ProfileField
					label="Role"
					value={isEditMode ? editData.role : profile.role}
					stepId="role"
					onboardingSteps={onboardingSteps}
					isEditMode={isEditMode}
					onChange={(value) => updateEditData("role", value)}
				/>
				<ProfileField
					label="Field"
					value={isEditMode ? editData.field : profile.field}
					stepId="field"
					onboardingSteps={onboardingSteps}
					isEditMode={isEditMode}
					onChange={(value) => updateEditData("field", value)}
				/>
				<ProfileField
					label="Experience"
					value={isEditMode ? editData.experience : profile.experience}
					stepId="experience"
					onboardingSteps={onboardingSteps}
					isEditMode={isEditMode}
					onChange={(value) => updateEditData("experience", value)}
				/>
				<ProfileField
					label="Study Level"
					value={isEditMode ? editData.studyLevel : profile.studyLevel}
					stepId="studyLevel"
					onboardingSteps={onboardingSteps}
					isEditMode={isEditMode}
					onChange={(value) => updateEditData("studyLevel", value)}
				/>
				<ProfileField
					label="Goals"
					value={isEditMode ? editData.goals : profile.goals}
					stepId="goals"
					onboardingSteps={onboardingSteps}
					isEditMode={isEditMode}
					onChange={(value) => updateEditData("goals", value)}
				/>
				<ProfileField
					label="Interests"
					value={isEditMode ? editData.interests : profile.interests}
					stepId="interests"
					onboardingSteps={onboardingSteps}
					isEditMode={isEditMode}
					onChange={(value) => updateEditData("interests", value)}
				/>
				<ProfileField
					label="Focus Areas"
					value={isEditMode ? editData.focusAreas : profile.focusAreas}
					stepId="focusAreas"
					onboardingSteps={onboardingSteps}
					isEditMode={isEditMode}
					onChange={(value) => updateEditData("focusAreas", value)}
				/>
			</div>

			<div className="flex justify-start gap-12 mt-12">
				<Button
					className="px-8 py-3 text-base font-medium"
					variant="outline"
					onClick={async () => {
						await signOut()
						window.location.href = "/sign-in"
					}}
				>
					<IconLogout className="mr-3 h-5 w-5" />
					Sign out
				</Button>

				<div>
					{!isEditMode ? (
						<Button
							onClick={() => setIsEditMode(true)}
							className="flex items-center gap-2"
						>
							<IconEdit className="h-4 w-4" />
							Edit Profile
						</Button>
					) : (
						<div className="flex gap-2">
							<Button
								onClick={handleSaveAll}
								disabled={saving}
								className="flex items-center gap-2"
							>
								<IconCheck className="h-4 w-4" />
								{saving ? "Saving..." : "Save All"}
							</Button>
							<Button
								variant="outline"
								onClick={handleCancel}
								disabled={saving}
								className="flex items-center gap-2"
							>
								<IconX className="h-4 w-4" />
								Cancel
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

interface ProfileFieldProps {
	label: string
	value: string | string[] | undefined
	stepId: string
	onboardingSteps: OnboardingStep[]
	isEditMode: boolean
	onChange: (value: string | string[] | undefined) => void
}

function ProfileField({
	label,
	value,
	stepId,
	onboardingSteps,
	isEditMode,
	onChange,
}: ProfileFieldProps) {
	const step = onboardingSteps.find((s) => s.id === stepId)

	if (!value && !isEditMode) return null

	// Get display value (label instead of value)
	const getDisplayValue = () => {
		if (!step) return Array.isArray(value) ? value.join(", ") : value

		// If array
		if (Array.isArray(value)) {
			return getLabelsByValues(stepId, value, onboardingSteps)
		} else {
			return getLabelByValue(stepId, value ?? "", onboardingSteps)
		}
	}

	return (
		<div className="flex flex-row sm:flex-row sm:justify-between sm:items-center items:between gap-24 p-6 border border-gray-200 rounded-xl transition-color">
			<div className="mb-4 sm:mb-0">
				<span className="font-semibold text-gray-700 text-xl tracking-wide">
					{label}
				</span>
			</div>
			<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
				{/* For editing */}
				{isEditMode ? (
					<div className="flex flex-col gap-4 w-full sm:w-auto">
						{step ? (
							step.type === "single-select" ? (
								// Single select
								<>
									<Select
										value={Array.isArray(value) ? value[0] || "" : value || ""}
										onValueChange={(newValue) => onChange(newValue)}
									>
										<SelectTrigger className="w-[180px]">
											<SelectValue placeholder={`Select ${label}`} />
										</SelectTrigger>
										<SelectContent>
											{step.options.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</>
							) : (
								// Multi select
								<div className="flex flex-wrap gap-3 justify-end">
									{step.options.map((option) => {
										const isSelected =
											Array.isArray(value) && value.includes(option.value)
										return (
											<button
												key={option.value}
												type="button"
												onClick={() => {
													if (Array.isArray(value)) {
														onChange(
															isSelected
																? value.filter((v) => v !== option.value)
																: [...value, option.value]
														)
													} else {
														onChange([option.value])
													}
												}}
												className={`px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 ${
													isSelected
														? "bg-blue-500 text-white border-blue-500 shadow-md"
														: "bg-white text-gray-700 border-gray-300 hover:gray-400 hover:bg-gray-100"
												}`}
											>
												{option.label}
											</button>
										)
									})}
								</div>
							)
						) : (
							<input
								type="text"
								value={Array.isArray(value) ? value.join(", ") : value || ""}
								onChange={(e) => onChange(e.target.value)}
								className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[300px]"
							/>
						)}
					</div>
				) : (
					<div className="flex-1 sm:flex-none">
						<span className="text-gray-900 font-sm">
							{getDisplayValue() && Array.isArray(getDisplayValue()) ? (
								<>
									<ul className="list-disc list-inside">
										{(getDisplayValue() as string[])?.map(
											(value: string, index: number) => {
												return (
													<li key={index} className="ml-2">
														{value}
													</li>
												)
											}
										)}
									</ul>
								</>
							) : (
								getDisplayValue()
							)}
						</span>
					</div>
				)}
			</div>
		</div>
	)
}
