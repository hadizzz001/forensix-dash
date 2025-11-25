'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';

export default function ManageProject() {

  const [projects, setProjects] = useState([]);        // List all projects
  const [editingId, setEditingId] = useState(null);    // ID of editing item

  const [formData, setFormData] = useState({
    title: '',
    img: '',
  });

  const [message, setMessage] = useState('');

  // Load all projects
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/part');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fill form when editing
  const startEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      img: item.img,
    });
  };

  // Delete a project
  const deleteItem = async (id) => {
    if (!confirm("Delete this item?")) return;

    try {
      const res = await fetch(`/api/part/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("Deleted successfully");
        fetchProjects();
      } else {
        setMessage("Delete failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit create or update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId ? `/api/part/${editingId}` : `/api/part`;
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage(editingId ? "Updated successfully!" : "Created successfully!");
        setFormData({ title: '', img: '' });
        setEditingId(null);
        fetchProjects();
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
        {editingId ? "Edit Project" : "Add Project"}
      </h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

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
              setFormData({ title: '', img: '' });
            }}
            className="ml-3 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel Edit
          </button>
        )}
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}

      {/* LIST ALL PROJECTS */}
      <h2 className="text-xl font-bold mt-8 mb-4">All Projects</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((item) => (
          <div key={item._id} className="border p-3 rounded shadow">
            <img src={item.img} className="w-full h-40 object-cover rounded" />

            <h3 className="font-semibold mt-2">{item.title}</h3>

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
