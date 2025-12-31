import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const ClassNode = ({ data }: { data: any }) => {
  // Parse method strings to extract return types for display
  const parseMethodString = (methodStr: string) => {
    const vis = methodStr.trim().charAt(0) === '+' || methodStr.trim().charAt(0) === '-' || methodStr.trim().charAt(0) === '#' ? methodStr.trim().charAt(0) : '+';
    const rest = vis ? methodStr.trim().slice(1).trim() : methodStr.trim();
    const nameAndRest = rest.split('(');
    const name = nameAndRest[0]?.trim() || '';
    const paramsPart = nameAndRest[1]?.split(')')[0] || '';
    const returnPart = nameAndRest[1]?.split(')')[1]?.split(':')[1]?.trim() || 'void';
    return { name, params: paramsPart, returnType: returnPart, visibility: vis };
  };

  return (
    <Card className="group relative w-[200px] shadow-md border-2 border-primary/20 bg-card">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
      
      <CardHeader className="p-2 bg-muted/50 text-center border-b">
        <CardTitle className="text-sm font-bold">{data.label}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-2 text-xs font-mono text-muted-foreground bg-background/50">
          {data.attributes && data.attributes.map((attr: string, i: number) => (
            <div key={i} className="truncate">{attr}</div>
          ))}
          {(!data.attributes || data.attributes.length === 0) && <div className="italic opacity-50">No attributes</div>}
        </div>
        
        <Separator />
        
        <div className="p-2 text-xs font-mono text-muted-foreground bg-background/50">
          {data.methods && data.methods.map((method: string, i: number) => {
            const parsed = parseMethodString(method);
            const displayText = parsed.returnType 
              ? `${parsed.visibility} ${parsed.name}(${parsed.params}): ${parsed.returnType}`
              : `${parsed.visibility} ${parsed.name}(${parsed.params})`;
            return (
              <div key={i} className="truncate">{displayText}</div>
            );
          })}
          {(!data.methods || data.methods.length === 0) && <div className="italic opacity-50">No methods</div>}
        </div>
      </CardContent>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-primary opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity" />
    </Card>
  );
};

export default memo(ClassNode);
