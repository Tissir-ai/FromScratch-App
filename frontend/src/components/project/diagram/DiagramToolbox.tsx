import React from 'react';
import { Separator } from "@/components/ui/separator";
import { Box, User, Circle, ArrowDown, LayoutTemplate, RectangleEllipsis, Diamond, PlayCircle, StopCircle, Type, StickyNote } from 'lucide-react';

interface DiagramToolboxProps {
  activeDiagramType: string;
}

export const DiagramToolbox: React.FC<DiagramToolboxProps> = ({ activeDiagramType }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData?: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    if (nodeData) {
      event.dataTransfer.setData('application/reactflow-data', JSON.stringify(nodeData));
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  const ToolItem = ({ type, data, label, icon: Icon }: { type: string, data: any, label: string, icon: any }) => (
    <div 
      className="flex flex-col items-center justify-center p-3 border rounded-md cursor-grab bg-background hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
      onDragStart={(event) => onDragStart(event, type, data)}
      draggable
    >
      <Icon className="w-6 h-6 mb-2 text-primary" />
      <span className="text-xs font-medium text-center">{label}</span>
    </div>
  );

  const renderClassTools = () => (
    <div className="grid grid-cols-2 gap-3">
      <ToolItem 
        type="classNode" 
        data={{ label: 'New Class', attributes: ['+ attribute: Type'], methods: ['+ method()'] }} 
        label="Class" 
        icon={Box} 
      />
    </div>
  );

  const renderUseCaseTools = () => (
    <div className="grid grid-cols-2 gap-3">
      <ToolItem 
        type="actorNode" 
        data={{ label: 'Actor' }} 
        label="Actor" 
        icon={User} 
      />
      <ToolItem 
        type="useCaseNode" 
        data={{ label: 'Use Case' }} 
        label="Use Case" 
        icon={Circle} 
      />
    </div>
  );

  const renderSequenceTools = () => (
    <div className="grid grid-cols-2 gap-3">
      <ToolItem 
        type="sequenceLifeline" 
        data={{ label: 'Lifeline' }} 
        label="Lifeline" 
        icon={ArrowDown} 
      />
    </div>
  );

  const renderActivityTools = () => (
    <div className="grid grid-cols-2 gap-3">
      <ToolItem 
        type="activityNode" 
        data={{ label: 'Activity' }} 
        label="Activity" 
        icon={RectangleEllipsis} 
      />
      
    </div>
  );

  const renderCommonTools = () => (
    <div className="grid grid-cols-2 gap-3">
      <ToolItem 
        type="textNode" 
        data={{ label: 'Text Label', fontSize: 'text-base', textColor: 'text-foreground', isBold: false, isItalic: false }} 
        label="Text" 
        icon={Type} 
      />
      <ToolItem 
        type="noteNode" 
        data={{ label: 'Note content here...', bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', textColor: 'text-yellow-900 dark:text-yellow-50', withBorder: true }} 
        label="Note" 
        icon={StickyNote} 
      />
    </div>
  );


  let content = null;
  if (activeDiagramType === 'class') content = renderClassTools();
  else if (activeDiagramType === 'use-case') content = renderUseCaseTools();
  else if (activeDiagramType === 'sequence') content = renderSequenceTools();
  else if (activeDiagramType === 'activity') content = renderActivityTools();

  return (
    <div className="flex flex-col gap-4 p-1">
      <div className="text-sm font-medium text-muted-foreground">
        Drag and drop items to the canvas
      </div>
      {content}
      {content && (
        <>
          <Separator />
          {renderCommonTools()}
        </>
      )}
      {!content && <div className="text-xs text-muted-foreground italic">Select a diagram to see available tools.</div>}
    </div>
  );
};
