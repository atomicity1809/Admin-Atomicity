import { NextResponse, NextRequest } from 'next/server';
import { connectToDB } from '@/lib/connectToDB';
import Event from '@/models/eventSchema';
import Admin from '@/models/adminSchema';

// to create one event
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const eventData = await req.json();
    const { ownerId } = eventData; // Extract ownerId from the incoming data

    // Fetch owner information using ownerId
    const owner = await Admin.find({clerkId: ownerId});
    console.log(owner);

    if (!owner) {
      return NextResponse.json({ success: false, error: 'Owner not found' }, { status: 404 });
    }

    // Create event with additional owner info
    const event = new Event({
      ...eventData,
      ownerName: owner[0].clubName, // Assuming the owner has a 'name' field
      ownerLogo: owner[0].logo, // Assuming the owner has a 'logo' field
    });

    await event.save();

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
