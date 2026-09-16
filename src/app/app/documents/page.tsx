'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FileText,
  PlusCircle,
  Download,
  Trash2,
  Search,
  Building,
  ShieldCheck,
  FileCheck,
  Eye,
} from 'lucide-react';

export default function DocumentsPage() {
  const { documents, addDocument, deleteDocument } = useCRMStore();
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [newDocForm, setNewDocForm] = useState({
    title: '',
    category: 'PROPERTY' as const,
    relatedName: '',
  });

  const filteredDocs = documents.filter((d) => {
    const matchesCat = filter === 'ALL' || d.category === filter;
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.relatedName && d.relatedName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      title: newDocForm.title,
      category: newDocForm.category,
      fileUrl: '/docs/sample.pdf',
      fileSizeMB: 3.5,
      fileType: 'PDF',
      relatedName: newDocForm.relatedName || 'General Asset',
    });
    setIsUploadModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#24211D] tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#A374]" />
              Document Vault & Legal KYC
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#A374]/15 text-[#8F642B] border border-[#A374]/30 rounded-full">
              {documents.length} Encrypted Files
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#766F63] mt-1">
            Store property brochures, floor plans, buyer PAN/KYC cards, and draft sale agreements.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsUploadModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Upload Document
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#FFFCF6] border border-[#DDD4C4] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#766F63] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by name or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#DDD4C4] rounded-xl text-xs text-[#24211D] placeholder:text-[#766F63] outline-none focus:border-[#A374]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'PROPERTY', 'CLIENT_KYC', 'LEGAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === cat
                  ? 'bg-[#A374] text-white shadow-xs'
                  : 'bg-white text-[#766F63] hover:text-[#24211D] border border-[#DDD4C4]'
              }`}
            >
              {cat === 'ALL' ? 'All Files' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No documents found"
          description="Upload property spec sheets, KYC files, or draft agreements."
          actionLabel="Upload Document"
          onAction={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-[#FFFCF6] border border-[#DDD4C4] hover:border-[#A374] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)] transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F7F3EA] text-[#8F642B] rounded border border-[#DDD4C4]">
                    {doc.category}
                  </span>
                  <span className="text-xs text-[#766F63] font-mono">{doc.fileSizeMB} MB • {doc.fileType}</span>
                </div>

                <h3 className="text-sm font-serif font-bold text-[#24211D] line-clamp-1">{doc.title}</h3>
                {doc.relatedName && (
                  <p className="text-xs text-[#766F63] truncate">Related: {doc.relatedName}</p>
                )}
              </div>

              <div className="pt-3 border-t border-[#DDD4C4] flex items-center justify-between text-xs">
                <button
                  onClick={() => alert(`Downloading ${doc.title}...`)}
                  className="text-[#8F642B] hover:underline font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="text-[#766F63] hover:text-[#8B2635] p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Real Estate Document"
        description="Attach PDF floor plans, KYC certificates, or contract drafts."
      >
        <form onSubmit={handleUpload} className="space-y-4 text-xs sm:text-sm">
          <Input
            label="Document Title *"
            required
            placeholder="e.g. Master Floor Plan - Emerald Heights.pdf"
            value={newDocForm.title}
            onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
          />

          <Select
            label="Category"
            value={newDocForm.category}
            onChange={(e) =>
              setNewDocForm({ ...newDocForm, category: e.target.value as any })
            }
            options={[
              { value: 'PROPERTY', label: 'Property Brochure / Floor Plan' },
              { value: 'CLIENT_KYC', label: 'Client PAN / KYC Document' },
              { value: 'LEGAL', label: 'Draft Sale Agreement / Title Deed' },
            ]}
          />

          <Input
            label="Related Property or Buyer Name"
            placeholder="e.g. The Grand Emerald Heights"
            value={newDocForm.relatedName}
            onChange={(e) => setNewDocForm({ ...newDocForm, relatedName: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDD4C4]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="md" className="font-bold">
              Upload to Vault
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
