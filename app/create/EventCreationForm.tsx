"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar as CalendarIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Client, Storage, ID } from "appwrite";
import dynamic from "next/dynamic";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MDPreview = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown), { ssr: false });

interface EventData {
  title: string;
  subtitle: string;
  description: string;
  date: Date;
  mode: 'online' | 'offline';
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

const EventForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");
  const isEditing = Boolean(eventId);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const today = new Date();

  const [eventData, setEventData] = useState<EventData>({
    title: "",
    subtitle: "",
    description: "",
    date: new Date(),
    mode: "offline",
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

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      try {
        const response = await fetch(`/api/event/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch event');
        
        const data = await response.json();
        setEventData({
          ...data,
          date: new Date(data.date),
          registrationOpenTill: new Date(data.registrationOpenTill),
          noMaxParticipants: data.maxAllowedParticipants === -1,
        });
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event data');
      }
    };

    fetchEventData();
  }, [eventId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setEventData((prev: EventData) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleMaxParticipantsCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setEventData((prev: EventData) => ({
      ...prev,
      noMaxParticipants: checked,
      maxAllowedParticipants: checked ? -1 : 0,
    }));
  };

  const handleSwitchChange = (name: keyof EventData) => (checked: boolean) => {
    setEventData((prev: EventData) => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (date: Date | undefined, field: keyof EventData) => {
    if (date) {
      setEventData((prev: EventData) => ({ ...prev, [field]: date }));
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, field: keyof EventData) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
        const fileUrl = storage.getFileView(BUCKET_ID, response.$id).href;
        setEventData((prev: EventData) => ({ ...prev, [field]: fileUrl }));
      } catch (error) {
        console.error(`Error uploading ${field}:`, error);
        toast.error("Error in file upload. try again...");
      }
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim());
    setEventData((prev: EventData) => ({ ...prev, tags }));
  };
  
  const handleCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categories = e.target.value.split(",").map((category) => category.trim());
    setEventData((prev: EventData) => ({ ...prev, categories }));
  };

  const handleAdditionalInfoChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEventData((prev: EventData) => ({ ...prev, additionalInfo: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const eventDataWithOwner = {
        ...eventData,
        ownerId: user?.id,
        date: eventData.date.toISOString(),
        registrationOpenTill: eventData.registrationOpenTill.toISOString(),
      };

      const url = isEditing ? `/api/event/${eventId}` : '/api/event';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventDataWithOwner),
      });

      if (!response.ok) {
        throw new Error(isEditing ? "Failed to update event" : "Failed to create event");
      }

      toast.success(isEditing ? "Event updated successfully!" : "Event created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error(isEditing ? "Error updating event:" : "Error creating event:", error);
      toast.error(isEditing ? "Failed to update event" : "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 p-6 h-[calc(100vh-64px)]">
      <ScrollArea className="h-full pr-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <ArrowLeft />
            </Link>
            <h2 className="text-2xl font-bold">{isEditing ? 'Edit Event' : 'Create Event'}</h2>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={eventData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              name="subtitle"
              value={eventData.subtitle}
              onChange={handleInputChange}
              placeholder="Enter event subtitle"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={eventData.description}
              onChange={handleInputChange}
              placeholder="Enter event description"
              className="min-h-[100px]"
            />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !eventData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventData.date ? format(eventData.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={eventData.date}
                  onSelect={(date) => handleDateChange(date, "date")}
                  disabled={(date) => date < today}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Registration Open Till */}
          <div>
            <Label htmlFor="registrationOpenTill">Registration Open Till</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
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
                  onSelect={(date) => handleDateChange(date, "registrationOpenTill")}
                  disabled={(date) =>
                    date < today || (eventData.date && date > eventData.date)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Mode */}
          <div>
            <Label htmlFor="mode">Mode of Event</Label>
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

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
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
            />
          </div>

          {/* Time */}
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

          {/* Fees */}
          <div>
            <Label htmlFor="fees">Fees</Label>
            <Input
              id="fees"
              name="fees"
              type="number"
              value={eventData.fees}
              onChange={handleInputChange}
              min="0"
            />
          </div>

          {/* Maximum Participants */}
          <div>
            <Label htmlFor="maxAllowedParticipants">Maximum Allowed Participants</Label>
            <Input
              id="maxAllowedParticipants"
              name="maxAllowedParticipants"
              type="number"
              value={
                eventData.noMaxParticipants ? "" : eventData.maxAllowedParticipants
              }
              onChange={handleInputChange}
              disabled={eventData.noMaxParticipants}
              placeholder={eventData.noMaxParticipants ? "No limit" : ""}
              min="0"
            />
          </div>

          {/* No Max Participants Toggle */}
          <div className="flex items-center space-x-2">
            <input
              id="noMaxParticipants"
              type="checkbox"
              checked={eventData.noMaxParticipants}
              onChange={handleMaxParticipantsCheckbox}
              className="rounded"
            />
            <Label htmlFor="noMaxParticipants">No maximum participation limit</Label>
          </div>

          {/* Cover Image */}
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

          {/* Detail Image */}
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

          {/* Support File */}
          <div>
            <Label htmlFor="supportFile">Support File</Label>
            <Input
              id="supportFile"
              name="supportFile"
              type="file"
              onChange={(e) => handleFileUpload(e, "supportFile")}
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={eventData.tags.join(", ")}
              onChange={handleTagsChange}
              placeholder="e.g. workshop, technology, learning"
            />
          </div>

          {/* Categories */}
          <div>
            <Label htmlFor="categories">Categories (comma-separated)</Label>
            <Input
              id="categories"
              name="categories"
              value={eventData.categories.join(", ")}
              onChange={handleCategoriesChange}
              placeholder="e.g. education, professional, technical"
            />
          </div>

          {/* Additional Info */}
          <div data-color-mode="light">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <MDEditor
              value={eventData.additionalInfo}
              onChange={handleAdditionalInfoChange}
              preview="edit"
            />
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="visibility"
              checked={eventData.visibility}
              onCheckedChange={handleSwitchChange("visibility")}
            />
            <Label htmlFor="visibility">Event Visibility</Label>
          </div>

          {/* Registration Availability Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isAvailableToReg"
              checked={eventData.isAvailableToReg}
              onCheckedChange={handleSwitchChange("isAvailableToReg")}
            />
            <Label htmlFor="isAvailableToReg">Available for Registration</Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? "Updating Event..."
                : "Creating Event..."
              : isEditing
              ? "Update Event"
              : "Create Event"}
          </Button>
        </form>
      </ScrollArea>

      {/* Preview Section */}
      <ScrollArea className="h-full pl-4">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Event Preview</h2>
          <p className="flex justify-center gap-2 items-center text-xs">
            <InfoIcon size={15} />
            Your changes reflect here in real-time
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
              <p className="text-gray-700">
                {eventData.description || "Event description will appear here."}
              </p>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>{format(eventData.date, "PPP")}</span>
                <span>{eventData.time || "Event Time"}</span>
              </div>
              
              <div className="text-gray-700">
                <strong>Location: </strong>
                {eventData.location || `${eventData.mode} event`}
              </div>
              
              <div className="flex justify-between text-gray-700">
                <span>
                  <strong>Fees: </strong>₹{eventData.fees}
                </span>
                <span>
                  <strong>Maximum Participants: </strong>
                  {eventData.noMaxParticipants
                    ? "Unlimited"
                    : eventData.maxAllowedParticipants}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
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
                <h4 className="font-semibold mb-2">Tags:</h4>
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
                <h4 className="font-semibold mb-2">Categories:</h4>
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

              <div>
                <h4 className="font-semibold">Registration Open Till:</h4>
                <p>{format(eventData.registrationOpenTill, "PPP")}</p>
              </div>

              {eventData.additionalInfo && (
                <div>
                  <h4 className="font-semibold mb-2">Additional Information:</h4>
                  <div className="prose prose-sm max-w-none">
                    <MDPreview source={eventData.additionalInfo} />
                  </div>
                </div>
              )}

              <Button 
                className="w-full mt-4" 
                disabled={!eventData.isAvailableToReg}
              >
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

export default EventForm;