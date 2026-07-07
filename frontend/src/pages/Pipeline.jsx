import { useEffect } from 'react';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { useLeadStore } from '../store/leadStore';
import { api } from '../lib/axios';
import { KanbanColumn } from '../components/leads/KanbanColumn';

const COLUMNS = [
  { id: 'new', title: 'New Leads' },
  { id: 'contacted', title: 'Contacted' },
  { id: 'interested', title: 'Interested' },
  { id: 'demo', title: 'Demo/Trial' },
  { id: 'enrolled', title: 'Enrolled' },
  { id: 'lost', title: 'Lost' }
];

export default function Pipeline() {
  const { leads, loading, fetchLeads, updateLeadLocally } = useLeadStore();

  useEffect(() => {
    fetchLeads({});
  }, [fetchLeads]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const leadId = active.id;
    const newStatus = over.id;
    const currentLead = leads.find(l => l.id === leadId);

    if (currentLead && currentLead.status !== newStatus) {
      const oldStatus = currentLead.status;
      
      // Optimistic update
      updateLeadLocally(leadId, { status: newStatus });
      
      try {
        await api.patch(`/leads/${leadId}`, { status: newStatus });
      } catch (error) {
        console.error('Drag failed, rolling back', error);
        // Rollback
        updateLeadLocally(leadId, { status: oldStatus });
      }
    }
  };

  if (loading) return <div className="p-4">Loading Pipeline...</div>;

  return (
    <div className="h-full flex-col flex">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Pipeline</h1>
        {/* Filters can go here */}
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="flex h-full gap-4 px-1 min-w-max">
            {COLUMNS.map((col) => (
              <KanbanColumn 
                key={col.id} 
                status={col.id} 
                title={col.title} 
                leads={leads.filter(l => l.status === col.id)} 
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
