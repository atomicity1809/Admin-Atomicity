import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Admin from "@/models/adminSchema";
import PendingAdminReq from "@/models/pendingAdminReq";
import { ObjectId } from "mongodb";

// GET request to check admin status based on Clerk ID
export async function GET(req: NextRequest) {
  await connectToDB(); // Connect to the database

  const { pathname } = new URL(req.url);
  const clerkId = pathname.split("/").pop(); // Extract Clerk ID from the URL
  console.log("Clerk id from frontend: ",clerkId,typeof(clerkId));

  try {
    if (!clerkId || clerkId == "undefined") {
      return NextResponse.json(
        { success: false, message: "Clerk ID is missing" },
        { status: 400 }
      );
    }

    // Check in the Admin table for the Clerk ID
    const adminUser = await Admin.findOne({ clerkId: clerkId });
    if (adminUser) {
      return NextResponse.json(
        { success: true, status: 3, message: "Admin request approved" },
        { status: 200 }
      );
    }

    // Check in the PendingAdminReq table if the user has a pending request
    const pendingRequest = await PendingAdminReq.findOne({ clerkId: clerkId });
    if (pendingRequest) {
      return NextResponse.json(
        { success: true, status: 2, message: "Admin request pending" },
        { status: 200 }
      );
    }

    // If the user is not found in either table, return status as not applied
    return NextResponse.json(
      { success: true, status: 1, message: "User has not applied for admin" },
      { status: 200 }
    );
  } catch (error) {
    // Handle errors
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}