'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';

const ManageProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    img: '',
  });

  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    description: '',
    img: '',
  });

  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/about');
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
    const res = await fetch('/api/about', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setMessage('about added successfully!');
      setFormData({
        title: '',
        description: '',
        img: '',
      });
      window.location.href = '/about';
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
      const res = await fetch(`/api/about/${encodeURIComponent(editFormData.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setMessage('about updated!');
        setEditMode(false);
        setEditFormData({
          id: '',
          title: '',
          description: '',
          img: '',
        });
        window.location.href = '/about';
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this about?')) {
      try {
        const res = await fetch(`/api/about/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMessage('about deleted!');
          window.location.href = '/about';
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
        {editMode ? 'Edit about' : 'Add about'}
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

        {/* NORMAL TEXTBOX DESCRIPTION */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="border p-2 w-full h-40"
            value={currentForm.description}
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
          {editMode ? 'Update about' : 'Add about'}
        </button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}

      {/* TABLE OF aboutS */}
      <h2 className="text-xl font-bold mt-8">All abouts</h2>

      <table className="table-auto w-full border mt-4">
        <thead>
          <tr>
            <th className="border p-2">Title</th>
            {/* Author removed */}
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
                No abouts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageProject;
