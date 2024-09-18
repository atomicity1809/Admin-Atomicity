import mongoose, { Document, Schema } from 'mongoose';

interface IEventReg extends Document {
    eventId: mongoose.Types.ObjectId;
    regUsers: mongoose.Types.ObjectId[];
}

const eventRegSchema: Schema = new Schema<IEventReg>({
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    regUsers: { type: [Schema.Types.ObjectId], ref: 'User', required: true }
});

const EventReg = mongoose.model<IEventReg>('EventReg', eventRegSchema);

export default EventReg;