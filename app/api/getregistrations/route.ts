import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Event from "@/models/eventSchema";
import User from "@/models/userSchema";

// to create one event
export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const body = await req.json();

    // Destructure data from the body
    const { eventId } = body;

    if (eventId == "undefined") {
      return NextResponse.json(
        { message: "Data insufficient" },
        { status: 500 }
      );
    }
    // Check if the combination of eventId and userId already exists
    const eventData = await Event.findOne({ _id: eventId });

    // Check if event exists
    if (!eventData) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const eventRegistrations = eventData.registeredUsers;
    console.log(eventRegistrations);
    const eventName = eventData.title;

    const userDetails = await Promise.all(
      eventRegistrations.map(async (clerkId: string) => {
        const user = await User.findOne({ clerkId: clerkId });

        // Return only required fields if the user exists
        if (user) {
          return {
            name: user.name,
            email: user.email,
            username: user.username,
            mobileNo: user.mobileNo,
            institute: user.institute,
          };
        } else {
          return {
            clerkId: clerkId,
            message: "User not found", // In case a user is missing
          };
        }
      })
    );

    return NextResponse.json(
      {
        eventName: eventName, // Add event name
        registrations: userDetails, // Return detailed user data
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error recording attendance:", error);

    // Return an error response
    return NextResponse.json(
      {
        message: "Error recording attendance",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
