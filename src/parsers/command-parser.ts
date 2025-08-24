import { BackendCommand, ProjectContext } from '../models/types';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class CommandParser {
  private static readonly BACKEND_REGEX = /Backend\.(crear|obtener|actualizar|eliminar|ejecutar)\s*\((.*?)\)/g;
  
  /**
   * Parsea comandos Backend desde el texto
   */
  static parseBackendCommand(text: string): BackendCommand | null {
    const match = text.match(/Backend\.(crear|obtener|actualizar|eliminar|ejecutar)\s*\((.*?)\)/);
    
    if (!match) {
      return null;
    }
    
    const action = match[1] as BackendCommand['action'];
    const params = this.parseParameters(match[2]);
    
    const command: BackendCommand = {
      action,
      resource: params[0] || ''
    };
    
    // Asignar parámetros según la acción
    switch (action) {
      case 'crear':
        command.data = params[1];
        break;
      case 'obtener':
        command.query = params[1];
        break;
      case 'actualizar':
        command.id = params[1];
        command.updates = params[2];
        break;
      case 'eliminar':
        command.id = params[1];
        break;
      case 'ejecutar':
        command.resource = params[0]; // action en este caso
        command.payload = params[1];
        break;
    }
    
    return command;
  }
  
  /**
   * Parsea los parámetros de un comando
   */
  private static parseParameters(paramsString: string): any[] {
    const params: any[] = [];
    
    if (!paramsString) {
      return params;
    }
    
    // Intenta parsear como JSON primero
    try {
      // Remueve comillas del recurso si es string
      const parts = paramsString.split(',').map(p => p.trim());
      
      for (const part of parts) {
        if (part.startsWith('"') || part.startsWith("'") || part.startsWith('`')) {
          // Es un string
          const match = part.match(/["'`]([^"'`]+)["'`]/);
          params.push(match ? match[1] : part);
        } else if (part.startsWith('{') || part.startsWith('[')) {
          // Es un objeto o array
          try {
            params.push(JSON.parse(part));
          } catch {
            params.push(part);
          }
        } else if (!isNaN(Number(part))) {
          // Es un número
          params.push(Number(part));
        } else {
          // Es una variable o expresión
          params.push(part);
        }
      }
    } catch (error) {
      // Si falla, retorna el string original
      params.push(paramsString);
    }
    
    return params;
  }
  
  /**
   * Encuentra todos los comandos Backend en un documento
   */
  static findAllBackendCommands(document: vscode.TextDocument): BackendCommand[] {
    const text = document.getText();
    const commands: BackendCommand[] = [];
    let match;
    
    this.BACKEND_REGEX.lastIndex = 0;
    
    while ((match = this.BACKEND_REGEX.exec(text)) !== null) {
      const command = this.parseBackendCommand(match[0]);
      if (command) {
        commands.push(command);
      }
    }
    
    return commands;
  }
  
  /**
   * Obtiene el contexto del proyecto Génesis
   */
  static async getProjectContext(workspaceFolder?: vscode.WorkspaceFolder): Promise<ProjectContext> {
    const context: ProjectContext = {
      entities: [],
      models: [],
      repositories: [],
      projectType: 'other'
    };
    
    if (!workspaceFolder) {
      return context;
    }
    
    const rootPath = workspaceFolder.uri.fsPath;
    
    // Detectar si es un proyecto Génesis
    const genesisIndicators = [
      'Compartido.Entidades',
      'Compartido.Modelos',
      'Compartido.Repositorio',
      'CBRFenix.sln'
    ];
    
    for (const indicator of genesisIndicators) {
      const indicatorPath = path.join(rootPath, indicator);
      if (fs.existsSync(indicatorPath)) {
        context.projectType = 'genesis';
        break;
      }
    }
    
    // Si es proyecto Génesis, analizar entidades, modelos y repositorios
    if (context.projectType === 'genesis') {
      context.entities = await this.scanDirectory(path.join(rootPath, 'Compartido.Entidades'), '.cs');
      context.models = await this.scanDirectory(path.join(rootPath, 'Compartido.Modelos'), '.cs');
      context.repositories = await this.scanDirectory(path.join(rootPath, 'Compartido.Repositorio'), '.cs');
    }
    
    return context;
  }
  
  /**
   * Escanea un directorio para encontrar archivos
   */
  private static async scanDirectory(dirPath: string, extension: string): Promise<string[]> {
    const files: string[] = [];
    
    if (!fs.existsSync(dirPath)) {
      return files;
    }
    
    try {
      const entries = fs.readdirSync(dirPath);
      
      for (const entry of entries) {
        if (entry.endsWith(extension)) {
          const baseName = path.basename(entry, extension);
          files.push(baseName);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }
    
    return files;
  }
  
  /**
   * Detecta el comando en la posición actual del cursor
   */
  static getCommandAtPosition(document: vscode.TextDocument, position: vscode.Position): BackendCommand | null {
    const line = document.lineAt(position);
    const text = line.text;
    
    // Buscar comando Backend en la línea actual
    const command = this.parseBackendCommand(text);
    
    if (command) {
      return command;
    }
    
    // Si no encuentra en la línea actual, buscar en líneas cercanas
    const range = new vscode.Range(
      new vscode.Position(Math.max(0, position.line - 2), 0),
      new vscode.Position(Math.min(document.lineCount - 1, position.line + 2), 0)
    );
    
    const nearbyText = document.getText(range);
    return this.parseBackendCommand(nearbyText);
  }
}