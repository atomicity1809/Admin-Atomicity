"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

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

const EventPage = () => {
  const [event, setEvent] = useState<IEvent | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const eventId = pathname.split("/").pop();

  useEffect(() => {
    const fetchEventData = async () => {
      // Replace with your actual API call
      const response = await fetch(`/api/event/${eventId}`);
      const data = await response.json();
      setEvent(data.data[0]);
    };

    fetchEventData();
  }, [eventId]);

  if (!event) {
    return <div>Loading...</div>;
  }

  const handleAttendanceClick = () => {
    router.push(`/event/${eventId}/attendance`);
  };

  const handleDownloadAttendance = async () => {
    try {
      // Fetch attendance data from the backend
      const response = await fetch(`/api/getattendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();
      console.log(data);

      // Ensure data contains the required information
      if (!data.attendance) {
        throw new Error("Invalid response structure");
      }

      // Filter the data to include user details and add srNo
      const filteredAttendance = data.attendance.map(
        (item: any, index: number) => ({
          srNo: index + 1,
          // userId: item.clerkId, // Assuming clerkId is used as user ID
          name: item.name,
          email: item.email,
          username: item.username,
          mobileNo: item.mobileNo,
          institute: item.institute,
          timestamp: item.timestamp, // Ensure timestamp exists in user data
          conf_number: item.conf_number || "N/A", // Default to "N/A" if conf_number is not present
        })
      );
      console.log(filteredAttendance);

      // Convert data to XLSX format
      const worksheet = XLSX.utils.json_to_sheet(filteredAttendance);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

      // Create a binary string representation of the workbook
      const binaryString = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "binary",
      });

      // Convert the binary string to a Blob and trigger the download
      const blob = new Blob([s2ab(binaryString)], {
        type: "application/octet-stream",
      });
      saveAs(blob, `attendance_${eventId}.xlsx`);
    } catch (error) {
      console.error("Error downloading attendance:", error);
    }
  };

  const handleDownloadRegistration = async () => {
    try {
      // Fetch attendance data from the backend
      const response = await fetch(`/api/getregistrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();
      const eventName = data.eventName;
      console.log(data);

      // Filter the data to include only required columns and add srNo
      const filteredRegistrations = data.registrations.map(
        (user: any, index: number) => ({
          srNo: index + 1,
          userId: user.clerkId, // Include user ID if needed
          name: user.name,
          email: user.email,
          username: user.username,
          mobileNo: user.mobileNo,
          institute: user.institute,
        })
      );

      // Convert data to XLSX format
      const worksheet = XLSX.utils.json_to_sheet(filteredRegistrations);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

      // Create a binary string representation of the workbook
      const binaryString = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "binary",
      });

      // Convert the binary string to a Blob and trigger the download
      const blob = new Blob([s2ab(binaryString)], {
        type: "application/octet-stream",
      });
      saveAs(blob, `registrations_${eventName}.xlsx`);
    } catch (error) {
      console.error("Error downloading attendance:", error);
    }
  };

  // Helper function to convert binary string to array buffer
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={handleAttendanceClick} className="mb-6">
        Attendance
      </Button>

      {/* New Download Attendance Button */}
      <Button onClick={handleDownloadAttendance} className="mb-6 m-6">
        Download Attendance
      </Button>

      {/* New Registration Button */}
      <Button onClick={handleDownloadRegistration} className="mb-6 m-6">
        Download Registration
      </Button>

      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <h2 className="text-xl mb-4">{event.subtitle}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Image
            src={event.coverImg}
            alt="Event Cover"
            className="w-full h-auto mb-4"
            width={100}
            height={100}
          />
          <Image
            src={event.detailImg}
            alt="Event Detail"
            className="w-full h-auto mb-4"
            width={100}
            height={100}
          />
        </div>

        <div>
          <p>
            <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
          </p>
          <p>
            <strong>Time:</strong> {event.time}
          </p>
          <p>
            <strong>Mode:</strong> {event.mode}
          </p>
          {event.mode !== "online" && (
            <p>
              <strong>Location:</strong> {event.location}
            </p>
          )}
          <p>
            <strong>Fees:</strong> ${event.fees}
          </p>
          <p>
            <strong>Max Participants:</strong>{" "}
            {event.noMaxParticipants
              ? "No Limit"
              : event.maxAllowedParticipants}
          </p>
          <p>
            <strong>Registration Open Till:</strong>{" "}
            {new Date(event.registrationOpenTill).toLocaleDateString()}
          </p>
          <p>
            <strong>Available for Registration:</strong>{" "}
            {event.isAvailableToReg ? "Yes" : "No"}
          </p>
          <p>
            <strong>Visibility:</strong>{" "}
            {event.visibility ? "Public" : "Private"}
          </p>
          <p>
            <strong>Likes:</strong> {event.likeCounter}
          </p>
          <p>
            <strong>Registered Users:</strong> {event?.registeredUsers.length}
          </p>
          <p>
            <strong>Tags:</strong> {event.tags.join(", ")}
          </p>
          <p>
            <strong>Categories:</strong> {event.categories.join(", ")}
          </p>
          <p>
            <strong>Additional Info:</strong> {event.additionalInfo}
          </p>
          <p>
            <strong>Support File:</strong>{" "}
            <a
              href={event.supportFile}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Event Owner</h3>
        <div className="flex items-center">
          <Image
            src={event.ownerLogo}
            alt="Owner Logo"
            className="w-16 h-16 rounded-full mr-4"
            width={100}
            height={100}
          />
          <div>
            <p>
              <strong>Name:</strong> {event.ownerName}
            </p>
            <p>
              <strong>ID:</strong> {event.ownerId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
