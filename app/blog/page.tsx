'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Upload from '../components/Upload'; 
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ManageProject = () => {
  const [formData, setFormData] = useState({
    title: '', 
    author: '', 
    description: '',
    img: '', 
    archive: 'no',
  });

  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '', 
    author: '', 
    description: '',
    img: '', 
    archive: 'no',
  });

  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/blog');
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
    const res = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setMessage('Blog added successfully!');
      setFormData({
        title: '', 
        author: '', 
        description: '',
        img: '', 
        archive: 'no',
      });
      window.location.href = '/blog';
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
      const res = await fetch(`/api/blog/${encodeURIComponent(editFormData.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setMessage('Blog updated!');
        setEditMode(false);
        setEditFormData({
          id: '',
          title: '', 
          author: '', 
          description: '',
          img: '', 
          archive: 'no',
        });
        window.location.href = '/blog';
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this Blog?')) {
      try {
        const res = await fetch(`/api/blog/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setMessage('Blog deleted!');
          window.location.href = '/blog';
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
      <h1 className="text-2xl font-bold mb-4">{editMode ? 'Edit Blog' : 'Add Blog'}</h1>
      <form onSubmit={editMode ? handleEditSubmit : handleSubmit} className="space-y-4">
        {['title', 'author'].map((field) => (
          <div key={field}>
            <label className="block mb-1 capitalize">{field}</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={currentForm[field]}
              onChange={(e) => updateField(field, e.target.value)}
              required
            />
          </div>
        ))}

        <div>
          <label className="block mb-1">Description</label>
          <ReactQuill value={currentForm.description} onChange={(val) => updateField('description', val)} />
        </div>

        <div>
          <label className="block mb-1">Upload Image</label>
          <Upload onImagesUpload={(url) => updateField('img', url)} />
          
        </div>

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
 

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editMode ? 'Update Blog' : 'Add Blog'}
        </button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}

      <h2 className="text-xl font-bold mt-8">All Blogs</h2>
      <table className="table-auto w-full border mt-4">
        <thead>
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Author</th> 
            <th className="border p-2">Archive</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
<tbody>
  {projects.length > 0 ? (
    projects.map((project) => (
      <tr key={project.id}>
        <td className="border p-2">{project.title}</td>
        <td className="border p-2">{project.author}</td>
        
                        <td className="border p-2">
  {project.archive == null ? "no" : project.archive}
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
      <td colSpan={4} className="text-center p-4">
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
