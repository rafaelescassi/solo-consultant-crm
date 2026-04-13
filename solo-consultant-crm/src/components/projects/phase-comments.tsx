'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DateDisplay } from '@/components/shared/date-display';
import { toast } from 'sonner';
import { addPhaseComment, deleteComment } from '@/app/(dashboard)/projects/actions';
import { Lock, EyeOff, Trash2 } from 'lucide-react';
import type { ProjectComment } from '@/lib/types';

interface PhaseCommentsProps {
  projectId: string;
  phaseNumber: number;
  comments: ProjectComment[];
}

export function PhaseComments({ projectId, phaseNumber, comments }: PhaseCommentsProps) {
  const [content, setContent] = useState('');
  const [isClientVisible, setIsClientVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  const phaseComments = comments.filter(c => c.phase_number === phaseNumber);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    try {
      const result = await addPhaseComment({
        project_id: projectId,
        phase_number: phaseNumber,
        content: content.trim(),
        is_client_visible: isClientVisible,
      });

      if (result.success) {
        setContent('');
        toast.success('Comment added');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      const result = await deleteComment(commentId);
      if (result.success) {
        toast.success('Comment deleted');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to delete comment');
    }
  }

  return (
    <div>
      {/* Comments list */}
      <div className="space-y-4">
        {phaseComments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
        ) : (
          phaseComments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-xs flex items-center justify-center flex-shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Admin</span>
                  <DateDisplay date={comment.created_at} format="relative" className="text-xs text-muted-foreground" />
                  {!comment.is_client_visible && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground italic">
                      <Lock className="h-3 w-3" /> Internal
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground mt-1">{comment.content}</p>
              </div>
              <div className="flex items-start gap-1 flex-shrink-0">
                {!comment.is_client_visible && <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="mt-6 border-t pt-4 space-y-3">
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isClientVisible}
              onChange={e => setIsClientVisible(e.target.checked)}
              className="rounded border-border"
            />
            Visible to client
          </label>
          <Button type="submit" size="sm" disabled={loading || !content.trim()}>
            {loading ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
