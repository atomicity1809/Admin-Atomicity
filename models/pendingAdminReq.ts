import mongoose, { Document, Schema } from "mongoose";

interface PendingAdminReq extends Document {
  clubName: string;
  type: string;
  logo: string;
  institute: string;
  clerkId: string;
  emailId: string;
}

const PendingAdminReqSchema: Schema = new Schema<PendingAdminReq>({
  clubName: { type: String, required: true },
  type: { type: String, required: true },
  logo: { type: String, default: "", required: true },
  institute: { type: String, default: "", required: true },
  clerkId: { type: String, default: "", required: true },
  emailId: { type: String, default: "", required: true },
});

const PendingAdminReq =
  mongoose.models.PendingAdminReq ||
  mongoose.model<PendingAdminReq>("PendingAdminReq", PendingAdminReqSchema);

export default PendingAdminReq;
