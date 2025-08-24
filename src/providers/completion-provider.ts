import * as vscode from 'vscode';
import { getAllBackendTemplates } from '../templates/backend-templates';

export class BackendCompletionProvider implements vscode.CompletionItemProvider {
  
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.CompletionItem[] | vscode.CompletionList {
    
    const linePrefix = document.lineAt(position).text.substr(0, position.character);
    
    // Solo activar si detectamos "Backend."
    if (!linePrefix.endsWith('Backend.')) {
      return [];
    }
    
    const completionItems: vscode.CompletionItem[] = [];
    const templates = getAllBackendTemplates();
    
    // Crear items de autocompletado para cada acción Backend
    for (const template of templates) {
      const actionName = template.name.split('.')[1]; // Obtener 'crear', 'obtener', etc.
      
      const item = new vscode.CompletionItem(
        actionName,
        vscode.CompletionItemKind.Method
      );
      
      item.detail = template.description;
      item.documentation = new vscode.MarkdownString(
        this.createDocumentation(template)
      );
      
      // Crear snippet con placeholders
      item.insertText = new vscode.SnippetString(
        this.createSnippet(actionName, template)
      );
      
      // Remover comando automático para evitar generación no deseada
      // item.command = {
      //   command: 'sinco.generatePrompt',
      //   title: 'Generar Prompt'
      // };
      
      completionItems.push(item);
    }
    
    return completionItems;
  }
  
  private createDocumentation(template: any): string {
    let doc = `**${template.name}**\n\n`;
    doc += `${template.description}\n\n`;
    
    if (template.requiredParams.length > 0) {
      doc += `**Parámetros requeridos:**\n`;
      template.requiredParams.forEach((param: string) => {
        doc += `- \`${param}\`\n`;
      });
      doc += '\n';
    }
    
    if (template.optionalParams && template.optionalParams.length > 0) {
      doc += `**Parámetros opcionales:**\n`;
      template.optionalParams.forEach((param: string) => {
        doc += `- \`${param}\`\n`;
      });
      doc += '\n';
    }
    
    if (template.examples && template.examples.length > 0) {
      doc += `**Ejemplos:**\n\n`;
      template.examples.forEach((example: any) => {
        doc += `\`\`\`javascript\n${example.input}\n\`\`\`\n`;
        doc += `*${example.description || example.output}*\n\n`;
      });
    }
    
    return doc;
  }
  
  private createSnippet(actionName: string, _template: any): string {
    // Snippets más detallados con mejores placeholders
    switch (actionName) {
      case 'crear':
        return 'crear("${1:recurso}", {\n\t${2:campo}: "${3:valor}"\n})';
      case 'obtener':
        return 'obtener("${1:recurso}"${2:, ${3:idOrQuery}})';
      case 'actualizar':
        return 'actualizar("${1:recurso}", ${2:id}, {\n\t${3:campo}: "${4:nuevoValor}"\n})';
      case 'eliminar':
        return 'eliminar("${1:recurso}", ${2:id})';
      case 'ejecutar':
        return 'ejecutar("${1:accion}"${2:, ${3:payload}})';
      default:
        return `${actionName}("\${1:parametro}")`;
    }
  }
}