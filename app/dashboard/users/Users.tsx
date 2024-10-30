"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  UserPlusIcon, 
  Loader2, 
  Pencil, 
  Trash2, 
  Upload, 
  LayoutGrid, 
  List,
  MoreVertical 
} from "lucide-react";
import { Layout } from "../Layout";
import { Client, Storage, ID } from "appwrite";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MemberDetails {
  _id: string;
  name: string;
  type: "board" | "executive";
  position?: string;
  profilePhoto: string | null;
  clerkId: string;
}

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || "";
const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKET_ID || "";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "";
const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);
const storage = new Storage(client);

export function Users() {
  // State Management
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("board");
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
  const [boardMembers, setBoardMembers] = useState<MemberDetails[]>([]);
  const [executiveMembers, setExecutiveMembers] = useState<MemberDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [user]);

  const fetchMembers = async () => {
    const reqBody = { adminId: user?.id };
    if (!reqBody.adminId) return;
    
    try {
      const response = await fetch("/api/getmembers", {
        method: "POST",
        body: JSON.stringify(reqBody),
      });
      const data = await response.json();

      if (response.ok) {
        setBoardMembers(data.boardMembers);
        setExecutiveMembers(data.executiveMembers);
      } else {
        toast.error("Failed to fetch members");
      }
    } catch (error) {
      toast.error("Error fetching members");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setMemberDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
        const fileUrl = storage.getFileView(BUCKET_ID, response.$id).href;
        setMemberDetails((prev) => ({ ...prev, profilePhoto: fileUrl }));
        toast.success("Profile photo uploaded successfully");
      } catch (error) {
        toast.error("Failed to upload profile photo");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    memberDetails.clerkId = user?.id || "";
    if (!memberDetails.clerkId) return;

    try {
      const response = await fetch("/api/addmember", {
        method: editMember ? "PUT" : "POST",
        body: JSON.stringify(memberDetails),
      });

      if (response.ok) {
        toast.success(
          editMember ? "Member updated successfully" : "Member added successfully"
        );
        await fetchMembers();
        setIsOpen(false);
        resetForm();
      } else {
        toast.error("Failed to save member");
      }
    } catch (error) {
      toast.error("Error saving member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (member: MemberDetails) => {
    setMemberDetails(member);
    setEditMember(member);
    setIsOpen(true);
  };

  const handleDelete = async (memberId: string) => {
    setSelectedMember(memberId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    setIsDeleting(selectedMember);
    
    try {
      const response = await fetch(`/api/addmember`, {
        method: "DELETE",
        body: JSON.stringify({ memberId: selectedMember }),
      });
      
      if (response.ok) {
        toast.success("Member deleted successfully");
        await fetchMembers();
      } else {
        toast.error("Failed to delete member");
      }
    } catch (error) {
      toast.error("Error deleting member");
    } finally {
      setIsDeleting(null);
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleAddMember = () => {
    // Reset form state before opening
    resetForm();
    setIsOpen(true);
  };

  // Modify the resetForm function to be more thorough
  const resetForm = () => {
    setMemberDetails({
      _id: "",
      name: "",
      type: "board",
      position: "",
      profilePhoto: null,
      clerkId: user?.id || "",
    });
    setEditMember(null);
  };

  const MemberCard = ({ member }: { member: MemberDetails }) => (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleEdit(member)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(member._id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-col items-center pt-4">
        <div className="relative w-24 h-24 mb-4">
          <Image
            src={member.profilePhoto || "/placeholder-avatar.png"}
            alt={member.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <h3 className="font-semibold text-lg">{member.name}</h3>
        {member.position && (
          <p className="text-muted-foreground text-sm">{member.position}</p>
        )}
      </CardContent>
    </Card>
  );

  const MemberListItem = ({ member }: { member: MemberDetails }) => (
    <div className="flex items-center justify-between p-4 hover:bg-accent rounded-lg group">
      <div className="flex items-center gap-4">
        <Image
          src={member.profilePhoto || "/placeholder-avatar.png"}
          alt={member.name}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h3 className="font-semibold">{member.name}</h3>
          {member.position && (
            <p className="text-sm text-muted-foreground">{member.position}</p>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleEdit(member)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDelete(member._id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const MembersList = ({ members }: { members: MemberDetails[] }) => (
    <div className="space-y-2">
      {members.map((member) => (
        <MemberListItem key={member._id} member={member} />
      ))}
    </div>
  );

  const MembersGrid = ({ members }: { members: MemberDetails[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <MemberCard key={member._id} member={member} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Club Members</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleAddMember} size="lg">
              <UserPlusIcon className="mr-2 h-5 w-5" /> Add Member
            </Button>
          </div>
        </div>

        <Tabs defaultValue="board" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="board">Board Members</TabsTrigger>
            <TabsTrigger value="executive">Executive Members</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-6">
            {viewMode === "grid" ? (
              <MembersGrid members={boardMembers} />
            ) : (
              <MembersList members={boardMembers} />
            )}
          </TabsContent>

          <TabsContent value="executive" className="mt-6">
            {viewMode === "grid" ? (
              <MembersGrid members={executiveMembers} />
            ) : (
              <MembersList members={executiveMembers} />
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editMember ? "Edit Member" : "Add New Member"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  name="name"
                  value={memberDetails.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={memberDetails.type}
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: "type", value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select member type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="board">Board Member</SelectItem>
                    <SelectItem value="executive">Executive Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {memberDetails.type === "board" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Input
                    name="position"
                    value={memberDetails.position}
                    onChange={handleInputChange}
                    placeholder="Enter position"
                  />
                </div>
              )}

              <div className="space-y-2">
              <label className="text-sm font-medium">Profile Photo</label>
                <div className="flex items-center gap-4">
                  {memberDetails.profilePhoto && (
                    <Image
                      src={memberDetails.profilePhoto}
                      alt="Preview"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isUploading}
                    onClick={() =>
                      document.getElementById("photo-upload")?.click()
                    }
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Photo
                  </Button>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editMember ? "Save Changes" : "Add Member"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                member from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                {isDeleting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}