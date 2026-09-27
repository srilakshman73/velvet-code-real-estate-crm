'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Property, PropertyType, PropertyStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Modal, Drawer } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatINR, formatINRPricePerSqFt } from '@/lib/utils';
import {
  Building2,
  PlusCircle,
  Search,
  LayoutGrid,
  List,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  Trash2,
  Edit,
  Phone,
  User,
} from 'lucide-react';

const PROPERTY_TYPE_OPTIONS = [
  { value: 'APARTMENT', label: 'Apartment / Flat' },
  { value: 'VILLA', label: 'Luxury Villa' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
  { value: 'COMMERCIAL', label: 'Commercial Suite' },
  { value: 'DUPLEX', label: 'Duplex' },
];

const PROPERTY_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'RENTED', label: 'Rented' },
];

const FURNISHING_OPTIONS = [
  { value: 'Unfurnished', label: 'Unfurnished' },
  { value: 'Semi-Furnished', label: 'Semi-Furnished' },
  { value: 'Fully Furnished', label: 'Fully Furnished' },
];

const FACING_OPTIONS = [
  { value: 'North', label: 'North' },
  { value: 'East', label: 'East' },
  { value: 'West', label: 'West' },
  { value: 'South', label: 'South' },
  { value: 'North-East', label: 'North-East' },
  { value: 'North-West', label: 'North-West' },
];

function normalizeIntegerInput(raw: string): string {
  const digitsOnly = raw.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return digitsOnly.replace(/^0+(?=\d)/, '');
}

export default function PropertiesPage() {
  const { properties, addProperty, updateProperty, deleteProperty, users } = useCRMStore();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form state for creating a property
  const [newPropForm, setNewPropForm] = useState<{
    title: string;
    description: string;
    propertyType: PropertyType;
    status: PropertyStatus;
    priceINR: string;
    areaSqFt: string;
    bedrooms: number;
    bathrooms: number;
    furnishing: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
    facing: 'North' | 'East' | 'West' | 'South' | 'North-East' | 'North-West';
    address: string;
    locality: string;
    city: string;
    state: string;
    ownerName: string;
    ownerPhone: string;
    featuredImageUrl: string;
    amenitiesInput: string;
    assignedAgentId: string;
  }>({
    title: '',
    description: '',
    propertyType: 'APARTMENT',
    status: 'AVAILABLE',
    priceINR: '12500000',
    areaSqFt: '1650',
    bedrooms: 3,
    bathrooms: 3,
    furnishing: 'Fully Furnished',
    facing: 'North-East',
    address: '',
    locality: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    ownerName: '',
    ownerPhone: '',
    featuredImageUrl: '',
    amenitiesInput: 'Swimming Pool, Clubhouse & Gym, Covered Parking, 24/7 Power Backup',
    assignedAgentId: users[0]?.id || '',
  });

  // Form state for editing a property
  const [editPropForm, setEditPropForm] = useState<{
    id: string;
    title: string;
    description: string;
    propertyType: PropertyType;
    status: PropertyStatus;
    priceINR: string;
    areaSqFt: string;
    bedrooms: number;
    bathrooms: number;
    furnishing: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
    facing: 'North' | 'East' | 'West' | 'South' | 'North-East' | 'North-West';
    address: string;
    locality: string;
    city: string;
    state: string;
    ownerName: string;
    ownerPhone: string;
    featuredImageUrl: string;
    amenitiesInput: string;
    assignedAgentId: string;
  } | null>(null);

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

    const parsedAmenities = newPropForm.amenitiesInput
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const priceNum = parseInt(newPropForm.priceINR, 10) || 0;
    const areaNum = parseInt(newPropForm.areaSqFt, 10) || 0;

    const res = addProperty({
      title: newPropForm.title,
      description: newPropForm.description,
      propertyType: newPropForm.propertyType,
      status: newPropForm.status,
      priceINR: priceNum,
      areaSqFt: areaNum,
      bedrooms: Number(newPropForm.bedrooms),
      bathrooms: Number(newPropForm.bathrooms),
      furnishing: newPropForm.furnishing,
      facing: newPropForm.facing,
      address: newPropForm.address || newPropForm.locality,
      locality: newPropForm.locality,
      city: newPropForm.city,
      state: newPropForm.state,
      ownerName: newPropForm.ownerName,
      ownerPhone: newPropForm.ownerPhone,
      featuredImageUrl: newPropForm.featuredImageUrl || undefined,
      images: newPropForm.featuredImageUrl ? [newPropForm.featuredImageUrl] : [],
      amenities: parsedAmenities.length > 0 ? parsedAmenities : ['Security', 'Water Supply'],
      assignedAgentId: newPropForm.assignedAgentId,
      assignedAgentName: assigned ? assigned.name : undefined,
    });

    if (!res.success) {
      alert(res.error);
      return;
    }

    // Reset form
    setNewPropForm({
      title: '',
      description: '',
      propertyType: 'APARTMENT',
      status: 'AVAILABLE',
      priceINR: '',
      areaSqFt: '',
      bedrooms: 3,
      bathrooms: 3,
      furnishing: 'Fully Furnished',
      facing: 'North-East',
      address: '',
      locality: '',
      city: 'Chennai',
      state: 'Tamil Nadu',
      ownerName: '',
      ownerPhone: '',
      featuredImageUrl: '',
      amenitiesInput: '',
      assignedAgentId: users[0]?.id || '',
    });

    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (prop: Property) => {
    setEditPropForm({
      id: prop.id,
      title: prop.title,
      description: prop.description || '',
      propertyType: prop.propertyType,
      status: prop.status,
      priceINR: prop.priceINR ? String(prop.priceINR) : '',
      areaSqFt: prop.areaSqFt ? String(prop.areaSqFt) : '',
      bedrooms: prop.bedrooms || 3,
      bathrooms: prop.bathrooms || 3,
      furnishing: prop.furnishing || 'Fully Furnished',
      facing: prop.facing || 'North-East',
      address: prop.address || '',
      locality: prop.locality || '',
      city: prop.city || '',
      state: prop.state || '',
      ownerName: prop.ownerName || '',
      ownerPhone: prop.ownerPhone || '',
      featuredImageUrl: prop.featuredImageUrl || (prop.images && prop.images[0]) || '',
      amenitiesInput: prop.amenities ? prop.amenities.join(', ') : '',
      assignedAgentId: prop.assignedAgentId || users[0]?.id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPropForm) return;

    const assigned = users.find((u) => u.id === editPropForm.assignedAgentId);
    const parsedAmenities = editPropForm.amenitiesInput
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const priceNum = parseInt(editPropForm.priceINR, 10) || 0;
    const areaNum = parseInt(editPropForm.areaSqFt, 10) || 0;

    updateProperty(editPropForm.id, {
      title: editPropForm.title,
      description: editPropForm.description,
      propertyType: editPropForm.propertyType,
      status: editPropForm.status,
      priceINR: priceNum,
      areaSqFt: areaNum,
      bedrooms: Number(editPropForm.bedrooms),
      bathrooms: Number(editPropForm.bathrooms),
      furnishing: editPropForm.furnishing,
      facing: editPropForm.facing,
      address: editPropForm.address || editPropForm.locality,
      locality: editPropForm.locality,
      city: editPropForm.city,
      state: editPropForm.state,
      ownerName: editPropForm.ownerName,
      ownerPhone: editPropForm.ownerPhone,
      featuredImageUrl: editPropForm.featuredImageUrl || undefined,
      images: editPropForm.featuredImageUrl ? [editPropForm.featuredImageUrl] : [],
      amenities: parsedAmenities,
      assignedAgentId: editPropForm.assignedAgentId,
      assignedAgentName: assigned ? assigned.name : undefined,
    });

    if (selectedProperty?.id === editPropForm.id) {
      setSelectedProperty({
        ...selectedProperty,
        title: editPropForm.title,
        description: editPropForm.description,
        propertyType: editPropForm.propertyType,
        status: editPropForm.status,
        priceINR: priceNum,
        areaSqFt: areaNum,
        bedrooms: Number(editPropForm.bedrooms),
        bathrooms: Number(editPropForm.bathrooms),
        furnishing: editPropForm.furnishing,
        facing: editPropForm.facing,
        address: editPropForm.address || editPropForm.locality,
        locality: editPropForm.locality,
        city: editPropForm.city,
        state: editPropForm.state,
        ownerName: editPropForm.ownerName,
        ownerPhone: editPropForm.ownerPhone,
        featuredImageUrl: editPropForm.featuredImageUrl || undefined,
        images: editPropForm.featuredImageUrl ? [editPropForm.featuredImageUrl] : [],
        amenities: parsedAmenities,
        assignedAgentId: editPropForm.assignedAgentId,
        assignedAgentName: assigned ? assigned.name : undefined,
      });
    }

    setIsEditModalOpen(false);
    setEditPropForm(null);
  };

  const openDetail = (prop: Property) => {
    setSelectedProperty(prop);
    setIsDrawerOpen(true);
  };

  // Helper to render property cover or luxury neutral placeholder
  const renderPropertyImage = (prop: Property, className = 'h-48') => {
    const imageUrl = prop.featuredImageUrl || (prop.images && prop.images[0]);
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={prop.title}
          className={`w-full ${className} object-cover group-hover:scale-105 transition-transform duration-500`}
        />
      );
    }
    return (
      <div className={`w-full ${className} bg-gradient-to-br from-[#EFE6D5] via-[#E4D5BE] to-[#EBCBD4] flex flex-col items-center justify-center text-[#8C455C] gap-2 select-none border-b border-[#EBCBD4]`}>
        <div className="w-12 h-12 rounded-xl bg-[#FFF9FA]/80 border border-[#B86B84]/30 flex items-center justify-center shadow-sm">
          <Building2 className="w-6 h-6 text-[#B86B84]" />
        </div>
        <div className="text-center px-4">
          <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#8C455C] block">
            No Image Available
          </span>
          <span className="text-[9px] text-[#9B828C]">Upload photo in property details</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#FCECEF] text-[#3A2930]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A2930] tracking-tight">
              Property Inventory
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#B86B84]/15 text-[#8C455C] border border-[#B86B84]/30 rounded-full">
              {filteredProperties.length} Properties Listed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#765D66] mt-1">
            Manage your high-end real estate portfolio, authentic photo galleries, and unit availability.
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
      <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#EBCBD4] shadow-[0_8px_24px_rgba(120,90,40,0.08)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9B828C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search properties by title, locality, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FFF5F7] border border-[#EBCBD4] rounded-xl text-xs text-[#3A2930] placeholder:text-[#9B828C] outline-none focus:border-[#B86B84] focus:ring-2 focus:ring-[#B86B84]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#FFF5F7] border border-[#EBCBD4] rounded-xl px-3 py-2 text-xs text-[#3A2930] outline-none focus:border-[#B86B84]"
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
            className="bg-[#FFF5F7] border border-[#EBCBD4] rounded-xl px-3 py-2 text-xs text-[#3A2930] outline-none focus:border-[#B86B84]"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold</option>
            <option value="RENTED">Rented</option>
          </select>

          <div className="bg-[#FFF5F7] border border-[#EBCBD4] p-1 rounded-xl flex items-center gap-1 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#B86B84] text-white shadow-sm' : 'text-[#765D66] hover:text-[#3A2930]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-[#B86B84] text-white shadow-sm' : 'text-[#765D66] hover:text-[#3A2930]'
              }`}
              title="Table View"
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
              className="rounded-2xl bg-[#FFF9FA] border border-[#EBCBD4] overflow-hidden hover:border-[#B86B84] cursor-pointer shadow-[0_8px_24px_rgba(120,90,40,0.08)] hover:shadow-[0_10px_30px_rgba(163,116,50,0.15)] transition-all flex flex-col justify-between group"
            >
              {/* Featured Image or Clean Neutral Placeholder */}
              <div className="relative h-48 w-full bg-[#FCECEF] overflow-hidden">
                {renderPropertyImage(prop, 'h-48')}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm border ${
                      prop.status === 'AVAILABLE'
                        ? 'bg-[#4A7C59] text-white border-[#4A7C59]'
                        : prop.status === 'RESERVED'
                        ? 'bg-[#D98FA5] text-white border-[#D98FA5]'
                        : 'bg-[#A84355] text-white border-[#A84355]'
                    }`}
                  >
                    {prop.status}
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#3A2930]/80 backdrop-blur-sm text-[#FFF9FA] rounded-md">
                    {prop.propertyType}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-[#3A2930]/90 backdrop-blur-md text-[#FFF9FA] font-extrabold text-sm font-mono shadow-md border border-[#B86B84]/40">
                  {formatINR(prop.priceINR, true)}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-serif font-bold text-[#3A2930] group-hover:text-[#8C455C] transition-colors line-clamp-1">
                    {prop.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(prop);
                    }}
                    className="p-1 text-[#765D66] hover:text-[#B86B84] rounded-lg hover:bg-[#B86B84]/10 transition-colors"
                    title="Edit Property"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[#765D66] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B86B84] flex-shrink-0" />
                  <span>{prop.locality}, {prop.city}</span>
                </p>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#EBCBD4] text-xs text-[#3A2930]">
                  <div className="flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-[#765D66]" />
                    <span>{prop.areaSqFt} sq.ft</span>
                  </div>
                  {prop.bedrooms !== undefined && (
                    <div className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-[#765D66]" />
                      <span>{prop.bedrooms} BHK</span>
                    </div>
                  )}
                  {prop.bathrooms !== undefined && (
                    <div className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-[#765D66]" />
                      <span>{prop.bathrooms} Bath</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-[#765D66] pt-1">
                  <span>Rate: {formatINRPricePerSqFt(prop.priceINR, prop.areaSqFt)}</span>
                  <span className="text-[#8C455C] font-semibold">
                    {prop.interestedLeadsCount || 0} Inquiries
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-[#EBCBD4] bg-[#FFF9FA] overflow-hidden shadow-[0_8px_24px_rgba(120,90,40,0.08)]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF5F7] border-b border-[#EBCBD4] text-[#765D66] font-semibold">
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
            <tbody className="divide-y divide-[#EBCBD4]/60">
              {filteredProperties.map((prop) => (
                <tr
                  key={prop.id}
                  onClick={() => openDetail(prop)}
                  className="hover:bg-[#F7EEDC] cursor-pointer transition-colors"
                >
                  <td className="p-4 font-serif font-bold text-[#3A2930] hover:text-[#8C455C]">
                    <div className="flex items-center gap-3">
                      {prop.featuredImageUrl || (prop.images && prop.images[0]) ? (
                        <img
                          src={prop.featuredImageUrl || prop.images[0]}
                          alt={prop.title}
                          className="w-9 h-9 rounded-lg object-cover border border-[#EBCBD4]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-[#EFE6D5] border border-[#EBCBD4] flex items-center justify-center text-[#B86B84]">
                          <Building2 className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-serif font-bold text-[#3A2930]">{prop.title}</div>
                        <div className="text-[10px] text-[#9B828C] font-sans">{prop.furnishing || 'Standard'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[#765D66]">{prop.propertyType}</td>
                  <td className="p-4 text-[#765D66]">{prop.locality}, {prop.city}</td>
                  <td className="p-4 font-extrabold text-[#8C455C] font-mono">
                    {formatINR(prop.priceINR, true)}
                  </td>
                  <td className="p-4 text-[#765D66]">{prop.areaSqFt} sq.ft</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        prop.status === 'AVAILABLE'
                          ? 'bg-[#4A7C59]/10 text-[#4A7C59] border-[#4A7C59]/20'
                          : prop.status === 'RESERVED'
                          ? 'bg-[#B86B84]/10 text-[#8C455C] border-[#B86B84]/25'
                          : 'bg-[#A84355]/10 text-[#A84355] border-[#A84355]/20'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#765D66]">{prop.assignedAgentName || 'Velvet Code'}</td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(prop)}
                        className="p-1.5 text-[#765D66] hover:text-[#B86B84] rounded-lg hover:bg-[#B86B84]/10 transition-colors"
                        title="Edit Property"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPropertyToDelete(prop)}
                        className="p-1.5 text-[#765D66] hover:text-[#A84355] rounded-lg hover:bg-[#A84355]/10 transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
          subtitle={`Property ID: ${selectedProperty.id} â€¢ ${selectedProperty.propertyType}`}
          size="lg"
        >
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Cover Image or Neutral Placeholder */}
            <div className="relative h-60 w-full rounded-xl overflow-hidden border border-[#EBCBD4] bg-[#FCECEF]">
              {selectedProperty.featuredImageUrl || (selectedProperty.images && selectedProperty.images[0]) ? (
                <img
                  src={selectedProperty.featuredImageUrl || selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#EFE6D5] via-[#E4D5BE] to-[#EBCBD4] flex flex-col items-center justify-center text-[#8C455C] gap-2 select-none">
                  <Building2 className="w-10 h-10 text-[#B86B84]" />
                  <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#8C455C]">
                    No Photo Uploaded
                  </span>
                </div>
              )}
              <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-[#3A2930]/90 backdrop-blur-md text-[#FFF9FA] font-bold font-mono border border-[#B86B84]/30">
                {formatINR(selectedProperty.priceINR)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-3">
              <h4 className="font-bold text-[#8C455C] uppercase tracking-wider text-xs font-serif">
                Specifications & Layout
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#765D66] block">Carpet / Super Area</span>
                  <span className="text-[#3A2930] font-semibold">{selectedProperty.areaSqFt} sq.ft</span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Bedrooms / Baths</span>
                  <span className="text-[#3A2930] font-semibold">
                    {selectedProperty.bedrooms || 0} BHK / {selectedProperty.bathrooms || 0} Bath
                  </span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Furnishing</span>
                  <span className="text-[#3A2930] font-semibold">{selectedProperty.furnishing || 'Semi'}</span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Facing Direction</span>
                  <span className="text-[#3A2930] font-semibold">{selectedProperty.facing || 'East'}</span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Location</span>
                  <span className="text-[#3A2930] font-semibold">{selectedProperty.locality}, {selectedProperty.city}</span>
                </div>
                <div>
                  <span className="text-[#765D66] block">Listing Status</span>
                  <span className="text-[#4A7C59] font-bold">{selectedProperty.status}</span>
                </div>
              </div>
            </div>

            {selectedProperty.ownerName && (
              <div className="p-4 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-2">
                <h4 className="font-bold text-[#8C455C] uppercase tracking-wider text-xs font-serif">
                  Property Ownership Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#3A2930]">
                    <User className="w-3.5 h-3.5 text-[#B86B84]" />
                    <span>{selectedProperty.ownerName}</span>
                  </div>
                  {selectedProperty.ownerPhone && (
                    <div className="flex items-center gap-1.5 text-[#3A2930]">
                      <Phone className="w-3.5 h-3.5 text-[#B86B84]" />
                      <span>{selectedProperty.ownerPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-2">
              <h4 className="font-bold text-[#8C455C] uppercase tracking-wider text-xs font-serif">
                Amenities & Features
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedProperty.amenities?.map((a, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs bg-[#FFF5F7] border border-[#EBCBD4] rounded-lg text-[#3A2930] flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#4A7C59]" />
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF9FA] border border-[#EBCBD4] space-y-2">
              <h4 className="font-bold text-[#8C455C] uppercase tracking-wider text-xs font-serif">
                Description & Highlights
              </h4>
              <p className="text-xs text-[#3A2930] leading-relaxed bg-[#FFF5F7] p-3 rounded-lg border border-[#EBCBD4]">
                {selectedProperty.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-4 border-t border-[#EBCBD4] flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  handleOpenEdit(selectedProperty);
                }}
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Edit Specifications
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setPropertyToDelete(selectedProperty)}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Delete Listing
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
        description="List a new residential or commercial property with authentic images in your CRM inventory."
      >
        <form onSubmit={handleCreateProperty} className="space-y-4 text-xs sm:text-sm">
          {/* Property Image Upload */}
          <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#EBCBD4]">
            <ImageUpload
              label="Primary Property Cover Photo (JPG, JPEG, PNG, WebP)"
              value={newPropForm.featuredImageUrl}
              onChange={(val) => setNewPropForm({ ...newPropForm, featuredImageUrl: val || '' })}
              placeholderText="Upload high-resolution property exterior or showroom photo"
            />
          </div>

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
              options={PROPERTY_TYPE_OPTIONS}
            />
            <Input
              label="Price (INR) *"
              type="text"
              required
              placeholder="e.g. 12500000"
              value={newPropForm.priceINR}
              onChange={(e) =>
                setNewPropForm({
                  ...newPropForm,
                  priceINR: normalizeIntegerInput(e.target.value),
                })
              }
            />
            <Input
              label="Area (Sq.Ft) *"
              type="text"
              required
              placeholder="e.g. 1650"
              value={newPropForm.areaSqFt}
              onChange={(e) =>
                setNewPropForm({
                  ...newPropForm,
                  areaSqFt: normalizeIntegerInput(e.target.value),
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Bedrooms (BHK)"
              type="number"
              min={0}
              max={20}
              value={newPropForm.bedrooms}
              onChange={(e) => setNewPropForm({ ...newPropForm, bedrooms: Number(e.target.value) })}
            />
            <Input
              label="Bathrooms"
              type="number"
              min={0}
              max={20}
              value={newPropForm.bathrooms}
              onChange={(e) => setNewPropForm({ ...newPropForm, bathrooms: Number(e.target.value) })}
            />
            <Select
              label="Furnishing"
              value={newPropForm.furnishing}
              onChange={(e) =>
                setNewPropForm({
                  ...newPropForm,
                  furnishing: e.target.value as 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished',
                })
              }
              options={FURNISHING_OPTIONS}
            />
            <Select
              label="Facing Direction"
              value={newPropForm.facing}
              onChange={(e) =>
                setNewPropForm({
                  ...newPropForm,
                  facing: e.target.value as 'North' | 'East' | 'West' | 'South' | 'North-East' | 'North-West',
                })
              }
              options={FACING_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Locality / Area *"
              required
              placeholder="e.g. OMR / Whitefield / Jubilee Hills"
              value={newPropForm.locality}
              onChange={(e) => setNewPropForm({ ...newPropForm, locality: e.target.value })}
            />
            <Input
              label="City *"
              required
              placeholder="e.g. Chennai / Bengaluru / Hyderabad"
              value={newPropForm.city}
              onChange={(e) => setNewPropForm({ ...newPropForm, city: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Owner / Builder Name"
              placeholder="e.g. V. Sundaram Properties"
              value={newPropForm.ownerName}
              onChange={(e) => setNewPropForm({ ...newPropForm, ownerName: e.target.value })}
            />
            <Input
              label="Owner / Builder Phone"
              placeholder="e.g. +91 98400 44332"
              value={newPropForm.ownerPhone}
              onChange={(e) => setNewPropForm({ ...newPropForm, ownerPhone: e.target.value })}
            />
          </div>

          <Input
            label="Amenities (Comma-separated)"
            placeholder="e.g. Swimming Pool, Gym, Covered Parking, 24/7 Power Backup"
            value={newPropForm.amenitiesInput}
            onChange={(e) => setNewPropForm({ ...newPropForm, amenitiesInput: e.target.value })}
          />

          <Select
            label="Assigned Real Estate Consultant *"
            value={newPropForm.assignedAgentId}
            onChange={(e) => setNewPropForm({ ...newPropForm, assignedAgentId: e.target.value })}
            options={users.map((u) => ({
              value: u.id,
              label: `${u.name} (${u.role})`,
            }))}
          />

          <Textarea
            label="Property Description"
            rows={3}
            placeholder="Detailed architectural specifications, carpet area breakdown, view orientation..."
            value={newPropForm.description}
            onChange={(e) => setNewPropForm({ ...newPropForm, description: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBCBD4]">
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

      {/* Edit Property Modal */}
      {isEditModalOpen && editPropForm && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditPropForm(null);
          }}
          title="Edit Property Listing"
          description="Update property specifications, pricing, and uploaded imagery."
        >
          <form onSubmit={handleUpdateProperty} className="space-y-4 text-xs sm:text-sm">
            {/* Property Image Upload */}
            <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#EBCBD4]">
              <ImageUpload
                label="Primary Property Cover Photo (JPG, JPEG, PNG, WebP)"
                value={editPropForm.featuredImageUrl}
                onChange={(val) => setEditPropForm({ ...editPropForm, featuredImageUrl: val || '' })}
                placeholderText="Upload high-resolution property exterior or showroom photo"
              />
            </div>

            <Input
              label="Property Title *"
              required
              value={editPropForm.title}
              onChange={(e) => setEditPropForm({ ...editPropForm, title: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Property Type"
                value={editPropForm.propertyType}
                onChange={(e) =>
                  setEditPropForm({ ...editPropForm, propertyType: e.target.value as PropertyType })
                }
                options={PROPERTY_TYPE_OPTIONS}
              />
              <Input
                label="Price (INR) *"
                type="text"
                required
                value={editPropForm.priceINR}
                onChange={(e) =>
                  setEditPropForm({
                    ...editPropForm,
                    priceINR: normalizeIntegerInput(e.target.value),
                  })
                }
              />
              <Input
                label="Area (Sq.Ft) *"
                type="text"
                required
                value={editPropForm.areaSqFt}
                onChange={(e) =>
                  setEditPropForm({
                    ...editPropForm,
                    areaSqFt: normalizeIntegerInput(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Input
                label="Bedrooms (BHK)"
                type="number"
                min={0}
                max={20}
                value={editPropForm.bedrooms}
                onChange={(e) => setEditPropForm({ ...editPropForm, bedrooms: Number(e.target.value) })}
              />
              <Input
                label="Bathrooms"
                type="number"
                min={0}
                max={20}
                value={editPropForm.bathrooms}
                onChange={(e) => setEditPropForm({ ...editPropForm, bathrooms: Number(e.target.value) })}
              />
              <Select
                label="Furnishing"
                value={editPropForm.furnishing}
                onChange={(e) =>
                  setEditPropForm({
                    ...editPropForm,
                    furnishing: e.target.value as 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished',
                  })
                }
                options={FURNISHING_OPTIONS}
              />
              <Select
                label="Facing Direction"
                value={editPropForm.facing}
                onChange={(e) =>
                  setEditPropForm({
                    ...editPropForm,
                    facing: e.target.value as 'North' | 'East' | 'West' | 'South' | 'North-East' | 'North-West',
                  })
                }
                options={FACING_OPTIONS}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Locality / Area *"
                required
                value={editPropForm.locality}
                onChange={(e) => setEditPropForm({ ...editPropForm, locality: e.target.value })}
              />
              <Input
                label="City *"
                required
                value={editPropForm.city}
                onChange={(e) => setEditPropForm({ ...editPropForm, city: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Owner / Builder Name"
                value={editPropForm.ownerName}
                onChange={(e) => setEditPropForm({ ...editPropForm, ownerName: e.target.value })}
              />
              <Input
                label="Owner / Builder Phone"
                value={editPropForm.ownerPhone}
                onChange={(e) => setEditPropForm({ ...editPropForm, ownerPhone: e.target.value })}
              />
            </div>

            <Input
              label="Amenities (Comma-separated)"
              value={editPropForm.amenitiesInput}
              onChange={(e) => setEditPropForm({ ...editPropForm, amenitiesInput: e.target.value })}
            />

            <Select
              label="Assigned Real Estate Consultant *"
              value={editPropForm.assignedAgentId}
              onChange={(e) => setEditPropForm({ ...editPropForm, assignedAgentId: e.target.value })}
              options={users.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.role})`,
              }))}
            />

            <Textarea
              label="Property Description"
              rows={3}
              value={editPropForm.description}
              onChange={(e) => setEditPropForm({ ...editPropForm, description: e.target.value })}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBCBD4]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditPropForm(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="md" className="font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmation Modal for Property Deletion */}
      {propertyToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setPropertyToDelete(null)}
          title="Confirm Property Deletion"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#3A2930]">
              Are you sure you want to permanently delete <strong className="text-[#8C455C]">{propertyToDelete.title}</strong> from your organization inventory?
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

