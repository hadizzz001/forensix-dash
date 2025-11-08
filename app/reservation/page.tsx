'use client';
import ExportButton from "../components/ExportExcel";
import { useState, useEffect } from "react";

const Page = () => {
  const [allTemp, setTemp] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [filterClientName, setFilterClientName] = useState("");

  // Fetch API data
  useEffect(() => {
    const fetchOrders = async () => {
      const response = await fetch('/api/order');
      if (response.ok) {
        const data = await response.json();
        setTemp(data);
      } else {
        console.error('Failed to fetch orders');
      }
    };
    fetchOrders();
  }, []);

  // Toggle row expansion
  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Delete order
  const handleDeleteOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/order/${id}`, { method: "DELETE" });
      if (response.ok) {
        setTemp(allTemp.filter((order) => order.id !== id));
      } else {
        console.error("Failed to delete order");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Filtered data (only by client name)
  const filteredData = allTemp.filter((post) =>
    filterClientName === "" || post.name.toLowerCase().includes(filterClientName.toLowerCase())
  );

  return (
    <>
      {/* Right aligned filter + export */}
      <div className="flex justify-end items-center mb-2 space-x-2 text-sm">
        <input
          type="text"
          value={filterClientName}
          onChange={(e) => setFilterClientName(e.target.value)}
          placeholder="Filter by Client Name"
          className="border p-1 text-xs"
        />
        <ExportButton allTemp={allTemp} className="text-xs p-1" />
      </div>

      <table className="table table-striped container text-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((post) => (
              <>
                <tr key={post.id}>
                  <td>{post.name}</td>
                  <td>{post.cat}</td>
                  <td>{post.date}</td>
                  <td className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteOrder(post.id)}
                      className="bg-red-500 text-white p-1 text-xs"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => toggleRow(post.id)}
                      className="text-xs p-1 border rounded"
                    >
                      {expandedRows[post.id] ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>

                {/* Expanded row */}
                {expandedRows[post.id] && (
                  <tr className="bg-gray-100">
                    <td colSpan={4} className="text-xs p-2">
                      <div><strong>Email:</strong> {post.email}</div>
                      <div><strong>Phone:</strong> {post.phone}</div>
                      <div><strong>Location:</strong> {post.location}</div>
                      <div><strong>Subject:</strong> {post.subject}</div>
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
