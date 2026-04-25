'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCommunicationStore } from '@/lib/communicationStore';
import { useAppStore } from '@/lib/appStore';

export default function WorkspaceSidebar() {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
  } = useCommunicationStore();
  const unreadByWorkspace: Record<string, number> = {}; // TODO: implement unread tracking

  const activeRole = useAppStore(s => s.activeRole);
  const isAdmin = activeRole === 'admin';
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <div className="flex h-full w-[72px] flex-col items-center bg-slate-900 py-3 gap-2 overflow-y-auto scrollbar-hide">
        {/* Workspace icons */}
        {workspaces.map((ws) => {
          const isActive = ws.id === activeWorkspaceId;
          const hasUnread = (unreadByWorkspace?.[ws.id] ?? 0) > 0;

          return (
            <div key={ws.id} className="relative flex items-center w-full justify-center group">
              {/* Active indicator bar (left side, Discord-style) */}
              <div
                className={`absolute left-0 w-1 rounded-r-full bg-white transition-all duration-200 ${
                  isActive
                    ? 'h-10'
                    : hasUnread
                      ? 'h-2'
                      : 'h-0 group-hover:h-5'
                }`}
              />

              {/* Workspace icon */}
              <button
                onClick={() => setActiveWorkspace(ws.id)}
                className={`relative flex h-12 w-12 items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'rounded-2xl bg-blue-600'
                    : 'rounded-[24px] bg-slate-700 hover:rounded-2xl hover:bg-blue-600'
                }`}
                title={ws.name}
              >
                {ws.icon_url ? (
                  <img
                    src={ws.icon_url}
                    alt={ws.name}
                    className="h-full w-full rounded-inherit object-cover"
                    style={{ borderRadius: 'inherit' }}
                  />
                ) : (
                  <span className="text-lg font-semibold text-white">
                    {ws.name.charAt(0).toUpperCase()}
                  </span>
                )}

                {/* Unread indicator dot */}
                {hasUnread && !isActive && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-red-500" />
                )}
              </button>
            </div>
          );
        })}

        {/* Separator */}
        <div className="mx-auto h-px w-8 bg-slate-700" />

        {/* Create workspace button (admin only) */}
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex h-12 w-12 items-center justify-center rounded-[24px] bg-slate-700 text-green-500 transition-all duration-200 hover:rounded-2xl hover:bg-green-600 hover:text-white"
            title="ワークスペースを作成"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {/* Emit event for parent to show modal */}
      {showCreateModal && (
        <CreateWorkspaceModalTrigger onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
}

/**
 * Internal trigger component -- renders the modal lazily.
 * The actual modal is imported dynamically to keep the sidebar bundle small.
 */
function CreateWorkspaceModalTrigger({ onClose }: { onClose: () => void }) {
  const CreateWorkspaceModal = React.lazy(
    () => import('./CreateWorkspaceModal')
  );

  return (
    <React.Suspense fallback={null}>
      <CreateWorkspaceModal onClose={onClose} />
    </React.Suspense>
  );
}
