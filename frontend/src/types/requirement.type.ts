export type RequirementCategory = 'user-stories' | 'technical' | 'acceptance' | 'business' | 'non-functional' | 'questions';

export interface Requirement {
  id: string;
  title: string;
  category: RequirementCategory;
  description: string;
  content?: string;
  updated_at ?: Date;
  created_at?: Date;
}

export interface RequirementTab {
  id: string; // requirement id
  dirty: boolean;
  saving: boolean;
}

export interface FolderInfo {
  category: RequirementCategory;
  name: string;
}
