// src/components/notes/NoteForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { createNote } from '../../store/slices/notesSlice';

export default function NoteForm() {
  const dispatch = useDispatch();
  const { register, handleSubmit, setError, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    // convert tags string
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    try {
      await dispatch(createNote(data)).unwrap();
    } catch (err) {
      if (err && typeof err === 'object') {
        for (const key of Object.keys(err)) {
          setError(key, { type: 'server', message: err[key] });
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input {...register('title', { required: 'Title required' })} placeholder="Title" className="w-full border px-3 py-2 rounded" />
      {errors.title && <div className="text-red-500 text-sm">{errors.title.message}</div>}

      <textarea {...register('content')} placeholder="Content" className="w-full border px-3 py-2 rounded" rows={6} />
      <input {...register('tags')} placeholder="tags,comma,separated" className="w-full border px-3 py-2 rounded" />

      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
      </div>
    </form>
  );
}
