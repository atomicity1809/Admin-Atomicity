import mongoose, { Document, Schema } from "mongoose";

interface ClubMember extends Document {
    clerkId: string;
  type: string;
  name: string;
  position: string;
  profilePhoto: string;
}

const clubMemberSchema: Schema = new Schema<ClubMember>({
  clerkId: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  position: { type: String},
  profilePhoto: { type: String, required: true },
  
});

const ClubMember = mongoose.models.ClubMember || mongoose.model<ClubMember>("ClubMember", clubMemberSchema);

export default ClubMember;
