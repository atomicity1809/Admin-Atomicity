import { NextResponse,NextRequest } from 'next/server';

import { connectToDB } from '@/lib/connectToDB';
import Event from '@/models/eventSchema';

// to create one event
export async function POST(req:NextRequest) {
    await connectToDB();

    try {
        const data = await req.json();
        const event = new Event(data);
        await event.save();
        return NextResponse.json({ success: true, data: event }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}

// to get all events
export async function GET(req:NextRequest) {
    await connectToDB();

    try {
        const events = await Event.find({});
        // console.log(events);
        return NextResponse.json({ success: true, data: events }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
}
