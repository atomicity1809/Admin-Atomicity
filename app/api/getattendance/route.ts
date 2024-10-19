import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Attendance from "@/models/attendance";
import User from "@/models/userSchema";

//to fetch attendance of an event
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
    const attendanceData = await Attendance.find({ eventId: eventId });
    console.log(attendanceData);

    if (!attendanceData) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const userIds = attendanceData.map((record) => record.userId);

    // Fetch user details from the User model
    const usersData = await User.find({ clerkId: { $in: userIds } });

    // Check if users exist
    if (!usersData || usersData.length === 0) {
      return NextResponse.json(
        { message: "No user details found" },
        { status: 404 }
      );
    }

    // Prepare the response data with user details
    const responseData = attendanceData.map((attendance) => {
      const user = usersData.find((user) => user.clerkId === attendance.userId);
      return {
        name: user?.name || "Unknown",
        email: user?.email || "Unknown",
        username: user?.username || "Unknown",
        mobileNo: user?.mobileNo || "Unknown",
        institute: user?.institute || "Unknown",
        timestamp: new Date(attendance.timestamp).toLocaleString(), // Convert timestamp to a readable format
        conf_number: attendance.conf_number || "N/A", // Default to "N/A" if conf_number is not present
      };
    });
    console.log(responseData);

    // Return the user details along with the event name
    return NextResponse.json({ attendance: responseData }, { status: 200 });
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
