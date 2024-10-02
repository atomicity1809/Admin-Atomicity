import mongoose, { Document, Schema } from "mongoose";

interface IBoardMember {
  position: string;
  userId: string;
}

const BoardMemberSchema = new Schema({
  position: { type: String, required: true },
  userId: { type: String, required: true },
});

interface IAdmin extends Document {
  clubName: string;
  type: string;
  pastEvents: string[];
  currentEvents: string[];
  boardMembersOfClub: IBoardMember[];
  executiveCommitteeMembers: string[];
  bio: string;
  logo: string;
  coverImage: string;
  membershipForm: string;
  socialMediaLinks: string[];
  facultyAdvisor: string;
  website: string;
  clerkId: string;
  emailId: string;
}

const adminSchema: Schema = new Schema<IAdmin>({
  clubName: { type: String, required: true },
  type: { type: String, required: true },
  pastEvents: { type: [String], default: [] },
  currentEvents: { type: [String], default: [] },
  boardMembersOfClub: { type: [BoardMemberSchema] },
  executiveCommitteeMembers: { type: [String], default: [] },
  bio: { type: String, default: "" },
  logo: { type: String, default: "", required: true },
  coverImage: { type: String, default: "" },
  membershipForm: { type: String, default: "" },
  socialMediaLinks: { type: [String], default: [] },
  facultyAdvisor: { type: String },
  website: { type: String, default: "" },
  clerkId: { type: String, required: true },
  emailId: { type: String, required: true },
});

const Admin = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", adminSchema);

export default Admin;
