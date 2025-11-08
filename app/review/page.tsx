'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
 

// ⭐ Clickable Star Component
const StarRating = ({ value, onChange }) => {
  return (
    <div className="flex space-x-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map((num) => (
        <span
          key={num}
          onClick={() => onChange(String(num))} // SAVE as STRING
          className={`text-3xl ${
            num <= Number(value) ? "text-yellow-400" : "text-gray-400"
          } hover:text-yellow-500 transition`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ManageProject = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stars: '0', // ⭐ renamed
  });

  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    description: '',
    stars: '0',
  });

  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/review');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch Review');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setMessage('Review added successfully!');
      setFormData({ name: '', description: '', stars: '0' });
      fetchProjects();
    } else {
      const errorData = await res.json();
      setMessage(`Error: ${errorData.error}`);
    }
  };

  const handleEdit = (project) => {
    setEditMode(true);
    setEditFormData({ ...project });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/review?id=${encodeURIComponent(editFormData.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFormData),
    });

    if (res.ok) {
      setMessage('Review updated!');
      setEditMode(false);
      setEditFormData({ id: '', name: '', description: '', stars: '0' });
      fetchProjects();
    } else {
      const errorData = await res.json();
      setMessage(`Error: ${errorData.error}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this Review?')) {
      try {
        const res = await fetch(`/api/review?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) {
          setMessage('Review deleted!');
          fetchProjects();
        } else {
          const errorData = await res.json();
          setMessage(`Error: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const currentForm = editMode ? editFormData : formData;
  const updateField = (field, value) => {
    editMode
      ? setEditFormData({ ...editFormData, [field]: value })
      : setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{editMode ? 'Edit Review' : 'Add Review'}</h1>

      {/* FORM */}
      <form onSubmit={editMode ? handleEditSubmit : handleSubmit} className="space-y-4">

        {/* Name */}
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={currentForm.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="border p-2 w-full"
            rows="4"
            value={currentForm.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>

        {/* ⭐ STARS (CLICKABLE) */}
        <div>
          <label className="block mb-1">Stars</label>
          <StarRating
            value={currentForm.stars}
            onChange={(newStars) => updateField("stars", newStars)}
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editMode ? 'Update Review' : 'Add Review'}
        </button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}

      {/* TABLE */}
      <h2 className="text-xl font-bold mt-8">All Reviews</h2>

      <table className="table-auto w-full border mt-4">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Stars</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {projects.length > 0 ? (
            projects.map((project) => (
              <tr key={project.id}>
                <td className="border p-2">{project.name}</td>
                <td className="border p-2">{project.description}</td>

                {/* ⭐ Show stars in table */}
                <td className="border p-2">
                  {"★".repeat(parseInt(project.stars || "0"))}
                </td>

                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleEdit(project)}
                    className="bg-yellow-500 text-white px-3 py-1 mr-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center p-4">No Reviews found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageProject;
