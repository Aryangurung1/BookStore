// ✅ FILE: src/components/BookForm.jsx
import React, { useState, useEffect } from 'react';

function formatDateForInput(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d)) return '';
  // Get YYYY-MM-DD
  return d.toISOString().split('T')[0];
}

const BookForm = ({ onSubmit, initialData = {}, isEdit = false, onCancel }) => {
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
    discountPercent: '',
    isOnSale: false,
    discountStart: '',
    discountEnd: '',
    Image: null
  });
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl ? `http://localhost:5176${initialData.imageUrl}` : '');

  useEffect(() => {
    if (isEdit && initialData) {
      setForm({
        ...form,
        ...initialData,
        isAvailableInLibrary: initialData.isAvailableInLibrary ?? initialData.IsAvailableInLibrary ?? false,
        isOnSale: initialData.isOnSale ?? initialData.IsOnSale ?? false,
        publicationDate: formatDateForInput(initialData.publicationDate),
        discountStart: formatDateForInput(initialData.discountStart),
        discountEnd: formatDateForInput(initialData.discountEnd),
        discountPercent: (initialData.discountPercent ?? '').toString(),
        Image: null // Don't set the file, just show preview
      });
      setImagePreview(initialData.imageUrl ? `http://localhost:5176${initialData.imageUrl}` : '');
    }
    // eslint-disable-next-line
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
      } else if (['publicationDate', 'discountStart', 'discountEnd'].includes(key)) {
        if (form[key]) {
          const date = new Date(form[key]);
          formData.append(key, date.toISOString());
        }
      } else if (key === 'discountPercent') {
        formData.append('DiscountPercent', form[key] === '' ? 0 : form[key]);
      } else if (key === 'isOnSale') {
        formData.append('IsOnSale', form[key]);
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
          <input id="title" type="text" name="title" value={form.title} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div className="flex flex-col">
          <label htmlFor="author" className="mb-1 text-sm font-medium">Author</label>
          <input id="author" type="text" name="author" value={form.author} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div className="flex flex-col">
          <label htmlFor="genre" className="mb-1 text-sm font-medium">Genre</label>
          <input id="genre" type="text" name="genre" value={form.genre} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="language" className="mb-1 text-sm font-medium">Language</label>
          <input id="language" type="text" name="language" value={form.language} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="format" className="mb-1 text-sm font-medium">Format</label>
          <input id="format" type="text" name="format" value={form.format} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="publisher" className="mb-1 text-sm font-medium">Publisher</label>
          <input id="publisher" type="text" name="publisher" value={form.publisher} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="isbn" className="mb-1 text-sm font-medium">ISBN</label>
          <input id="isbn" type="text" name="isbn" value={form.isbn} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="price" className="mb-1 text-sm font-medium">Price</label>
          <input id="price" type="number" name="price" value={form.price} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div className="flex flex-col">
          <label htmlFor="stockQuantity" className="mb-1 text-sm font-medium">Stock Quantity</label>
          <input id="stockQuantity" type="number" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div className="flex flex-col">
          <label htmlFor="publicationDate" className="mb-1 text-sm font-medium">Publication Date</label>
          <input id="publicationDate" type="date" name="publicationDate" value={form.publicationDate} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="discountPercent" className="mb-1 text-sm font-medium">Discount Percent</label>
          <input id="discountPercent" type="number" name="discountPercent" value={form.discountPercent} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" min="0" max="100" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="discountStart" className="mb-1 text-sm font-medium">Discount Start Date</label>
          <input id="discountStart" type="date" name="discountStart" value={form.discountStart} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="discountEnd" className="mb-1 text-sm font-medium">Discount End Date</label>
          <input id="discountEnd" type="date" name="discountEnd" value={form.discountEnd} onChange={handleChange} className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex flex-col col-span-2">
          <label htmlFor="Image" className="mb-1 text-sm font-medium">Book Cover Image</label>
          <input 
            id="Image" 
            type="file" 
            name="Image" 
            onChange={handleChange} 
            accept="image/*"
            className="border p-2 rounded focus:ring-2 focus:ring-indigo-500" 
            required={!isEdit}
          />
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Book cover preview" 
              className="mt-2 h-40 object-contain rounded shadow border"
            />
          )}
        </div>
        <label className="col-span-2 flex items-center gap-2">
          <input type="checkbox" name="isAvailableInLibrary" checked={form.isAvailableInLibrary} onChange={handleChange} />
          <span className="text-sm font-medium">Available in Physical Library</span>
        </label>
        <label className="col-span-2 flex items-center gap-2">
          <input type="checkbox" name="isOnSale" checked={form.isOnSale} onChange={handleChange} />
          <span className="text-sm font-medium">On Sale</span>
        </label>
      </div>
      <div className="flex flex-col">
        <label htmlFor="description" className="mb-1 text-sm font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2 rounded h-28 focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex gap-4 mt-4">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 shadow"
        >
          {isEdit ? 'Update Book' : 'Add Book'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default BookForm;