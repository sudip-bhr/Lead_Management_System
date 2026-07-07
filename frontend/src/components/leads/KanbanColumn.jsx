import { useDroppable } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';

export function KanbanColumn({ status, title, leads }) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex h-full w-72 flex-col rounded-lg bg-gray-100 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">{leads.length}</span>
      </div>
      
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto rounded-md p-1 transition-colors ${isOver ? 'bg-blue-50' : ''}`}
      >
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}
