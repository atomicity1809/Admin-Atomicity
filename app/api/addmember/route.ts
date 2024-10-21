import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import ClubMember from "@/models/members";

// to create one event
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const memberData = await req.json();
    const { _id, ...newMemberData } = memberData;
    console.log(newMemberData);

    // Create event with additional owner info
    const member = new ClubMember(newMemberData);
    console.log(member);

    await member.save();

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  await connectToDB();

  try {
    const memberData = await req.json();
    console.log(memberData);
    const { _id, __v, ...updateData } = memberData;
    console.log(updateData);
    console.log(_id, _id.length);
    if (!_id) {
      return NextResponse.json(
        { success: false, error: "Invalid id" },
        { status: 400 }
      );
    }

    // Find the member by ID and update with new data
    const updatedMember = await ClubMember.findByIdAndUpdate(_id, updateData, {
      new: true, // Return the updated member
      runValidators: true, // Run schema validation on updated data
    });

    if (!updatedMember) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedMember },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await connectToDB();

  try {
    const { memberId } = await req.json();
    console.log(memberId);
    if (!memberId) {
      return NextResponse.json(
        { success: false, message: "Member ID is required" },
        { status: 400 }
      );
    }

    // Find the member by ID and delete
    const deletedMember = await ClubMember.findByIdAndDelete(memberId);
    console.log(deletedMember);

    if (!deletedMember) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Member successfully deleted" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}
