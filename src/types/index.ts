/**
 * 类型定义
 */

export interface SpecRequest {
  spec_name: string;
  projectRoot: string;
}

export interface CreateSpecRequest {
  spec_name: string;
  content: string;
  projectRoot: string;
}

export interface EditSpecRequest {
  spec_name: string;
  content: string;
  projectRoot: string;
}

export interface ListSpecsRequest {
  projectRoot: string;
}

export interface DeleteSpecRequest {
  spec_name: string;
  projectRoot: string;
}

export interface SpecResponse {
  spec_name: string;
  content: string;
  file_path: string;
}

export interface SpecOperationResponse {
  success: boolean;
  message: string;
  spec_name: string;
}

export interface ListSpecsResponse {
  total: number;
  specs: Array<{
    name: string;
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
