'use client'; 
import { useState, useEffect } from "react";

const Page = () => {
  const [allTemp, setTemp] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [filterClientName, setFilterClientName] = useState("");

  // Fetch API data from /api/order
  useEffect(() => {
    const fetchorders = async () => {
      const response = await fetch('/api/order');
      if (response.ok) {
        const data = await response.json();
        setTemp(data);
      } else {
        console.error('Failed to fetch orders');
      }
    };
    fetchorders();
  }, []);

  // Toggle row expansion
  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Delete order entry
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/order/${id}`, { method: "DELETE" });
      if (response.ok) {
        setTemp(allTemp.filter((item) => item.id !== id));
      } else {
        console.error("Failed to delete order entry");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Filtered data by name
  const filteredData = allTemp.filter((post) =>
    filterClientName === "" || post.name.toLowerCase().includes(filterClientName.toLowerCase())
  );

  return (
    <>
      {/* Right aligned filter */}
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
            <th></th>
            <th>Name</th>
            <th>Subject</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((post) => (
              <>
                <tr key={post.id}>
                  <td>
                    <button 
                      onClick={() => toggleRow(post.id)}
                      className="text-xs px-1 bg-gray-200 rounded"
                    >
                      {expandedRows[post.id] ? "▼" : "▶"}
                    </button>
                  </td>
                  <td>{post.name}</td>
                  <td>{post.subject}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="bg-red-500 text-white p-1 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                {expandedRows[post.id] && (
                  <tr>
                    <td></td>
                    <td colSpan={3} className="bg-gray-50 p-2 text-xs">
                      <div><strong>Email:</strong> {post.email}</div>
                      <div><strong>Phone:</strong> {post.phone}</div>
                      <div><strong>Location:</strong> {post.location}</div>
                      <div><strong>Date:</strong> {post.date || "N/A"}</div>
                      <div><strong>Time:</strong> {post.time || "N/A"}</div>
                      <div><strong>Message:</strong> {post.message}</div>
                    </td>
                  </tr>
                )}
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
