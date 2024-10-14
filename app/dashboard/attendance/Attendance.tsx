"use client"

import React, { useState, useEffect } from 'react';
import { useZxing } from "react-zxing";

interface UserDetails {
  name: string;
  email: string;
  eventName: string;
  confirmationNumber: string;
}

const Attendance: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const { ref } = useZxing({
    onDecodeResult(result) {
      setScanResult(result.getText());
      setIsScanning(false);
    },
    onError(error) {
      console.error("Scanner error:", error);
      setError("Error scanning QR code. Please try again.");
      setIsScanning(false);
    },
  });

  useEffect(() => {
    if (scanResult) {
      fetchUserDetails(scanResult);
    }
  }, [scanResult]);

  const fetchUserDetails = async (confirmationNumber: string) => {
    try {
      setError(null);
      // Simulating API call
      setTimeout(() => {
        const mockUserDetails: UserDetails = {
          name: "John Doe",
          email: "john@example.com",
          eventName: "Tech Conference 2023",
          confirmationNumber: confirmationNumber
        };
        setUserDetails(mockUserDetails);
      }, 1000);
    } catch (error) {
      setError('Failed to fetch user details. Please try again.');
      setUserDetails(null);
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setScanResult(null);
    setUserDetails(null);
    setError(null);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Event Attendance</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Scan QR Code</h2>
        {!isScanning ? (
          <button 
            onClick={handleStartScanning}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Start Scanning
          </button>
        ) : (
          <div className="w-full max-w-sm mx-auto">
            <video ref={ref} className="w-full" />
            <button 
              onClick={handleStopScanning}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2"
            >
              Stop Scanning
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {userDetails && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <h2 className="text-xl font-semibold mb-2">Attendee Details</h2>
          <p><strong>Name:</strong> {userDetails.name}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Event:</strong> {userDetails.eventName}</p>
          <p><strong>Confirmation Number:</strong> {userDetails.confirmationNumber}</p>
        </div>
      )}
    </div>
  );
};

export default Attendance;