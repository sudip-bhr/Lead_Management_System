import { useDraggable } from '@dnd-kit/core';

export function KanbanCard({ lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { ...lead }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="mb-2 cursor-grab rounded-md border bg-white p-3 shadow-sm hover:border-blue-400"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{lead.name}</h4>
        <span className="text-xs text-gray-500 capitalize">{lead.score}</span>
      </div>
      <p className="mt-1 text-xs text-gray-600">{lead.course_interest || 'General'}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 capitalize">{lead.source}</span>
      </div>
    </div>
  );
}
