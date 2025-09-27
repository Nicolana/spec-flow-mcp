/**
 * 类型定义
 */

export interface SpecRequest {
  spec_name: string;
  category?: 'frontend' | 'backend' | 'mobile' | 'design';
  projectRoot: string;
}

export interface CreateSpecRequest {
  spec_name: string;
  content: string;
  category?: 'frontend' | 'backend' | 'mobile' | 'design';
  projectRoot: string;
}

export interface EditSpecRequest {
  spec_name: string;
  content: string;
  category?: 'frontend' | 'backend' | 'mobile' | 'design';
  projectRoot: string;
}

export interface ListSpecsRequest {
  projectRoot: string;
}

export interface SpecResponse {
  spec_name: string;
  content: string;
  category: string;
  file_path: string;
}

export interface SpecOperationResponse {
  success: boolean;
  message: string;
  spec_name: string;
  category: string;
}

export interface ListSpecsResponse {
  total: number;
  specs: Array<{
    name: string;
    category: string;
    file_path: string;
  }>;
}

export interface MCPMessage {
  jsonrpc: string;
  id?: string | number;
  method?: string;
  params?: Record<string, any>;
}

export interface MCPResponse {
  jsonrpc: string;
  id?: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}
