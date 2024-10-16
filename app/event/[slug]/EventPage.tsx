"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ObjectId } from "mongoose";

interface IEvent {
  _id: ObjectId;
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
  }, []);

  if (!event) {
    return <div>Loading...</div>;
  }

  const handleAttendanceClick = () => {
    router.push(`/event/${event._id}/attendance`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={handleAttendanceClick} className="mb-6">
        Attendance
      </Button>

      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <h2 className="text-xl mb-4">{event.subtitle}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <img
            src={event.coverImg}
            alt="Event Cover"
            className="w-full h-auto mb-4"
          />
          <img
            src={event.detailImg}
            alt="Event Detail"
            className="w-full h-auto mb-4"
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
          <img
            src={event.ownerLogo}
            alt="Owner Logo"
            className="w-16 h-16 rounded-full mr-4"
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
