import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";


import { connectToDB } from "@/lib/connectToDB";
import Event from "@/models/eventSchema";

//to get all events of logged in club
export async function GET(req: NextRequest) {
  await connectToDB();
  const { pathname } = new URL(req.url);
//   console.log("pathname: ", pathname);
  const slug = pathname.split("/").pop();
//   console.log(slug);
  

  try {
    // const events = await Event.find({owner: new ObjectId("66c6d9bba15522307994e4bc")});
    const events = await Event.find({owner: slug});
    // console.log("club events: ",events);
    return NextResponse.json({ success: true, data: events }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}
