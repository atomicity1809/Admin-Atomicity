import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Attendance from "@/models/attendance";

// to create one event
export async function POST(req: NextRequest) {
  await connectToDB();
  try {
    await connectToDB();
    const body = await req.json();

    // Destructure data from the body
    const { eventId, userId, conf_number } = body;
    console.log("in backend: ", eventId, userId, conf_number);
    if (!eventId || !userId || !conf_number) {
      return NextResponse.json(
        { message: "Data insufficient" },
        { status: 500 }
      );
    }
    // Check if the combination of eventId and userId already exists
    const existingAttendance = await Attendance.findOne({ eventId, userId });
    if (existingAttendance) {
      return NextResponse.json(
        { message: "Attendance already marked for this event and user." },
        { status: 300 } // Return a 400 status for bad request
      );
    }

    // Create a new attendance record
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const timestamp = new Date(Date.now() + istOffset); // Get the IST timestamp

    const attendanceRecord = new Attendance({
      timestamp: timestamp,
      eventId: eventId,
      userId: userId,
      conf_number: conf_number,
    });

    // Save the attendance record to the database
    await attendanceRecord.save();

    // Return a success response
    return NextResponse.json(
      { message: "Attendance recorded successfully!" },
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
