"use client";
import React from 'react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, X, Cloud, Edit2, Trash, RotateCw, MoreHorizontal, Save } from 'lucide-react';
// import { getFlowDiagramSync } from '@/services/diagram.service';
import { Badge } from '@/components/ui/badge';

interface SaveBarProps {
  activeFlowId: string | null;
  titleInput: string;
  setTitleInput: (v: string) => void;
  isEditingTitle: boolean;
  setIsEditingTitle: (b: boolean) => void;
  saveTitle: () => void;
  cancelEditTitle: () => void;
  isDirty: boolean;
  lastSaved: string | null;
  saveDiagram: () => void;
  restoreSavedVersion: () => void;
  onDelete: () => void;
}

export const SaveBar: React.FC<SaveBarProps> = ({
  activeFlowId,
  titleInput,
  setTitleInput,
  isEditingTitle,
  setIsEditingTitle,
  saveTitle,
  cancelEditTitle,
  isDirty,
  lastSaved,
  saveDiagram,
  restoreSavedVersion,
  onDelete,
}) => {
  const currentTitle = titleInput && titleInput.trim() ? titleInput.trim() : 'Untitled Diagram';

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-full max-w-3xl px-4">
      <div className="flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-md px-4 py-2 shadow-sm">
        
        {/* Left Section: Title */}
        <div className="flex items-center gap-2 flex-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
              <Input
                className="h-7 w-48 text-sm px-2 py-1 bg-muted/50 border-transparent focus:border-input focus:bg-background transition-colors"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') cancelEditTitle(); }}
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={saveTitle}>
                <Check className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={cancelEditTitle}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="group flex items-center gap-2 cursor-pointer" onClick={() => setIsEditingTitle(true)}>
              <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors truncate max-w-[200px]">
                {currentTitle || 'Untitled Diagram'}
              </span>
              <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1">
            
          {/* Status Indicator */}
          <div className="mr-2 flex items-center">
             {isDirty ? (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200">
                    Unsaved
                </Badge>
             ) : (
                <span className="text-[10px] text-muted-foreground px-2">
                    {lastSaved ? `Saved ${lastSaved}` : 'All changes saved'}
                </span>
             )}
          </div>

          <div className="h-4 w-[1px] bg-border mx-1" />

          {/* Save Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                    variant={isDirty ? "default" : "ghost"} 
                    size="sm" 
                    onClick={saveDiagram}
                    className={`h-8 px-3 gap-2 ${!isDirty && "text-muted-foreground"}`}
                    disabled={!isDirty}
                >
                  {isDirty ? <Save className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
                  <span className="sr-only sm:not-sr-only sm:inline-block text-xs">
                    {isDirty ? 'Save' : 'Saved'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isDirty ? 'Save changes (Ctrl+S)' : 'No changes to save'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Restore Button (Only if dirty) */}
          {isDirty && (
            <TooltipProvider>
                <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={restoreSavedVersion}>
                        <RotateCw className="w-3.5 h-3.5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Revert to last saved version</TooltipContent>
                </Tooltip>
            </TooltipProvider>
          )}

          {/* More Menu (Delete hidden here) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mt-2">
              <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                <Edit2 className="mr-2 w-3.5 h-3.5" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={onDelete}
              >
                <Trash className="mr-2 w-3.5 h-3.5" />
                Delete Diagram
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </div>
  );
};

export default SaveBar;
