"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Layout } from "./Layout";
import DataTable from "./events/DataTable";
import { columns } from "./events/columns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, DownloadIcon, Mail, Globe, Users } from "lucide-react";
import StatCard from "./StatCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  registeredUsers: string[];
  isAvailableToReg: boolean;
  [key: string]: any;
}

interface ClubInfo {
  id: string;
  clubName: string;
  type: string;
  logo: string;
  emailId: string;
  bio: string;
  [key: string]: any;
}

const SkeletonStatCard = () => (
  <Card>
    <CardContent className="p-6">
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-10 w-1/3" />
    </CardContent>
  </Card>
);

const SkeletonClubInfo = () => (
  <Card className="mb-8 overflow-hidden">
    <div className="relative h-40 bg-purple-200 border-purple-500 border-2 rounded-xl">
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center space-x-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
    <CardContent className="pt-6 bg-slate-100">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const router = useRouter();
  const { user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [eventsResponse, clubInfoResponse] = await Promise.all([
          fetch(`/api/events/${user?.id}`),
          fetch(`/api/admindetails/${user?.id}`),
        ]);
        const eventsData = await eventsResponse.json();
        const clubInfoData = await clubInfoResponse.json();

        if (eventsData.success) {
          setEvents(eventsData.data);
        }
        if (clubInfoData.success) {
          setClubInfo(clubInfoData.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.isAvailableToReg).length;
  const totalRegistrations = events.reduce(
    (sum, event) => sum + event.registeredUsers.length,
    0
  );

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => {}}>
              <DownloadIcon className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={() => router.push("/create")}>
              <PlusIcon className="mr-2 h-4 w-4" /> Create Event
            </Button>
          </div>
        </div>

        {loading ? (
          <SkeletonClubInfo />
        ) : (
          clubInfo && (
            <Card className="mb-8 overflow-hidden">
              <div className="relative h-40 bg-purple-200 border-purple-500 border-2 rounded-xl">
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center space-x-4">
                  <Avatar className="h-24 w-24 border-4 border-white">
                    <AvatarImage src={clubInfo.logo} alt={clubInfo.clubName} />
                    <AvatarFallback className="text-2xl font-bold text-black">
                      {clubInfo.clubName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-3xl font-bold text-purple-500">
                      {clubInfo.clubName}
                    </h2>
                    <Badge variant="secondary" className="mt-2">
                      {clubInfo.type}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardContent className="pt-6 bg-slate-100">
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{clubInfo.emailId}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>{totalRegistrations} Members</span>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground">
                  {clubInfo.bio ||
                    "Welcome to our club! We're dedicated to fostering innovation and knowledge in electronics and communication."}
                </p>
              </CardContent>
            </Card>
          )
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {loading ? (
            <>
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </>
          ) : (
            <>
              <StatCard title="Total Events" value={totalEvents} />
              <StatCard title="Active Events" value={activeEvents} />
              <StatCard
                title="Total Registrations"
                value={totalRegistrations}
              />
            </>
          )}
        </div>

        {/* <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Events</CardTitle>
                <CardDescription>A list of all your events.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <DataTable columns={columns} data={events} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Events</CardTitle>
                <CardDescription>Currently active events.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={events.filter((event) => event.isAvailableToReg)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Events</CardTitle>
                <CardDescription>
                  Events that have already occurred.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={events.filter((event) => !event.isAvailableToReg)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs> */}
      </div>
    </Layout>
  );
}

export default Dashboard;