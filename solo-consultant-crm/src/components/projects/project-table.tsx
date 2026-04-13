'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/empty-state';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { DateDisplay } from '@/components/shared/date-display';
import { ProjectStatusBadge } from './project-status-badge';
import { FolderKanban, Search, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteProject } from '@/app/(dashboard)/projects/actions';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PROJECT_TYPE_LABELS } from '@/lib/types';
import type { ProjectWithClient, ProjectStatus } from '@/lib/types';

interface ProjectTableProps {
  projects: ProjectWithClient[];
}

const TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'delivered', label: 'Delivered' },
];

const PAGE_SIZE = 10;

export function ProjectTable({ projects }: ProjectTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let result = projects;
    if (filter !== 'all') {
      result = result.filter(p => p.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [projects, filter, search]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const getCount = (status: string) => {
    if (status === 'all') return projects.length;
    return projects.filter(p => p.status === status).length;
  };

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const result = await deleteProject(deleteId);
      if (result.success) {
        toast.success('Project deleted');
        setDeleteId(null);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Create your first AI project to get started."
        actionLabel="New Project"
        onAction={() => router.push('/projects/new')}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => { setFilter(v); setPage(0); }}>
        <TabsList>
          {TABS.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              {tab.label}
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 ml-1">
                {getCount(tab.value)}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead className="hidden lg:table-cell">Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right hidden md:table-cell">Est. Value</TableHead>
              <TableHead className="hidden lg:table-cell">Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(project => (
              <TableRow key={project.id}>
                <TableCell>
                  <Link href={`/projects/${project.id}`} className="font-medium text-foreground hover:underline">
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {project.client?.name || 'Unknown'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="secondary" className="text-xs">
                    {PROJECT_TYPE_LABELS[project.project_type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ProjectStatusBadge status={project.status} />
                </TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  {project.estimated_value ? <CurrencyDisplay amount={project.estimated_value} /> : '—'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <DateDisplay date={project.created_at} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/edit`)}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      {(project.status === 'draft' || project.status === 'cancelled') && (
                        <DropdownMenuItem onClick={() => setDeleteId(project.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Project"
        description="This will permanently delete this project and all its phases, comments, and deliverables. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
