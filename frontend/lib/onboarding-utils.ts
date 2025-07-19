import {
	IconUser,
	IconStethoscope,
	IconBrain,
	IconTarget,
	IconHeart,
	IconMicroscope,
	IconPill,
	IconUsers,
	IconBook,
	IconVideo,
	IconMessage,
	IconChartBar,
	IconFileDescription,
} from "@tabler/icons-react"

// Type definitions
export interface OnboardingOption {
	value: string
	label: string
	icon: string
	color: string
}

export interface OnboardingStep {
	id: string
	title: string
	description: string
	type: "single-select" | "multi-select"
	options: OnboardingOption[]
}

export interface OnboardingData {
	steps: OnboardingStep[]
}

// Icon mapping object
export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	IconUser,
	IconStethoscope,
	IconBrain,
	IconTarget,
	IconHeart,
	IconMicroscope,
	IconPill,
	IconUsers,
	IconBook,
	IconVideo,
	IconMessage,
	IconChartBar,
	IconFileDescription,
}

// Helper function to get icon component by name
export const getIconComponent = (iconName: string) => {
	return iconMap[iconName] || IconUser
}

// Helper function to get label by value for a specific step
export const getLabelByValue = (stepId: string, value: string, onboardingSteps: OnboardingStep[]) => {
	const step = onboardingSteps.find(s => s.id === stepId)
	if (!step) return value
	
	const option = step.options.find((opt: OnboardingOption) => opt.value === value)
	return option ? option.label : value
}

// Helper function to get labels for multiple values (for multi-select fields)
export const getLabelsByValues = (stepId: string, values: string[], onboardingSteps: OnboardingStep[]) => {
	if (!Array.isArray(values)) return []
	
	return values.map(value => getLabelByValue(stepId, value, onboardingSteps))
} 