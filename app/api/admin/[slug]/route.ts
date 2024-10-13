import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Admin from "@/models/adminSchema";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  await connectToDB();

  const clerkId = params.slug; // The slug now represents the Clerk ID

  try {
    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: "Clerk ID is missing" },
        { status: 400 }
      );
    }

    // Fetch admin details from the database using the Clerk ID
    const adminDetails = await Admin.findOne({ clerkId: clerkId });

    if (!adminDetails) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Respond with the fetched admin details
    return NextResponse.json(
      { success: true, data: adminDetails },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin details:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  await connectToDB();

  const clerkId = params.slug; // The slug represents the Clerk ID

  try {
    if (!clerkId) {
      return NextResponse.json(
        { success: false, message: "Clerk ID is missing" },
        { status: 400 }
      );
    }

    const updatedData = await req.json();

    // Find the admin by clerkId and update all provided fields
    const updatedAdmin = await Admin.findOneAndUpdate(
      { clerkId: clerkId },
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Respond with the updated admin details
    return NextResponse.json(
      { success: true, data: updatedAdmin },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating admin details:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}