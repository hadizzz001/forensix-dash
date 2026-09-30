'use client';

import { useEffect, useState } from 'react';
import Upload from '../components/Upload';
import { PAGE_BANNERS } from '../constants';

const PageBannerForm = ({ page, label, savedImage, onSaved }) => {
  const [image, setImage] = useState(savedImage);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/page-banner', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, img: image }),
      });

      if (res.ok) {
        const data = await res.json();
        onSaved(page, data.img);
        setMessage(`${label} banner updated successfully!`);
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Error updating ${label} banner.`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (urls) => {
    const selectedImage = Array.isArray(urls) ? urls[0] : urls;
    if (selectedImage) {
      setImage(selectedImage);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded p-4">
      <div>
        <h2 className="text-xl font-bold">{label}</h2>
        <p className="text-gray-500">/{page}</p>
      </div>

      {image ? (
        <img src={image} alt={`${label} banner`} className="w-full max-h-80 rounded border object-cover" />
      ) : (
        <div className="border p-6 text-center text-gray-500">No banner uploaded yet. The website shows its default image.</div>
      )}

      {image && image !== savedImage && (
        <p className="text-gray-600">Not saved yet. Click the button below to publish this image.</p>
      )}

      <Upload onImagesUpload={handleImageUpload} multiple={false} label={`Upload ${label} Banner`} />

      <button
        type="submit"
        disabled={saving || !image || image === savedImage}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {saving ? 'Updating...' : `Update ${label} Banner`}
      </button>

      {message && <p className="text-red-500">{message}</p>}
    </form>
  );
};

const ManagePageBanners = () => {
  const [banners, setBanners] = useState({});
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageBanners = async () => {
      try {
        const res = await fetch('/api/page-banner');
        if (res.ok) {
          const data = await res.json();
          setBanners(Object.fromEntries(data.map((banner) => [banner.page, banner.img])));
        } else {
          setLoadError('Failed to fetch page banners.');
        }
      } catch (error) {
        console.error('Error:', error);
        setLoadError('Error fetching page banners.');
      } finally {
        setLoading(false);
      }
    };

    fetchPageBanners();
  }, []);

  const handleSaved = (page, img) => {
    setBanners((current) => ({ ...current, [page]: img }));
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading page banners...</div>;
  }

  if (loadError) {
    return <div className="container mx-auto p-4 text-red-500">{loadError}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Page Banners</h1>
      <p className="mb-4 text-gray-600">Each page has one banner image. Upload a new image, then click that page&apos;s update button. The home page slides are edited under Home Banner.</p>

      <div className="space-y-6 max-w-3xl">
        {PAGE_BANNERS.map(({ page, label }) => (
          <PageBannerForm
            key={page}
            page={page}
            label={label}
            savedImage={banners[page] || ''}
            onSaved={handleSaved}
          />
        ))}
      </div>
    </div>
  );
};

export default ManagePageBanners;
