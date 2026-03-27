import { useState } from 'react';
import type { CharacterSheet, CampaignNote } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
  onBlur?: () => void;
}

const CATEGORIES = [
  { value: 'npcs' as const, label: 'NPCs' },
  { value: 'locations' as const, label: 'Locais' },
  { value: 'events' as const, label: 'Eventos' },
  { value: 'general' as const, label: 'Geral' },
];

export function CampaignNotes({ sheet, onChange, onBlur }: Props) {
  const [filter, setFilter] = useState<string>('all');
  const [collapsed, setCollapsed] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const addNote = () => {
    const note: CampaignNote = { id: crypto.randomUUID(), category: 'general', title: '', content: '' };
    onChange({ campaignNotes: [...sheet.campaignNotes, note] });
    setExpandedIds(prev => new Set(prev).add(note.id));
  };

  const updateNote = (idx: number, patch: Partial<CampaignNote>) => {
    const campaignNotes = [...sheet.campaignNotes];
    campaignNotes[idx] = { ...campaignNotes[idx], ...patch };
    onChange({ campaignNotes });
  };

  const removeNote = (idx: number) => {
    onChange({ campaignNotes: sheet.campaignNotes.filter((_, i) => i !== idx) });
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = filter === 'all' ? sheet.campaignNotes : sheet.campaignNotes.filter(n => n.category === filter);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3 pt-4 px-4">
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="flex w-full items-center justify-between"
        >
          <CardTitle className="text-lg text-primary">Notas da Campanha</CardTitle>
          <span className="text-muted-foreground">
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </span>
        </button>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-3 px-4 pb-4" onBlur={onBlur}>
          <div className="flex gap-2 items-center justify-end">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-8 w-28 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={addNote} className="h-8 gap-1 text-sm">
              <Plus className="h-4 w-4" /> Nova Nota
            </Button>
          </div>

          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma nota ainda.</p>
          ) : (
            filtered.map(note => {
              const idx = sheet.campaignNotes.findIndex(n => n.id === note.id);
              const isExpanded = expandedIds.has(note.id);
              return (
                <div key={note.id} className="rounded-md border border-border/50 md:p-3 p-1 space-y-2">
                  
                  {/* MOBILE VIEW */}
                  <div className="md:hidden">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(note.id)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-primary/5 transition-colors"
                    >
                      <span className="font-medium text-foreground truncate">
                        <span className="text-xs text-muted-foreground mr-1.5">
                          {CATEGORIES.find(c => c.value === note.category)?.label || 'Geral'}
                        </span>
                        {note.title || 'Nova nota'}
                      </span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="mt-2 space-y-2 px-1">
                        <div className="flex gap-2 items-center">
                          <Select value={note.category} onValueChange={v => updateNote(idx, { category: v as CampaignNote['category'] })}>
                            <SelectTrigger className="h-9 w-28 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input placeholder="Título" value={note.title} onChange={e => updateNote(idx, { title: e.target.value })} className="h-9 text-sm" />
                          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeNote(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea value={note.content} onChange={e => updateNote(idx, { content: e.target.value })} placeholder="Conteúdo…" className="min-h-[60px] text-sm" />
                      </div>
                    )}
                  </div>

                  {/* DESKTOP VIEW */}
                  <div className="hidden md:block">
                    <div className="flex gap-2 items-center mb-2">
                      <Select value={note.category} onValueChange={v => updateNote(idx, { category: v as CampaignNote['category'] })}>
                        <SelectTrigger className="h-9 w-28 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input placeholder="Título" value={note.title} onChange={e => updateNote(idx, { title: e.target.value })} className="h-9 text-sm" />
                      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeNote(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea value={note.content} onChange={e => updateNote(idx, { content: e.target.value })} placeholder="Conteúdo…" className="min-h-[60px] text-sm" />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      )}
    </Card>
  );
}
