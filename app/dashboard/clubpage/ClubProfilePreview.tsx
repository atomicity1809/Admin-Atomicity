import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Facebook, Twitter, Instagram, Linkedin, Globe, Mail, Radio } from 'lucide-react';

interface ClubData {
  clubName: string;
  type: string;
  bio: string;
  logo: string;
  coverImage: string;
  membershipForm: string;
  socialMediaLinks: string[];
  facultyAdvisor: string;
  website: string;
  emailId: string;
}

interface ClubProfilePreviewProps {
  clubData: ClubData;
}

const getSocialIcon = (link: string) => {
  if (link.includes('facebook')) return <Facebook className="h-4 w-4" />;
  if (link.includes('twitter')) return <Twitter className="h-4 w-4" />;
  if (link.includes('instagram')) return <Instagram className="h-4 w-4" />;
  if (link.includes('linkedin')) return <Linkedin className="h-4 w-4" />;
  return <Radio className="h-4 w-4" />;
};

const ClubProfilePreview: React.FC<ClubProfilePreviewProps> = ({ clubData }) => {
  return (
    <div className="bg-gray-100">
      <div className="relative h-64">
        <Image
          src={clubData.coverImage || "/api/placeholder/1200/400"}
          alt={`${clubData.clubName} cover`}
          layout="fill"
          objectFit="cover"
        />
      </div>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={clubData.logo || "/api/placeholder/100"} alt={clubData.clubName} />
                <AvatarFallback>{clubData.clubName}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{clubData.clubName}</h1>
                <p className="text-xl text-gray-600">{clubData.type}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-700">{clubData.bio}</p>
            </div>
            
            <div className="mt-6 flex space-x-4">
              {clubData.socialMediaLinks.map((link, index) => (
                <Button key={index} variant="outline" size="icon" asChild>
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    {getSocialIcon(link)}
                  </a>
                </Button>
              ))}
              <Button variant="outline" size="icon" asChild>
                <a href={clubData.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={`mailto:${clubData.emailId}`}>
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="join">Join Us</TabsTrigger>
            </TabsList>
            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{clubData.bio}</p>
                  <p><strong>Faculty Advisor:</strong> {clubData.facultyAdvisor}</p>
                  <p><strong>Website:</strong> <a href={clubData.website} className="text-blue-600 hover:underline">{clubData.website}</a></p>
                  <p><strong>Email:</strong> {clubData.emailId}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>No events available in preview mode.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Club Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Member information not available in preview mode.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="join">
              <Card>
                <CardHeader>
                  <CardTitle>Join Our Club</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Interested in joining {clubData.clubName}? Fill out our membership form to get started!</p>
                  <Button asChild>
                    <a href={clubData.membershipForm} target="_blank" rel="noopener noreferrer">
                      Open Membership Form
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ClubProfilePreview;