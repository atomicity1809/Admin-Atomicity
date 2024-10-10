"use client"

import React, { useState, useEffect } from 'react';
import { DataTable } from '../DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '../Layout';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  status: 'upcoming' | 'ongoing' | 'past';
}

const columns: ColumnDef<Event>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'attendees',
    header: 'Attendees',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
          status === 'ongoing' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
];

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Fetch events data here
    // For now, we'll use mock data
    const mockEvents: Event[] = [
      { id: '1', title: 'Tech Conference', date: '2023-08-15', location: 'San Francisco', attendees: 500, status: 'upcoming' },
      { id: '2', title: 'Hackathon', date: '2023-07-01', location: 'New York', attendees: 200, status: 'ongoing' },
      { id: '3', title: 'Workshop', date: '2023-06-20', location: 'London', attendees: 50, status: 'past' },
    ];
    setEvents(mockEvents);
  }, []);

  return (
    <Layout>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={events} />
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
}