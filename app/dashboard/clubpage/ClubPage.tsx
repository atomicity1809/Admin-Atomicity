"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, PlusCircle, X, Loader, Eye } from "lucide-react"; // Import Loader for spinner icon
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Client, Storage, ID } from "appwrite";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Layout } from "../Layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ClubProfilePreview from "./ClubProfilePreview";

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || "";
const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKET_ID || "";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "";

const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
const storage = new Storage(client);

interface ClubData {
  coverImage: string;
  bio: string;
  membershipForm: string;
  socialMediaLinks: string[];
  facultyAdvisor: string;
  website: string;
  aboutUs: string;
  clubName: string;
  type: string;
  logo: string;
  emailId: string;
}

const ClubPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Form submission loading
  const [fileLoading, setFileLoading] = useState(false); // File upload loading
  const [dataLoading, setDataLoading] = useState(true);
  const { user } = useUser();

  const [clubData, setClubData] = useState<ClubData>({
    coverImage: "",
    bio: "",
    membershipForm: "",
    socialMediaLinks: [],
    facultyAdvisor: "",
    website: "",
    aboutUs: "",
    clubName: "",
    type: "",
    logo: "",
    emailId: "",
  });

  useEffect(() => {
    const fetchClubData = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/admin/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setClubData({
              coverImage: data.data.coverImage || "",
              bio: data.data.bio || "",
              membershipForm: data.data.membershipForm || "",
              socialMediaLinks: data.data.socialMediaLinks || [],
              facultyAdvisor: data.data.facultyAdvisor || "",
              website: data.data.website || "",
              aboutUs: data.data.aboutUs || "",
              clubName: data.data.clubName || "",
              type: data.data.type || "",
              logo: data.data.logo || "",
              emailId: data.data.emailId || "",
            });
          } else {
            toast.error("Failed to fetch club data");
          }
        } catch (error) {
          console.error("Error fetching club data:", error);
          toast.error("An error occurred while fetching club data");
        }finally{
          setDataLoading(false);
        }
      }
    };

    fetchClubData();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setClubData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialMediaLinksChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newLinks = [...clubData.socialMediaLinks];
    newLinks[index] = e.target.value;
    setClubData((prev) => ({ ...prev, socialMediaLinks: newLinks }));
  };

  const addSocialMediaLink = () => {
    setClubData((prev) => ({
      ...prev,
      socialMediaLinks: [...prev.socialMediaLinks, ""],
    }));
  };

  const removeSocialMediaLink = (index: number) => {
    const newLinks = [...clubData.socialMediaLinks];
    newLinks.splice(index, 1);
    setClubData((prev) => ({ ...prev, socialMediaLinks: newLinks }));
  };

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileLoading(true); // Start file upload loading
      try {
        const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
        const fileUrl = storage.getFileView(BUCKET_ID, response.$id).href;
        setClubData((prev) => ({ ...prev, [field]: fileUrl }));
        toast.success("File uploaded successfully");
      } catch (error) {
        console.error(`Error uploading ${field}:`, error);
        toast.error("Error in file upload. Please try again.");
      } finally {
        setFileLoading(false); // End file upload loading
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Start form submission loading

    try {
      const response = await fetch(`/api/admin/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clubData),
      });

      if (!response.ok) {
        throw new Error("Failed to update club information");
      }

      toast.success("Club information updated successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating club information:", error);
      toast.error("Failed to update club information");
    } finally {
      setIsLoading(false); // End form submission loading
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <ArrowLeft />
            </Link>
            <h2 className="text-2xl font-bold">Update Club Information</h2>
          </div>
          <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Club Profile Preview</DialogTitle>
                  <DialogDescription>
                    This is how your club profile will look to visitors.
                  </DialogDescription>
                </DialogHeader>
                <ClubProfilePreview clubData={clubData} />
              </DialogContent>
            </Dialog>
          {/* Cover Image */}
          <div>
            <Label htmlFor="coverImage">Cover Image</Label>
            {dataLoading ? (
              <Skeleton className="w-full h-32 mb-2" />
            ) : clubData.coverImage ? (
              <img
                src={clubData.coverImage}
                alt="Current cover image"
                className="w-full h-32 object-cover mb-2"
              />
            ) : null}
            <Input
              id="coverImage"
              name="coverImage"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "coverImage")}
              disabled={fileLoading || dataLoading}
            />
            {fileLoading && (
              <div className="flex items-center gap-2 text-sm">
                <Loader className="animate-spin" /> Uploading file...
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Club Bio</Label>
            {dataLoading ? (
              <Skeleton className="w-full h-24" />
            ) : (
              <Textarea
                id="bio"
                name="bio"
                value={clubData.bio}
                onChange={handleInputChange}
                rows={5}
                disabled={isLoading || dataLoading}
              />
            )}
          </div>

          {/* Membership Form */}
          <div>
            <Label htmlFor="membershipForm">Membership Form Link</Label>
            {dataLoading ? (
              <Skeleton className="w-full h-10" />
            ) : (
              <Input
                id="membershipForm"
                name="membershipForm"
                value={clubData.membershipForm}
                onChange={handleInputChange}
                placeholder="https://example.com/membership-form"
                disabled={isLoading || dataLoading}
              />
            )}
          </div>

          {/* Social Media Links */}
          <div>
            <Label>Social Media Links</Label>
            {dataLoading ? (
              <>
                <Skeleton className="w-full h-10 mb-2" />
                <Skeleton className="w-full h-10 mb-2" />
              </>
            ) : (
              clubData.socialMediaLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    value={link}
                    onChange={(e) => handleSocialMediaLinksChange(e, index)}
                    placeholder={`Social Media Link ${index + 1}`}
                    className="flex-grow"
                    disabled={isLoading || dataLoading}
                  />
                  <Button
                    type="button"
                    onClick={() => removeSocialMediaLink(index)}
                    className="px-2"
                    disabled={isLoading || dataLoading}
                  >
                    <X size={10} />
                  </Button>
                </div>
              ))
            )}
            <Button
              variant="outline"
              type="button"
              onClick={addSocialMediaLink}
              className="mt-2"
              disabled={isLoading || dataLoading}
            >
              <PlusCircle size={20} className="mr-2" /> Add Social Media Link
            </Button>
          </div>

          {/* Faculty Advisor */}
          <div>
            <Label htmlFor="facultyAdvisor">Faculty Advisor</Label>
            {dataLoading ? (
              <Skeleton className="w-full h-10" />
            ) : (
              <Input
                id="facultyAdvisor"
                name="facultyAdvisor"
                value={clubData.facultyAdvisor}
                onChange={handleInputChange}
                disabled={isLoading || dataLoading}
              />
            )}
          </div>

          {/* Website */}
          <div>
            <Label htmlFor="website">Website</Label>
            {dataLoading ? (
              <Skeleton className="w-full h-10" />
            ) : (
              <Input
                id="website"
                name="website"
                value={clubData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                disabled={isLoading || dataLoading}
              />
            )}
          </div>

          {/* About Us */}
          <div>
            <Label htmlFor="aboutUs">About Us</Label>
            {dataLoading ? (
              <Skeleton className="w-full h-24" />
            ) : (
              <Textarea
                id="aboutUs"
                name="aboutUs"
                value={clubData.aboutUs}
                onChange={handleInputChange}
                rows={5}
                disabled={isLoading || dataLoading}
              />
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading || fileLoading || dataLoading} 
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" /> Updating...
              </div>
            ) : dataLoading ? (
              <div className="flex items-center gap-2">
                <Loader className="animate-spin" /> Loading...
              </div>
            ) : (
              "Update Club Info"
            )}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default ClubPage;
