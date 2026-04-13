'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MoreHorizontal, Eye, Pencil, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/empty-state';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useDebounce } from '@/hooks/use-debounce';
import { getClients, archiveClient } from '@/app/(dashboard)/clients/actions';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '@/lib/types';

interface ClientTableProps {
  initialClients: Client[];
}

const PAGE_SIZE = 10;

export function ClientTable({ initialClients }: ClientTableProps) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [archiveTarget, setArchiveTarget] = useState<Client | null>(null);
  const [archiving, setArchiving] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchClients = async () => {
      const data = await getClients(debouncedSearch || undefined);
      setClients(data);
      setPage(0);
    };
    fetchClients();
  }, [debouncedSearch]);

  const paginatedClients = clients.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(clients.length / PAGE_SIZE);

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      const result = await archiveClient(archiveTarget.id);
      if (result.success) {
        toast.success(`${archiveTarget.name} archived`);
        setClients(prev => prev.filter(c => c.id !== archiveTarget.id));
        setArchiveTarget(null);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to archive client');
    } finally {
      setArchiving(false);
    }
  };

  if (clients.length === 0 && !search) {
    return (
      <EmptyState
        icon={Users}
        title="No clients yet"
        description="Add your first client to start managing your business relationships."
        actionLabel="Add Client"
        onAction={() => router.push('/clients/new')}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="pl-9"
          aria-label="Search clients"
        />
      </div>

      {paginatedClients.length === 0 && search ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No clients matching &quot;{search}&quot;</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.map(client => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/clients/${client.id}`)}
                  >
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{client.company || '—'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Client actions" onClick={(e: React.MouseEvent) => e.stopPropagation()} />}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/clients/${client.id}`); }}>
                            <Eye className="h-4 w-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/clients/${client.id}`); }}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); setArchiveTarget(client); }}
                            className="text-destructive"
                          >
                            <Archive className="h-4 w-4 mr-2" /> Archive
                          </DropdownMenuItem>
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
                Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, clients.length)} of {clients.length}
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
        </>
      )}

      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title="Archive Client"
        description={`Are you sure you want to archive "${archiveTarget?.name}"? You can restore them later.`}
        confirmLabel="Archive"
        variant="destructive"
        onConfirm={handleArchive}
        loading={archiving}
      />
    </div>
  );
}
