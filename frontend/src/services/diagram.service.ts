import { FlowDiagram } from '@/types/diagram.type';
import { mainApi } from './main-api';


/**
 * List all diagrams for a project
 * GET /api/v1/diagrams/{project_id}
 */
export const listDiagrams = async (projectId: string): Promise<FlowDiagram[]> => {
  try {
    const diagrams = await mainApi.get<any>(`/v1/diagrams/${projectId}`);
    if(diagrams.length === 0) {
      console.log("No diagrams found for project", projectId);
      return [];
    }
    const diagramsData : FlowDiagram[] = diagrams.map((d: { _id: any; }) => ({ ...d, id: d._id }));
    console.log("Fetched diagrams for project", projectId, ":", diagramsData[0].id);
    return diagramsData;
  } catch (error) {
    console.error('Failed to list diagrams:', error);
    throw error;
  }
};

/**
 * Create a new diagram
 * POST /api/v1/diagrams/{project_id}
 */
export const addFlowDiagram = async (projectId: string, diagram: Partial<FlowDiagram>): Promise<FlowDiagram> => {
  try {
    const created = await mainApi.post<any>(`/v1/diagrams/${projectId}`, diagram);
    console.log("Created diagram for project", projectId, ":", created.id);
    const newDiagram: FlowDiagram = { ...created, id: created._id };
    return newDiagram;
  } catch (error) {
    console.error('Failed to create diagram:', error);
    throw error;
  }
};

/**
 * Update an existing diagram
 * PUT /api/v1/diagrams/{project_id}/{doc_id}
 */
export const updateFlowDiagram = async (
  projectId: string, 
  docId: string, 
  patch: Partial<FlowDiagram>
): Promise<FlowDiagram> => {
  try {
    // Fetch current diagram to build a full DiagramStructure payload
    const diagrams = await listDiagrams(projectId);
    const existing = diagrams.find(d => String(d.id) === String(docId));
    if (!existing) {
      throw new Error('Diagram not found');
    }

    const payload = {
      _id: docId,
      title: (patch as any).title ?? existing.title,
      type: (patch as any).type ?? existing.type,
      nodes: (patch as any).nodes ?? existing.nodes ?? [],
      edges: (patch as any).edges ?? existing.edges ?? [],
    } as any;

    const updated = await mainApi.put<any>(`/v1/diagrams/${projectId}/${docId}`, payload);
    // Normalize returned object to FlowDiagram
    const result: FlowDiagram = { ...updated, id: updated._id ?? updated.id };
    return result;
  } catch (error) {
    console.error('Failed to update diagram:', error);
    throw error;
  }
};

/**
 * Delete a diagram
 * DELETE /api/v1/diagrams/{project_id}/{doc_id}
 */
export const deleteFlowDiagram = async (projectId: string, docId: string): Promise<boolean> => {
  try {
    await mainApi.delete<{ deleted: boolean }>(`/v1/diagrams/${projectId}/${docId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete diagram:', error);
    throw error;
  }
};
