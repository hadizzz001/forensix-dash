'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';

const ManageProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    data: [], // <-- ARRAY OF {title, img}
  });

  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    description: '',
    data: [], // <-- ARRAY OF {title, img}
  });

  const [newItem, setNewItem] = useState({ title: '', img: '' }); // temp input for each item
  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/hwork');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const addItemToData = () => {
    if (!newItem.title || !newItem.img) return alert("Title & Image required");

    const updated = [...currentForm.data, newItem];

    updateField('data', updated);
    setNewItem({ title: '', img: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/hwork', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setMessage('hwork added successfully!');
      setFormData({
        title: '',
        description: '',
        data: [],
      });
      window.location.href = '/hwork';
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
    try {
      const res = await fetch(`/api/hwork/${encodeURIComponent(editFormData.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setMessage('hwork updated!');
        setEditMode(false);
        setEditFormData({
          id: '',
          title: '',
          description: '',
          data: [],
        });
        window.location.href = '/hwork';
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this hwork?')) {
      try {
        const res = await fetch(`/api/hwork/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMessage('hwork deleted!');
          window.location.href = '/hwork';
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
      <h1 className="text-2xl font-bold mb-4">
        {editMode ? 'Edit hwork' : 'Add hwork'}
      </h1>

      <form onSubmit={editMode ? handleEditSubmit : handleSubmit} className="space-y-4">
        {/* TITLE */}
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={currentForm.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="border p-2 w-full h-40"
            value={currentForm.description}
            onChange={(e) => updateField('description', e.target.value)}
            required
          ></textarea>
        </div>

        {/* ADD MULTIPLE ITEMS */}
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

          {/* Preview list */}
          {currentForm.data.length > 0 && (
            <ul className="mt-3 list-disc ml-5">
              {currentForm.data.map((d, i) => (
                <li key={i}>{d.title}</li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editMode ? 'Update hwork' : 'Add hwork'}
        </button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}

      {/* TABLE */}
      <h2 className="text-xl font-bold mt-8">All hworks</h2>

      <table className="table-auto w-full border mt-4">
        <thead>
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Archive</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {projects.length > 0 ? (
            projects.map((project) => (
              <tr key={project.id}>
                <td className="border p-2">{project.title}</td>
                <td className="border p-2">
                  {project.archive == null ? 'no' : project.archive}
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
              <td colSpan={3} className="text-center p-4">
                No hworks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageProject;
