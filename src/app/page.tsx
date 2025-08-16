"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Zap, Shield, Globe, Wallet, DollarSign, ArrowRight, Users, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  // If user is authenticated, show a different message
  if (session) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 mb-4">You're already signed in!</p>
              <p className="text-sm text-gray-500">You can now access all wallet features from the navbar.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-blue-50 -z-10" />
          
          <div className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
                  <span className="bg-gradient-to-r from-orange-600 via-red-600 to-blue-600 bg-clip-text text-transparent">
                    Your Gateway to 
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
                    Crypto Trading
                  </span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                  Experience seamless crypto trading with advanced wallet management, 
                  real-time market data, and secure transactions on CryptoBazar.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
                >
                  Learn More
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8"
              >
                {[
                  { icon: Users, label: "Active Users", value: "10K+" },
                  { icon: DollarSign, label: "Volume Traded", value: "$50M+" },
                  { icon: BarChart3, label: "Success Rate", value: "99.9%" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why Choose CryptoBazar?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Built with cutting-edge technology to provide you with the best trading experience
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: "Real-time Trading",
                  description: "Access live market data and execute trades instantly with our advanced trading engine.",
                  colors: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100"
                },
                {
                  icon: Shield,
                  title: "Bank-level Security",
                  description: "Your assets are protected with industry-leading security measures and encryption.",
                  colors: "border-red-200 bg-gradient-to-br from-red-50 to-red-100"
                },
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description: "Experience ultra-fast transaction processing with minimal latency.",
                  colors: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
                },
                {
                  icon: Globe,
                  title: "Multi-chain Support",
                  description: "Trade across multiple blockchain networks with seamless integration.",
                  colors: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                >
                  <Card className={`${feature.colors} hover:shadow-lg transition-all duration-300 hover:scale-105 h-full`}>
                    <CardContent className="p-6">
                      <div className="w-12 h-12 mb-4 bg-white/50 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-gray-700" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-red-600">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Start Trading?
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                Join thousands of traders who trust CryptoBazar for their crypto trading needs. 
                Sign up now and get started in minutes.
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Sign Up Now
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              CryptoBazar
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            The future of crypto trading is here. Join us on the journey.
          </p>
          <p className="text-sm text-gray-500">
            © 2024 CryptoBazar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
