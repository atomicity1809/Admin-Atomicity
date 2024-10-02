"use client"


import React from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const HomePage: React.FC = () => {
  const { user} = useUser();

  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [coverRef, coverInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-primary">Atomicity</span>
              </div>
            </div>
            <div className="flex items-center">
              <ClerkLoaded>
                <SignedOut>
                  <Button variant="ghost" className="text-primary mr-2">
                    <SignInButton mode="modal" />
                  </Button>
                  <Button variant="default">
                    <SignUpButton mode="modal" fallbackRedirectUrl={"/signup"} />
                  </Button>
                </SignedOut>
                <SignedIn>
                  <div className=" flex items-center gap-2">
                    <span className=" font-thin">
                      Welcome <b>{user?.fullName}</b>👋👋
                    </span>
                    <UserButton/>
                    <Link href={"/dashboard"} prefetch>
                      <Button>
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                </SignedIn>
              </ClerkLoaded>
              <ClerkLoading>
                <Button variant="ghost" disabled className="mr-2">
                  Sign in
                </Button>
                <Button variant="default" disabled>
                  Sign up
                </Button>
              </ClerkLoading>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0, y: 50 }}
        animate={heroInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="bg-primary text-white py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
            Welcome to Atomicity
          </h1>
          <p className="mt-3 max-w-md mx-auto text-xl sm:text-2xl md:mt-5 md:max-w-3xl">
            Empowering your workflow with atomic precision.
          </p>
          <div className="mt-10">
            <Button size="lg" variant="secondary">
              Get Started
            </Button>
          </div>
        </div>
        <div className="mt-10 flex justify-center">
          <ChevronDown className="animate-bounce w-10 h-10" />
        </div>
      </motion.section>

      {/* Cover Section */}
      <motion.section
        ref={coverRef}
        initial={{ opacity: 0, y: 50 }}
        animate={coverInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Our Mission</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Revolutionizing Workflow Management
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Atomicity brings a new level of efficiency and precision to your projects, enabling you to break down complex tasks into manageable, atomic units.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        ref={featuresRef}
        initial={{ opacity: 0, y: 50 }}
        animate={featuresInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl text-center mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Atomic Tasks", description: "Break down projects into small, manageable units" },
              { title: "Real-time Collaboration", description: "Work together seamlessly with your team" },
              { title: "Intelligent Automation", description: "Let AI handle repetitive tasks for you" },
            ].map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">About</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Social</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Twitter</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              {/* Add social icons here */}
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              © 2024 Atomicity, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;