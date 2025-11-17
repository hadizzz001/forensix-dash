'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Upload from '../components/Upload';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function ManageProject() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    img: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState('');

  // -------- SUB SECTION STATE --------
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState('');
  const [sectionData, setSectionData] = useState({
    title: '',
    description: '',
    img: '',
  });

  // Fetch All Projects
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/project');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('Fetch error:', err);
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
      setMessage('✅ Project added!');
      setFormData({ title: '', description: '', img: '' });
      fetchProjects();
    } else {
      setMessage('❌ Error creating project');
    }
  };


  // DELETE SUB-SECTION
const handleDeleteSection = async (projectId, sectionId) => {
  if (!confirm("Delete this section?")) return;

  const res = await fetch(`/api/project/${projectId}/section/${sectionId}`, {
    method: "DELETE",
  });

  if (res.ok) {
    setMessage("✅ Section removed!");
    fetchProjects();
  } else {
    setMessage("❌ Error deleting section");
  }
};


  // Update project
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/project/${editProject.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editProject),
    });

    if (res.ok) {
      setMessage('✅ Project updated!');
      setEditMode(false);
      setEditProject(null);
      fetchProjects();
    } else {
      setMessage('❌ Error updating project');
    }
  };

  // Delete project
  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;

    await fetch(`/api/project/${id}`, { method: 'DELETE' });
    fetchProjects();
  };

  const updateField = (field, value) => {
    if (editMode) {
      setEditProject({ ...editProject, [field]: value });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const currentForm = editMode ? editProject : formData;

  // ---------------------- SECTION HANDLERS ------------------------

  const openSectionModal = (projectId) => {
    setCurrentProjectId(projectId);
    setSectionData({ title: '', description: '', img: '' });
    setShowSectionModal(true);
  };

const handleAddSection = async (e) => {
  e.preventDefault();

  // ----- VALIDATION -----
  if (!sectionData.title.trim()) {
    setMessage("❌ Sub-section title is missing");
    return;
  }

  if (!sectionData.description || sectionData.description.trim() === "") {
    setMessage("❌ Sub-section description is missing");
    return;
  }

  if (!sectionData.img) {
    setMessage("❌ Sub-section image is missing");
    return;
  }
  // -----------------------

  const res = await fetch(`/api/project/${currentProjectId}/section`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sectionData)
  });

  if (res.ok) {
    setMessage('✅ Section added!');
    setShowSectionModal(false);
    fetchProjects();
  } else {
    setMessage('❌ Error adding section');
  }
};


  // -------------------------------------------------------------------

  return (
    <div className="container mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">
        {editMode ? 'Edit Project' : 'Add Project'}
      </h1>

      {/* ADD/EDIT PROJECT FORM */}
      <form
        onSubmit={editMode ? handleEditSubmit : handleSubmit}
        className="space-y-4 bg-gray-100 p-4 rounded"
      >
        <div>
          <label className="font-semibold">Title</label>
          <input
            className="border p-2 w-full"
            value={currentForm.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="font-semibold">Description</label>
          <ReactQuill
            value={currentForm.description}
            onChange={(val) => updateField('description', val)}
          />
        </div>

        <div>
          <label className="font-semibold">Upload Image</label>
          <Upload onImagesUpload={(url) => updateField('img', url)} />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editMode ? 'Update' : 'Add Project'}
        </button>
      </form>

      {message && <p className="text-blue-600 mt-4">{message}</p>}

      {/* ===== PROJECT LIST ===== */}
      <h2 className="text-xl font-bold mt-8 mb-2">All Projects</h2>

      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Title</th>
            <th className="border p-2">Sections</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {projects.length > 0 ? (
            projects.map((p) => (
              <tr key={p.id}>
                <td className="border p-2">{p.title}</td>

<td className="border p-2">
  {p.sections?.length > 0 ? (
    p.sections.map((s) => (
      <div key={s.id} className="flex items-center justify-between border-b py-1 text-sm">
        <span>• {s.title}</span>

        <button
          onClick={() => handleDeleteSection(p.id, s.id)}
          className="text-red-600 hover:underline text-xs"
        >
          Delete
        </button>
      </div>
    ))
  ) : (
    <span className="text-gray-500 text-sm">No sections</span>
  )}

  <button
    className="bg-green-600 text-white px-2 py-1 mt-2 text-sm rounded"
    onClick={() => openSectionModal(p.id)}
  >
    + Add Section
  </button>
</td>


                {/* ACTION BUTTONS */}
                <td className="border p-2">
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setEditProject(p);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 mr-2 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-4 text-center">No projects found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ---------- SECTION MODAL ---------- */}
{showSectionModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
    <div className="bg-white p-6 rounded w-96 max-h-[80vh] overflow-y-auto">

      <h2 className="font-bold text-xl mb-4">Add Sub-Section</h2>

      <form onSubmit={handleAddSection} className="space-y-3">
        <input
          className="border p-2 w-full"
          placeholder="Section Title"
          value={sectionData.title}
          onChange={(e) =>
            setSectionData({ ...sectionData, title: e.target.value })
          }
          required
        />

        <ReactQuill
          value={sectionData.description}
          onChange={(val) =>
            setSectionData({ ...sectionData, description: val })
          }
        />

        <Upload
          onImagesUpload={(url) =>
            setSectionData({ ...sectionData, img: url })
          }
        />

        <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
          Add Section
        </button>
      </form>

      {message && (
  <p className="text-red-600 text-sm mb-2">{message}</p>
)}


      <button
        onClick={() => setShowSectionModal(false)}
        className="mt-4 text-center w-full text-red-500"
      >
        Cancel
      </button>
    </div>
  </div>
)}

    </div>
  );
}
