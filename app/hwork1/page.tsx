'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';

const FIXED_ID = "6920ccd25dac3d059619ff14";

const ManageProject = () => {
  const [editFormData, setEditFormData] = useState({
    id: FIXED_ID,
    title: '',
    description: '',
    data: [],
  });

  const [newItem, setNewItem] = useState({ title: '', img: '' });
  const [message, setMessage] = useState('');

  const loadFixedItem = async () => {
    try {
      const res = await fetch(`/api/hwork1/${FIXED_ID}`);
      if (res.ok) {
        const data = await res.json();
        setEditFormData({
          id: FIXED_ID,
          title: data.title || '',
          description: data.description || '',
          data: data.data || [],
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    loadFixedItem();
  }, []);

  const addItemToData = () => {
    if (!newItem.title || !newItem.img) {
      alert("Title & Image required");
      return;
    }

    const updated = [...editFormData.data, newItem];
    setEditFormData({ ...editFormData, data: updated });
    setNewItem({ title: '', img: '' });
  };

  // ✅ NEW: Remove item from data list
  const removeItemFromData = (index) => {
    const updated = editFormData.data.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, data: updated });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/hwork1/${FIXED_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setMessage('Updated successfully!');
        loadFixedItem();
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

      <h1 className="text-2xl font-bold mb-4">Edit Mission </h1>

      <form onSubmit={handleEditSubmit} className="space-y-4">

        {/* TITLE */}
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

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="border p-2 w-full h-40"
            value={editFormData.description}
            onChange={(e) => updateField('description', e.target.value)}
            required
          ></textarea>
        </div>

        {/* ITEMS */}
        <div className="border p-4">
          <h3 className="font-bold mb-2">Add Item (title + img)</h3>

          <input
            type="text"
            placeholder="Item title"
            className="border p-2 w-full mb-2"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          />

          <Upload
            onImagesUpload={(url) => setNewItem({ ...newItem, img: url })}
          />

          <button
            type="button"
            onClick={addItemToData}
            className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
          >
            Add to list
          </button>

          {/* PREVIEW WITH REMOVE BUTTON */}
          {editFormData.data.length > 0 && (
            <ul className="mt-3 list-disc ml-5">
              {editFormData.data.map((d, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>{d.title}</span>
                  <button
                    type="button"
                    onClick={() => removeItemFromData(i)}
                    className="ml-4 bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}

    </div>
  );
};

export default ManageProject;
