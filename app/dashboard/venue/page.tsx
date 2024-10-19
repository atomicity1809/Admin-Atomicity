"use client"
import React, { useState } from 'react';
import { Layout } from '../Layout';
import { CalendarIcon, Clock, Users, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Types
type TimeSlot = {
  time: string;
  isOccupied: boolean;
  eventName?: string;
  organizer?: string;
};

type Venue = {
  id: string;
  name: string;
  capacity: number;
  location: string;
  block: string;
  type: 'auditorium' | 'ground' | 'seminar-hall';
  timeSlots: TimeSlot[];
};

// Mock Data
const MOCK_VENUES: Venue[] = [
  {
    id: '1',
    name: 'A Auditorium',
    capacity: 500,
    location: 'First Floor',
    block: 'A Block',
    type: 'auditorium',
    timeSlots: [
      { time: '09:00', isOccupied: true, eventName: 'Technical Seminar', organizer: 'Computer Dept' },
      { time: '10:00', isOccupied: false },
      { time: '11:00', isOccupied: true, eventName: 'Workshop', organizer: 'IEEE Student Branch' },
      { time: '12:00', isOccupied: false },
      { time: '13:00', isOccupied: false },
      { time: '14:00', isOccupied: true, eventName: 'Guest Lecture', organizer: 'T&P' },
      { time: '15:00', isOccupied: false },
      { time: '16:00', isOccupied: false },
      { time: '17:00', isOccupied: true, eventName: 'Cultural Event', organizer: 'SAC' }
    ]
  },
  {
    id: '2',
    name: 'C Auditorium',
    capacity: 400,
    location: 'Ground Floor',
    block: 'C Block',
    type: 'auditorium',
    timeSlots: [
      { time: '09:00', isOccupied: false },
      { time: '10:00', isOccupied: true, eventName: 'Department Meeting', organizer: 'ME Dept' },
      { time: '11:00', isOccupied: false },
      { time: '12:00', isOccupied: false },
      { time: '13:00', isOccupied: true, eventName: 'Seminar', organizer: 'EC Dept' },
      { time: '14:00', isOccupied: false },
      { time: '15:00', isOccupied: false },
      { time: '16:00', isOccupied: true, eventName: 'Club Meeting', organizer: 'Robotics Club' },
      { time: '17:00', isOccupied: false }
    ]
  },
  {
    id: '3',
    name: 'NIM Auditorium',
    capacity: 800,
    location: 'Second Floor',
    block: 'NIM Block',
    type: 'auditorium',
    timeSlots: [
      { time: '09:00', isOccupied: true, eventName: 'Orientation', organizer: 'Admin' },
      { time: '10:00', isOccupied: true, eventName: 'Conference', organizer: 'Research Cell' },
      { time: '11:00', isOccupied: false },
      { time: '12:00', isOccupied: false },
      { time: '13:00', isOccupied: false },
      { time: '14:00', isOccupied: true, eventName: 'Workshop', organizer: 'ISTE' },
      { time: '15:00', isOccupied: false },
      { time: '16:00', isOccupied: false },
      { time: '17:00', isOccupied: false }
    ]
  }
];

// TimeSlot Component
const TimeSlotCard = ({ slot }: { slot: TimeSlot }) => (
  <div className={`p-4 rounded-lg border ${slot.isOccupied ? 'bg-red-50' : 'bg-green-50'}`}>
    <div className="flex items-center justify-between mb-2">
      <span className="font-medium">{slot.time}</span>
      {slot.isOccupied ? (
        <XCircle className="h-5 w-5 text-red-500" />
      ) : (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      )}
    </div>
    {slot.isOccupied && (
      <div className="text-sm space-y-1">
        <p className="font-medium text-gray-800">{slot.eventName}</p>
        <p className="text-gray-600">By: {slot.organizer}</p>
      </div>
    )}
  </div>
);

// Venue Details Dialog Component
const VenueDetailsSheet = ({ venue, date }: { venue: Venue; date: Date | undefined }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string>('');
    const [bookingDetails, setBookingDetails] = useState({
      eventName: '',
      organizer: ''
    });
  
    const handleBooking = () => {
      if (!selectedSlot || !date) {
        alert('Please select a date and time slot');
        return;
      }
      alert(`Booking Confirmed!\nVenue: ${venue.name}\nDate: ${format(date, "PPP")}\nTime: ${selectedSlot}`);
      setIsOpen(false);
    };
  
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">View Details</Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:w-[540px] overflow-y-auto">
          <SheetHeader className="space-y-1">
            <SheetTitle>{venue.name}</SheetTitle>
            <SheetDescription>
              Availability for {date ? format(date, "PPP") : "Selected Date"}
            </SheetDescription>
          </SheetHeader>
  
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Capacity</Label>
                <p className="font-medium">{venue.capacity} people</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Location</Label>
                <p className="font-medium">{venue.location}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Block</Label>
                <p className="font-medium">{venue.block}</p>
              </div>
            </div>
  
            <div>
              <h3 className="font-semibold mb-4">Time Slot Availability</h3>
              <div className="grid grid-cols-1 gap-4">
                {venue.timeSlots.map((slot, index) => (
                  <TimeSlotCard key={index} slot={slot} />
                ))}
              </div>
            </div>
  
            <div className="border-t pt-4 space-y-4">
              <Label className="mb-2 block">Quick Book</Label>
              <div className="space-y-4">
                <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {venue.timeSlots
                      .filter(slot => !slot.isOccupied)
                      .map((slot, index) => (
                        <SelectItem key={index} value={slot.time}>
                          {slot.time}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleBooking} 
                  disabled={!selectedSlot || !date} 
                  className="w-full"
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

// Main Component
const VenuePage = () => {
  const [date, setDate] = useState<Date>();
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredVenues = MOCK_VENUES.filter(venue => {
    if (selectedBlock !== 'all' && venue.block !== selectedBlock) return false;
    if (selectedType !== 'all' && venue.type !== selectedType) return false;
    return true;
  });

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Venue Reservation</h1>
          <p className="text-muted-foreground">Book venues for your events at Nirma University</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Section */}
          <Card className="w-full md:w-72 h-fit">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Block</Label>
                <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blocks</SelectItem>
                    <SelectItem value="A Block">A Block</SelectItem>
                    <SelectItem value="B Block">B Block</SelectItem>
                    <SelectItem value="C Block">C Block</SelectItem>
                    <SelectItem value="NIM Block">NIM Block</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Venue Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="auditorium">Auditorium</SelectItem>
                    <SelectItem value="ground">Ground</SelectItem>
                    <SelectItem value="seminar-hall">Seminar Hall</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Venues List */}
          <div className="flex-1">
            <Tabs defaultValue="grid" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
                <Badge variant="secondary" className="ml-2">
                  {filteredVenues.length} venues available
                </Badge>
              </div>

              <TabsContent value="grid" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVenues.map((venue) => (
                    <Card key={venue.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium text-lg">{venue.name}</h3>
                            <p className="text-sm text-muted-foreground">{venue.block}</p>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>Capacity: {venue.capacity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{venue.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {venue.timeSlots.filter(slot => !slot.isOccupied).length} slots available
                              </span>
                            </div>
                          </div>
                          <VenueDetailsSheet venue={venue} date={date} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                <ScrollArea className="h-[600px] rounded-md border">
                  <div className="divide-y">
                    {filteredVenues.map((venue) => (
                      <div key={venue.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-medium">{venue.name}</h3>
                              <p className="text-sm text-muted-foreground">{venue.block}</p>
                            </div>
                          </div>
                          <div className="flex gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>Capacity: {venue.capacity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{venue.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{venue.timeSlots.filter(slot => !slot.isOccupied).length} slots available</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="capitalize">
                            {venue.type}
                          </Badge>
                          <VenueDetailsSheet venue={venue} date={date} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VenuePage;