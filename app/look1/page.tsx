'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';

const ManageProject = () => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    img: '',
  });

  const [message, setMessage] = useState('');

  const fetchSingleProject = async () => {
    try {
      const res = await fetch('/api/look1');
      if (res.ok) {
        const data = await res.json();
        const firstItem = Array.isArray(data) && data.length > 0 ? data[0] : null;

        if (firstItem) {
          setFormData({
            id: firstItem.id || '',
            title: firstItem.title || '',
            description: firstItem.description || '',
            img: firstItem.img || '',
          });
        }
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchSingleProject();
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id) {
      setMessage('No record found to update.');
      return;
    }

    try {
      const res = await fetch(`/api/look1/${formData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Updated successfully!');
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="container mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">Edit Vision</h1>

      <form onSubmit={handleEditSubmit} className="space-y-4">

        {/* TITLE */}
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="border p-2 w-full h-40"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            required
          ></textarea>
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="block mb-1">Upload Image</label>
          <Upload onImagesUpload={(url) => updateField('img', url)} />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Vision
        </button>
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
};

export default ManageProject;
