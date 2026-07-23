import { useDraggable } from '@dnd-kit/core';
import { MessageSquare, Globe } from 'lucide-react';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

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

  const renderSourceTag = (source) => {
    switch (source) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">
            <MessageSquare className="h-3 w-3 text-emerald-600" /> WhatsApp
          </span>
        );
      case 'facebook':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <FacebookIcon className="h-3 w-3 text-blue-600" /> Facebook
          </span>
        );
      case 'website':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-800 border border-purple-200">
            <Globe className="h-3 w-3 text-purple-600" /> Website
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 capitalize">
            {source}
          </span>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="mb-2 cursor-grab rounded-md border bg-white p-3 shadow-sm hover:border-blue-400"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">{lead.name}</h4>
        <span className={`text-xs font-semibold capitalize ${lead.score === 'hot' ? 'text-red-500' : lead.score === 'warm' ? 'text-orange-500' : 'text-blue-500'}`}>
          {lead.score}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-600">{lead.course_interest || 'General'}</p>
      <div className="mt-2 flex items-center gap-2">
        {renderSourceTag(lead.source)}
      </div>
    </div>
  );
}
