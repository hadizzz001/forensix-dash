'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Upload from '../components/Upload';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ManageProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    img: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch All Projects
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/project');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Add new project
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),   // ✅ only title, description, img
    });

    if (res.ok) {
      setMessage('✅ Project added successfully!');
      setFormData({ title: '', description: '', img: '' });
      fetchProjects();
    } else {
      const errorData = await res.json();
      setMessage(`❌ Error: ${errorData.error}`);
    }
  };

  // Update existing project
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/project/${editProject._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editProject), // ✅ only title, description, img will exist
    });

    if (res.ok) {
      setMessage('✅ Project updated!');
      setEditMode(false);
      setEditProject(null);
      fetchProjects();
    } else {
      const errorData = await res.json();
      setMessage(`❌ Error: ${errorData.error}`);
    }
  };

  const handleEdit = (project) => {
    setEditMode(true);
    setEditProject({ ...project });
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      const res = await fetch(`/api/project/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('🗑️ Deleted!');
        fetchProjects();
      }
    }
  };

  const updateField = (field, value) => {
    if (editMode) {
      setEditProject({ ...editProject, [field]: value });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const currentForm = editMode ? editProject : formData;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {editMode ? 'Edit Project' : 'Add Project'}
      </h1>

      <form onSubmit={editMode ? handleEditSubmit : handleSubmit} className="space-y-4 bg-gray-100 p-4 rounded">

        {/* Title */}
        <div>
          <label className="block mb-1 font-semibold">Title</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={currentForm.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <ReactQuill
            value={currentForm.description}
            onChange={(val) => updateField('description', val)}
            theme="snow"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-1 font-semibold">Upload Image</label>
          <Upload onImagesUpload={(url) => updateField('img', url)} />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editMode ? 'Update' : 'Add Project'}
        </button>
      </form>

      {message && <p className="mt-4 text-blue-600">{message}</p>}

      {/* Projects List */}
      <h2 className="text-xl font-bold mt-8 mb-2">All Projects</h2>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((p) => (
              <tr key={p._id}>
                <td className="border p-2">{p.title}</td>

                <td className="border p-2">
                  <button onClick={() => handleEdit(p)} className="bg-yellow-500 text-white px-3 py-1 mr-2 rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="bg-red-500 text-white px-3 py-1 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td className="text-center p-4">No projects found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageProject;
