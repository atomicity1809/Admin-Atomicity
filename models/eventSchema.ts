import mongoose, { Document, Schema, Model } from 'mongoose';

interface IEvent extends Document {
  title: string;
  subtitle: string;
  description: string;
  date: Date;
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
  owner: string;
}

const eventSchema: Schema<IEvent> = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  time: { type: String, required: true },
  fees: { type: Number, required: true },
  maxAllowedParticipants: { type: Number, required: function() { return !this.noMaxParticipants; }, default: null },
  noMaxParticipants: { type: Boolean},
  coverImg: { type: String, required: true },
  detailImg: { type: String, required: true },
  supportFile: { type: String, required: true },
  visibility: { type: Boolean, required: true },
  isAvailableToReg: { type: Boolean, required: true },
  registeredUsers: [{ type: String}],
  owner: { type: String, required: true },
});

// Check if the model is already registered to avoid OverwriteModelError
const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export default Event;
