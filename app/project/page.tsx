'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Upload from '../components/Upload';
import Upload1 from '../components/Upload1';
import Upload2 from '../components/Upload2';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ManageProject = () => {
const [formData, setFormData] = useState({
  title: '',
  description: '',
  img: '',
  img1: '',      // ✅ NEW FIELD
  video: '',
  archive: 'no',
});


  const [editMode, setEditMode] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch all projects
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
    body: JSON.stringify(formData),
  });

  if (res.ok) {
    setMessage('✅ Project added successfully!');
    setFormData({ title: '', description: '', img: '',img1: '', video: '', archive: 'no' });
    window.location.reload(); // 🔁 Hard refresh after successful submission
  } else {
    const errorData = await res.json();
    setMessage(`❌ Error: ${errorData.error}`);
  }
};

// Update existing project
const handleEditSubmit = async (e) => {
  e.preventDefault();
  const res = await fetch(`/api/project/${encodeURIComponent(editProject.id || editProject._id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(editProject),
  });

  if (res.ok) {
    setMessage('✅ Project updated!');
    setEditMode(false);
    setEditProject(null);
    window.location.reload(); // 🔁 Hard refresh after successful update
  } else {
    const errorData = await res.json();
    setMessage(`❌ Error: ${errorData.error}`);
  }
};


  // Edit project
  const handleEdit = (project) => {
    setEditMode(true);
    setEditProject({ ...project });
  };

 

  // Delete project
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this Service?')) {
      const res = await fetch(`/api/project/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('🗑️ Service deleted!');
        fetchProjects();
      } else {
        const errorData = await res.json();
        setMessage(`❌ Error: ${errorData.error}`);
      }
    }
  };

  // Helper to update fields
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
        {editMode ? 'Edit Service' : 'Add Service'}
      </h1>

      <form
        onSubmit={editMode ? handleEditSubmit : handleSubmit}
        className="space-y-4 bg-gray-100 p-4 rounded"
      >
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
          <label className="block mb-1 font-semibold">Upload Gallery Image</label>
          <Upload onImagesUpload={(url) => updateField('img', url)} />
        </div>

        <div>
 
  <Upload2 onImagesUpload={(url) => updateField('img1', url)} />
</div>

        {/* Video Upload */}
        <div>
          <Upload1 onFilesUpload={(url) => updateField('video', url)} />
        </div>

        {/* Archive Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={currentForm.archive === 'yes'}
            onChange={(e) => updateField('archive', e.target.checked ? 'yes' : 'no')}
            id="archive"
            className="w-4 h-4"
          />
          <label htmlFor="archive" className="cursor-pointer">Archive</label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editMode ? 'Update Service' : 'Add Service'}
        </button>
      </form>

      {message && <p className="mt-4 text-blue-600">{message}</p>}

      {/* Projects List */}
      <h2 className="text-xl font-bold mt-8 mb-2">All Services</h2>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>  
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((project) => (
              <tr key={project.id || project._id}>
                <td className="border p-2">{project.title}</td>
            
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleEdit(project)}
                    className="bg-yellow-500 text-white px-3 py-1 mr-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id || project._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center p-4">
                No projects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageProject;
