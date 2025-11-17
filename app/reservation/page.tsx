"use client";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Page = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: string }>({});

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/work");
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFeedbackChange = (id: string, value: string) => {
    setFeedbacks((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmitFeedback = async (id: string) => {
    const feedback = feedbacks[id] || "";
    try {
      const res = await fetch(`/api/work/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      if (res.ok) {
        alert("Feedback submitted!");
        setApplications((prev) =>
          prev.map((app) =>
            (app._id || app.id) === id
              ? { ...app, data: { ...app.data, feedback } }
              : app
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4 overflow-x-auto">
      <table className="w-full bg-white text-black rounded-xl shadow-lg border border-gray-200">
        <thead className="bg-[#0b2556] text-white">
          <tr>
            <th className="p-3 text-left">Document</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-center"> </th>
          </tr>
        </thead>

        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-700">
                No applications found.
              </td>
            </tr>
          ) : (
            applications.map((app, index) => {
              // ✅ FIX: safe unique row ID
              const rowId = app._id || app.id || index.toString();

              const isExpanded = expandedRows[rowId];

              return (
                <React.Fragment key={rowId}>
                  {/* MAIN ROW */}
                  <tr
                    className={`cursor-pointer transition-all ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-200`}
                    onClick={() => toggleRow(rowId)}
                  >
                    <td className="p-3 break-words">
                      {app.data.cvUrl ? (
                        <a
                          href={app.data.cvUrl}
                          target="_blank"
                          className="text-black underline break-all"
                        >
                          View Document
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>

                    <td className="p-3">{app.data.date}</td>

                    <td className="p-3 text-center">
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </td>
                  </tr>

{/* EXPANDED ROW */}
{isExpanded && (
  <tr
    className="bg-gray-100 border-t border-gray-300"
    onClick={(e) => e.stopPropagation()} // prevent toggle
  >
    <td colSpan={3} className="p-4 flex flex-col gap-3">
      <p className="max-w-[80ch] break-words whitespace-pre-line">
        <strong>Note:</strong> {app.data.note || "-"}
      </p>

      <div className="flex flex-col gap-1 max-w-[80ch]">
        <label className="font-semibold">Feedback:</label>
        <textarea
          value={feedbacks[rowId] || app.data.feedback || ""}
          onChange={(e) => handleFeedbackChange(rowId, e.target.value)}
          className="border p-2 rounded w-full text-sm resize-y"
          placeholder="Enter feedback"
          rows={4} // default height
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSubmitFeedback(rowId);
          }}
          className="bg-green-500 text-white p-2 rounded w-32 text-sm mt-1"
        >
          Submit
        </button>
      </div>
    </td>
  </tr>
)}

                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
