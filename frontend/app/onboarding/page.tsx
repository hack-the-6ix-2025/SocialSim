"use client"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
	IconArrowRight,
	IconArrowLeft,
} from "@tabler/icons-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/utils/supabase/client"
import onboardingStepsData from "@/data/onboarding-steps.json"
import { getIconComponent, OnboardingStep } from "@/lib/onboarding-utils"

interface OnboardingData {
	role: string
	field: string
	experience: string
	goals: string[]
	interests: string[]
	studyLevel: string
	focusAreas: string[]
}

const onboardingSteps: OnboardingStep[] = onboardingStepsData.steps as OnboardingStep[]

export default function OnboardingPage() {
	const [introPage, setIntroPage] = useState(true)
	const [currentStep, setCurrentStep] = useState(0)
	const [onboardingData, setOnboardingData] = useState<OnboardingData>({
		role: "",
		field: "",
		experience: "",
		goals: [],
		interests: [],
		studyLevel: "",
		focusAreas: [],
	})
	const [isLoading, setIsLoading] = useState(false)

	const currentStepData = onboardingSteps[currentStep]
	const progress = ((currentStep + 1) / onboardingSteps.length) * 100

	const handleOptionSelect = (value: string) => {
		if (currentStepData.type === "single-select") {
			setOnboardingData((prev) => ({
				...prev,
				[currentStepData.id]: value,
			}))
		} else if (currentStepData.type === "multi-select") {
			setOnboardingData((prev) => ({
				...prev,
				[currentStepData.id]: prev[
					currentStepData.id as keyof OnboardingData
				]?.includes(value)
					? (
							prev[currentStepData.id as keyof OnboardingData] as string[]
					  ).filter((item) => item !== value)
					: [
							...((prev[
								currentStepData.id as keyof OnboardingData
							] as string[]) || []),
							value,
					  ],
			}))
		}
	}

	const isOptionSelected = (value: string) => {
		if (currentStepData.type === "single-select") {
			return (
				onboardingData[currentStepData.id as keyof OnboardingData] === value
			)
		} else if (currentStepData.type === "multi-select") {
			return (
				(onboardingData[
					currentStepData.id as keyof OnboardingData
				] as string[]) || []
			).includes(value)
		}
		return false
	}

	const canProceed = () => {
		const currentValue =
			onboardingData[currentStepData.id as keyof OnboardingData]
		if (currentStepData.type === "single-select") {
			return currentValue && currentValue.length > 0
		} else if (currentStepData.type === "multi-select") {
			return Array.isArray(currentValue) && currentValue.length > 0
		}
		return false
	}

	const handleNext = () => {
		if (currentStep < onboardingSteps.length - 1) {
			setCurrentStep((prev) => prev + 1)
		} else {
			handleComplete()
		}
	}

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1)
		}
	}

	const handleComplete = async () => {
		setIsLoading(true)
		console.log("Onboarding data:", onboardingData)

		// Add user onboarding data to profile
		// Profile is created in auth callback if its the users first time signing in
		const supabase = await createClient()
		const { data } = await supabase.auth.getUser()
		const userId = data.user?.id

		console.log(data)

		const { error } = await supabase
			.from("profiles")
			.update({
				experience: onboardingData.experience,
				field: onboardingData.field,
				focusAreas: onboardingData.focusAreas,
				goals: onboardingData.goals,
				interests: onboardingData.interests,
				role: onboardingData.role,
				studyLevel: onboardingData.studyLevel,
			})
			.eq("user_id", userId)
		if (error) {
			console.log("Error updating profile")
		}

    	// Redirect to dashboard now
		window.location.href = "/dashboard"
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
			<div className="w-full max-w-4xl">
				{/* Main Content */}

				{!introPage ? (
					<>
						{/* Progress Bar */}
						<div className="mb-8">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium text-gray-600">
									Step {currentStep + 1} of {onboardingSteps.length}
								</span>
							</div>
							<Progress value={progress} className="h-2" />
						</div>
						<AnimatePresence mode="wait">
							<motion.div
								key={currentStep}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.3 }}
							>
								<Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
									<CardHeader className="text-center pb-8">
										{/* <motion.div
									initial={{ scale: 0.8 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.1 }}
								> */}
										<CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
											{currentStepData.title}
										</CardTitle>
										{/* </motion.div> */}
										<CardDescription className="text-lg text-gray-600 mt-2">
											{currentStepData.description}
										</CardDescription>
									</CardHeader>

									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											{currentStepData.options.map((option, index) => {
												const IconComponent = getIconComponent(option.icon)
												const selected = isOptionSelected(option.value)

												return (
													<motion.div
														key={option.value}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: index * 0.1 }}
													>
														<button
															onClick={() => handleOptionSelect(option.value)}
															className={`w-full p-6 rounded-xl border-2 transition-all duration-200 group ${
																selected
																	? "border-blue-500 bg-blue-50"
																	: "border-gray-200 bg-white hover:border-gray-400"
															}`}
														>
															<div className="flex flex-col items-center space-y-3">
																<div
																	className={`p-3 rounded-full ${option.color} text-white`}
																>
																	<IconComponent className="w-6 h-6" />
																</div>
																<span
																	className={`font-medium text-center ${
																		selected ? "text-blue-700" : "text-gray-700"
																	}`}
																>
																	{option.label}
																</span>
																{/* {selected && (
															<div className="bg-blue-500 text-white rounded-full p-1">
																<IconCheck className="w-4 h-4" />
															</div>
														)} */}
															</div>
														</button>
													</motion.div>
												)
											})}
										</div>

										{/* Navigation */}

										<div className="flex justify-between items-center pt-8">
											{currentStep > 0 ? (
												<Button
													variant="outline"
													onClick={handleBack}
													disabled={currentStep === 0}
													className="flex items-center space-x-2"
												>
													<IconArrowLeft className="w-4 h-4" />
													<span>Back</span>
												</Button>
											) : (
												<div></div>
											)}

											<div className="flex items-center space-x-4">
												{currentStepData.type === "multi-select" && (
													<span className="text-sm text-gray-500">
														{Array.isArray(
															onboardingData[
																currentStepData.id as keyof OnboardingData
															]
														)
															? (
																	onboardingData[
																		currentStepData.id as keyof OnboardingData
																	] as string[]
															  ).length
															: 0}{" "}
														selected
													</span>
												)}

												<Button
													onClick={handleNext}
													disabled={!canProceed() || isLoading}
													className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
												>
													{isLoading ? (
														<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
													) : (
														<>
															<span>
																{currentStep === onboardingSteps.length - 1
																	? "Complete Setup"
																	: "Next"}
															</span>
															<IconArrowRight className="w-4 h-4" />
														</>
													)}
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						</AnimatePresence>
					</>
				) : (
					<div className="flex flex-col items-center gap-12">
						{/* Welcome Message */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.8,
								delay: 0.5,
								ease: [0.0, 0.18, 0.0, 1],
							}}
							className="text-center mt-8 flex flex-col items-center gap-6"
						>
							<p className="text-gray-500 text-6xl bold">
								Welcome to{" "}
								<span className="font-semibold text-blue-600">
									Social Sim
								</span>
								!
							</p>

							<p className="text-2xl text-gray-500">
								Let&apos;s personalize your experience.
							</p>

							<Button
								onClick={() => {
									setIntroPage(false)
								}}
								className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
							>
								{isLoading ? (
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								) : (
									<>
										<span>Start</span>
										<IconArrowRight className="w-4 h-4" />
									</>
								)}
							</Button>
						</motion.div>
					</div>
				)}
			</div>
		</div>
	)
}
