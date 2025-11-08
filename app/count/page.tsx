'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Upload from '../components/Upload';
import 'react-quill/dist/quill.snow.css';

const ManageProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    img: '',
    num: '', // ✅ Added new field
  });

  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    img: '',
    num: '', // ✅ Added new field
  });

  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/counter');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData), // ✅ num included automatically as string
    });

    if (res.ok) {
      setMessage('counter added successfully!');
      setFormData({
        title: '',
        img: '',
        num: '', // ✅ reset num
      });
      window.location.href = '/count';
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
      const res = await fetch(`/api/counter?id=${encodeURIComponent(editFormData.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setMessage('counter updated!');
        setEditMode(false);
        setEditFormData({
          id: '',
          title: '',
          img: '',
          num: '',
        });
        window.location.href = '/count';
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this counter?')) {
      try {
        const res = await fetch(`/api/counter?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMessage('counter deleted!');
          window.location.href = '/count';
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
    const stringValue = field === 'num' ? value.toString() : value; // ✅ num always stored as string
    editMode
      ? setEditFormData({ ...editFormData, [field]: stringValue })
      : setFormData({ ...formData, [field]: stringValue });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{editMode ? 'Edit counter' : 'Add counter'}</h1>

      <form onSubmit={editMode ? handleEditSubmit : handleSubmit} className="space-y-4">
        {/* Title */}
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

        {/* ✅ num field */}
        <div>
          <label className="block mb-1">Num</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={currentForm.num}
            onChange={(e) => updateField('num', e.target.value)}
            required
          />
        </div>

        {/* Image upload */}
        <div>
          <Upload onImagesUpload={(url) => updateField('img', url)} />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editMode ? 'Update counter' : 'Add counter'}
        </button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}

      <h2 className="text-xl font-bold mt-8">All Counts</h2>
      <table className="table-auto w-full border mt-4">
        <thead>
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Num</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((project) => (
              <tr key={project.id}>
                <td className="border p-2">{project.title}</td>
                <td className="border p-2">{project.num}</td>

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
            <tr><td colSpan={4} className="text-center p-4">No projects found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageProject;
