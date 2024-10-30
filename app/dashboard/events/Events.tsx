"use client"

import React, { useState, useEffect } from 'react';
import { Layout } from '../Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, Loader2 } from 'lucide-react';
import DataTable from './DataTable';
import { columns } from './columns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface Event {
  _id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  location: string;
  time: string;
  fees: number;
  maxAllowedParticipants: number;
  noMaxParticipants: boolean;
  coverImg: string;
  isAvailableToReg: boolean;
  clubName: string;
  eventType: string;
  registeredUsers: string[];
}

interface ClubInfo {
  clubName: string;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch(`/api/events/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        if (data.success) {
          setEvents(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, isLoaded]);

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  // Show loading state while checking authentication or fetching data
  if (!isLoaded || loading) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Show authentication required message if not authenticated
  if (!user) {
    return (
      <Layout>
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
          <h2 className="text-xl font-semibold">Authentication Required</h2>
          <p className="text-muted-foreground">Please sign in to view events</p>
          <Button onClick={() => router.push('/sign-in')}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Events</h1>
          </div>
          <Button onClick={handleCreateEvent}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Image
                    src="/empty-state.svg"
                    alt="No events"
                    width={200}
                    height={200}
                    className="mb-4"
                  />
                  <h3 className="text-lg font-semibold">No events found</h3>
                  <p className="text-muted-foreground">
                    Create your first event to get started
                  </p>
                  <Button
                    onClick={handleCreateEvent}
                    className="mt-4"
                    variant="outline"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={events.map(event => ({
                    id: event._id,
                    title: event.title,
                    date: new Date(event.date).toLocaleDateString(),
                    location: event.location,
                    registeredUsers: event.registeredUsers,
                    isAvailableToReg: event.isAvailableToReg
                  }))}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Events;