'use client';

import React, { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import {
  CheckSquare,
  PlusCircle,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export default function TasksPage() {
  const { tasks, addTask, updateTaskStatus, deleteTask, users, leads, deals, currentUser } = useCRMStore();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TaskPriority,
    dueDate: new Date().toISOString().split('T')[0],
    assignedUserId: currentUser?.id || 'usr-admin-01',
    leadId: '',
  });

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'PENDING') return t.status !== 'COMPLETED';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const assigned = users.find((u) => u.id === newTaskForm.assignedUserId);
    const lead = leads.find((l) => l.id === newTaskForm.leadId);

    addTask({
      title: newTaskForm.title,
      description: newTaskForm.description,
      priority: newTaskForm.priority,
      status: 'PENDING',
      dueDate: newTaskForm.dueDate,
      assignedUserId: newTaskForm.assignedUserId,
      assignedUserName: assigned ? assigned.name : 'Velvet Code',
      leadId: newTaskForm.leadId,
      leadName: lead ? lead.name : undefined,
    });

    setIsAddModalOpen(false);
    setNewTaskForm({
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: new Date().toISOString().split('T')[0],
      assignedUserId: currentUser?.id || 'usr-admin-01',
      leadId: '',
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#E9DFC8] text-[#2C241A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C241A] tracking-tight">
              Task Management
            </h1>
            <span className="px-3 py-1 text-xs font-semibold bg-[#A37432]/15 text-[#7A5520] border border-[#A37432]/30 rounded-full">
              {tasks.filter((t) => t.status !== 'COMPLETED').length} Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6A5A44] mt-1">
            Assign sales tasks, client follow-ups, and property documentation milestones.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Add Task
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8C7A5] pb-3">
        {[
          { id: 'ALL', label: 'All Tasks' },
          { id: 'PENDING', label: 'Pending Action' },
          { id: 'COMPLETED', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.id
                ? 'bg-[#A37432] text-white shadow-sm'
                : 'bg-[#FFF9F0] text-[#6A5A44] hover:text-[#2C241A] border border-[#D8C7A5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-8 h-8" />}
          title="No tasks in this view"
          description="Create a task to assign action items to your real estate sales team."
          actionLabel="Add Task"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => {
            const isCompleted = t.status === 'COMPLETED';
            return (
              <div
                key={t.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-[#F4EAD7]/70 border-[#D8C7A5]/60 opacity-65'
                    : 'bg-[#FFF9F0] border-[#D8C7A5] shadow-[0_4px_16px_rgba(120,90,40,0.06)] hover:border-[#A37432]'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() =>
                      updateTaskStatus(t.id, isCompleted ? 'PENDING' : 'COMPLETED')
                    }
                    className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-[#547A61] border-[#547A61] text-white'
                        : 'border-[#D8C7A5] bg-[#FFF9F0] hover:border-[#A37432]'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          isCompleted ? 'line-through text-[#8A7A63]' : 'text-[#2C241A] font-serif'
                        }`}
                      >
                        {t.title}
                      </h4>
                      <PriorityBadge priority={t.priority} />
                    </div>

                    {t.description && (
                      <p className="text-xs text-[#6A5A44]">{t.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#6A5A44] pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#A37432]" /> Due: {t.dueDate}
                      </span>
                      <span>Assigned: {t.assignedUserName}</span>
                      {t.leadName && <span>Buyer: {t.leadName}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-1.5 text-[#6A5A44] hover:text-[#8B4A4A] rounded-lg hover:bg-[#8B4A4A]/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New CRM Task"
        description="Assign a priority follow-up or administrative task."
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs sm:text-sm">
          <Input
            label="Task Title *"
            required
            placeholder="e.g. Follow up on property viewing and agreement terms"
            value={newTaskForm.title}
            onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority Level"
              value={newTaskForm.priority}
              onChange={(e) =>
                setNewTaskForm({ ...newTaskForm, priority: e.target.value as TaskPriority })
              }
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'URGENT', label: 'Urgent' },
              ]}
            />

            <Input
              label="Due Date *"
              type="date"
              required
              value={newTaskForm.dueDate}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assign To Agent"
              value={newTaskForm.assignedUserId}
              onChange={(e) =>
                setNewTaskForm({ ...newTaskForm, assignedUserId: e.target.value })
              }
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>

            <Select
              label="Related Buyer / Lead (Optional)"
              value={newTaskForm.leadId}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, leadId: e.target.value })}
            >
              <option value="">None</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Task Description & Instructions"
            rows={3}
            placeholder="e.g. Coordinate with Emerald Heights builder office."
            value={newTaskForm.description}
            onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D8C7A5]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="md" className="font-bold">
              Save Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
