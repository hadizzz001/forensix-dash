'use client';

import { useState, useEffect } from 'react';
import Upload from '../components/Upload';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });


export default function CourseTable() {
  const [courses, setCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const res = await fetch('/api/course');
    const data = await res.json();
    setCourses(data);
  };

  // Delete a course
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await fetch(`/api/course/${id}`, { method: 'DELETE' });
      fetchCourses();
    }
  };

  // Open editor
  const handleEdit = (course) => setEditingCourse(course);

  // Save updates
  const handleUpdate = async (updatedCourse) => {
    const res = await fetch(`/api/course/${updatedCourse.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCourse),
    });
    if (res.ok) {
      alert('Course updated successfully!');
      setEditingCourse(null);
      fetchCourses();
    }
  };

  // Filter by title
  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Edit form */}
      {editingCourse && (
        <EditCourseForm
          course={editingCourse}
          onCancel={() => setEditingCourse(null)}
          onSave={handleUpdate}
        />
      )}

      <h1 className="text-2xl font-bold mb-4">Course List</h1>

      {/* Search bar */}
      <input
        className="w-full p-2 border mb-4"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by course title"
      />

      {/* Courses table */}
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>
            <th className="border p-2">Image</th>
            <th className="border p-2">Video</th>
            <th className="border p-2">Archive</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.map((c) => (
            <tr key={c.id || c._id}>
              <td className="border p-2">{c.title}</td>

              {/* Image preview */}
              <td className="border p-2">
                {c.img?.length > 0 ? (
                  <img src={c.img[0]} alt="Course" className="w-24 rounded" />
                ) : (
                  'No image'
                )}
              </td>

              {/* Video preview */}
              <td className="border p-2">
                {c.video ? (
                  <video src={c.video} controls className="w-32 h-20 object-cover" />
                ) : (
                  'No video'
                )}
              </td>

              {/* Archive status */}
              <td className="border p-2 text-center">
                {c.archive === 'yes' ? '✅ Yes' : '❌ No'}
              </td>

              {/* Actions */}
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id || c._id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function EditCourseForm({ course, onCancel, onSave }) {
   
  const [title, setTitle] = useState(course.title || '');
  const [description, setDescription] = useState(course.description || '');
  const [img, setImg] = useState(course.img || []);
  const [video, setVideo] = useState(course.video || '');
  const [archive, setArchive] = useState(course.archive || 'no');

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...course,
      title,
      description,
      img,
      video,
      archive,
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 p-4 mb-6 rounded">
      <h2 className="text-xl font-bold mb-4">Edit Course</h2>

      {/* Title */}
      <input
        className="w-full p-2 border mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Course Title"
        required
      />

      {/* Description (ReactQuill) */}
      <ReactQuill
        value={description}
        onChange={setDescription}
        className="mb-4"
        theme="snow"
        placeholder="Write course description..."
      />

      {/* Image Upload */}
      <div className="mb-4">
        <p className="font-semibold mb-1">Upload Image</p>
        <Upload onImagesUpload={(urls) => setImg(urls)} />
      </div>

      {/* Video Upload */}
      <div className="mb-4">
        <p className="font-semibold mb-1">Upload Video</p>
        <Upload1 onFilesUpload={(url) => setVideo(url)} />
      </div>

      {/* Archive Checkbox */}
      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={archive === 'yes'}
          onChange={(e) => setArchive(e.target.checked ? 'yes' : 'no')}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium">Archive</span>
      </label>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
 

}
 