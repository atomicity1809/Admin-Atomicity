import mongoose, { Document, Schema } from "mongoose";

// Attendance Schema
interface Attendance extends Document {
  timestamp: Date;
  eventId: string;
  userId: string;
  conf_number: string;
}

const attendanceSchema: Schema<Attendance> = new Schema<Attendance>({
  timestamp: { type: Date, default: Date.now },
  eventId: { type: String, required: true },
  userId: { type: String, required: true },
  conf_number: { type: String, required: true },
});

const Attendance =
  mongoose.models.Attendance ||
  mongoose.model<Attendance>("Attendance", attendanceSchema);

export default Attendance;
