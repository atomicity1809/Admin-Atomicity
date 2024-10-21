"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlusIcon } from "lucide-react";
import { Layout } from "../Layout";
import { Client, Storage, ID } from "appwrite";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

// Interface for both Board and Executive Members
interface MemberDetails {
  _id: string;
  name: string;
  type: "board" | "executive";
  position?: string; // Optional for executive members
  profilePhoto: string | null;
  clerkId: string;
}

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || "";
const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKET_ID || "";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "";
const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
const storage = new Storage(client);

export function Users() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { user } = useUser();
  const [memberDetails, setMemberDetails] = useState<MemberDetails>({
    _id: "",
    name: "",
    clerkId: user?.id || "",
    type: "board",
    position: "",
    profilePhoto: null,
  });
  const [editMember, setEditMember] = useState<MemberDetails | null>(null);
  // const [editMember, setEditMember] = useState(0);

  // State for members
  const [boardMembers, setBoardMembers] = useState<MemberDetails[]>([]);
  const [executiveMembers, setExecutiveMembers] = useState<MemberDetails[]>([]);

  // Fetch members on component mount
  useEffect(() => {
    const reqBody = { adminId: user?.id };
    if (!reqBody.adminId) return;
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/getmembers", {
          method: "POST",
          body: JSON.stringify(reqBody),
        });
        const data = await response.json();

        // Set the fetched members to state
        if (response.ok) {
          setBoardMembers(data.boardMembers);
          setExecutiveMembers(data.executiveMembers);
        } else {
          console.error("Failed to fetch members:", data.message);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, [user]);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMemberDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Upload the file using storage API
        const response = await storage.createFile(BUCKET_ID, ID.unique(), file);

        // Get the file's viewable URL after successful upload
        const fileUrl = storage.getFileView(BUCKET_ID, response.$id).href;

        setMemberDetails((prev) => ({ ...prev, profilePhoto: fileUrl }));
      } catch (error) {
        console.error("Error uploading file:", error);
        // Handle file upload error
      }
    }
  };

  // Modify the handleSubmit function to handle both add and edit cases
  const handleSubmit = async () => {
    const submitUrl = "/api/addmember";
    console.log(editMember);
    memberDetails.clerkId = user?.id || "";
    if(!memberDetails.clerkId) return;

    try {
      const response = await fetch(submitUrl, {
        method: editMember ? "PUT" : "POST",
        body: JSON.stringify(memberDetails),
      });

      if (response.ok) {
        const updatedMember: MemberDetails = {
          ...memberDetails,
        };

        if (editMember) {
          // Update state for edited member
          setBoardMembers((prev) =>
            prev.map((member) =>
              member._id === updatedMember._id ? updatedMember : member
            )
          );
          setExecutiveMembers((prev) =>
            prev.map((member) =>
              member._id === updatedMember._id ? updatedMember : member
            )
          );
        } else {
          // Update state for newly added member
          if (updatedMember.type === "board") {
            setBoardMembers((prev) => [...prev, updatedMember]);
          } else {
            setExecutiveMembers((prev) => [...prev, updatedMember]);
          }
        }

        setIsPopupOpen(false);
        // Reset form
        setMemberDetails({
          _id: "",
          name: "",
          type: "board",
          position: "",
          profilePhoto: null,
          clerkId: "",
        });
        setEditMember(null); // Reset edit member
      } else {
        console.error("Failed to add/edit member");
      }
    } catch (error) {
      console.error("Error adding/editing member:", error);
    }
  };

  // Add this function to handle editing a member
  const handleEdit = (member: MemberDetails) => {
    setMemberDetails(member); // Populate the form with the selected member's data
    setIsPopupOpen(true); // Open the popup
    setEditMember(member); // Set the member to edit
  };

  // Add this function to handle deleting a member
  const handleDelete = async (memberId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member?"
    );
    if (confirmDelete) {
      try {
        const reqBody = {memberId: memberId}
        const response = await fetch(`/api/addmember`, {
          method: "DELETE",
          body: JSON.stringify(reqBody),
        });
        if (response.ok) {
          console.log("Member deleted successfully");
          // Remove the member from the respective state without refetching
          setBoardMembers((prev) =>
            prev.filter((member) => member._id !== memberId)
          );
          setExecutiveMembers((prev) =>
            prev.filter((member) => member._id !== memberId)
          );
        } else {
          console.error("Failed to delete member");
        }
      } catch (error) {
        console.error("Error deleting member:", error);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Club Members</h1>
          <Button onClick={togglePopup}>
            <UserPlusIcon className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
              <h2 className="text-xl font-semibold">Add New Member</h2>

              <div>
                <label className="block font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={memberDetails.name}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block font-medium">Type</label>
                <select
                  name="type"
                  value={memberDetails.type}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                >
                  <option value="board">Board Member</option>
                  <option value="executive">Executive Member</option>
                </select>
              </div>

              {memberDetails.type === "board" && (
                <div>
                  <label className="block font-medium">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={memberDetails.position}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                    placeholder="Enter position"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button onClick={togglePopup} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Add</Button>
              </div>
            </div>
          </div>
        )}
        {/* Display members */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Board Members</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boardMembers.map((member) => (
              <div
                key={member._id}
                className="border rounded p-4 flex flex-col items-center"
              >
                <Image
                  src={member.profilePhoto || "default-profile-photo-url.jpg"} // Default image if none
                  alt={member.name}
                  className="h-16 w-16 rounded-full mb-2"
                  height={100}
                  width={100}
                />
                <h3 className="font-bold">{member.name}</h3>
                <p className="text-gray-600">{member.position}</p>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEdit(member)}>Edit</Button>
                  <Button onClick={() => handleDelete(member._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold">Executive Members</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {executiveMembers.map((member) => (
              <div
                key={member._id}
                className="border rounded p-4 flex flex-col items-center"
              >
                <Image
                  src={member.profilePhoto || "default-profile-photo-url.jpg"} // Default image if none
                  alt={member.name}
                  className="h-16 w-16 rounded-full mb-2"
                  height={100}
                  width={100}
                />
                <h3 className="font-bold">{member.name}</h3>
                {member.position && (
                  <p className="text-gray-600">{member.position}</p>
                )}
                <div className="flex space-x-2">
                  <Button onClick={() => handleEdit(member)}>Edit</Button>
                  <Button onClick={() => handleDelete(member._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
