// import { v2 as cloudinary } from 'cloudinary';

// // Configure your Cloudinary credentials
// cloudinary.config({
//   cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export const uploadToCloudinary = async (file: File) => {
//   const formData = new FormData();
//   formData.append('file', file);
//   formData.append('upload_preset', 'your_unsigned_upload_preset'); // Make sure to replace this with your Cloudinary preset

//   const response = await fetch(
//     `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
//     {
//       method: 'POST',
//       body: formData,
//     }
//   );

//   if (!response.ok) {
//     throw new Error('Cloudinary upload failed');
//   }

//   const data = await response.json();
//   return data.secure_url; // Return the uploaded image URL
// };
