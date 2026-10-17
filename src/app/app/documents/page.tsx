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
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';

export default function DocumentsPage() {
  const { documents, addDocument, deleteDocument, uploadFileToStorage } = useCRMStore();
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // File selection state (UPLOAD != SAVE)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [newDocForm, setNewDocForm] = useState({
    title: '',
    category: 'PROPERTY' as 'PROPERTY' | 'CLIENT_KYC' | 'LEGAL',
    relatedName: '',
  });

  const filteredDocs = documents.filter((d) => {
    const matchesCat = filter === 'ALL' || d.category === filter;
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.relatedName && d.relatedName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File exceeds maximum limit of 10MB.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    if (!newDocForm.title) {
      setNewDocForm((prev) => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ''),
      }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a document file to upload.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload to persistent cloud storage
      const uploadRes = await uploadFileToStorage(selectedFile, 'CRM_DOCUMENT');

      if (!uploadRes.success || !uploadRes.asset) {
        alert(`Storage Upload Failed: ${uploadRes.error || 'Unknown error'}`);
        setIsUploading(false);
        return;
      }

      // 2. Derive file extension type
      const ext = selectedFile.name.split('.').pop()?.toUpperCase() || 'PDF';
      const sizeMB = Math.round((selectedFile.size / (1024 * 1024)) * 100) / 100 || 0.1;

      // 3. Save Document record in store and database
      await addDocument({
        title: newDocForm.title.trim() || selectedFile.name,
        category: newDocForm.category,
        fileUrl: uploadRes.asset.storageUrl,
        fileSizeMB: sizeMB,
        fileType: ext,
        relatedName: newDocForm.relatedName.trim() || 'General Asset',
      });

      // Reset
      setSelectedFile(null);
      setNewDocForm({
        title: '',
        category: 'PROPERTY',
        relatedName: '',
      });
      setIsUploadModalOpen(false);
    } catch (err: any) {
      alert(`Error uploading document: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (fileUrl: string, title: string) => {
    if (fileUrl.startsWith('/api/storage/') || fileUrl.startsWith('http')) {
      window.open(fileUrl, '_blank');
    } else {
      alert(`Downloading ${title}... (Demo placeholder file: ${fileUrl})`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#E9DFC8] text-[#2C241A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2C241A] tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#A37432]" />
              Document Vault &amp; Legal KYC
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#A37432]/15 text-[#7A5520] border border-[#A37432]/30 rounded-full">
              {documents.length} Encrypted Files
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6A5A44] mt-1">
            Store property brochures, floor plans, buyer PAN/KYC cards, and draft sale agreements in encrypted cloud storage.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => {
            setSelectedFile(null);
            setIsUploadModalOpen(true);
          }}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Upload Document
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#D8C7A5] shadow-[0_8px_24px_rgba(120,90,40,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6A5A44] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by name or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F4EAD7] border border-[#D8C7A5] rounded-xl text-xs text-[#2C241A] placeholder:text-[#8A7A63] outline-none focus:border-[#A37432]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'PROPERTY', 'CLIENT_KYC', 'LEGAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filter === cat
                  ? 'bg-[#A37432] text-white shadow-xs'
                  : 'bg-[#F4EAD7] text-[#6A5A44] hover:text-[#2C241A] border border-[#D8C7A5]'
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
          onAction={() => {
            setSelectedFile(null);
            setIsUploadModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const isCloudStored = doc.fileUrl.startsWith('/api/storage/');

            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-[#FFF9F0] border border-[#D8C7A5] hover:border-[#A37432] shadow-[0_8px_24px_rgba(120,90,40,0.08)] transition-all space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F4EAD7] text-[#7A5520] rounded border border-[#D8C7A5]">
                      {doc.category}
                    </span>
                    <span className="text-xs text-[#6A5A44] font-mono">
                      {doc.fileSizeMB} MB &bull; {doc.fileType}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#2C241A] line-clamp-1 group-hover:text-[#7A5520] transition-colors">
                    {doc.title}
                  </h3>

                  {doc.relatedName && (
                    <p className="text-xs text-[#6A5A44] truncate">Related: {doc.relatedName}</p>
                  )}

                  {isCloudStored && (
                    <div className="inline-flex items-center gap-1 text-[10px] text-[#547A61] font-semibold bg-[#547A61]/10 px-2 py-0.5 rounded border border-[#547A61]/20">
                      <CheckCircle2 className="w-3 h-3" /> Cloud Stored &amp; Verified
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#D8C7A5] flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleDownload(doc.fileUrl, doc.title)}
                    className="text-[#7A5520] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download / View {doc.fileType}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete document "${doc.title}"?`)) {
                        deleteDocument(doc.id);
                      }
                    }}
                    className="text-[#6A5A44] hover:text-[#8B4A4A] p-1 transition-colors cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal (UPLOAD != SAVE) */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          if (!isUploading) {
            setSelectedFile(null);
            setIsUploadModalOpen(false);
          }
        }}
        title="Upload Real Estate Document"
        description="Attach PDF floor plans, KYC certificates, contract drafts, or brochures."
      >
        <form onSubmit={handleUpload} className="space-y-4 text-xs sm:text-sm">
          {/* File Picker with Local Selection (UPLOAD != SAVE) */}
          <div className="p-4 rounded-xl border-2 border-dashed border-[#D8C7A5] bg-[#F4EAD7] hover:border-[#A37432] transition-colors text-center relative">
            <input
              type="file"
              id="doc-file-input"
              required
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {selectedFile ? (
              <div className="space-y-1">
                <FileCheck className="w-8 h-8 text-[#547A61] mx-auto" />
                <p className="font-bold text-[#2C241A] text-xs sm:text-sm">{selectedFile.name}</p>
                <p className="text-[11px] text-[#6A5A44]">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Selected (Will upload upon Save)
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-[10px] text-[#8B4A4A] hover:underline pt-1 inline-block"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <div className="space-y-1 pointer-events-none">
                <Upload className="w-8 h-8 text-[#7A5520] mx-auto mb-1" />
                <p className="font-bold text-[#2C241A] text-xs">
                  Click or drag document to select
                </p>
                <p className="text-[11px] text-[#6A5A44]">
                  Supports PDF, DOC, DOCX, PNG, JPG, WebP, CSV (Max 10MB)
                </p>
              </div>
            )}
          </div>

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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D8C7A5]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isUploading}
              onClick={() => {
                setSelectedFile(null);
                setIsUploadModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="md"
              className="font-bold"
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading to Vault...' : 'Upload to Vault'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
