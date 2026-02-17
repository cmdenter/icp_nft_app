import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNFTStore } from '../store/nftStore';
import type { Trait } from '../types';
import { ImageIcon, XIcon } from './icons';

export const MintForm: React.FC = () => {
  const navigate = useNavigate();
  const mint = useNFTStore((s) => s.mint);
  const principal = useNFTStore((s) => s.principal);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [traits, setTraits] = useState<Trait[]>([{ category: '', value: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    const maxSize = 500 * 1024;
    if (file.size > maxSize) {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          const maxDim = 800;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = (h / w) * maxDim; w = maxDim; }
            else { w = (w / h) * maxDim; h = maxDim; }
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
          setImage(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target!.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const addTrait = () => setTraits([...traits, { category: '', value: '' }]);
  const updateTrait = (index: number, field: 'category' | 'value', val: string) => {
    const updated = [...traits];
    updated[index] = { ...updated[index], [field]: val };
    setTraits(updated);
  };
  const removeTrait = (index: number) => setTraits(traits.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (!image) { setError('Image is required'); return; }
    setIsSubmitting(true);
    setError('');
    const validTraits = traits.filter((t) => t.category.trim() && t.value.trim());
    try {
      const tokenId = await mint({ name: name.trim(), description: description.trim(), image, traits: validTraits });
      navigate(`/nft/${tokenId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Mint failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-3xl lg:text-4xl tracking-tight font-bold text-white mb-1">Create New Item</h1>
      <p className="text-os-text-secondary text-sm mb-8">
        Once your item is minted you will not be able to change any of its information.
      </p>

      {!principal && (
        <div className="bg-os-yellow/10 border border-os-yellow/30 rounded-xl p-4 mb-6 text-os-yellow text-sm">
          No identity detected. Using anonymous identity for local dev.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Image */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Image, Video, Audio, or 3D Model <span className="text-os-red">*</span>
            </label>
            <p className="text-xs text-os-text-secondary mb-3">
              File types supported: JPG, PNG, GIF, SVG. Max size: 500 KB
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
                isDragging
                  ? 'border-os-primary bg-os-primary/10'
                  : image
                    ? 'border-os-border bg-os-surface'
                    : 'border-os-border hover:border-os-text-secondary bg-os-surface'
              }`}
            >
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center px-8">
                  <div className="w-20 h-20 rounded-full bg-os-card flex items-center justify-center mx-auto mb-4">
                    <ImageIcon size={32} className="text-os-text-secondary" />
                  </div>
                  <p className="text-base text-white font-semibold">Drag and drop media</p>
                  <p className="text-sm text-os-primary mt-1">Browse files</p>
                  <p className="text-xs text-os-text-secondary mt-2">Max size: 500KB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processFile(file);
                }}
              />
            </div>
            <div className="mt-3">
              <input
                type="text"
                value={image.startsWith('data:') ? '' : image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Or paste image URL"
                className="w-full bg-os-surface border border-os-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-os-primary focus:shadow-[0_0_0_3px_rgba(32,129,226,0.15)] placeholder-os-text-secondary"
              />
            </div>
          </div>

          {/* Right: Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Name <span className="text-os-red">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Item name"
                required
                className="w-full bg-os-surface border border-os-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-os-primary focus:shadow-[0_0_0_3px_rgba(32,129,226,0.15)] placeholder-os-text-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Description</label>
              <p className="text-xs text-os-text-secondary mb-2">The description will be included on the item's detail page.</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of your item"
                rows={4}
                className="w-full bg-os-surface border border-os-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-os-primary focus:shadow-[0_0_0_3px_rgba(32,129,226,0.15)] resize-none placeholder-os-text-secondary"
              />
            </div>

            {/* Properties */}
            <div>
              <label className="block text-sm font-bold text-white mb-1">Properties</label>
              <p className="text-xs text-os-text-secondary mb-3">Textual traits that show up as rectangles.</p>
              <div className="space-y-2">
                {traits.map((trait, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={trait.category}
                      onChange={(e) => updateTrait(i, 'category', e.target.value)}
                      placeholder="Type"
                      className="flex-1 bg-os-surface border border-os-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-os-primary focus:shadow-[0_0_0_3px_rgba(32,129,226,0.15)] placeholder-os-text-secondary"
                    />
                    <input
                      type="text"
                      value={trait.value}
                      onChange={(e) => updateTrait(i, 'value', e.target.value)}
                      placeholder="Name"
                      className="flex-1 bg-os-surface border border-os-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-os-primary focus:shadow-[0_0_0_3px_rgba(32,129,226,0.15)] placeholder-os-text-secondary"
                    />
                    {traits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTrait(i)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-os-surface border border-os-border hover:bg-os-card text-os-text-secondary hover:text-os-red transition-colors"
                      >
                        <XIcon size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTrait}
                  className="text-sm text-os-primary hover:text-os-primary-hover font-semibold transition-colors"
                >
                  + Add more
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-os-red/10 border border-os-red/30 rounded-xl px-4 py-3 text-os-red text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-os-primary hover:bg-os-primary-hover disabled:bg-os-surface disabled:text-os-text-secondary text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-os-primary/20 active:scale-[0.98]"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
