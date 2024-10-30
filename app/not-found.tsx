"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CloudOff } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center text-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Image src="/imgs/atomicity_logo.png" width={150} height={150} alt='logo'/>

          </motion.div>
          <motion.h1
            className="text-4xl font-bold text-gray-900 mb-2"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            404
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Oops! Page not found
          </motion.p>
          <motion.p
            className="text-gray-500 mb-8"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </motion.p>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className=' flex justify-between items-center gap-1'> 
                <Link href={'/'}>
                    <Button variant="default" size="lg" className="bg-purple-500 hover:bg-purple-600">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go back home
                    </Button>
                </Link>

                <Link href={'/events'}>
                    <Button variant="default" size="lg" className="bg-black hover:bg-gray-900">
                        Explore Events<ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>

          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}