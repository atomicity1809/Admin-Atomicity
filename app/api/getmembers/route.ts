import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import ClubMember from "@/models/members";


//to get all club members
export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const body = await req.json();

    const {adminId} = body;

    if (!adminId) {
      return NextResponse.json(
        { message: "Data insufficient" },
        { status: 500 }
      );
    }
    //console.log(adminId, typeof(adminId));

    // Check if the event exists
    const membersData = await ClubMember.find({ clerkId: adminId });


    if (!membersData || membersData.length === 0) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    //console.log(adminData);
    // Segregate members into board and executive based on type
    const boardMembers = membersData.filter(member => member.type === "board");
    const executiveMembers = membersData.filter(member => member.type === "executive");


    return NextResponse.json(
      {
        boardMembers,
        executiveMembers
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching members:", error);

    // Return an error response
    return NextResponse.json(
      {
        message: "Error fetching members",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
