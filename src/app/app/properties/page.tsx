'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCRMStore } from '@/lib/store';
import { Property, PropertyType, PropertyStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal, Drawer } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatINR, formatINRPricePerSqFt } from '@/lib/utils';
import {
  Building2,
  PlusCircle,
  Search,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Compass,
  CheckCircle2,
  Trash2,
  Edit,
  DollarSign,
  Users,
  CalendarCheck,
  Download,
} from 'lucide-react';

export default function PropertiesPage() {
  const { properties, addProperty, updateProperty, deleteProperty, users, leads, siteVisits } = useCRMStore();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [newPropForm, setNewPropForm] = useState({
    title: '',
    description: '',
    propertyType: 'APARTMENT' as PropertyType,
    status: 'AVAILABLE' as PropertyStatus,
    priceINR: 12500000,
    areaSqFt: 1650,
    bedrooms: 3,
    bathrooms: 3,
    furnishing: 'Fully Furnished' as const,
    facing: 'North-East' as const,
    address: 'Tower A, Floor 12, Main Road',
    locality: 'OMR Expressway',
    city: 'Chennai',
    state: 'Tamil Nadu',
    ownerName: 'V. Sundaram Properties',
    ownerPhone: '+91 98400 44332',
    featuredImageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    amenities: ['Swimming Pool', 'Clubhouse & Gym', '2 Covered Car Parks', '24/7 Power Backup'],
    assignedAgentId: 'usr-admin-01',
  });

  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  const confirmDeleteProperty = () => {
    if (propertyToDelete) {
      deleteProperty(propertyToDelete.id);
      setPropertyToDelete(null);
      if (selectedProperty?.id === propertyToDelete.id) {
        setIsDrawerOpen(false);
        setSelectedProperty(null);
      }
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || p.propertyType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const assigned = users.find((u) => u.id === newPropForm.assignedAgentId);

    const res = addProperty({
      title: newPropForm.title,
      description: newPropForm.description,
      propertyType: newPropForm.propertyType,
      status: newPropForm.status,
      priceINR: Number(newPropForm.priceINR),
      areaSqFt: Number(newPropForm.areaSqFt),
      bedrooms: Number(newPropForm.bedrooms),
      bathrooms: Number(newPropForm.bathrooms),
      furnishing: newPropForm.furnishing,
      facing: newPropForm.facing,
      address: newPropForm.address,
      locality: newPropForm.locality,
      city: newPropForm.city,
      state: newPropForm.state,
      ownerName: newPropForm.ownerName,
      ownerPhone: newPropForm.ownerPhone,
      featuredImageUrl: newPropForm.featuredImageUrl,
      images: [newPropForm.featuredImageUrl],
      amenities: newPropForm.amenities,
      assignedAgentId: newPropForm.assignedAgentId,
      assignedAgentName: assigned ? assigned.name : undefined,
    });

    if (!res.success) {
      alert(res.error);
      return;
    }

    setIsAddModalOpen(false);
  };

  const openDetail = (prop: Property) => {
    setSelectedProperty(prop);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#29251F] tracking-tight">
              Property Inventory
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#A374]/15 text-[#805B25] border border-[#A374]/30 rounded-full">
              {filteredProperties.length} Properties Listed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#625B51] mt-1">
            Manage your high-end real estate portfolio, visual galleries, and unit availability.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Add New Property
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#D4C9B9] shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#625B51] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search properties by title, locality, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#D4C9B9] rounded-xl text-xs text-[#29251F] placeholder:text-[#625B51] outline-none focus:border-[#A374] focus:ring-2 focus:ring-[#A374]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-[#D4C9B9] rounded-xl px-3 py-2 text-xs text-[#29251F] outline-none focus:border-[#A374]"
          >
            <option value="ALL">All Property Types</option>
            <option value="APARTMENT">Apartments / Flats</option>
            <option value="VILLA">Luxury Villas</option>
            <option value="PENTHOUSE">Penthouses</option>
            <option value="COMMERCIAL">Commercial Suites</option>
            <option value="DUPLEX">Duplex</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#D4C9B9] rounded-xl px-3 py-2 text-xs text-[#29251F] outline-none focus:border-[#A374]"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold</option>
            <option value="RENTED">Rented</option>
          </select>

          <div className="bg-[#E8E1D5] border border-[#D4C9B9] p-1 rounded-xl flex items-center gap-1 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#A374] text-white shadow-sm' : 'text-[#625B51] hover:text-[#29251F]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-[#A374] text-white shadow-sm' : 'text-[#625B51] hover:text-[#29251F]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      {filteredProperties.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-8 h-8" />}
          title="No properties listed yet"
          description="Add your first luxury apartment, villa, or commercial property listing."
          actionLabel="Add Property"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              onClick={() => openDetail(prop)}
              className="rounded-2xl bg-[#FFFDF8] border border-[#D4C9B9] overflow-hidden hover:border-[#A374] cursor-pointer shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(163,116,36,0.12)] transition-all flex flex-col justify-between group"
            >
              {/* Featured Image */}
              <div className="relative h-48 w-full bg-[#ECE5D8] overflow-hidden">
                <img
                  src={prop.featuredImageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm border ${
                      prop.status === 'AVAILABLE'
                        ? 'bg-[#3D7258] text-white border-[#3D7258]'
                        : prop.status === 'RESERVED'
                        ? 'bg-[#B87B28] text-white border-[#B87B28]'
                        : 'bg-[#8B4A4A] text-white border-[#8B4A4A]'
                    }`}
                  >
                    {prop.status}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#29251F]/80 backdrop-blur-sm text-[#FFFDF8] rounded-md">
                    {prop.propertyType}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-[#29251F]/90 backdrop-blur-md text-[#FFFDF8] font-extrabold text-sm font-mono shadow-md border border-[#A374]/40">
                  {formatINR(prop.priceINR, true)}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <h3 className="text-base font-serif font-bold text-[#29251F] group-hover:text-[#805B25] transition-colors line-clamp-1">
                  {prop.title}
                </h3>

                <p className="text-xs text-[#625B51] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#A374] flex-shrink-0" />
                  <span>{prop.locality}, {prop.city}</span>
                </p>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#D4C9B9] text-xs text-[#29251F]">
                  <div className="flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-[#625B51]" />
                    <span>{prop.areaSqFt} sq.ft</span>
                  </div>
                  {prop.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-[#625B51]" />
                      <span>{prop.bedrooms} BHK</span>
                    </div>
                  )}
                  {prop.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-[#625B51]" />
                      <span>{prop.bathrooms} Bath</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-[#625B51] pt-1">
                  <span>Rate: {formatINRPricePerSqFt(prop.priceINR, prop.areaSqFt)}</span>
                  <span className="text-[#805B25] font-semibold">
                    {prop.interestedLeadsCount || 12} Inquiries
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-[#D4C9B9] bg-[#FFFDF8] overflow-hidden shadow-[0_4px_20px_-4px_rgba(21,21,21,0.05)]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#E8E1D5] border-b border-[#D4C9B9] text-[#625B51] font-semibold">
                <th className="p-4">Property</th>
                <th className="p-4">Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Price</th>
                <th className="p-4">Area</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Agent</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4C9B9]/60">
              {filteredProperties.map((prop) => (
                <tr
                  key={prop.id}
                  onClick={() => openDetail(prop)}
                  className="hover:bg-[#E8E1D5]/60 cursor-pointer transition-colors"
                >
                  <td className="p-4 font-serif font-bold text-[#29251F] hover:text-[#805B25]">
                    {prop.title}
                  </td>
                  <td className="p-4 text-[#625B51]">{prop.propertyType}</td>
                  <td className="p-4 text-[#625B51]">{prop.locality}, {prop.city}</td>
                  <td className="p-4 font-extrabold text-[#805B25] font-mono">
                    {formatINR(prop.priceINR, true)}
                  </td>
                  <td className="p-4 text-[#625B51]">{prop.areaSqFt} sq.ft</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        prop.status === 'AVAILABLE'
                          ? 'bg-[#3D7258]/10 text-[#3D7258] border-[#3D7258]/20'
                          : prop.status === 'RESERVED'
                          ? 'bg-[#B87B28]/10 text-[#805B25] border-[#B87B28]/25'
                          : 'bg-[#8B4A4A]/10 text-[#8B4A4A] border-[#8B4A4A]/20'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#625B51]">{prop.assignedAgentName || 'Velvet Code'}</td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setPropertyToDelete(prop)}
                      className="p-1.5 text-[#625B51] hover:text-[#8B4A4A] rounded-lg hover:bg-[#8B4A4A]/10 transition-colors"
                      title="Delete Property"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Property Detail Drawer */}
      {selectedProperty && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title={selectedProperty.title}
          subtitle={`Property ID: ${selectedProperty.id} • ${selectedProperty.propertyType}`}
          size="lg"
        >
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="relative h-56 w-full rounded-xl overflow-hidden border border-[#D4C9B9]">
              <img
                src={selectedProperty.featuredImageUrl}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-[#29251F]/90 backdrop-blur-md text-[#FFFDF8] font-bold font-mono border border-[#A374]/30">
                {formatINR(selectedProperty.priceINR)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#D4C9B9] space-y-3">
              <h4 className="font-bold text-[#805B25] uppercase tracking-wider text-xs font-serif">
                Specifications & Layout
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#625B51] block">Carpet / Super Area</span>
                  <span className="text-[#29251F] font-semibold">{selectedProperty.areaSqFt} sq.ft</span>
                </div>
                <div>
                  <span className="text-[#625B51] block">Bedrooms / Baths</span>
                  <span className="text-[#29251F] font-semibold">
                    {selectedProperty.bedrooms || 0} BHK / {selectedProperty.bathrooms || 0} Bath
                  </span>
                </div>
                <div>
                  <span className="text-[#625B51] block">Furnishing</span>
                  <span className="text-[#29251F] font-semibold">{selectedProperty.furnishing || 'Semi'}</span>
                </div>
                <div>
                  <span className="text-[#625B51] block">Facing Direction</span>
                  <span className="text-[#29251F] font-semibold">{selectedProperty.facing || 'East'}</span>
                </div>
                <div>
                  <span className="text-[#625B51] block">Location</span>
                  <span className="text-[#29251F] font-semibold">{selectedProperty.locality}, {selectedProperty.city}</span>
                </div>
                <div>
                  <span className="text-[#625B51] block">Listing Status</span>
                  <span className="text-[#3D7258] font-bold">{selectedProperty.status}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#D4C9B9] space-y-2">
              <h4 className="font-bold text-[#805B25] uppercase tracking-wider text-xs font-serif">
                Amenities & Features
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedProperty.amenities.map((a, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs bg-[#E8E1D5] border border-[#D4C9B9] rounded-lg text-[#29251F] flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#3D7258]" />
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#D4C9B9] space-y-2">
              <h4 className="font-bold text-[#805B25] uppercase tracking-wider text-xs font-serif">
                Description & Highlights
              </h4>
              <p className="text-xs text-[#29251F] leading-relaxed bg-[#E8E1D5] p-3 rounded-lg border border-[#D4C9B9]">
                {selectedProperty.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#D4C9B9] flex justify-end">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setPropertyToDelete(selectedProperty)}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Delete Property Listing
              </Button>
            </div>
          </div>
        </Drawer>
      )}

      {/* Add Property Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Real Estate Property"
        description="List a new residential or commercial property in your CRM inventory."
      >
        <form onSubmit={handleCreateProperty} className="space-y-4 text-xs sm:text-sm">
          <Input
            label="Property Title *"
            required
            placeholder="e.g. The Grand Emerald Heights - Luxury 3BHK"
            value={newPropForm.title}
            onChange={(e) => setNewPropForm({ ...newPropForm, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Property Type"
              value={newPropForm.propertyType}
              onChange={(e) =>
                setNewPropForm({ ...newPropForm, propertyType: e.target.value as PropertyType })
              }
              options={[
                { value: 'APARTMENT', label: 'Apartment' },
                { value: 'VILLA', label: 'Villa' },
                { value: 'PENTHOUSE', label: 'Penthouse' },
                { value: 'COMMERCIAL', label: 'Commercial' },
                { value: 'DUPLEX', label: 'Duplex' },
              ]}
            />
            <Input
              label="Price (INR) *"
              type="number"
              required
              value={newPropForm.priceINR}
              onChange={(e) => setNewPropForm({ ...newPropForm, priceINR: Number(e.target.value) })}
            />
            <Input
              label="Area (Sq.Ft) *"
              type="number"
              required
              value={newPropForm.areaSqFt}
              onChange={(e) => setNewPropForm({ ...newPropForm, areaSqFt: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Locality / Area *"
              required
              placeholder="e.g. OMR / Whitefield"
              value={newPropForm.locality}
              onChange={(e) => setNewPropForm({ ...newPropForm, locality: e.target.value })}
            />
            <Input
              label="City *"
              required
              placeholder="e.g. Chennai / Bangalore"
              value={newPropForm.city}
              onChange={(e) => setNewPropForm({ ...newPropForm, city: e.target.value })}
            />
          </div>

          <Textarea
            label="Property Description"
            rows={3}
            value={newPropForm.description}
            onChange={(e) => setNewPropForm({ ...newPropForm, description: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4C9B9]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="md" className="font-bold">
              List Property
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal for Property Deletion */}
      {propertyToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setPropertyToDelete(null)}
          title="Confirm Property Deletion"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#29251F]">
              Are you sure you want to permanently delete <strong className="text-[#805B25]">{propertyToDelete.title}</strong> from your organization inventory?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPropertyToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={confirmDeleteProperty}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Delete Property
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
