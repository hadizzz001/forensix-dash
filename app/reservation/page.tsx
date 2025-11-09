'use client'; 
import ExportButton from "../components/ExportExcel";
import { useState, useEffect } from "react";

const Page = () => {
  const [allTemp, setTemp] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [filterClientName, setFilterClientName] = useState("");

  // Fetch API data from /api/work
  useEffect(() => {
    const fetchWorks = async () => {
      const response = await fetch('/api/work');
      if (response.ok) {
        const data = await response.json();
        setTemp(data);
      } else {
        console.error('Failed to fetch works');
      }
    };
    fetchWorks();
  }, []);

  // Toggle row expansion
  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Delete work entry
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/work/${id}`, { method: "DELETE" });
      if (response.ok) {
        setTemp(allTemp.filter((item) => item.id !== id));
      } else {
        console.error("Failed to delete work entry");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Filtered data by fullName
  const filteredData = allTemp.filter((post) =>
    filterClientName === "" || post.data.fullName.toLowerCase().includes(filterClientName.toLowerCase())
  );

  return (
    <>
      {/* Right aligned filter + export */}
      <div className="flex justify-end items-center mb-2 space-x-2 text-sm">
        <input
          type="text"
          value={filterClientName}
          onChange={(e) => setFilterClientName(e.target.value)}
          placeholder="Filter by Name"
          className="border p-1 text-xs"
        /> 
      </div>

      <table className="table table-striped container text-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Date</th>
            <th>Docs</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((post) => (
              <>
                <tr key={post.id}>
                  <td>{post.data.fullName}</td>
                  <td>{post.data.email}</td>
                  <td>{post.data.date}</td>
                  <td>
                    {post.data.cvUrl ? (
                      <a
                        href={post.data.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="myGray  underline text-xs"
                         
                      >
                        View Docs
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="bg-red-500 text-white p-1 text-xs"
                    >
                      Delete
                    </button> 
                  </td>
                </tr>

          
              </>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">
                No matching records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default Page;
