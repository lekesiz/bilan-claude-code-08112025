import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function InitialInfo({ onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const categories = [
    'Software Development',
    'Data Analysis',
    'Project Management',
    'Human Resources',
    'Marketing',
    'Sales',
    'Business Analysis',
    'Leadership & Management'
  ];

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Competency Assessment</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            {...register('first_name', { required: 'First name is required' })}
            placeholder="Enter your first name"
            className="w-full"
          />
          {errors.first_name && (
            <span className="text-red-500 text-sm">{errors.first_name.message}</span>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            {...register('last_name', { required: 'Last name is required' })}
            placeholder="Enter your last name"
            className="w-full"
          />
          {errors.last_name && (
            <span className="text-red-500 text-sm">{errors.last_name.message}</span>
          )}
        </div>

        {/* Interest Category */}
        <div>
          <label className="block text-sm font-medium mb-1">Interest Category</label>
          <select
            {...register('interest_category', { required: 'Category is required' })}
            className="w-full"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.interest_category && (
            <span className="text-red-500 text-sm">{errors.interest_category.message}</span>
          )}
        </div>

        {/* Allocated Hours */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Hours Available for Assessment
          </label>
          <select
            {...register('allocated_hours', { required: 'Hours are required' })}
            className="w-full"
          >
            <option value="">Select hours</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
              <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
            ))}
          </select>
          {errors.allocated_hours && (
            <span className="text-red-500 text-sm">{errors.allocated_hours.message}</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Starting Assessment...' : 'Start Assessment'}
        </button>
      </form>
    </div>
  );
}
