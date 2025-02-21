"use client";
import { getOrdersHistory, useOkto } from "@okto_web3/react-sdk";
import { useState } from "react";

const CheckJobStatus = () => {
  const [jobId, setJobId] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const oktoClient = useOkto();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobId(e.target.value);
  };

  const checkJobStatus = async () => {
    if (!jobId) {
      alert("Please enter a JobId.");
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
        const status= await getOrdersHistory(oktoClient,  {
            intentId: jobId,
            intentType: "TOKEN_TRANSFER"
        });
        console.log("status of order history", status);
    } catch (error) {
      setStatus("Failed to fetch status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Check Job Status</h3>
      <div>
        <input
          type="text"
          placeholder="Enter the JobId"
          value={jobId}
          onChange={handleInputChange}
        />
        <button onClick={checkJobStatus} disabled={loading}>
          {loading ? "Checking..." : "Check Status"}
        </button>
      </div>

      {status && (
        <div>
          <h4>Job Status:</h4>
          <p>{status}</p>
        </div>
      )}
    </div>
  );
};

export default CheckJobStatus;