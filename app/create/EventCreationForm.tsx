"use client";

import React, { useState, ChangeEvent } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar as CalendarIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Client, Storage, ID } from "appwrite";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { toast, Toaster } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MDPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

interface EventData {
  title: string;
  subtitle: string;
  description: string;
  date: Date;
  location: string;
  mode: string;
  time: string;
  fees: number;
  maxAllowedParticipants: number;
  noMaxParticipants: boolean;
  coverImg: string;
  detailImg: string;
  supportFile: string;
  visibility: boolean;
  isAvailableToReg: boolean;
  tags: string[];
  categories: string[];
  likeCounter: number;
  registrationOpenTill: Date;
  additionalInfo: string;
  ownerId: string;
}

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || "";
const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKET_ID || "";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "";

const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);

const storage = new Storage(client);

const EventCreationForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const today = new Date();

  // let ownerId = user?.id

  const [eventData, setEventData] = useState<EventData>({
    title: "",
    subtitle: "",
    description: "",
    date: new Date(),
    mode: "offline", // default value
    location: "",
    time: "",
    fees: 0,
    maxAllowedParticipants: 0,
    noMaxParticipants: false,
    coverImg: "",
    detailImg: "",
    supportFile: "",
    visibility: true,
    isAvailableToReg: true,
    tags: [],
    categories: [],
    likeCounter: 0,
    registrationOpenTill: new Date(),
    additionalInfo: "",
    ownerId: user?.id || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleMaxParticipantsCheckbox = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setEventData((prev) => ({
      ...prev,
      noMaxParticipants: checked,
      maxAllowedParticipants: checked ? -1 : 0,
    }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setEventData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (date: Date | undefined, field: string) => {
    if (date) {
      setEventData((prev) => ({ ...prev, [field]: date }));
    }
  };

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
        const fileUrl = storage.getFileView(BUCKET_ID, response.$id).href;
        setEventData((prev) => ({ ...prev, [field]: fileUrl }));
      } catch (error) {
        console.error(`Error uploading ${field}:`, error);
        toast.error("Error in file upload. try again...");
      }
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim());
    setEventData((prev) => ({ ...prev, tags }));
  };

  const handleCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categories = e.target.value
      .split(",")
      .map((category) => category.trim());
    setEventData((prev) => ({ ...prev, categories }));
  };

  const handleAdditionalInfoChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEventData((prev) => ({ ...prev, additionalInfo: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ownerId = user?.id;
    console.log(user?.id);
    setIsLoading(true);

    try {
      const eventDataWithOwner = {
        ...eventData,
        ownerId: user?.id,
        date: eventData.date.toISOString(),
        registrationOpenTill: eventData.registrationOpenTill.toISOString(),
      };

      const response = await fetch("/api/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventDataWithOwner),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const result = await response.json();

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 p-6 h-[calc(100vh-64px)]">
      <ScrollArea className="h-full pr-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href={"/dashboard"}>
            <ArrowLeft />
          </Link>
          <h2 className="text-2xl font-bold">Create Event</h2>
        </div>
        {/* titile */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={eventData.title}
              onChange={handleInputChange}
            />
          </div>

          {/* sub titile */}
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              name="subtitle"
              value={eventData.subtitle}
              onChange={handleInputChange}
            />
          </div>

          {/* description */}
          {/* <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={eventData.description}
              onChange={handleInputChange}
            />
          </div> */}

          {/* date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !eventData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventData.date ? (
                    format(eventData.date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={eventData.date}
                  onSelect={(date) => handleDateChange(date, "date")}
                  disabled={(date) => date < today} // Disable past dates
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* registration open till */}
          <div>
            <Label htmlFor="registrationOpenTill">Registration Open Till</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !eventData.registrationOpenTill && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventData.registrationOpenTill ? (
                    format(eventData.registrationOpenTill, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={eventData.registrationOpenTill}
                  onSelect={(date) =>
                    handleDateChange(date, "registrationOpenTill")
                  }
                  disabled={(date) =>
                    date < today || (eventData.date && date > eventData.date)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* mode */}
          <div>
            <label htmlFor="mode">Mode of Event</label>
            <select
              id="mode"
              name="mode"
              value={eventData.mode}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* location */}
          <div>
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={eventData.location}
              onChange={handleInputChange}
              disabled={eventData.mode === "online"}
              placeholder={
                eventData.mode === "online"
                  ? "Not required for online events"
                  : "Enter event location"
              }
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* time */}
          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              name="time"
              type="time"
              value={eventData.time}
              onChange={handleInputChange}
            />
          </div>

          {/* fees */}
          <div>
            <Label htmlFor="fees">Fees</Label>
            <Input
              id="fees"
              name="fees"
              type="number"
              value={eventData.fees}
              onChange={handleInputChange}
            />
          </div>

          {/* Maximum allowed participation */}
          <div>
            <Label htmlFor="maxParticipants">
              Maximum Allowed Participants
            </Label>
            <Input
              id="maxAllowedParticipants"
              name="maxAllowedParticipants"
              type="number"
              value={
                eventData.noMaxParticipants === true
                  ? ""
                  : eventData.maxAllowedParticipants
              }
              onChange={handleInputChange}
              disabled={eventData.noMaxParticipants}
              placeholder={eventData.noMaxParticipants ? "No limit" : ""}
            />
          </div>

          {/* no max participation */}
          <div className="flex items-center space-x-2">
            <input
              id="noMaxParticipants"
              type="checkbox"
              checked={eventData.noMaxParticipants}
              onChange={handleMaxParticipantsCheckbox}
            />
            <Label htmlFor="noMaxParticipants">No maximum participation</Label>
          </div>

          {/* cover image */}
          <div>
            <Label htmlFor="coverImg">Cover Image</Label>
            <Input
              id="coverImg"
              name="coverImg"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "coverImg")}
            />
          </div>

          {/* detail image */}
          <div>
            <Label htmlFor="detailImg">Detail Image</Label>
            <Input
              id="detailImg"
              name="detailImg"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "detailImg")}
            />
          </div>

          {/* support file */}
          <div>
            <Label htmlFor="supportFile">Support File</Label>
            <Input
              id="supportFile"
              name="supportFile"
              type="file"
              onChange={(e) => handleFileUpload(e, "supportFile")}
            />
          </div>

          {/* tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={eventData.tags.join(", ")}
              onChange={handleTagsChange}
            />
          </div>

          {/* categories */}
          <div>
            <Label htmlFor="categories">Categories (comma-separated)</Label>
            <Input
              id="categories"
              name="categories"
              value={eventData.categories.join(", ")}
              onChange={handleCategoriesChange}
            />
          </div>
          {/* <div>
            <Label htmlFor="links">Links (one per line)</Label>
            <Textarea
              id="links"
              name="links"
              value={eventData.links.join('\n')}
              onChange={handleLinksChange}
            />
          </div> */}

          {/* additional info */}
          <div data-color-mode="light">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <MDEditor
              value={eventData.additionalInfo}
              onChange={handleAdditionalInfoChange}
            />
          </div>

          {/* visibility */}
          <div className="flex items-center space-x-2">
            <Switch
              id="visibility"
              checked={eventData.visibility}
              onCheckedChange={handleSwitchChange("visibility")}
            />
            <Label htmlFor="visibility">Visibility</Label>
          </div>

          {/* isavailable to reg */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isAvailableToReg"
              checked={eventData.isAvailableToReg}
              onCheckedChange={handleSwitchChange("isAvailableToReg")}
            />
            <Label htmlFor="isAvailableToReg">Available for Registration</Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Event..." : "Create Event"}
          </Button>
        </div>
      </form>
      </ScrollArea>

      {/* PREVIEW SECTION */}
      <ScrollArea className="h-full pl-4">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Event Preview</h2>
        <p className="flex justify-center gap-2 items-center text-xs">
          <InfoIcon size={15} />
          Your changes reflect here.
        </p>
        <div className="rounded-lg overflow-hidden border">
          <div className="relative h-48">
            <img
              src={eventData.coverImg || "/api/placeholder/1200/400"}
              alt="Event cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
              <h3 className="text-2xl font-bold">
                {eventData.title || "Event Title"}
              </h3>
              <p>{eventData.subtitle || "Event Subtitle"}</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <p>
              {eventData.description || "Event description will appear here."}
            </p>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{format(eventData.date, "PPP")}</span>
              <span>{eventData.time || "Event Time"}</span>
            </div>
            <p>{eventData.location || "Event Location"}</p>
            <div className="flex justify-between">
              <span>Fees: ₹{eventData.fees}</span>
              <span>
                Maximum Participants:{" "}
                {eventData.noMaxParticipants
                  ? "N/A"
                  : `${eventData.maxAllowedParticipants}`}
              </span>
            </div>
            <div className="flex space-x-2">
              {eventData.visibility && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Visible
                </span>
              )}
              {eventData.isAvailableToReg && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Registration Open
                </span>
              )}
            </div>
            <div>
              <h4 className="font-semibold">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {eventData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold">Categories:</h4>
              <div className="flex flex-wrap gap-2">
                {eventData.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
            {/* <div>
              <h4 className="font-semibold">Links:</h4>
              <ul className="list-disc list-inside">
                {eventData.links.map((link, index) => (
                  <li key={index} className="text-blue-500 hover:underline">
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}
            <div>
              <h4 className="font-semibold">Registration Open Till:</h4>
              <p>{format(eventData.registrationOpenTill, "PPP")}</p>
            </div>
            <div>
              <h4 className="font-semibold">Additional Information:</h4>
              <MDPreview source={eventData.additionalInfo} />
            </div>
            <Button className="w-full" disabled={!eventData.isAvailableToReg}>
              {eventData.isAvailableToReg
                ? "Register Now"
                : "Registration Closed"}
            </Button>
          </div>
        </div>
      </div>
      </ScrollArea>
    </div>
  );
};

export default EventCreationForm;
