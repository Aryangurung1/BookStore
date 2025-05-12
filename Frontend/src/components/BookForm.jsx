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
    Image: null,
    isAwardWinner: false,
    isBestseller: false
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
        Image: null, // Don't set the file, just show preview
        isAwardWinner: initialData.isAwardWinner ?? initialData.IsAwardWinner ?? false,
        isBestseller: initialData.isBestseller ?? initialData.IsBestseller ?? false
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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      
      
      {/* Basic Information Section */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
            <input 
              id="title" 
              type="text" 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              required 
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author *</label>
            <select 
              id="author" 
              name="author" 
              value={form.author} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              required 
            >
              <option value="">Select an author</option>
              <option value="J.K. Rowling">J.K. Rowling</option>
              <option value="Stephen King">Stephen King</option>
              <option value="Agatha Christie">Agatha Christie</option>
              <option value="George R.R. Martin">George R.R. Martin</option>
              <option value="Jane Austen">Jane Austen</option>
              <option value="Ernest Hemingway">Ernest Hemingway</option>
              <option value="William Shakespeare">William Shakespeare</option>
              <option value="Mark Twain">Mark Twain</option>
              <option value="Charles Dickens">Charles Dickens</option>
              <option value="F. Scott Fitzgerald">F. Scott Fitzgerald</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Genre *</label>
            <select 
              id="genre" 
              name="genre" 
              value={form.genre} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              required 
            >
              <option value="">Select a genre</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Mystery">Mystery</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Biography">Biography</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language *</label>
            <select 
              id="language" 
              name="language" 
              value={form.language} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              required 
            >
              <option value="">Select a language</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Nepali">Nepali</option>
              <option value="Russian">Russian</option>
              <option value="Japanese">Japanese</option>
              <option value="Chinese">Chinese</option>
              <option value="Arabic">Arabic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Publishing Details Section */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Publishing Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">Publisher *</label>
            <select 
              id="publisher" 
              name="publisher" 
              value={form.publisher} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              required 
            >
              <option value="">Select a publisher</option>
              <option value="Penguin Random House">Penguin Random House</option>
              <option value="HarperCollins">HarperCollins</option>
              <option value="Simon & Schuster">Simon & Schuster</option>
              <option value="Hachette Book Group">Hachette Book Group</option>
              <option value="Macmillan Publishers">Macmillan Publishers</option>
              <option value="Scholastic">Scholastic</option>
              <option value="Bloomsbury">Bloomsbury</option>
              <option value="Oxford University Press">Oxford University Press</option>
              <option value="Cambridge University Press">Cambridge University Press</option>
              <option value="Wiley">Wiley</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">ISBN *</label>
            <input 
              id="isbn" 
              type="text" 
              name="isbn" 
              value={form.isbn} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              required 
              maxLength={13}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="format" className="block text-sm font-medium text-gray-700">Format *</label>
            <select 
              id="format" 
              name="format" 
              value={form.format} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              required 
            >
              <option value="">Select a format</option>
              <option value="Hardcover">Hardcover</option>
              <option value="Paperback">Paperback</option>
              <option value="E-Book">E-Book</option>
              <option value="Audiobook">Audiobook</option>
              <option value="Mass Market Paperback">Mass Market Paperback</option>
              <option value="Large Print">Large Print</option>
              <option value="Board Book">Board Book</option>
              <option value="Spiral Bound">Spiral Bound</option>
              <option value="Comic Book">Comic Book</option>
              <option value="Magazine">Magazine</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="publicationDate" className="block text-sm font-medium text-gray-700">Publication Date *</label>
            <input 
              id="publicationDate" 
              type="date" 
              name="publicationDate" 
              value={form.publicationDate} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="isAwardWinner" className="block text-sm font-medium text-gray-700">Award Winner</label>
            <input
              id="isAwardWinner"
              name="isAwardWinner"
              type="checkbox"
              checked={form.isAwardWinner || false}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-600 text-sm">Mark as Award Winner</span>
          </div>
          <div className="space-y-2">
            <label htmlFor="isBestseller" className="block text-sm font-medium text-gray-700">Bestseller</label>
            <input
              id="isBestseller"
              name="isBestseller"
              type="checkbox"
              checked={form.isBestseller || false}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-600 text-sm">Mark as Bestseller</span>
          </div>
        </div>
      </div>

      {/* Inventory & Pricing Section */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Inventory & Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input 
                id="price" 
                type="number" 
                name="price" 
                value={form.price} 
                onChange={handleChange} 
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                required 
                min="0.01"
                max="99999.99"
                step="0.01"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">Stock Quantity *</label>
            <input 
              id="stockQuantity" 
              type="number" 
              name="stockQuantity" 
              value={form.stockQuantity} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              required 
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Discount Section */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Discount Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="discountPercent" className="block text-sm font-medium text-gray-700">Discount Percentage</label>
            <div className="relative">
              <input 
                id="discountPercent" 
                type="number" 
                name="discountPercent" 
                value={form.discountPercent} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                min="0" 
                max="100"
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="discountStart" className="block text-sm font-medium text-gray-700">Discount Start Date</label>
            <input 
              id="discountStart" 
              type="date" 
              name="discountStart" 
              value={form.discountStart} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="discountEnd" className="block text-sm font-medium text-gray-700">Discount End Date</label>
            <input 
              id="discountEnd" 
              type="date" 
              name="discountEnd" 
              value={form.discountEnd} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            />
          </div>
        </div>
      </div>

      {/* Book Cover Section */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Book Cover</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="Image" 
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {!imagePreview ? (
                  <>
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 800x400px)</p>
                  </>
                ) : (
                  <img 
                    src={imagePreview} 
                    alt="Book cover preview" 
                    className="max-h-56 object-contain rounded shadow-sm"
                  />
                )}
              </div>
              <input 
                id="Image" 
                type="file" 
                name="Image" 
                onChange={handleChange} 
                accept="image/*"
                className="hidden" 
                required={!isEdit}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Description</h3>
        <div className="space-y-2">
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors min-h-[120px]"
            placeholder="Enter book description..."
            required
            maxLength={2000}
          />
        </div>
      </div>

      {/* Availability Section */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Availability</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              name="isAvailableInLibrary" 
              checked={form.isAvailableInLibrary} 
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
            />
            <span className="text-sm font-medium text-gray-700">Available in Physical Library</span>
          </label>
          <label className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              name="isOnSale" 
              checked={form.isOnSale} 
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
            />
            <span className="text-sm font-medium text-gray-700">On Sale</span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end mt-8">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-500 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-md shadow hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all text-base"
        >
          {isEdit ? 'Update Book' : 'Add Book'}
        </button>
      </div>
    </form>
  );
};

export default BookForm;