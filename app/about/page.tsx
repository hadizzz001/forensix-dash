'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';

const ALLOWED_ID = "6919f3cba4938d48e0349fa2";

const ManageProject = () => {
  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    description: '',
    img: '',
  });

  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState([]);

  // Fetch only once
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/about');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);

        // Load ONLY the allowed ID into form
        const allowed = data.find((p) => p.id === ALLOWED_ID);
        if (allowed) {
          setEditFormData(allowed);
        } else {
          setMessage("The allowed ABOUT section was not found.");
        }
      } else {
        console.error('Failed to fetch');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // PATCH ONLY THIS ID
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (editFormData.id !== ALLOWED_ID) {
      setMessage("You are NOT allowed to edit this record.");
      return;
    }

    try {
      const res = await fetch(`/api/about/${ALLOWED_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setMessage('ABOUT section updated successfully!');
        window.location.href = '/about';
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateField = (field, value) => {
    setEditFormData({ ...editFormData, [field]: value });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit About Page Content</h1>

      {/* Only Edit Form */}
      <form onSubmit={handleEditSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={editFormData.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
          />
        </div>

        {/* Normal Textarea */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="border p-2 w-full h-40"
            value={editFormData.description}
            onChange={(e) => updateField('description', e.target.value)}
            required
          ></textarea>
        </div>

        {/* Upload Image */}
        <div>
          <label className="block mb-1">Upload Image</label>
          <Upload onImagesUpload={(url) => updateField('img', url)} />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Update About
        </button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}

  
    </div>
  );
};

export default ManageProject;
