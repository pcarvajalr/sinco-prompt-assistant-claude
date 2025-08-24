import * as vscode from 'vscode';
import { getAllBackendTemplates } from '../templates/backend-templates';
import { CommandTemplate } from '../models/types';

export class CommandsTreeProvider implements vscode.TreeDataProvider<CommandItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<CommandItem | undefined | null | void> = new vscode.EventEmitter<CommandItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<CommandItem | undefined | null | void> = this._onDidChangeTreeData.event;
  
  constructor() {}
  
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  
  getTreeItem(element: CommandItem): vscode.TreeItem {
    return element;
  }
  
  getChildren(element?: CommandItem): Thenable<CommandItem[]> {
    if (!element) {
      // Raíz del árbol - mostrar categorías
      return Promise.resolve([
        new CommandItem(
          'Backend',
          'Comandos de Backend',
          vscode.TreeItemCollapsibleState.Expanded,
          'library'
        )
      ]);
    } else if (element.label === 'Backend') {
      // Mostrar comandos Backend
      const templates = getAllBackendTemplates();
      return Promise.resolve(
        templates.map(template => {
          const actionName = template.name.split('.')[1];
          return new CommandItem(
            actionName,
            template.description,
            vscode.TreeItemCollapsibleState.Collapsed,
            'symbol-method',
            template
          );
        })
      );
    } else if (element.template) {
      // Mostrar detalles del comando
      const items: CommandItem[] = [];
      
      // Parámetros requeridos
      if (element.template.requiredParams.length > 0) {
        items.push(
          new CommandItem(
            'Parámetros Requeridos',
            element.template.requiredParams.join(', '),
            vscode.TreeItemCollapsibleState.None,
            'symbol-parameter'
          )
        );
      }
      
      // Parámetros opcionales
      if (element.template.optionalParams && element.template.optionalParams.length > 0) {
        items.push(
          new CommandItem(
            'Parámetros Opcionales',
            element.template.optionalParams.join(', '),
            vscode.TreeItemCollapsibleState.None,
            'symbol-parameter'
          )
        );
      }
      
      // Ejemplos
      if (element.template.examples && element.template.examples.length > 0) {
        items.push(
          new CommandItem(
            'Ejemplos',
            `${element.template.examples.length} ejemplo(s) disponible(s)`,
            vscode.TreeItemCollapsibleState.Collapsed,
            'book',
            undefined,
            element.template.examples
          )
        );
      }
      
      return Promise.resolve(items);
    } else if (element.examples) {
      // Mostrar ejemplos individuales
      return Promise.resolve(
        element.examples.map((example, index) => 
          new CommandItem(
            `Ejemplo ${index + 1}`,
            example.description || example.output,
            vscode.TreeItemCollapsibleState.None,
            'code',
            undefined,
            undefined,
            example
          )
        )
      );
    } else {
      return Promise.resolve([]);
    }
  }
}

class CommandItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly iconPath?: string,
    public readonly template?: CommandTemplate,
    public readonly examples?: any[],
    public readonly example?: any
  ) {
    super(label, collapsibleState);
    
    this.tooltip = this.description;
    this.description = this.description;
    
    if (iconPath) {
      this.iconPath = new vscode.ThemeIcon(iconPath) as any;
    }
    
    // Si es un comando específico, añadir comando de click
    if (template) {
      this.command = {
        command: 'sinco.insertCommand',
        title: 'Insertar Comando',
        arguments: [template]
      };
    }
    
    // Si es un ejemplo específico, añadir comando de click
    if (example) {
      this.command = {
        command: 'sinco.insertExample',
        title: 'Insertar Ejemplo',
        arguments: [example]
      };
    }
  }
}

// Registrar comandos adicionales para el árbol
export function registerTreeCommands(context: vscode.ExtensionContext) {
  // Comando para insertar comando desde el árbol
  const insertCommandCommand = vscode.commands.registerCommand('sinco.insertCommand', (template: CommandTemplate) => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const actionName = template.name.split('.')[1];
      let snippet = '';
      
      switch (actionName) {
        case 'crear':
          snippet = `Backend.crear("resource", { campo: "valor" });`;
          break;
        case 'obtener':
          snippet = `Backend.obtener("resource");`;
          break;
        case 'actualizar':
          snippet = `Backend.actualizar("resource", id, { campo: "valor" });`;
          break;
        case 'eliminar':
          snippet = `Backend.eliminar("resource", id);`;
          break;
        case 'ejecutar':
          snippet = `Backend.ejecutar("action");`;
          break;
      }
      
      editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, snippet);
      });
      
      vscode.window.showInformationMessage(`Comando ${template.name} insertado`);
    }
  });
  
  // Comando para insertar ejemplo desde el árbol
  const insertExampleCommand = vscode.commands.registerCommand('sinco.insertExample', (example: any) => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, example.input);
      });
      
      vscode.window.showInformationMessage('Ejemplo insertado');
    }
  });
  
  context.subscriptions.push(insertCommandCommand, insertExampleCommand);
}