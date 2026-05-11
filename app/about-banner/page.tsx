'use client';

import { useEffect, useState } from 'react';
import Upload from '../components/Upload';

const ManageAboutBanner = () => {
  const [image, setImage] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAboutBanner = async () => {
    try {
      const res = await fetch('/api/about-banner');
      if (res.ok) {
        const data = await res.json();
        setImage(data.img || '');
      } else {
        setMessage('Failed to fetch about banner.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error fetching about banner.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutBanner();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/about-banner', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ img: image }),
      });

      if (res.ok) {
        const data = await res.json();
        setImage(data.img || '');
        setMessage('About banner updated successfully!');
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error updating about banner.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (urls) => {
    const selectedImage = Array.isArray(urls) ? urls[0] : urls;
    if (selectedImage) {
      setImage(selectedImage);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading about banner...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">About Banner</h1>
      <p className="mb-4 text-gray-600">Only one image is allowed. Upload a new image, then save to update the about banner.</p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <div>
          <label className="block mb-2 font-bold">Current Banner</label>
          {image ? (
            <img src={image} alt="About banner" className="w-full max-h-80 rounded border object-cover" />
          ) : (
            <div className="border p-6 text-center text-gray-500">No banner image selected.</div>
          )}
        </div>

        <Upload onImagesUpload={handleImageUpload} multiple={false} label="Upload About Banner" />

        <button
          type="submit"
          disabled={saving || !image}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Update About Banner'}
        </button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default ManageAboutBanner;
