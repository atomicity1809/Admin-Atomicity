"use client";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import Attendance from "@/models/attendance";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

const AttendanceBlock = () => {
  const [data, setData] = useState("");
  const [isScanning, setIsScanning] = useState(false); // State to control camera visibility
  const pathname = usePathname();
  // console.log(pathname);
  const eventId = pathname.split("/")[2];
  // console.log(eventId);

  const handleScan = async (result: any) => {
    if (result && result.length > 0) {
      const scannedData = result[0].rawValue;
      console.log("Scanned Data:", scannedData); // Log the scanned data
      setData(scannedData); // Store the scanned data

      // Split the data into conf_number and userid
      const [conf_number, userId] = scannedData.split(",");
      if (!conf_number || !userId) return "Not found";

      // Prepare the request body
      const attendanceData = {
        eventId,
        userId,
        conf_number,
      };

      try {
        // Make a POST request to /takeattendance
        const response = await fetch("/api/takeattendance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attendanceData),
        });

        if (response.ok) {
          console.log("Attendance marked successfully!");
          toast.success("Attendance marked successfully!");
        } else {
          const errorData = await response.json(); // Get the error response
          console.error("Failed to mark attendance:", errorData.message);

          // Check if the message indicates attendance is already marked
          if (response.status === 300) {
            toast.error("Attendance already marked for this event and user.");
          } else if (response.status === 500) {
            toast.error("Data insufficient");

          } else {
            toast.error("Failed to mark attendance.");
          }
        }
      } catch (error) {
        console.error("Error in marking attendance:", error);
        toast.error("Error in marking attendance");
      }
    }
  };

  const handleError = (error: any) => {
    console.error("Error scanning QR code:", error);
  };

  const toggleScanner = () => {
    setIsScanning((prev) => !prev); // Toggle camera on/off
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Take Attendance</h1>
      <button
        onClick={toggleScanner}
        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        {isScanning ? "Close Camera" : "Take Attendance"}
      </button>

      {isScanning && (
        <div className="mt-6">
          <div className="w-64 h-64 border border-gray-300 rounded-lg overflow-hidden">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              formats={["qr_code"]}
              scanDelay={300}
              classNames={{
                container: "w-full h-full", // Use classNames instead of className
              }}
            />
          </div>
        </div>
      )}

      {isScanning && <p className="mt-4 text-lg">Scanned Data: {data}</p>}
    </div>
  );
};

export default AttendanceBlock;
