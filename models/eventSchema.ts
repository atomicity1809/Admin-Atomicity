import mongoose, { Document, Schema, Model } from "mongoose";

interface IEvent extends Document {
  title: string;
  subtitle: string;
  description: string;
  date: Date;
  mode: string;
  location: string;
  time: string;
  fees: number;
  maxAllowedParticipants: number;
  noMaxParticipants: boolean;
  coverImg: string;
  detailImg: string;
  supportFile: string;
  visibility: boolean;
  isAvailableToReg: boolean;
  registeredUsers: string[];
  ownerId: string;
  tags: string[]; // New field
  categories: string[]; // New field
  likeCounter: number; // New field
  registrationOpenTill: Date; // New field
  additionalInfo: string; // New field
}

const eventSchema: Schema<IEvent> = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  mode: { type: String, required: true },
  location: {
    type: String,
    required: function () {
      return this.mode === "online" ? false : true;
    },
    default: "",
  },
  time: { type: String, required: true },
  fees: { type: Number, required: true },
  maxAllowedParticipants: {
    type: Number,
    required: function () {
      return !this.noMaxParticipants;
    },
    default: -1,
  },
  noMaxParticipants: { type: Boolean },
  coverImg: { type: String, required: true },
  detailImg: { type: String, required: true },
  supportFile: { type: String, required: true },
  visibility: { type: Boolean, required: true },
  isAvailableToReg: { type: Boolean, required: true },
  registeredUsers: [{ type: String }],
  ownerId: { type: String, required: true },
  tags: [{ type: String }], // New field
  categories: [{ type: String }], // New field
  likeCounter: { type: Number, default: 0 }, // New field
  registrationOpenTill: { type: Date }, // New field
  additionalInfo: { type: String }, // New field
});

// Check if the model is already registered to avoid OverwriteModelError
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;
