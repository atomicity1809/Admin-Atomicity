"use client"

import React, { useState } from "react";
import { Client, Storage, ID } from "appwrite";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || "";
const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKET_ID || "";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "";

const client = new Client()
  .setEndpoint(API_ENDPOINT)
  .setProject(PROJECT_ID);

const storage = new Storage(client);

const SignupForm: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    clubName: "",
    type: "tech",
    logo: "",
    institute: "itnu",
    clerkId: user?.id || "",
    emailId: user?.emailAddresses[0]?.emailAddress || "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      clerkId: user?.id || "",
      emailId: user?.emailAddresses[0]?.emailAddress || "",
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
        const fileUrl = storage.getFileView(BUCKET_ID, response.$id).href;
        setFormData((prev) => ({ ...prev, logo: fileUrl }));
      } catch (error) {
        console.error("Error uploading logo:", error);
        setError("Failed to upload logo. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const hasEmptyFields = Object.values(formData).some((value) => value === "");
    if (hasEmptyFields) {
      setError("All fields must be filled.");
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        router.push("/pending-request");
      } else {
        throw new Error("Signup failed");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError("An error occurred during signup. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-start space-x-8 p-8">
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Sign Up Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clubName">Club Name</Label>
              <Input
                id="clubName"
                value={formData.clubName}
                onChange={(e) => handleInputChange("clubName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type of Club</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select club type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Tech Club</SelectItem>
                  <SelectItem value="non-tech">Non-Tech Club</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institute">Institute</Label>
              <Select
                value={formData.institute}
                onValueChange={(value) => handleInputChange("institute", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select institute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="itnu">ITNU</SelectItem>
                  <SelectItem value="imnu">IMNU</SelectItem>
                  <SelectItem value="ipnu">IPNU</SelectItem>
                  <SelectItem value="ianu">IANU</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={formData.logo} alt="Club Logo" />
              <AvatarFallback>{formData.clubName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{formData.clubName || "Club Name"}</h2>
            <div className="flex space-x-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                {formData.type === "tech" ? "Tech Club" : "Non-Tech Club"}
              </span>
              <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                {formData.institute.toUpperCase()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;