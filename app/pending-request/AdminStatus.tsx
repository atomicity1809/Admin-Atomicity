"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, HelpCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Confetti from "react-confetti"; // Add this package for confetti
import { useRouter } from "next/navigation";

const AdminStatus = () => {
  const [adminStatus, setAdminStatus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const userId = user?.id;
        const response = await fetch(`/api/getadminstatus/${userId}`);
        const data = await response.json();

        if (data.success) {
          setAdminStatus(data.status);
        } else {
          setError("Failed to load admin status");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAdminStatus();
    }
  }, [user]);

  const getStatusInfo = () => {
    switch (adminStatus) {
      case 1:
        return {
          title: "Not Applied",
          description: "You have not applied for admin status.",
          icon: <HelpCircle className="text-gray-600" />,
          color: "bg-gray-100 text-gray-800",
          action: "Apply Now"
        };
      case 2:
        return {
          title: "Pending",
          description: "Your admin request is currently under review.",
          icon: <Clock className="text-yellow-600" />,
          color: "bg-yellow-100 text-yellow-800",
          action: "Check Status"
        };
      case 3:
        return {
          title: "Approved",
          description: "Your admin request has been approved!",
          icon: <CheckCircle className="text-green-600" />,
          color: "bg-green-100 text-green-800",
          action: "Manage Admin"
        };
      default:
        return {
          title: "Error",
          description: "Unable to determine admin status.",
          icon: <AlertCircle className="text-red-600" />,
          color: "bg-red-100 text-red-800",
          action: "Retry"
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-lg font-semibold">Loading your admin status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const { title, description, icon, color, action } = getStatusInfo();

  const handleActionClick = () => {
    if (adminStatus === 3) {
      router.push("/dashboard");
    } else {
      // Handle other actions if needed
    }
  };

  return (
    <div className="relative">
      {adminStatus === 3 && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={500}/>}
      <Card className={`max-w-md mx-auto ${color}`}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            {icon}
            <CardTitle>Admin Status</CardTitle>
          </div>
          <CardDescription>Your current administrative status</CardDescription>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <Button className="mt-4" onClick={handleActionClick}>
            {action}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatus;
