'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';

export default function ManageTeam() {

  const [team, setTeam] = useState([]);        // List all team members
  const [editingId, setEditingId] = useState(null); // ID of the item being edited

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    img: '',
  });

  const [message, setMessage] = useState('');

  // Fetch all team members
  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      setTeam(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // When clicking edit
  const startEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      description: item.description,
      img: item.img,
    });
  };

  // Delete item
  const deleteItem = async (id) => {
    if (!confirm("Delete this team member?")) return;

    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("Deleted successfully");
        window.location.replace("/team");
      } else {
        setMessage("Delete failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle add/update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId ? `/api/team/${editingId}` : `/api/team`;
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage(editingId ? "Updated successfully!" : "Created successfully!");
        setFormData({ title: '', description: '', img: '' });
        setEditingId(null);
        window.location.replace("/project");
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">
        {editingId ? "Edit Team Member" : "Add Team Member"}
      </h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* TITLE */}
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="border p-2 w-full h-40"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          ></textarea>
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="block mb-1">Upload Image</label>
          <Upload onImagesUpload={(url) => setFormData({...formData, img: url})} />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? "Update" : "Create"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({ title: '', description: '', img: '' });
            }}
            className="ml-3 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel Edit
          </button>
        )}
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}

      {/* LIST ALL TEAM MEMBERS */}
      <h2 className="text-xl font-bold mt-8 mb-4">Team List</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {team.map((item) => (
          <div key={item._id} className="border p-3 rounded shadow">
            <img src={item.img} className="w-full h-40 object-cover rounded" />

            <h3 className="font-semibold mt-2">{item.title}</h3>
            <p className="text-sm mt-1">{item.description}</p>

            <div className="flex gap-2 mt-3">
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded"
                onClick={() => startEdit(item)}
              >
                Edit
              </button>

              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => deleteItem(item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
