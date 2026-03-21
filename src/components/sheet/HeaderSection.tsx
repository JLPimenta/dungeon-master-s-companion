import type { CharacterSheet } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProficiencyBonus } from '@/utils/calculations';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  sheet: CharacterSheet;
  onChange: (patch: Partial<CharacterSheet>) => void;
}

export function HeaderSection({ sheet, onChange }: Props) {
  const profBonus = getProficiencyBonus(sheet.level);
  const [isOpen, setIsOpen] = useState(true);

  return (
      <Card className="border-primary/20">
        <CardContent className="px-4 pt-4 pb-4">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            {!isOpen && (
                <CollapsibleTrigger asChild>
                  <button
                      type="button"
                      className="w-full flex items-center gap-3 rounded-md border border-primary/30 bg-transparent px-4 py-3 text-left hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors"
                  >
                    <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:gap-0">
                  <span
                      className="font-semibold text-base text-foreground truncate"
                      style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {sheet.name || 'Sem Nome'}
                  </span>

                      {(sheet.class || sheet.level) && (
                          <span className="flex items-center gap-1 text-muted-foreground mt-0.5 sm:mt-0 sm:ml-0">
                      {sheet.class && (
                          <>
                            <span className="hidden sm:inline px-2 text-border">|</span>
                            <span>{sheet.class}</span>
                          </>
                      )}
                            {sheet.level != null && (
                                <>
                                  <span className="px-2 text-border">|</span>
                                  <span>Nível {sheet.level}</span>
                                </>
                            )}
                    </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                  <span className="rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary whitespace-nowrap">
                    Proficiência: +{profBonus}
                  </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                    </div>
                  </button>
                </CollapsibleTrigger>
            )}

            <CollapsibleContent>
              {isOpen && (
                  <div className="flex justify-end mb-2">
                    <button
                        type="button"
                        aria-label="Recolher cabeçalho"
                        onClick={() => setIsOpen(false)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <ChevronDown className="h-4 w-4 rotate-180 transition-transform duration-200" />
                    </button>
                  </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                <div className="col-span-2 lg:col-span-2">
                  <Label className="text-sm text-muted-foreground">Nome</Label>
                  <Input
                      value={sheet.name}
                      onChange={e => onChange({ name: e.target.value })}
                      className="mt-1 text-lg font-semibold"
                      style={{ fontFamily: 'var(--font-heading)' }}
                  />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <Label className="text-sm text-muted-foreground">Classe</Label>
                  <Input value={sheet.class} onChange={e => onChange({ class: e.target.value })} className="mt-1" />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <Label className="text-sm text-muted-foreground">Nível</Label>
                  <Input
                      type="number"
                      min={1}
                      max={20}
                      value={sheet.level}
                      onChange={e => onChange({ level: Number(e.target.value) || 1 })}
                      className="mt-1"
                  />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <Label className="text-sm text-muted-foreground">Espécie</Label>
                  <Input value={sheet.species} onChange={e => onChange({ species: e.target.value })} className="mt-1" />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <Label className="text-sm text-muted-foreground">Subclasse</Label>
                  <Input value={sheet.subclass} onChange={e => onChange({ subclass: e.target.value })} className="mt-1" />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <Label className="text-sm text-muted-foreground">Antecedente</Label>
                  <Input value={sheet.background} onChange={e => onChange({ background: e.target.value })} className="mt-1" />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <Label className="text-sm text-muted-foreground">XP</Label>
                  <Input
                      type="number"
                      min={0}
                      value={sheet.xp}
                      onChange={e => onChange({ xp: Number(e.target.value) || 0 })}
                      className="mt-1"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-end lg:col-span-2">
                  <div className="flex h-10 w-full items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                    Bônus de Proficiência +{profBonus}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
  );
}
