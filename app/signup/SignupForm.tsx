"use client";
import React, { useState } from "react";
import { Client, Storage, ID } from "appwrite";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const OWNER_ID = "66c6d9bba15522307994e4bc";
const PROJECT_ID = "66ee5e29002deb03acf6";
const BUCKET_ID = "66ee5e4b001aa7d4bc64";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const storage = new Storage(client);

const SignupForm: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  // console.log(user);
  // Define the state for the form
  const [formData, setFormData] = useState({
    clubName: "",
    type: "tech",
    logo: "",
    // coverImage: "",
    // socialMediaLinks: [""], // Now it's an array of strings
    institute: "itnu",
    clerkId: user?.id || "",
    emailId: user?.emailAddresses[0]?.emailAddress || "",
  });

  // Handler for input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // console.log(name, value);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setFormData((prevFormData) => ({
      ...prevFormData,
      clerkId: user?.id || "",
      emailId: user?.emailAddresses[0]?.emailAddress || "",
    }));
    // console.log(formData);
  };

  // Handler for social media links changes
  // const handleSocialLinkChange = (
  //   index: number,
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const { value } = e.target;
  //   const newSocialLinks = [...formData.socialMediaLinks];
  //   newSocialLinks[index] = value; // Directly update the string value
  //   setFormData({ ...formData, socialMediaLinks: newSocialLinks });
  // };

  // Add a new social media link field
  // const addSocialMediaLink = () => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     socialMediaLinks: [...prevData.socialMediaLinks, ""], // Add an empty string for the new link
  //   }));
  // };

  // Remove social link
  // const removeSocialMediaLink = (index: number) => {
  //   const newSocialLinks = [...formData.socialMediaLinks];
  //   newSocialLinks.splice(index, 1);
  //   setFormData({ ...formData, socialMediaLinks: newSocialLinks });
  // };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
        const fileUrl = storage.getFileView(BUCKET_ID, response.$id).href;
        setFormData((prev) => ({ ...prev, [field]: fileUrl }));
      } catch (error) {
        console.error(`Error uploading ${field}: ok`, error);
      }
    }
  };

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormData((prevFormData) => ({
      ...prevFormData,
      clerkId: user?.id || "",
      emailId: user?.emailAddresses[0]?.emailAddress || "",
    }));
    // console.log("Form data:", formData);
    // console.log("line 94: ",user);

    const hasEmptyFields = Object.values(formData).some(
      (value) => value === ""
    );

    if (hasEmptyFields) {
      console.error("All fields must be filled.");
      // You can use a toast or any alert method to show the error
      return;
    }
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    console.log(response);

    if (response.status == 201) {
      console.log("req sent");
      // add toaster to show this message--------------------------------------------
      router.push("/dashboard");
    } else {
      console.log("Error");
    }
  };

  return (
    <div>
      <h1>Sign Up Form</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium">Club Name</label>
          <input
            type="text"
            name="clubName"
            value={formData.clubName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Type of club */}
        <div>
          <label className="block text-sm font-medium">Type of Club</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          >
            <option value="tech">Tech Club</option>
            <option value="non-tech">Non-Tech Club</option>
          </select>
        </div>

        {/* institute */}
        <div>
          <label className="block text-sm font-medium">Institute</label>
          <select
            name="institute"
            value={formData.institute}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          >
            <option value="itnu">ITNU</option>
            <option value="imnu">IMNU</option>
            <option value="ipnu">IPNU</option>
            <option value="ianu">IANU</option>
          </select>
        </div>
        {/* <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div> */}

        <div>
          <label htmlFor="logo">Logo: </label>
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "logo")}
          />
        </div>

        {/* <div>
          <label className="block text-sm font-medium">Logo URL</label>
          <input
            type="text"
            name="logo"
            value={formData.logo}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div> */}

        {/* <div>
          <label className="block text-sm font-medium">Cover Image URL</label>
          <input
            type="text"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div> */}

        {/* <div>
          <label htmlFor="coverImage">Cover Image: </label>
          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "coverImage")}
          />
        </div> */}

        {/* <div>
          <label className="block text-sm font-medium">
            Membership Form URL
          </label>
          <input
            type="text"
            name="membershipForm"
            value={formData.membershipForm}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div> */}

        {/* Social Media Links */}
        {/* <div>
          <label className="block text-sm font-medium">
            Social Media Links
          </label>
          {formData.socialMediaLinks.map((socialLink, index) => (
            <div key={index} className="space-y-2 flex items-center">
              <div className="flex-grow">
                <input
                  type="text"
                  name="socialMediaName"
                  placeholder="Social Media Name"
                  value={socialLink.socialMediaName}
                  onChange={(e) => handleSocialLinkChange(index, e)}
                  className="w-full px-4 py-2 border rounded-md"
                /> 
                <input
                  type="text"
                  name="socialMediaLink"
                  placeholder="Social Media Link"
                  value={socialLink.socialMediaLink}
                  onChange={(e) => handleSocialLinkChange(index, e)}
                  className="w-full px-4 py-2 border rounded-md mt-2"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSocialMediaLink(index)}
                className="ml-2 text-red-500"
              >
                🗑️
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSocialMediaLink}
            className="mt-2 text-blue-500"
          >
            Add another social media link
          </button>
        </div> */}

        {/* <div>
          <label className="block text-sm font-medium">Faculty Advisor</label>
          <input
            type="text"
            name="facultyAdvisor"
            value={formData.facultyAdvisor}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div> */}

        {/* <div>
          <label className="block text-sm font-medium">Website URL</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div> */}

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-md"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
