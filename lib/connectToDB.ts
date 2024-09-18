import mongoose from 'mongoose';

let isConnected = false; // track the connection

export const connectToDB = async () => {
  mongoose.set('strictQuery', true);

  if(isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI as string)

    isConnected = true;
    console.log('----------------------------------------------------------------------------')
    console.log('------------------------MONGODB CONNECTED-----------------------------------')
    console.log('----------------------------------------------------------------------------')
  } catch (error) {
    console.log(error);
  }
}
