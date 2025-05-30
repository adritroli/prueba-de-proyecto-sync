export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  favorite: boolean;
  shared_with?: string;
  shared_with_id?: string;
  folder_id?: string;
  deleted?: boolean;
  share_type?: 'shared_by_me' | 'shared_with_me';
  owner_name?: string;
  shared_by?: number;
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}
