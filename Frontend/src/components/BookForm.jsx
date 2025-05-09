// ✅ FILE: src/components/BookForm.jsx
import React, { useState, useEffect } from 'react';

const BookForm = ({ onSubmit, initialData = {}, isEdit = false }) => {
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    language: '',
    format: '',
    publisher: '',
    isbn: '',
    description: '',
    price: '',
    stockQuantity: '',
    isAvailableInLibrary: false,
    publicationDate: '',
    Image: null
  });
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || '');

  useEffect(() => {
    if (isEdit && initialData) {
      setForm(initialData);
      setImagePreview(initialData.imageUrl);
    }
  }, [initialData, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setForm(prev => ({
          ...prev,
          Image: file
        }));
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'Image') {
        if (form[key]) {
          formData.append('Image', form[key]);
        }
      } else {
        formData.append(key, form[key]);
      }
    });
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label htmlFor="title" className="mb-1 text-sm font-medium">Title</label>
          <input id="title" type="text" name="title" value={form.title} onChange={handleChange} className="border p-2 rounded" required />
        </div>

        <div className="flex flex-col">
          <label htmlFor="author" className="mb-1 text-sm font-medium">Author</label>
          <input id="author" type="text" name="author" value={form.author} onChange={handleChange} className="border p-2 rounded" required />
        </div>

        <div className="flex flex-col">
          <label htmlFor="genre" className="mb-1 text-sm font-medium">Genre</label>
          <input id="genre" type="text" name="genre" value={form.genre} onChange={handleChange} className="border p-2 rounded" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="language" className="mb-1 text-sm font-medium">Language</label>
          <input id="language" type="text" name="language" value={form.language} onChange={handleChange} className="border p-2 rounded" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="format" className="mb-1 text-sm font-medium">Format</label>
          <input id="format" type="text" name="format" value={form.format} onChange={handleChange} className="border p-2 rounded" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="publisher" className="mb-1 text-sm font-medium">Publisher</label>
          <input id="publisher" type="text" name="publisher" value={form.publisher} onChange={handleChange} className="border p-2 rounded" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="isbn" className="mb-1 text-sm font-medium">ISBN</label>
          <input id="isbn" type="text" name="isbn" value={form.isbn} onChange={handleChange} className="border p-2 rounded" />
        </div>

        <div className="flex flex-col">
          <label htmlFor="price" className="mb-1 text-sm font-medium">Price</label>
          <input id="price" type="number" name="price" value={form.price} onChange={handleChange} className="border p-2 rounded" required />
        </div>

        <div className="flex flex-col">
          <label htmlFor="stockQuantity" className="mb-1 text-sm font-medium">Stock Quantity</label>
          <input id="stockQuantity" type="number" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} className="border p-2 rounded" required />
        </div>

        <div className="flex flex-col">
          <label htmlFor="publicationDate" className="mb-1 text-sm font-medium">Publication Date</label>
          <input id="publicationDate" type="date" name="publicationDate" value={form.publicationDate} onChange={handleChange} className="border p-2 rounded" />
        </div>

        <div className="flex flex-col col-span-2">
          <label htmlFor="Image" className="mb-1 text-sm font-medium">Book Cover Image</label>
          <input 
            id="Image" 
            type="file" 
            name="Image" 
            onChange={handleChange} 
            accept="image/*"
            className="border p-2 rounded" 
            required
          />
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Book cover preview" 
              className="mt-2 h-40 object-contain"
            />
          )}
        </div>

        <label className="col-span-2 flex items-center gap-2">
          <input type="checkbox" name="isAvailableInLibrary" checked={form.isAvailableInLibrary} onChange={handleChange} />
          <span className="text-sm font-medium">Available in Physical Library</span>
        </label>
      </div>

      <div className="flex flex-col">
        <label htmlFor="description" className="mb-1 text-sm font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2 rounded h-28"
        />
      </div>

      <button
        type="submit"
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        {isEdit ? 'Update Book' : 'Add Book'}
      </button>
    </form>
  );
};

export default BookForm;