"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { Layout } from "@/app/dashboard/Layout";
import Link from "next/link";
import { 
  ChevronRight, 
  Download, 
  Edit, 
  Trash, 
  Users, 
  Menu,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users2,
  Heart,
  Tag,
  Info
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface IEvent {
  id: string;
  title: string;
  subtitle: string;
  date: Date;
  mode: string;
  location: string;
  time: string;
  fees: number;
  maxAllowedParticipants: number;
  noMaxParticipants: boolean;
  coverImg: string;
  detailImg: string;
  supportFile: string;
  visibility: boolean;
  isAvailableToReg: boolean;
  registeredUsers: string[];
  ownerId: string;
  tags: string[];
  categories: string[];
  likeCounter: number;
  registrationOpenTill: Date;
  additionalInfo: string;
  ownerName: string;
  ownerLogo: string;
}

interface AttendanceRecord {
  name: string;
  email: string;
  username: string;
  mobileNo: string;
  institute: string;
  timestamp: string;
  conf_number?: string;
}

interface RegistrationRecord {
  clerkId: string;
  name: string;
  email: string;
  username: string;
  mobileNo: string;
  institute: string;
}

const EventPage = () => {
  const [event, setEvent] = useState<IEvent | null>(null);
  const [activeSection, setActiveSection] = useState<"details" | "attendance" | "downloads">("details");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const eventId = pathname.split("/").pop();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/event/${eventId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event data');
        }
        const data = await response.json();
        setEvent(data.data[0]);
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  const handleDownloadAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/getattendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const data = await response.json();

      if (!data.attendance) {
        throw new Error("Invalid response structure");
      }

      const filteredAttendance = data.attendance.map(
        (item: AttendanceRecord, index: number) => ({
          srNo: index + 1,
          name: item.name,
          email: item.email,
          username: item.username,
          mobileNo: item.mobileNo,
          institute: item.institute,
          timestamp: item.timestamp,
          conf_number: item.conf_number || "N/A",
        })
      );

      const worksheet = XLSX.utils.json_to_sheet(filteredAttendance);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

      const binaryString = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "binary",
      });

      const blob = new Blob([s2ab(binaryString)], {
        type: "application/octet-stream",
      });
      saveAs(blob, `attendance_${event?.title || eventId}.xlsx`);
    } catch (error) {
      console.error("Error downloading attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadRegistration = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/getregistrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch registration data');
      }

      const data = await response.json();

      const filteredRegistrations = data.registrations.map(
        (user: RegistrationRecord, index: number) => ({
          srNo: index + 1,
          userId: user.clerkId,
          name: user.name,
          email: user.email,
          username: user.username,
          mobileNo: user.mobileNo,
          institute: user.institute,
        })
      );

      const worksheet = XLSX.utils.json_to_sheet(filteredRegistrations);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

      const binaryString = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "binary",
      });

      const blob = new Blob([s2ab(binaryString)], {
        type: "application/octet-stream",
      });
      saveAs(blob, `registrations_${event?.title || eventId}.xlsx`);
    } catch (error) {
      console.error("Error downloading registrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/event/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      router.push("/dashboard/events");
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const renderEventDetails = () => {
    if (!event) return null;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <h2 className="text-xl text-gray-600">{event.subtitle}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Image
              src={event.coverImg}
              alt="Event Cover"
              className="w-full h-auto rounded-lg shadow-md"
              width={500}
              height={300}
            />
            <Image
              src={event.detailImg}
              alt="Event Detail"
              className="w-full h-auto rounded-lg shadow-md"
              width={500}
              height={300}
            />
          </div>

          <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p>{new Date(event.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p>{event.time}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Mode</p>
                  <p>{event.mode}</p>
                  {event.mode !== "online" && <p className="text-sm text-gray-600">{event.location}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Fees</p>
                  <p>${event.fees}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users2 className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Participants</p>
                  <p>
                    {event.noMaxParticipants
                      ? "No Limit"
                      : `${event.registeredUsers.length} / ${event.maxAllowedParticipants}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Registration Open Till</p>
                  <p>{new Date(event.registrationOpenTill).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Likes</p>
                  <p>{event.likeCounter}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Tags</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Info className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Additional Info</p>
                  <p className="text-sm">{event.additionalInfo}</p>
                </div>
              </div>

              {event.supportFile && (
                <div className="mt-4">
                  <a
                    href={event.supportFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Support File</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-2xl font-bold mb-4">Event Owner</h3>
          <div className="flex items-center space-x-4">
            <Image
              src={event.ownerLogo}
              alt="Owner Logo"
              className="w-16 h-16 rounded-full"
              width={64}
              height={64}
            />
            <div>
              <p className="font-semibold">{event.ownerName}</p>
              <p className="text-sm text-gray-500">ID: {event.ownerId}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAttendance = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Attendance Management</h2>
        <Alert>
          <Users className="h-4 w-4" />
          <AlertTitle>Manage Event Attendance</AlertTitle>
          <AlertDescription>
            Take attendance or view attendance records for this event.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => router.push(`/dashboard/events/${eventId}/attendance`)}
          disabled={isLoading}
        >
          <Users className="mr-2 h-4 w-4" />
          Take Attendance
        </Button>
      </div>
    );
  };

  const renderDownloads = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Download Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="font-semibold mb-3">Attendance Report</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download a complete list of attendees who checked in to the event.
            </p>
            <Button 
              onClick={handleDownloadAttendance}
              className="w-full"
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isLoading ? "Downloading..." : "Download Attendance"}
            </Button>
          </div>
          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="font-semibold mb-3">Registration Report</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download a complete list of users registered for the event.
            </p>
            <Button 
              onClick={handleDownloadRegistration}
              className="w-full"
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isLoading ? "Downloading..." : "Download Registration"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "attendance":
        return renderAttendance();
      case "downloads":
        return renderDownloads();
      default:
        return renderEventDetails();
    }
  };

  if (isLoading && !event) {
    return (
      <Layout>
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 px-4">
          <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/events" className="hover:text-gray-700">Events</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">Loading...</span>
        </nav>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 px-4">
          <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/events" className="hover:text-gray-700">Events</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">Error</span>
        </nav>
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load event details. Please try again later.</p>
          <Button 
            onClick={() => router.push("/dashboard/events")}
            className="mt-4"
          >
            Return to Events
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 px-4">
        <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/dashboard/events" className="hover:text-gray-700">Events</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {activeSection === "details" ? event.title : `${event.title} - ${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}`}
        </span>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="space-x-2">
                <Menu className="h-4 w-4" />
                <span>Control Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem 
                onClick={() => setActiveSection("details")}
                className="flex items-center"
              >
                <Info className="mr-2 h-4 w-4" />
                Event Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setActiveSection("attendance")}
                className="flex items-center"
              >
                <Users className="mr-2 h-4 w-4" />
                Attendance
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setActiveSection("downloads")}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Downloads
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push(`/dashboard/events/edit/${eventId}`)}
                className="flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center text-red-600 focus:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {activeSection !== "details" && (
            <Button 
              variant="outline"
              onClick={() => setActiveSection("details")}
              className="hover:text-gray-700"
            >
              ← Back to Details
            </Button>
          )}
        </div>

        {renderContent()}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{event.title}"? This action cannot be undone
                and will permanently remove all event data, including registrations and attendance records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteEvent}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete Event"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default EventPage;