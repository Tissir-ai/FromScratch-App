"use client";
import React, { useEffect, useState, useRef } from "react";
import { Node, Edge, MarkerType } from 'reactflow';
import { X, ArrowRight, ArrowRightCircle, Circle, Slash, Bold, Italic } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
// Inline component definitions to keep a single file
type LocalAttr = { name: string; type: string; visibility: string };
type LocalMethod = { name: string; params: string; returnType: string; visibility: string };

const FieldsEditor: React.FC<{
  attrs: LocalAttr[];
  editingFields: boolean;
  onAttrChange: (idx: number, field: keyof LocalAttr, value: string) => void;
  addAttr: () => void;
  removeAttr: (idx: number) => void;
  resetAttrsFromNode: () => void;
  syncToNode: () => void;
  setEditingFields: (v: boolean) => void;
}> = ({ attrs, editingFields, onAttrChange, addAttr, removeAttr, resetAttrsFromNode, syncToNode, setEditingFields }) => {
  return (
    <div>
      {!editingFields && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Fields</h4>
            <Button size="sm" variant="outline" onClick={() => { resetAttrsFromNode(); setEditingFields(true); }}>Edit</Button>
          </div>
          {attrs.length === 0 && <div className="text-xs text-muted-foreground">No fields defined.</div>}
          {attrs.map((a, idx) => (
            <div key={idx} className="flex items-center justify-between rounded border px-2 py-1 text-xs">
              <span className="truncate" title={a.name}>{a.visibility} {a.name}{a.type ? `: ${a.type}` : ''}</span>
            </div>
          ))}
        </div>
      )}
      {editingFields && (
        <div className="mt-2 space-y-4">
          {attrs.map((a, idx) => (
            <div key={idx} className="p-3 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <Select value={a.visibility} onValueChange={(v) => onAttrChange(idx, 'visibility', v)}>
                  <SelectTrigger className="p-2 rounded border">
                    <SelectValue>{a.visibility}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+">+</SelectItem>
                    <SelectItem value="-">-</SelectItem>
                    <SelectItem value="#">#</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={a.name} onChange={(e) => onAttrChange(idx, 'name', (e.target as HTMLInputElement).value)} placeholder="Attribute Name" />
                <Button variant="ghost" size="icon" onClick={() => removeAttr(idx)} title="Delete attribute" aria-label="Delete attribute">
                  {/* icon removed to keep single file light */}
                </Button>
              </div>
              <div>
                <Select value={a.type} onValueChange={(v) => onAttrChange(idx, 'type', v)}>
                  <SelectTrigger className="p-2 rounded border">
                    <SelectValue>{a.type}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">string</SelectItem>
                    <SelectItem value="int">int</SelectItem>
                    <SelectItem value="float">float</SelectItem>
                    <SelectItem value="bool">bool</SelectItem>
                    <SelectItem value="object">object</SelectItem>
                    <SelectItem value="custom">custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addAttr}>Add Attribute</Button>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => { resetAttrsFromNode(); setEditingFields(false); }}>Cancel</Button>
            <Button size="sm" onClick={() => { syncToNode(); setEditingFields(false); }}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
};

const MethodsEditor: React.FC<{
  methods: LocalMethod[];
  editingMethods: boolean;
  onMethodChange: (idx: number, field: keyof LocalMethod, value: string) => void;
  addMethod: () => void;
  removeMethod: (idx: number) => void;
  resetMethodsFromNode: () => void;
  syncToNode: () => void;
  setEditingMethods: (v: boolean) => void;
}> = ({ methods, editingMethods, onMethodChange, addMethod, removeMethod, resetMethodsFromNode, syncToNode, setEditingMethods }) => {
  return (
    <div>
      {!editingMethods && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Methods</h4>
            <Button size="sm" variant="outline" onClick={() => { resetMethodsFromNode(); setEditingMethods(true); }}>Edit</Button>
          </div>
          {methods.length === 0 && <div className="text-xs text-muted-foreground">No methods defined.</div>}
          {methods.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between rounded border px-2 py-1 text-xs">
              <span className="truncate" title={m.name}>{m.visibility} {m.name}({m.params}){m.returnType ? `: ${m.returnType}` : ''}</span>
            </div>
          ))}
        </div>
      )}
      {editingMethods && (
        <div className="mt-2 space-y-4">
          {methods.map((m, idx) => (
            <div key={idx} className="p-3 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <Select value={m.visibility} onValueChange={(v) => onMethodChange(idx, 'visibility', v)}>
                  <SelectTrigger className="p-2 rounded border">
                    <SelectValue>{m.visibility}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+">+</SelectItem>
                    <SelectItem value="-">-</SelectItem>
                    <SelectItem value="#">#</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={m.name} onChange={(e) => onMethodChange(idx, 'name', (e.target as HTMLInputElement).value)} placeholder="Method Name" />
                <Button variant="ghost" size="icon" onClick={() => removeMethod(idx)} title="Delete method" aria-label="Delete method" />
              </div>
              <div className="flex items-center gap-2">
                <Input value={m.params} onChange={(e) => onMethodChange(idx, 'params', (e.target as HTMLInputElement).value)} placeholder="Parameters" />
                <Input value={m.returnType} onChange={(e) => onMethodChange(idx, 'returnType', (e.target as HTMLInputElement).value)} placeholder="Return Type" />
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addMethod}>Add Method</Button>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => { resetMethodsFromNode(); setEditingMethods(false); }}>Cancel</Button>
            <Button size="sm" onClick={() => { syncToNode(); setEditingMethods(false); }}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
};

const EdgeEditor: React.FC<{
  selectedEdge: Edge;
  edgeType: string;
  setEdgeType: (v: string) => void;
  edgeColor: string;
  setEdgeColor: (v: string) => void;
  edgeWidth: 'sm' | 'md' | 'xl';
  setEdgeWidth: (v: 'sm' | 'md' | 'xl') => void;
  edgeLabel: string;
  setEdgeLabel: (v: string) => void;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  setStrokeStyle: (v: 'solid' | 'dashed' | 'dotted') => void;
  edgeMarkerStart: 'none' | 'Arrow' | 'ArrowClosed' | 'Circle';
  setEdgeMarkerStart: (v: 'none' | 'Arrow' | 'ArrowClosed' | 'Circle') => void;
  edgeMarkerEnd: 'none' | 'Arrow' | 'ArrowClosed' | 'Circle';
  setEdgeMarkerEnd: (v: 'none' | 'Arrow' | 'ArrowClosed' | 'Circle') => void;
  applyEdgeChanges: (patch?: { type?: string; style?: any; label?: string; markerStart?: string | null; markerEnd?: string | null }) => void;
}> = ({ selectedEdge, edgeType, setEdgeType, edgeColor, setEdgeColor, edgeWidth, setEdgeWidth, edgeLabel, setEdgeLabel, strokeStyle, setStrokeStyle, edgeMarkerStart, setEdgeMarkerStart, edgeMarkerEnd, setEdgeMarkerEnd, applyEdgeChanges }) => {
  const sizeToWidthLocal = (s: 'sm' | 'md' | 'xl') => s === 'sm' ? 1 : s === 'md' ? 3 : 6;
  return (
    <div className="mb-4">
      <div className="mb-2">
        <Label className="text-sm">Title (appears on the line)</Label>
        <Input value={edgeLabel} onChange={(e) => { const v = (e.target as HTMLInputElement).value; setEdgeLabel(v); applyEdgeChanges({ label: v }); }} className="mt-2" />
      </div>
      <div className="mb-2">
        <Label className="text-sm">Type</Label>
        <Select value={edgeType} onValueChange={(v) => { setEdgeType(v); applyEdgeChanges({ type: v }); }}>
          <SelectTrigger className="w-full p-2 mt-2 rounded border">
            <SelectValue>{edgeType}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Straight</SelectItem>
            <SelectItem value="smoothstep">Smooth</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mb-2">
        <Label className="text-sm">Color</Label>
        <div className="flex gap-2 mt-2">
          {['#B1B1B7', '#000000', '#0ea5a4', '#f97316', '#ef4444'].map(c => (
            <button key={c} title={c} onClick={() => { setEdgeColor(c); applyEdgeChanges({ style: { stroke: c } }); }} style={{ background: c }} className={`relative w-8 h-8 rounded border overflow-hidden ${edgeColor === c ? 'ring-2 ring-offset-1 ring-primary' : ''}`}>
              {/* selected indicator omitted */}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <Label className="text-sm">Width</Label>
        <div className="flex gap-2 mt-2">
          <button aria-label="small" className={`p-2 rounded border flex items-center gap-2 ${edgeWidth === 'sm' ? 'bg-muted' : ''}`} onClick={() => { setEdgeWidth('sm'); applyEdgeChanges({ style: { strokeWidth: sizeToWidthLocal('sm') } }); }}>
            <span className="block w-2 h-2 bg-current rounded-full" style={{ background: '#000' }} />
            <span className="text-xs">sm</span>
          </button>
          <button aria-label="medium" className={`p-2 rounded border flex items-center gap-2 ${edgeWidth === 'md' ? 'bg-muted' : ''}`} onClick={() => { setEdgeWidth('md'); applyEdgeChanges({ style: { strokeWidth: sizeToWidthLocal('md') } }); }}>
            <span className="block w-3 h-3 bg-current rounded-full" style={{ background: '#000' }} />
            <span className="text-xs">md</span>
          </button>
          <button aria-label="large" className={`p-2 rounded border flex items-center gap-2 ${edgeWidth === 'xl' ? 'bg-muted' : ''}`} onClick={() => { setEdgeWidth('xl'); applyEdgeChanges({ style: { strokeWidth: sizeToWidthLocal('xl') } }); }}>
            <span className="block w-4 h-4 bg-current rounded-full" style={{ background: '#000' }} />
            <span className="text-xs">xl</span>
          </button>
        </div>
      </div>
      <div className="mb-2">
        <Label className="text-sm">Line Style</Label>
        <Select value={strokeStyle} onValueChange={(v) => {
          const vv = v as 'solid' | 'dashed' | 'dotted';
          setStrokeStyle(vv);
          const dash = vv === 'solid' ? '' : vv === 'dashed' ? '6 4' : '2 4';
          applyEdgeChanges({ style: { strokeDasharray: dash } });
        }}>
          <SelectTrigger className="w-full p-2 mt-2 rounded border">
            <SelectValue>{strokeStyle}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between items-center">
        <div className="mb-2">
          <Label className="text-sm">Source head</Label>
          <div className="flex gap-2 mt-2">
            {['none', 'Arrow', 'ArrowClosed'].map(key => {
              const Icon = key === 'none' ? Slash : key === 'Arrow' ? ArrowRight : key === 'ArrowClosed' ? ArrowRightCircle : Circle;
              return (
                <button
                  key={key}
                  title={key}
                  onClick={() => { const k = key as 'none' | 'Arrow' | 'ArrowClosed'; setEdgeMarkerStart(k); applyEdgeChanges({ markerStart: k === 'none' ? null : k }); }}
                  className={`relative w-8 h-8 rounded border flex items-center justify-center ${edgeMarkerStart === key ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>
        <div className="mb-2">
          <Label className="text-sm">Target head</Label>
          <div className="flex gap-2 mt-2">
            {['none', 'Arrow', 'ArrowClosed'].map(key => {
              const Icon = key === 'none' ? Slash : key === 'Arrow' ? ArrowRight : key === 'ArrowClosed' ? ArrowRightCircle : Circle;
              return (
                <button
                  key={key}
                  title={key}
                  onClick={() => { const k = key as 'none' | 'Arrow' | 'ArrowClosed'; setEdgeMarkerEnd(k); applyEdgeChanges({ markerEnd: k === 'none' ? null : k }); }}
                  className={`relative w-8 h-8 rounded border flex items-center justify-center ${edgeMarkerEnd === key ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const RelationsPanel: React.FC<{
  selectedNode: Node | null;
  nodes: Node[];
  edges: Edge[];
  updateEdge?: (id: string, data: any) => void;
  removeRelation: (edgeId: string) => void;
  addRelation: (sourceId: string, targetId: string) => void;
}> = ({ selectedNode, nodes, edges, updateEdge, removeRelation, addRelation }) => {
  const otherNodes = selectedNode ? nodes.filter(n => n.id !== selectedNode.id) : nodes;
  const connected = selectedNode ? edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id) : [];
  const [relationTarget, setRelationTarget] = React.useState<string | null>(null);
  return (
    <div>
      <h4 className="font-medium">Relations</h4>
      <div className="mt-2 grid grid-cols-1 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label className="text-sm">From</Label>
            <Input value={selectedNode?.data?.label || selectedNode?.id || ''} disabled className="mt-1" />
          </div>
          <div className="flex-1">
            <Label className="text-sm">To</Label>
            <Select value={relationTarget ?? undefined} onValueChange={(v) => setRelationTarget(v || null)}>
              <SelectTrigger className="w-full p-2 mt-1 rounded border">
                <SelectValue placeholder="Select target node" />
              </SelectTrigger>
              <SelectContent>
                {otherNodes.map(n => <SelectItem key={n.id} value={n.id}>{String(n.data?.label || n.id)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end align-bottom">
            <Button size="sm" onClick={() => {
              if (!selectedNode) return;
              if (!relationTarget) return;
              if (relationTarget === selectedNode.id) { window.alert('Cannot relate node to itself'); return; }
              addRelation(selectedNode.id, relationTarget);
              setRelationTarget(null);
            }} disabled={!relationTarget || !selectedNode}>Add</Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">Tip: After adding a relation you can edit its label below.</div>
      </div>
      <div className="mt-3 space-y-2">
        {connected.length === 0 && <div className="text-sm text-muted-foreground">No relations yet.</div>}
        {connected.map(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          const isOutgoing = edge.source === selectedNode?.id;
          return (
            <div key={edge.id} className="flex items-center gap-2 p-2 border rounded-md shadow-sm bg-background">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{isOutgoing ? 'To' : 'From'}</span>
                  <span className="text-sm font-medium">{isOutgoing ? (targetNode?.data?.label || targetNode?.id) : (sourceNode?.data?.label || sourceNode?.id)}</span>
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Label</Label>
                  <Input defaultValue={`${edge.label ?? ''}`} onBlur={(e) => { if (updateEdge) updateEdge(edge.id, { label: (e.target as HTMLInputElement).value }); }} className="mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => { if (!window.confirm('Remove this relation?')) return; removeRelation(edge.id); }} title="Remove relation">✕</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TextNodeEditor: React.FC<{
  selectedNode: Node;
  updateNode: (id: string, data: any) => void;
  textFontSize: string;
  setTextFontSize: (v: string) => void;
  textColorLocal: string;
  setTextColorLocal: (v: string) => void;
  textBold: boolean;
  setTextBold: (v: boolean) => void;
  textItalic: boolean;
  setTextItalic: (v: boolean) => void;
  textTransform: string;
  setTextTransform: (v: string) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
}> = ({ selectedNode, updateNode, textFontSize, setTextFontSize, textColorLocal, setTextColorLocal, textBold, setTextBold, textItalic, setTextItalic, textTransform, setTextTransform, fontFamily, setFontFamily }) => {
  return (
    <div className="mb-4">
      <div className="mb-3">
        <Label className="text-sm">Font Size</Label>
        <div className="flex gap-3 mt-2 flex-wrap">
          {[
            { val: 'text-xs', label: 'XS' },
            { val: 'text-sm', label: 'S' },
            { val: 'text-base', label: 'M' },
            { val: 'text-lg', label: 'L' },
            { val: 'text-xl', label: 'XL' },
            { val: 'text-3xl', label: '3XL' },
          ].map((s) => (
            <button
              key={s.val}
              title={s.val}
              onClick={() => {
                setTextFontSize(s.val);
                updateNode(selectedNode.id, { ...selectedNode.data, fontSize: s.val });
              }}
              className={`px-2 w-9 h-9 py-1 rounded border flex items-center justify-center ${textFontSize === s.val ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
            >
              <span className="text-xs">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <Label className="text-sm">Text Color</Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[
            { val: 'text-black', preview: '#000000' },
            { val: 'text-white', preview: '#ffffff' },
            { val: 'text-red-600', preview: '#dc2626' },
            { val: 'text-blue-600', preview: '#2563eb' },
            { val: 'text-green-600', preview: '#16a34a' },
            { val: 'text-yellow-400', preview: '#fef08a' },
            { val: 'text-purple-600', preview: '#7c3aed' }
          ].map((c) => (
            <button
              key={c.val}
              title={c.val}
              onClick={() => {
                setTextColorLocal(c.val);
                updateNode(selectedNode.id, { ...selectedNode.data, textColor: c.val });
              }}
              className={`w-8 h-8 rounded border ${textColorLocal === c.val ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
              style={{ background: c.preview }}
            />
          ))}
        </div>
      </div>
      <div className="mb-3">
        <Label className="text-sm">Font Style</Label>
        <div className="mt-2 flex gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Bold"
              aria-pressed={textBold}
              onClick={() => {
                const newBold = !textBold;
                setTextBold(newBold);
                updateNode(selectedNode.id, { ...selectedNode.data, isBold: newBold });
              }}
              className={`p-2 rounded border flex items-center justify-center ${textBold ? 'bg-muted ring-2 ring-offset-1 ring-primary' : ''}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <Label className="text-sm cursor-pointer">Bold</Label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Italic"
              aria-pressed={textItalic}
              onClick={() => {
                const newItalic = !textItalic;
                setTextItalic(newItalic);
                updateNode(selectedNode.id, { ...selectedNode.data, isItalic: newItalic });
              }}
              className={`p-2 rounded border flex items-center justify-center ${textItalic ? 'bg-muted ring-2 ring-offset-1 ring-primary' : ''}`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <Label className="text-sm cursor-pointer">Italic</Label>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <Label className="text-sm">Text Transform</Label>
        <div className="mt-2 flex gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="None"
              aria-pressed={textTransform === 'none'}
              onClick={() => {
                setTextTransform('none');
                updateNode(selectedNode.id, { ...selectedNode.data, textTransform: 'none' });
              }}
              className={`p-2 rounded border flex items-center justify-center ${textTransform === 'none' ? 'bg-muted ring-2 ring-offset-1 ring-primary' : ''}`}
            >
              <span className="text-xs">Aa</span>
            </button>
            <Label className="text-sm cursor-pointer">None</Label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Uppercase"
              aria-pressed={textTransform === 'uppercase'}
              onClick={() => {
                setTextTransform('uppercase');
                updateNode(selectedNode.id, { ...selectedNode.data, textTransform: 'uppercase' });
              }}
              className={`p-2 rounded border flex items-center justify-center ${textTransform === 'uppercase' ? 'bg-muted ring-2 ring-offset-1 ring-primary' : ''}`}
            >
              <span className="text-xs">AA</span>
            </button>
            <Label className="text-sm cursor-pointer">Uppercase</Label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Lowercase"
              aria-pressed={textTransform === 'lowercase'}
              onClick={() => {
                setTextTransform('lowercase');
                updateNode(selectedNode.id, { ...selectedNode.data, textTransform: 'lowercase' });
              }}
              className={`p-2 rounded border flex items-center justify-center ${textTransform === 'lowercase' ? 'bg-muted ring-2 ring-offset-1 ring-primary' : ''}`}
            >
              <span className="text-xs">aa</span>
            </button>
            <Label className="text-sm cursor-pointer">Lowercase</Label>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <Label className="text-sm">Font Family</Label>
        <Select value={fontFamily} onValueChange={(val) => {
          setFontFamily(val);
          updateNode(selectedNode.id, { ...selectedNode.data, fontFamily: val });
        }}>
          <SelectTrigger className="w-full mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="font-sans">Sans Serif</SelectItem>
            <SelectItem value="font-serif">Serif</SelectItem>
            <SelectItem value="font-mono">Monospace</SelectItem>
            <SelectItem value="font-sans">Arial</SelectItem>
            <SelectItem value="font-sans">Times New Roman</SelectItem>
            <SelectItem value="font-sans">Georgia</SelectItem>
            <SelectItem value="font-sans">Verdana</SelectItem>
            <SelectItem value="font-mono">Courier New</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const NoteNodeEditor: React.FC<{
  selectedNode: Node;
  updateNode: (id: string, data: any) => void;
  noteBg: string | null;
  setNoteBg: (v: string | null) => void;
}> = ({ selectedNode, updateNode, noteBg, setNoteBg }) => {
  return (
    <div className="mb-4">
      <div className="mb-3">
        <Label className="text-sm">Background Color</Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[
            { cls: 'bg-yellow-50 dark:bg-yellow-900/30', preview: '#fef08a' },
            { cls: 'bg-blue-50 dark:bg-blue-900/30', preview: '#93c5fd' },
            { cls: 'bg-green-50 dark:bg-green-900/30', preview: '#86efac' },
            { cls: 'bg-red-50 dark:bg-red-900/30', preview: '#fecaca' },
            { cls: 'bg-purple-50 dark:bg-purple-900/30', preview: '#e9d5ff' },
            { cls: 'bg-gray-50 dark:bg-gray-900/30', preview: '#f3f4f6' },
          ].map((c) => (
            <button
              key={c.cls}
              title={c.cls}
              onClick={() => {
                setNoteBg(c.cls);
                updateNode(selectedNode.id, { ...selectedNode.data, bgColor: c.cls });
              }}
              className={`w-8 h-8 rounded border ${noteBg === c.cls ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
              style={{ background: c.preview }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

type Attr = { name: string; type: string; visibility: string };
type Method = { name: string; params: string; returnType: string; visibility: string };

interface DiagramEditProps {
  selectedNode: Node | null;
  selectedEdge?: Edge | null;
  nodes: Node[];
  edges: Edge[];
  updateNode: (id: string, data: any) => void;
  updateEdge?: (id: string, data: any) => void;
  addRelation: (sourceId: string, targetId: string) => void;
  removeRelation: (edgeId: string) => void;
  onClose: () => void;
}

const DEFAULT_ATTR = { name: '', type: 'string', visibility: '+' };
const DEFAULT_METHOD = { name: '', params: '', returnType: 'void', visibility: '+' };

export const DiagramEdit: React.FC<DiagramEditProps> = ({ selectedNode, selectedEdge, nodes, edges, updateNode, updateEdge, addRelation, removeRelation, onClose }) => {
  const [title, setTitle] = useState('');
  const [attrs, setAttrs] = useState<Attr[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const syncTimerRef = useRef<number | null>(null);
  const lastNodeIdRef = useRef<string | null>(null);
  const titleEditedRef = useRef<boolean>(false);
  const [isEdited, setIsEdited] = useState(false); // Track if any edits occurred
  const [editingFields, setEditingFields] = useState(false);
  const [editingMethods, setEditingMethods] = useState(false);
  const [noteBg, setNoteBg] = useState<string | null>(null);
  const [textFontSize, setTextFontSize] = useState<string>('text-base');
  const [textColorLocal, setTextColorLocal] = useState<string>('text-foreground');
  const [textBold, setTextBold] = useState<boolean>(false);
  const [textItalic, setTextItalic] = useState<boolean>(false);
  const [textTransform, setTextTransform] = useState<string>('none');
  const [fontFamily, setFontFamily] = useState<string>('font-sans');
  const [lifelineHeight, setLifelineHeight] = useState<number>(400);
  const [lifelineWidth, setLifelineWidth] = useState<number>(2);

  useEffect(() => {
    if (!selectedNode) {
      lastNodeIdRef.current = null;
      titleEditedRef.current = false;
      return;
    }
    const d: any = selectedNode.data || {};

    // Only reset title when selecting a different node
    if (lastNodeIdRef.current !== selectedNode.id) {
      setTitle(d.label || '');
      titleEditedRef.current = false;
      lastNodeIdRef.current = selectedNode.id;

      // attributes: support both string[] and structured
      const rawAttrs = d.attributes || [];
      const parsedAttrs: Attr[] = Array.isArray(rawAttrs) ? rawAttrs.map((a: any) => {
        if (typeof a === 'string') {
          const vis = a.trim().charAt(0) === '+' || a.trim().charAt(0) === '-' || a.trim().charAt(0) === '#' ? a.trim().charAt(0) : '+';
          const rest = vis ? a.trim().slice(1).trim() : a.trim();
          const parts = rest.split(':');
          return { name: parts[0]?.trim() || '', type: parts[1]?.trim() || 'string', visibility: vis };
        }
        return { name: a.name || '', type: a.type || 'string', visibility: a.visibility || '+' };
      }) : [];
      setAttrs(parsedAttrs);

      const rawMethods = d.methods || [];
      const parsedMethods: Method[] = Array.isArray(rawMethods) ? rawMethods.map((m: any) => {
        if (typeof m === 'string') {
          const vis = m.trim().charAt(0) === '+' || m.trim().charAt(0) === '-' || m.trim().charAt(0) === '#' ? m.trim().charAt(0) : '+';
          const rest = vis ? m.trim().slice(1).trim() : m.trim();
          const nameAndRest = rest.split('(');
          const name = nameAndRest[0]?.trim() || '';
          const paramsPart = nameAndRest[1]?.split(')')[0] || '';
          const returnPart = nameAndRest[1]?.split(')')[1]?.split(':')[1]?.trim() || 'void';
          return { name, params: paramsPart, returnType: returnPart, visibility: vis };
        }
        return { name: m.name || '', params: m.params || '', returnType: m.returnType || 'void', visibility: m.visibility || '+' };
      }) : [];
      setMethods(parsedMethods);

      // close edit modes when node changes
      setEditingFields(false);
      setEditingMethods(false);
    }

    // sync note background local state so swatches reflect immediately
    if (selectedNode.type === 'noteNode') {
      setNoteBg(d.bgColor || null);
    } else {
      setNoteBg(null);
    }
    // sync text node local style state so controls update immediately
    if (selectedNode.type === 'textNode') {
      setTextFontSize(d.fontSize || 'text-base');
      setTextColorLocal(d.textColor || 'text-foreground');
      setTextBold(!!d.isBold);
      setTextItalic(!!d.isItalic);
      setTextTransform(d.textTransform || 'none');
      setFontFamily(d.fontFamily || 'font-sans');
    } else {
      setTextFontSize('text-base');
      setTextColorLocal('text-foreground');
      setTextBold(false);
      setTextItalic(false);
      setTextTransform('none');
      setFontFamily('font-sans');
    }

    // sync sequence lifeline dimensions
    if (selectedNode.type === 'sequenceLifeline') {
      setLifelineHeight(typeof d.lifelineHeight === 'number' ? d.lifelineHeight : 400);
      setLifelineWidth(typeof d.lifelineWidth === 'number' ? d.lifelineWidth : 2);
    } else {
      setLifelineHeight(400);
      setLifelineWidth(2);
    }

  }, [selectedNode]);

  const onAttrChange = (idx: number, field: keyof Attr, value: string) => {
    setAttrs(prev => { const c = prev.slice(); c[idx] = { ...c[idx], [field]: value }; return c; });
    setIsEdited(true); // sync on Save
  };

  const onMethodChange = (idx: number, field: keyof Method, value: string) => {
    setMethods(prev => { const c = prev.slice(); c[idx] = { ...c[idx], [field]: value }; return c; });
    setIsEdited(true); // sync on Save
  };

  const addAttr = () => { setAttrs(prev => [...prev, { ...DEFAULT_ATTR }]); setIsEdited(true); };
  const removeAttr = (idx: number) => { setAttrs(prev => prev.filter((_, i) => i !== idx)); setIsEdited(true); };

  const addMethod = () => { setMethods(prev => [...prev, { ...DEFAULT_METHOD }]); setIsEdited(true); };
  const removeMethod = (idx: number) => { setMethods(prev => prev.filter((_, i) => i !== idx)); setIsEdited(true); };

  // small debounce to avoid too many updates while typing (use ref so timer persists across renders)
  const syncToNodeDelayed = () => {
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => syncToNode(), 300);
  };

  const syncToNode = () => {
    if (!selectedNode) return;
    const attrStrings = attrs.map(a => `${a.visibility} ${a.name}${a.type ? `: ${a.type}` : ''}`);
    const methodStrings = methods.map(m => `${m.visibility} ${m.name}(${m.params || ''})${m.returnType ? `: ${m.returnType}` : ''}`);
    updateNode(selectedNode.id, { label: title, attributes: attrStrings, methods: methodStrings });
  };

  // Edge editor state - must be declared before any conditional returns (React Rules of Hooks)
  const [activeTab, setActiveTab] = useState<string>('Relations');
  const [edgeType, setEdgeType] = useState<string>('default');
  const [edgeColor, setEdgeColor] = useState<string>('#000000');
  const [edgeWidth, setEdgeWidth] = useState<'sm' | 'md' | 'xl'>('md');
  const [edgeLabel, setEdgeLabel] = useState<string>('');
  const [edgeMarkerStart, setEdgeMarkerStart] = useState<'none' | 'Arrow' | 'ArrowClosed' | 'Circle'>('none');
  const [edgeMarkerEnd, setEdgeMarkerEnd] = useState<'none' | 'Arrow' | 'ArrowClosed' | 'Circle'>('none');
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');

  useEffect(() => {
    return () => { if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current); };
  }, []);

  useEffect(() => { 
    if (titleEditedRef.current) {
      syncToNodeDelayed(); 
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */ 
  }, [title]);

  // Reset active tab when selection changes
  useEffect(() => {
    if (selectedEdge) setActiveTab('Line');
    else if (selectedNode?.type === 'classNode') setActiveTab('Fields');
    else if (selectedNode?.type === 'sequenceLifeline') setActiveTab('Lifeline');
    else if (selectedNode?.type === 'textNode') setActiveTab('Text Style');
    else if (selectedNode?.type === 'noteNode') setActiveTab('Note Style');
    else setActiveTab('Relations');
  }, [selectedNode, selectedEdge]);

  // Sync edge state when selectedEdge changes
  useEffect(() => {
    if (!selectedEdge) return;
    setEdgeType(selectedEdge.type || 'default');
    setEdgeColor((selectedEdge.style as any)?.stroke || '#B1B1B7');
    const sw = (selectedEdge.style as any)?.strokeWidth || 3;
    if (sw <= 1) setEdgeWidth('sm');
    else if (sw <= 4) setEdgeWidth('md');
    else setEdgeWidth('xl');
    setEdgeLabel(String(selectedEdge.label ?? ''));
    const s = (selectedEdge.style as any)?.strokeDasharray || '';
    setStrokeStyle(!s ? 'solid' : s === '6 4' ? 'dashed' : 'dotted');
    const ms = (selectedEdge as any)?.markerStart?.type;
    if (!ms) setEdgeMarkerStart('none');
    else if (ms === MarkerType.Arrow) setEdgeMarkerStart('Arrow');
    else if (ms === MarkerType.ArrowClosed) setEdgeMarkerStart('ArrowClosed');
    else if (ms === (MarkerType as any).Circle) setEdgeMarkerStart('Circle');
    const me = (selectedEdge as any)?.markerEnd?.type;
    if (!me) setEdgeMarkerEnd('none');
    else if (me === MarkerType.Arrow) setEdgeMarkerEnd('Arrow');
    else if (me === MarkerType.ArrowClosed) setEdgeMarkerEnd('ArrowClosed');
    else if (me === (MarkerType as any).Circle) setEdgeMarkerEnd('Circle');
  }, [selectedEdge]);

  // render when either a node or an edge is selected
  if (!selectedNode && !selectedEdge) return null;

  const applyEdgeChanges = (patch?: { type?: string; style?: any; label?: string; markerStart?: string | null; markerEnd?: string | null }) => {
    if (!selectedEdge || !updateEdge) return;
    const newData: any = {};
    if (patch?.type !== undefined) newData.type = patch.type;
    if (patch?.style !== undefined) newData.style = { ...(selectedEdge.style || {}), ...patch.style };
    if (patch?.label !== undefined) newData.label = patch.label;
    if (patch?.markerStart !== undefined) {
      if (!patch.markerStart || patch.markerStart === 'none') newData.markerStart = undefined;
      else newData.markerStart = { type: (MarkerType as any)[patch.markerStart] };
    }
    if (patch?.markerEnd !== undefined) {
      if (!patch.markerEnd || patch.markerEnd === 'none') newData.markerEnd = undefined;
      else newData.markerEnd = { type: (MarkerType as any)[patch.markerEnd] };
    }
    updateEdge(selectedEdge.id, newData);
  };

  const tabs: string[] = selectedEdge ? ['Line'] : (() => {
    const t: string[] = [];
    if (selectedNode?.type === 'classNode') {
      t.push('Fields', 'Methods', 'Relations');
    } else if (selectedNode?.type === 'sequenceLifeline') {
      t.push('Lifeline', 'Relations');
    } else if (selectedNode?.type === 'textNode') {
      t.push('Text Style');
    } else if (selectedNode?.type === 'noteNode') {
      t.push('Note Style');
    } else {
      t.push('Relations');
    }
    return t;
  })();

  // Helpers to reset attrs/methods from node for cancel
  const resetAttrsFromNode = () => {
    if (!selectedNode) return;
    const rawAttrs = (selectedNode.data?.attributes) || [];
    const parsedAttrs: Attr[] = Array.isArray(rawAttrs) ? rawAttrs.map((a: any) => {
      if (typeof a === 'string') {
        const vis = a.trim().charAt(0) === '+' || a.trim().charAt(0) === '-' || a.trim().charAt(0) === '#' ? a.trim().charAt(0) : '+';
        const rest = vis ? a.trim().slice(1).trim() : a.trim();
        const parts = rest.split(':');
        return { name: parts[0]?.trim() || '', type: parts[1]?.trim() || 'string', visibility: vis };
      }
      return { name: a.name || '', type: a.type || 'string', visibility: a.visibility || '+' };
    }) : [];
    setAttrs(parsedAttrs);
    setIsEdited(false);
  };
  const resetMethodsFromNode = () => {
    if (!selectedNode) return;
    const rawMethods = (selectedNode.data?.methods) || [];
    const parsedMethods: Method[] = Array.isArray(rawMethods) ? rawMethods.map((m: any) => {
      if (typeof m === 'string') {
        const vis = m.trim().charAt(0) === '+' || m.trim().charAt(0) === '-' || m.trim().charAt(0) === '#' ? m.trim().charAt(0) : '+';
        const rest = vis ? m.trim().slice(1).trim() : m.trim();
        const nameAndRest = rest.split('(');
        const name = nameAndRest[0]?.trim() || '';
        const paramsPart = nameAndRest[1]?.split(')')[0] || '';
        const returnType = rest.includes('):') ? rest.split('):')[1].trim() : 'void';
        return { name, params: paramsPart, returnType, visibility: vis };
      }
      return { name: m.name || '', params: (m.params || []).join?.(',') || '', returnType: m.returnType || 'void', visibility: m.visibility || '+' };
    }) : [];
    setMethods(parsedMethods);
    setIsEdited(false);
  };

  return (
    <div className="h-full w-80 bg-background border-l shadow-lg z-20 flex flex-col">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">Configuration Pannel</h3>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <div className="p-1">
          <div className="mb-3">

            {!selectedEdge && selectedNode?.type !== 'textNode' && selectedNode?.type !== 'noteNode' && (
              <div className="mb-3">
                <Label className="text-base">Name / Title</Label>
                <Input value={title} onChange={(e) => { setTitle((e.target as HTMLInputElement).value); titleEditedRef.current = true; }} className="mt-2" />
              </div>
            )}
            {!selectedEdge && (selectedNode?.type === 'textNode' || selectedNode?.type === 'noteNode') && (
              <div className="mb-3">
                <Label className="text-base">Content</Label>
                <textarea
                  value={title}
                  onChange={(e) => { setTitle((e.target as HTMLTextAreaElement).value); titleEditedRef.current = true; }}
                  className="mt-2 w-full p-2 border border-input rounded-md min-h-[80px] text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Enter text content..."
                />
              </div>
            )}
            <div className="flex gap-2 mb-3">
              {tabs.map((tab, idx) => (
                <button key={`${tab}-${idx}`} onClick={() => setActiveTab(tab)} className={`px-2 py-1 rounded text-sm ${activeTab === tab ? 'bg-muted' : 'border'}`}>{tab}</button>
              ))}
            </div>
            {selectedNode?.type === 'textNode' && activeTab === 'Text Style' && (
              <TextNodeEditor
                selectedNode={selectedNode}
                updateNode={updateNode}
                textFontSize={textFontSize}
                setTextFontSize={setTextFontSize}
                textColorLocal={textColorLocal}
                setTextColorLocal={setTextColorLocal}
                textBold={textBold}
                setTextBold={setTextBold}
                textItalic={textItalic}
                setTextItalic={setTextItalic}
                textTransform={textTransform}
                setTextTransform={setTextTransform}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
              />
            )}

            {selectedNode?.type === 'noteNode' && activeTab === 'Note Style' && (
              <NoteNodeEditor
                selectedNode={selectedNode}
                updateNode={updateNode}
                noteBg={noteBg}
                setNoteBg={setNoteBg}
              />
            )}
          </div>


          {selectedNode?.type === 'classNode' && (
            <div className="mb-4">
              {activeTab === 'Fields' && (
                <FieldsEditor
                  attrs={attrs}
                  editingFields={editingFields}
                  onAttrChange={onAttrChange}
                  addAttr={addAttr}
                  removeAttr={removeAttr}
                  resetAttrsFromNode={resetAttrsFromNode}
                  syncToNode={() => { syncToNode(); setIsEdited(false); }}
                  setEditingFields={setEditingFields}
                />
              )}
              {activeTab === 'Methods' && (
                <MethodsEditor
                  methods={methods}
                  editingMethods={editingMethods}
                  onMethodChange={onMethodChange}
                  addMethod={addMethod}
                  removeMethod={removeMethod}
                  resetMethodsFromNode={resetMethodsFromNode}
                  syncToNode={() => { syncToNode(); setIsEdited(false); }}
                  setEditingMethods={setEditingMethods}
                />
              )}
            </div>
          )}

          {selectedNode?.type === 'useCaseNode' && activeTab === 'Use Case' && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Use Case</h4>
              <div className="mb-2">
                <Label className="text-sm">Actors (comma separated)</Label>
                <Input value={(selectedNode?.data?.actors || []).join?.(',') || ''} onChange={(e) => selectedNode && updateNode(selectedNode.id, { actors: (e.target as HTMLInputElement).value.split(',').map(s => s.trim()) })} className="mt-2" />
              </div>
              <div className="mb-2">
                <Label className="text-sm">Preconditions</Label>
                <Input value={selectedNode?.data?.preconditions || ''} onChange={(e) => selectedNode && updateNode(selectedNode.id, { preconditions: (e.target as HTMLInputElement).value })} className="mt-2" />
              </div>
              <div className="mb-2">
                <Label className="text-sm">Postconditions</Label>
                <Input value={selectedNode?.data?.postconditions || ''} onChange={(e) => selectedNode && updateNode(selectedNode.id, { postconditions: (e.target as HTMLInputElement).value })} className="mt-2" />
              </div>
              <div>
                <Label className="text-sm">Scenario steps (one per line)</Label>
                <Input value={(selectedNode?.data?.steps || []).join('\n') || ''} onChange={(e) => selectedNode && updateNode(selectedNode.id, { steps: (e.target as HTMLInputElement).value.split('\n') })} className="mt-2" />
              </div>
            </div>
          )}





          {selectedNode?.type === 'sequenceLifeline' && activeTab === 'Lifeline' && (
            <div className="mb-4">
              <div className="mb-3">
                <Label className="text-sm">Height (px)</Label>
                <Input type="number" value={String(lifelineHeight)} onChange={(e) => {
                  const v = Number((e.target as HTMLInputElement).value) || 0;
                  setLifelineHeight(v);
                  if (selectedNode) updateNode(selectedNode.id, { ...selectedNode.data, lifelineHeight: v });
                }} className="mt-2" />
              </div>
              <div className="mb-3">
                <Label className="text-sm">Line Width (px)</Label>
                <Input type="number" value={String(lifelineWidth)} onChange={(e) => {
                  const v = Number((e.target as HTMLInputElement).value) || 0;
                  setLifelineWidth(v);
                  if (selectedNode) updateNode(selectedNode.id, { ...selectedNode.data, lifelineWidth: v });
                }} className="mt-2" />
              </div>
            </div>
          )}

          {/* If an edge is selected, show edge editor */}
          {selectedEdge && activeTab === 'Line' && (
            <EdgeEditor
              selectedEdge={selectedEdge}
              edgeType={edgeType}
              setEdgeType={setEdgeType}
              edgeColor={edgeColor}
              setEdgeColor={setEdgeColor}
              edgeWidth={edgeWidth}
              setEdgeWidth={setEdgeWidth}
              edgeLabel={edgeLabel}
              setEdgeLabel={setEdgeLabel}
              strokeStyle={strokeStyle}
              setStrokeStyle={setStrokeStyle}
              edgeMarkerStart={edgeMarkerStart}
              setEdgeMarkerStart={setEdgeMarkerStart}
              edgeMarkerEnd={edgeMarkerEnd}
              setEdgeMarkerEnd={setEdgeMarkerEnd}
              applyEdgeChanges={applyEdgeChanges}
            />
          )}

          {activeTab === 'Relations' && (
            <RelationsPanel
              selectedNode={selectedNode}
              nodes={nodes}
              edges={edges}
              updateEdge={updateEdge}
              removeRelation={removeRelation}
              addRelation={addRelation}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagramEdit;