'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';

const ManageProject = () => {
  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    description: '',
    data: [],
  });

  const [newItem, setNewItem] = useState({ title: '', img: [] });
  const [message, setMessage] = useState('');

  const loadItem = async () => {
    try {
      const res = await fetch('/api/hwork');
      if (res.ok) {
        const data = await res.json();
        const firstItem = Array.isArray(data) && data.length > 0 ? data[0] : null;

        if (firstItem) {
          setEditFormData({
            id: firstItem.id || '',
            title: firstItem.title || '',
            description: firstItem.description || '',
            data: firstItem.data || [],
          });
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    loadItem();
  }, []);

  const getUploadedImage = (url) => Array.isArray(url) ? url[0] : url;
  const getUploadedImageArray = (url) => {
    const image = getUploadedImage(url);

    return image ? [image] : [];
  };
  const getItemImage = (img) => Array.isArray(img) ? img[0] : img;
  const hasItemImage = (img) => Boolean(getItemImage(img));

  const addItemToData = () => {
    if (!newItem.title || !hasItemImage(newItem.img)) {
      alert("Title & Image required");
      return;
    }

    const updated = [...editFormData.data, newItem];
    setEditFormData({ ...editFormData, data: updated });
    setNewItem({ title: '', img: [] });
  };

  // ✅ NEW: Remove item from data list
  const removeItemFromData = (index) => {
    const updated = editFormData.data.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, data: updated });
  };

  const updateDataItem = (index, field, value) => {
    const updated = editFormData.data.map((item, i) => (
      i === index ? { ...item, [field]: value } : item
    ));

    setEditFormData({ ...editFormData, data: updated });
  };

  const updateDataItemImage = (index, url) => {
    const image = getUploadedImageArray(url);

    if (image.length > 0) {
      updateDataItem(index, 'img', image);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.id) {
      setMessage('No record found to update.');
      return;
    }

    try {
      const res = await fetch(`/api/hwork/${editFormData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setMessage('Updated successfully!');
        loadItem();
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

      <h1 className="text-2xl font-bold mb-4">Manage hwork</h1>

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
            onImagesUpload={(url) => setNewItem({ ...newItem, img: getUploadedImageArray(url) })}
            multiple={false}
          />

          <button
            type="button"
            onClick={addItemToData}
            className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
          >
            Add to list
          </button>

          {/* EDIT ITEMS */}
          {editFormData.data.length > 0 && (
            <div className="mt-4 space-y-4">
              {editFormData.data.map((d, i) => (
                <div key={i} className="border rounded p-3">
                  <label className="block mb-1 font-semibold">Item {i + 1} Title</label>
                  <input
                    type="text"
                    className="border p-2 w-full mb-2"
                    value={d.title || ''}
                    onChange={(e) => updateDataItem(i, 'title', e.target.value)}
                  />

                  {hasItemImage(d.img) && (
                    <img src={getItemImage(d.img)} alt={d.title || `Item ${i + 1}`} className="w-28 h-20 object-cover rounded mb-2" />
                  )}

                  <Upload
                    onImagesUpload={(url) => updateDataItemImage(i, url)}
                    multiple={false}
                    label="Update Item Image"
                  />

                  <button
                    type="button"
                    onClick={() => removeItemFromData(i)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
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
