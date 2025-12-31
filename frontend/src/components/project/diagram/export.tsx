"use client";
import React, { useState } from 'react';
import { FileDown, Image as ImageIcon, FileJson, FileText, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toPng, toJpeg } from 'html-to-image';      
import { ReactFlowInstance, Node, Edge, getRectOfNodes, getTransformForBounds } from 'reactflow';
import { FlowDiagram } from '@/types/diagram.type';

interface DiagramExportProps {
  rfInstance: ReactFlowInstance | null;
  flowContainerRef: React.RefObject<HTMLDivElement | null>;
  activeFlow: FlowDiagram | null;
  nodes: Node<any>[];
  edges: Edge<any>[];
}

export default function DiagramExport({ rfInstance, flowContainerRef, activeFlow, nodes, edges }: DiagramExportProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [imageMode, setImageMode] = useState<'light' | 'dark'>('light');
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(true);
  // Export resolution preset
  const [exportRes, setExportRes] = useState<string>('1600x900');

  const downloadAs = async (type: 'png' | 'jpeg') => {
    try {
      const rootEl = flowContainerRef.current?.querySelector('.react-flow') as HTMLElement | null;
      const viewportEl = flowContainerRef.current?.querySelector('.react-flow__viewport') as HTMLElement | null;
      if (!rootEl || !viewportEl || !rfInstance) {
        window.alert('Unable to find canvas to export.');
        return;
      }

      const title = activeFlow?.title || activeFlow?.id || 'export';
      const safeTitle = String(title).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
      await new Promise((res) => setTimeout(res, 50));

      const imageBg = imageMode === 'light' ? '#ffffff' : '#0b1220';
      const imageTextColor = imageMode === 'light' ? '#000000' : '#ffffff';
      // Create offscreen container to avoid mutating the live preview
      // Offscreen container
      const offscreen = document.createElement('div');
      offscreen.style.position = 'fixed';
      offscreen.style.left = '-99999px';
      offscreen.style.top = '-99999px';
      offscreen.style.background = imageBg;
      offscreen.style.zIndex = '-1';
      const [exportWidth, exportHeight] = (() => {
        const map: Record<string, [number, number]> = {
          '1280x720': [1280, 720],
          '1600x900': [1600, 900],
          '1920x1080': [1920, 1080],
          '2560x1440': [2560, 1440],
        };
        return map[exportRes] || [1600, 900];
      })();
      offscreen.style.width = `${exportWidth}px`;
      offscreen.style.height = `${exportHeight}px`;

      // Clone the React Flow root so internal layout is preserved
      const clonedRoot = rootEl.cloneNode(true) as HTMLElement;
      clonedRoot.style.width = `${exportWidth}px`;
      clonedRoot.style.height = `${exportHeight}px`;
      clonedRoot.style.background = imageBg;
      clonedRoot.style.position = 'relative';
      // Find viewport inside clone
      const clonedViewport = clonedRoot.querySelector('.react-flow__viewport') as HTMLElement | null;
      if (!clonedViewport) {
        document.body.appendChild(offscreen);
        offscreen.remove();
        window.alert('Export failed: viewport not found in clone');
        return;
      }
      // Compute transform to fit all nodes into export canvas
      let transform = { x: 0, y: 0, zoom: 1 } as { x: number; y: number; zoom: number };
      try {
        const nodesBounds = getRectOfNodes(nodes as any);
        const [x, y, zoom] = getTransformForBounds(nodesBounds, exportWidth, exportHeight, 0.1, 2);
        transform = { x, y, zoom };
      } catch (e) {}
      clonedViewport.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`;
      clonedViewport.style.transformOrigin = '0 0';
      offscreen.appendChild(clonedRoot);
      document.body.appendChild(offscreen);

      // Inline styles within the cloned subtree to preserve appearance
      const inlineComputedStyles = (el: Element) => {
        try {
          const style = window.getComputedStyle(el as Element);
          const props = [
            'stroke','stroke-width','stroke-dasharray','stroke-linecap','stroke-linejoin',
            'fill','fill-opacity','opacity','vector-effect','font-family','font-size','font-weight','color','background-color'
          ];
          props.forEach((p) => {
            const v = style.getPropertyValue(p);
            if (v) {
              try { (el as HTMLElement).style.setProperty(p, v); } catch (e) { try { (el as unknown as SVGElement).setAttribute(p, v); } catch (err) {} }
            }
          });
        } catch (e) {}
      };
      try {
        const allEls = clonedRoot.querySelectorAll('*');
        allEls.forEach((el) => inlineComputedStyles(el));
        // For activity diagrams we want to preserve node backgrounds (they are white by design)
        const cardSelectors = activeFlow?.type === 'activity'
          ? ['.card', '[class*="bg-background"]']
          : ['.react-flow__node', '.card', '[class*="bg-background"]'];
        clonedRoot.querySelectorAll(cardSelectors.join(',')).forEach((c) => {
          try { (c as HTMLElement).style.background = imageBg; (c as HTMLElement).style.color = imageTextColor; } catch (e) {}
        });
        // Remove UI overlays from export (Controls, MiniMap, Background grid)
        clonedRoot.querySelectorAll('.react-flow__controls, .react-flow__minimap, .react-flow__background').forEach((el) => {
          try { el.remove(); } catch (e) {}
        });
        // Ensure strokes
        const pathSelectors = ['.react-flow__edge-path', 'svg path', 'svg line', 'svg polyline', 'svg polygon'];
        clonedRoot.querySelectorAll(pathSelectors.join(',')).forEach((path) => {
          const p = path as unknown as SVGElement;
          try { const stroke = window.getComputedStyle(p as Element).getPropertyValue('stroke') || '#555555'; if (!p.getAttribute('stroke') || p.getAttribute('stroke') === 'none') p.setAttribute('stroke', stroke); } catch (e) {}
          try { const sw = window.getComputedStyle(p as Element).getPropertyValue('stroke-width') || '2'; if (!p.getAttribute('stroke-width') || p.getAttribute('stroke-width') === '0') p.setAttribute('stroke-width', sw.replace('px','')); } catch (e) {}
        });
        // Copy defs
        const originalDefs: Element[] = [];
        document.querySelectorAll('svg defs').forEach((d) => originalDefs.push(d));
        if (originalDefs.length) {
          const svgs = clonedRoot.querySelectorAll('svg');
          svgs.forEach((svg) => {
            let defs = svg.querySelector('defs') as SVGDefsElement | null;
            if (!defs) {
              defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs') as SVGDefsElement;
              svg.insertBefore(defs, svg.firstChild);
            }
            originalDefs.forEach((od) => {
              od.childNodes.forEach((cn) => {
                try { defs!.appendChild(cn.cloneNode(true) as ChildNode); } catch (err) {}
              });
            });
          });
        }
        // If this is a use-case diagram, force text to white for exported image
        try {
          if (activeFlow?.type === 'use-case') {
            // Use the chosen image text color so we don't force white on light backgrounds
            // HTML text nodes (labels inside nodes)
            clonedRoot.querySelectorAll('span, p, label, h1, h2, h3, h4, h5, .react-flow__node *').forEach((el) => {
              try { (el as HTMLElement).style.setProperty('color', imageTextColor, 'important'); } catch (e) {}
            });
            // SVG text elements
            clonedRoot.querySelectorAll('svg text').forEach((t) => {
              try { (t as SVGElement).setAttribute('fill', imageTextColor); } catch (e) {}
            });
          }
        } catch (e) {}
      } catch (e) {}

      await document.fonts.ready;

      const options: any = {
        backgroundColor: imageBg,
        pixelRatio: 2,
        cacheBust: true,
      };

      const dataUrl = type === 'png' ? await toPng(clonedRoot, options) : await toJpeg(clonedRoot, { ...options, quality: 0.95 });

      // Compose watermark on a canvas after render
      const baseImg = new Image();
      baseImg.src = dataUrl;
      await new Promise((res, rej) => { baseImg.onload = () => res(null); baseImg.onerror = rej; });
      const canvas = document.createElement('canvas');
      canvas.width = baseImg.width; canvas.height = baseImg.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(baseImg, 0, 0);
      try {
        if (includeWatermark) {
          const watermark = new Image();
          watermark.src = '/logos/fromScratch.png';
          await new Promise((res, rej) => { watermark.onload = () => res(null); watermark.onerror = rej; });
          const pad = 12;
          const frac = 0.12; // fixed watermark fraction of width
          const wmWidth = Math.min(128, Math.floor(canvas.width * frac));
          const wmHeight = Math.floor(wmWidth * (watermark.height / watermark.width || 1));
          ctx.globalAlpha = 0.85; // fixed opacity
          ctx.drawImage(watermark, canvas.width - wmWidth - pad, canvas.height - wmHeight - pad, wmWidth, wmHeight);
          ctx.globalAlpha = 1;
        }
      } catch (e) {}

      const finalUrl = canvas.toDataURL(type === 'png' ? 'image/png' : 'image/jpeg', type === 'jpeg' ? 0.95 : undefined);
      const link = document.createElement('a'); link.download = `${safeTitle || 'diagram'}.${type}`; link.href = finalUrl; document.body.appendChild(link); link.click(); document.body.removeChild(link);

      // Cleanup offscreen
      try { document.body.removeChild(offscreen); } catch (e) {}
    } catch (err) {
      console.error('Export error', err); window.alert('Failed to export image.');
    }
  };

  const exportAs = (type: 'json' | 'fsd') => {
    if (!activeFlow) return;
    const diagram = activeFlow;
    const title = diagram?.title || diagram?.id || 'export';
    const safeTitle = String(title).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
    if (type === 'json') {
      const flowExport = { title: diagram?.title || '', type: diagram?.type || 'class', nodes, edges };
      const content = JSON.stringify(flowExport, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${safeTitle || 'diagram'}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      return;
    }
    const version = 'SCRATCHX1';
    const header = [version, `TITLE=${diagram?.title || ''}`, `TYPE=${diagram?.type || 'class'}`];
    const nodeLines = nodes.map(n => {
      const label = String(n.data?.label || '').replace(/\n/g,' ');
      const attributes = Array.isArray((n as any).data?.attributes) ? (n as any).data.attributes : [];
      const methods = Array.isArray((n as any).data?.methods) ? (n as any).data.methods : [];
      let dataB64 = '';
      if (attributes.length || methods.length) {
        try { const payload = { attributes, methods }; const json = JSON.stringify(payload); dataB64 = btoa(unescape(encodeURIComponent(json))); } catch (e) { dataB64 = ''; }
      }
      return `N|${n.id}|${n.type}|${label}|${Math.round((n as any).position?.x ?? 0)}|${Math.round((n as any).position?.y ?? 0)}|${dataB64}`;
    });
    const edgeLines = edges.map(e => {
      const label = String(e.label || '').replace(/\n/g,' ');
      return `E|${e.id}|${e.source}|${e.target}|${label}|${e.type || 'smoothstep'}`;
    });
    const content = [...header, '---', ...nodeLines, '---', ...edgeLines, 'END'].join('\n');
    const encoded = btoa(unescape(encodeURIComponent(content)));
    const blob = new Blob([encoded], { type: 'application/x-scratchx' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${safeTitle || 'diagram'}.scratchx`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute top-2 right-4 z-50 flex flex-col gap-2 items-end">
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="shadow-md" onClick={() => setShowExportMenu(prev => !prev)}>
           Export<FileDown className="h-4 w-4" />
        </Button>
      </div>
      {showExportMenu && (
        <Card className="mt-2 p-2 w-56 shadow-md bg-background/95 backdrop-blur border-muted">
          <div className="flex flex-col gap-3">
            <div>
                <div className='flex justify-between items-center py-1 mb-2'>
              <div className="text-xs font-semibold">Image Export</div>
                  <div className="relative">
                  <Switch checked={imageMode === 'dark'} onCheckedChange={(v) => setImageMode(v ? 'dark' : 'light')}  />
                  <div
                    className="pointer-events-none absolute flex items-center justify-center"
                    style={{
                      top: 2,
                      left: 2,
                      width: 20,
                      height: 20,
                      transform: `translateX(${imageMode === 'dark' ? 20 : 0}px)`,
                      transition: 'transform 150ms ease',
                    }}
                  >
                    {imageMode === 'dark' ? <Moon className="h-3 w-3 text-gray-500 dark:text-white" /> : <Sun className="h-3 w-3 text-yellow-400" />}
                  </div>
                </div>
                </div>

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Resolution</Label>
                </div>
                <Select value={exportRes} onValueChange={setExportRes}>
                  <SelectTrigger className="h-7 px-2 py-1 text-xs">
                    <SelectValue placeholder="1600x900" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1280x720">1280 x 720</SelectItem>
                    <SelectItem value="1600x900">1600 x 900</SelectItem>
                    <SelectItem value="1920x1080">1920 x 1080</SelectItem>
                    <SelectItem value="2560x1440">2560 x 1440</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => downloadAs('png')}><ImageIcon className="h-4 w-4 mr-2" /> PNG</Button>
                <Button variant="outline" size="sm" onClick={() => downloadAs('jpeg')}><ImageIcon className="h-4 w-4 mr-2" /> JPEG</Button>
              </div>
            </div>

            <div className="border-t pt-2">
              <div className="text-xs font-semibold mb-2">Watermark</div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Include</Label>
                </div>
                <Switch checked={includeWatermark} onCheckedChange={setIncludeWatermark} />
              </div>
              {/* Watermark size and opacity are fixed; only include toggle is exposed */}
            </div>

            <div className="border-t pt-2">
              <div className="text-xs font-semibold mb-2">File Export</div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => exportAs('json')}><FileJson className="h-4 w-4 mr-2" /> JSON</Button>
                <Button variant="outline" size="sm" onClick={() => exportAs('fsd')}><FileText className="h-4 w-4 mr-2" /> ScratchX</Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
