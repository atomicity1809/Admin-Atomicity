"use client"

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, HelpCircle, Mail } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
          icon: <HelpCircle className="w-8 h-8 text-gray-600" />,
          color: "border-gray-200",
          action: "Apply Now",
          progress: 0
        };
      case 2:
        return {
          title: "Request Submitted",
          description: "Your admin request is currently under review.",
          icon: <Clock className="w-8 h-8 text-blue-600" />,
          color: "border-blue-200",
          action: "Check Status",
          progress: 50
        };
      case 3:
        return {
          title: "Approved",
          description: "Your admin request has been approved!",
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          color: "border-green-200",
          action: "Manage Admin",
          progress: 100
        };
      default:
        return {
          title: "Error",
          description: "Unable to determine admin status.",
          icon: <AlertCircle className="w-8 h-8 text-red-600" />,
          color: "border-red-200",
          action: "Retry",
          progress: 0
        };
    }
  };

  const timelineSteps = [
    { icon: <Clock className="w-5 h-5" />, title: "Request Sent", description: "Your admin request has been sent to Atomicity." },
    { icon: <HelpCircle className="w-5 h-5" />, title: "Under Consideration", description: "Our team is reviewing your organization details." },
    { icon: <CheckCircle className="w-5 h-5" />, title: "Final Status", description: "Decision on your admin status." },
    { icon: <Mail className="w-5 h-5" />, title: "Notification Sent", description: "Email sent with final status." },
  ];

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

  const { title, description, icon, color, action, progress } = getStatusInfo();

  const handleActionClick = () => {
    if (adminStatus === 3) {
      router.push("/dashboard");
    } else {
      // Handle other actions if needed
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className={`mb-8 ${color}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {icon}
              <div>
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
            <Button onClick={handleActionClick}>{action}</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Application Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative border-l border-gray-200">
            {timelineSteps.map((step, index) => (
              <li key={index} className="mb-10 ml-6">
                <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-8 ring-white ${index <= adminStatus ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  {React.cloneElement(step.icon, { className: `w-5 h-5 ${index <= adminStatus ? 'text-white' : 'text-gray-500'}` })}
                </span>
                <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
                  {step.title}
                  {index === adminStatus && (
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3">
                      Current
                    </span>
                  )}
                </h3>
                <p className="mb-4 text-base font-normal text-gray-500">{step.description}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatus;