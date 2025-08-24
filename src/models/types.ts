export interface BackendCommand {
  action: 'crear' | 'obtener' | 'actualizar' | 'eliminar' | 'ejecutar' | 'crearTabla';
  resource?: string;
  data?: any;
  id?: string | number;
  query?: any;
  updates?: any;
  payload?: any;
  // Campos específicos para crearTabla
  modulo?: string;
  nombreTabla?: string;
  camposTabla?: string;
}

export interface GeneratedPrompt {
  command: BackendCommand;
  prompt: string;
  timestamp: Date;
  context?: ProjectContext;
}

export interface ProjectContext {
  entities: string[];
  models: string[];
  repositories: string[];
  currentFile?: string;
  projectType: 'genesis' | 'other';
}

export interface CommandTemplate {
  name: string;
  description: string;
  promptTemplate: string;
  requiredParams: string[];
  optionalParams?: string[];
  examples?: CommandExample[];
}

export interface CommandExample {
  input: string;
  output: string;
  description?: string;
}

export interface ExtensionConfig {
  backend: {
    enabled: boolean;
    autoGenerate: boolean;
    showInStatusBar: boolean;
  };
  output: {
    format: 'markdown' | 'plain';
  };
  genesis: {
    projectPath?: string;
    autoDetect: boolean;
  };
}

export interface CommandLibrary {
  backend: {
    [key: string]: CommandTemplate;
  };
  frontend?: {
    [key: string]: CommandTemplate;
  };
  qa?: {
    [key: string]: CommandTemplate;
  };
}