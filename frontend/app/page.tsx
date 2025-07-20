"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Users, 
  Brain, 
  Target, 
  Award, 
  ArrowRight, 
  Play,
  Shield,
  Zap
} from "lucide-react"

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Simulations",
      description: "Practice with intelligent AI replicas that adapt to your responses and provide realistic scenarios."
    },
    {
      icon: Users,
      title: "Professional Training",
      description: "Designed for medical, law enforcement, education, and social work professionals."
    },
    {
      icon: Target,
      title: "Skill Development",
      description: "Improve communication, leadership, and decision-making skills in a safe environment."
    },
    {
      icon: Award,
      title: "Performance Analytics",
      description: "Track your progress with detailed feedback and performance metrics."
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: "Safe Practice Environment",
      description: "Learn and make mistakes without real-world consequences."
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Get immediate insights and suggestions for improvement."
    },
    {
      icon: Play,
      title: "Flexible Learning",
      description: "Practice anytime, anywhere with our accessible platform."
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white">
            Social Sim
          </span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold mb-6 text-white"
          >
            Master Professional
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Communication Skills
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Practice real-world scenarios with AI-powered simulations. Perfect for medical professionals, 
            law enforcement, educators, and social workers looking to enhance their communication skills.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg">
              <Link href="/sign-in" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/discover">Explore Simulations</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Why Choose Social Sim?
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI technology with proven training methodologies 
            to deliver an unparalleled learning experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border border-gray-800 shadow-lg bg-gray-900 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Transform Your Skills
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Join thousands of professionals who have improved their communication 
              and decision-making abilities through our platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{benefit.title}</h3>
                <p className="text-gray-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of professionals improving their skills with AI-powered simulations.
              </p>
              <Button asChild size="lg" variant="secondary" className="bg-white text-black hover:bg-gray-100">
                <Link href="/sign-in" className="flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <Users className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-white">Social Sim</span>
          </div>
          <p className="text-gray-300">
            © 2024 Social Sim. Empowering professionals through AI-powered training.
          </p>
        </div>
      </footer>
    </div>
  )
}
