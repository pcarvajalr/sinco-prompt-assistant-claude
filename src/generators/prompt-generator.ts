import { BackendCommand, GeneratedPrompt, ProjectContext } from '../models/types';
import { getBackendTemplate } from '../templates/backend-templates';

export class PromptGenerator {
  private static promptHistory: GeneratedPrompt[] = [];
  
  /**
   * Genera un prompt basado en un comando Backend
   */
  static generateBackendPrompt(command: BackendCommand, context?: ProjectContext): GeneratedPrompt {
    const template = getBackendTemplate(command.action);
    
    if (!template) {
      throw new Error(`Template no encontrado para la acción: ${command.action}`);
    }
    
    let prompt = template.promptTemplate;
    
    // Reemplazar placeholders con valores reales
    prompt = this.replacePlaceholders(prompt, command, context);
    
    // Añadir contexto del proyecto si está disponible
    if (context && context.projectType === 'genesis') {
      prompt = this.enrichWithProjectContext(prompt, command, context);
    }
    
    const generatedPrompt: GeneratedPrompt = {
      command,
      prompt,
      timestamp: new Date(),
      context
    };
    
    // Guardar en historial
    this.promptHistory.push(generatedPrompt);
    
    return generatedPrompt;
  }
  
  /**
   * Reemplaza los placeholders en el template con valores reales
   */
  private static replacePlaceholders(template: string, command: BackendCommand, _context?: ProjectContext): string {
    let result = template;
    
    // Reemplazar resource
    result = result.replace(/{resource}/g, command.resource || '[recurso]');
    
    // Reemplazar según el tipo de comando
    switch (command.action) {
      case 'crear':
        result = result.replace(/{data}/g, this.formatData(command.data));
        break;
      case 'obtener':
        result = result.replace(/{idOrQuery}/g, this.formatData(command.query || command.id));
        break;
      case 'actualizar':
        result = result.replace(/{id}/g, String(command.id || '[id]'));
        result = result.replace(/{updates}/g, this.formatData(command.updates));
        break;
      case 'eliminar':
        result = result.replace(/{id}/g, String(command.id || '[id]'));
        break;
      case 'ejecutar':
        result = result.replace(/{action}/g, command.resource || '[acción]');
        result = result.replace(/{payload}/g, this.formatData(command.payload));
        break;
      case 'crearTabla':
        result = result.replace(/{modulo}/g, command.modulo || '[módulo]');
        result = result.replace(/{nombreTabla}/g, command.nombreTabla || '[nombreTabla]');
        result = result.replace(/{camposTabla}/g, command.camposTabla || '[camposTabla]');
        break;
    }
    
    return result;
  }
  
  /**
   * Enriquece el prompt con contexto del proyecto Génesis
   */
  private static enrichWithProjectContext(prompt: string, command: BackendCommand, context: ProjectContext): string {
    let enrichedPrompt = prompt;
    
    // Si el recurso coincide con una entidad conocida, añadir información
    if (command.resource) {
      const matchingEntity = context.entities.find(e => 
        e.toLowerCase() === command.resource!.toLowerCase()
      );
      
      if (matchingEntity) {
        enrichedPrompt += `\n\nContexto del proyecto Génesis:`;
        enrichedPrompt += `\n- La entidad "${matchingEntity}" existe en Compartido.Entidades`;
        
        // Buscar modelo relacionado
        const matchingModel = context.models.find(m => 
          m.toLowerCase().includes(command.resource!.toLowerCase())
        );
        if (matchingModel) {
          enrichedPrompt += `\n- Modelo relacionado: ${matchingModel} en Compartido.Modelos`;
        }
        
        // Buscar repositorio relacionado
        const matchingRepo = context.repositories.find(r => 
          r.toLowerCase().includes(command.resource!.toLowerCase())
        );
        if (matchingRepo) {
          enrichedPrompt += `\n- Repositorio: ${matchingRepo} en Compartido.Repositorio`;
        }
      }
    }
    
    return enrichedPrompt;
  }
  
  /**
   * Formatea datos para mostrar en el prompt
   */
  private static formatData(data: any): string {
    if (data === undefined || data === null) {
      return '[sin datos]';
    }
    
    if (typeof data === 'object') {
      try {
        return JSON.stringify(data, null, 2);
      } catch {
        return String(data);
      }
    }
    
    return String(data);
  }
  
  /**
   * Genera un prompt con formato Markdown
   */
  static generateMarkdownPrompt(command: BackendCommand, context?: ProjectContext): string {
    const generatedPrompt = this.generateBackendPrompt(command, context);
    
    let markdown = `## Prompt Generado\n\n`;
    markdown += `### Comando\n`;
    markdown += `\`\`\`javascript\n`;
    markdown += `Backend.${command.action}(${this.formatCommandParameters(command)})\n`;
    markdown += `\`\`\`\n\n`;
    markdown += `### Instrucción para IA\n\n`;
    markdown += generatedPrompt.prompt;
    
    if (context && context.projectType === 'genesis') {
      markdown += `\n\n### Contexto del Proyecto\n`;
      markdown += `- Tipo de proyecto: Génesis\n`;
      markdown += `- Entidades disponibles: ${context.entities.length}\n`;
      markdown += `- Modelos disponibles: ${context.models.length}\n`;
      markdown += `- Repositorios disponibles: ${context.repositories.length}\n`;
    }
    
    return markdown;
  }
  
  /**
   * Formatea los parámetros del comando para visualización
   */
  private static formatCommandParameters(command: BackendCommand): string {
    const params: string[] = [];
    
    params.push(`"${command.resource}"`);
    
    switch (command.action) {
      case 'crear':
        if (command.data) params.push(this.formatData(command.data));
        break;
      case 'obtener':
        if (command.query || command.id) params.push(this.formatData(command.query || command.id));
        break;
      case 'actualizar':
        if (command.id) params.push(String(command.id));
        if (command.updates) params.push(this.formatData(command.updates));
        break;
      case 'eliminar':
        if (command.id) params.push(String(command.id));
        break;
      case 'ejecutar':
        if (command.payload) params.push(this.formatData(command.payload));
        break;
    }
    
    return params.join(', ');
  }
  
  /**
   * Obtiene el historial de prompts generados
   */
  static getHistory(): GeneratedPrompt[] {
    return [...this.promptHistory];
  }
  
  /**
   * Limpia el historial de prompts
   */
  static clearHistory(): void {
    this.promptHistory = [];
  }
  
  /**
   * Exporta el prompt en diferentes formatos
   */
  static exportPrompt(prompt: GeneratedPrompt, format: 'markdown' | 'plain' | 'json'): string {
    switch (format) {
      case 'markdown':
        return this.generateMarkdownPrompt(prompt.command, prompt.context);
      case 'json':
        return JSON.stringify(prompt, null, 2);
      case 'plain':
      default:
        return prompt.prompt;
    }
  }
}