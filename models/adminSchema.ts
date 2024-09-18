import mongoose, { Document, Schema } from 'mongoose';

interface IAdmin extends Document {
    clubName: string;
    presidentName: string;
    type: string;
    pastEvents: mongoose.Types.ObjectId[];
    currentEvents: mongoose.Types.ObjectId[];
    presidentMobileNo: string;
    rollNo: string;
    membersOfClub: mongoose.Types.ObjectId[];
}

const adminSchema: Schema = new Schema<IAdmin>({
    clubName: { type: String, required: true },
    presidentName: { type: String, required: true },
    type: { type: String, required: true },
    pastEvents: { type: [Schema.Types.ObjectId], ref: 'Event' },
    currentEvents: { type: [Schema.Types.ObjectId], ref: 'Event' },
    presidentMobileNo: { type: String, required: true },
    rollNo: { type: String, required: true },
    membersOfClub: { type: [Schema.Types.ObjectId], ref: 'User' }
});

const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;