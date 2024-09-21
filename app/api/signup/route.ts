import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import PendingAdminReq from "@/models/pendingAdminReq";

import { connectToDB } from "@/lib/connectToDB";
import Event from "@/models/eventSchema";

//send data in pendin req
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const data = await req.json();
    const pendingReq = new PendingAdminReq(data);
    await pendingReq.save();
    return NextResponse.json(
      { success: true, data: pendingReq },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}
