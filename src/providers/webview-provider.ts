import * as vscode from 'vscode';
import { PromptGenerator } from '../generators/prompt-generator';
import { BackendCommand, ProjectContext } from '../models/types';
import { CommandParser } from '../parsers/command-parser';

export class SincoWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'sincoPromptGenerator';

  private _view?: vscode.WebviewView;
  private _projectContext?: ProjectContext;

  constructor(
    private readonly _extensionUri: vscode.Uri,
  ) {}

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    // Configurar webview
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    // Cargar contexto del proyecto
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
      this._projectContext = await CommandParser.getProjectContext(vscode.workspace.workspaceFolders[0]);
    }

    // Configurar HTML
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Manejar mensajes del webview
    webviewView.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.type) {
          case 'generatePrompt':
            await this.handleGeneratePrompt(message.command);
            break;
          case 'copyPrompt':
            await this.handleCopyPrompt(message.prompt);
            break;
          case 'exportPrompt':
            await this.handleExportPrompt(message.prompt, message.format);
            break;
          case 'previewPrompt':
            this.handlePreviewPrompt(message.command);
            break;
        }
      },
      undefined
    );
  }

  private async handleGeneratePrompt(command: BackendCommand) {
    try {
      const generatedPrompt = PromptGenerator.generateBackendPrompt(command, this._projectContext);
      const format = vscode.workspace.getConfiguration('sinco').get('output.format', 'markdown');
      
      let content: string;
      if (format === 'markdown') {
        content = PromptGenerator.generateMarkdownPrompt(command, this._projectContext);
      } else {
        content = generatedPrompt.prompt;
      }

      // Crear documento con el prompt
      const doc = await vscode.workspace.openTextDocument({
        language: format === 'markdown' ? 'markdown' : 'plaintext',
        content
      });

      await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
      
      // Enviar confirmación al webview
      this._view?.webview.postMessage({
        type: 'promptGenerated',
        success: true,
        prompt: generatedPrompt.prompt
      });

    } catch (error) {
      vscode.window.showErrorMessage(`Error generando prompt: ${error}`);
      this._view?.webview.postMessage({
        type: 'promptGenerated',
        success: false,
        error: String(error)
      });
    }
  }

  private async handleCopyPrompt(prompt: string) {
    await vscode.env.clipboard.writeText(prompt);
    vscode.window.showInformationMessage('Prompt copiado al portapapeles');
  }

  private async handleExportPrompt(prompt: string, format: 'markdown' | 'json' | 'plain') {
    const fileName = `prompt-${Date.now()}.${format === 'markdown' ? 'md' : format === 'json' ? 'json' : 'txt'}`;
    
    const uri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(fileName),
      filters: {
        'Markdown': ['md'],
        'JSON': ['json'],
        'Text': ['txt'],
        'All Files': ['*']
      }
    });

    if (uri) {
      await vscode.workspace.fs.writeFile(uri, Buffer.from(prompt, 'utf8'));
      vscode.window.showInformationMessage(`Prompt exportado a ${uri.fsPath}`);
    }
  }

  private handlePreviewPrompt(command: BackendCommand) {
    try {
      const generatedPrompt = PromptGenerator.generateBackendPrompt(command, this._projectContext);
      
      this._view?.webview.postMessage({
        type: 'promptPreview',
        prompt: generatedPrompt.prompt,
        command: command
      });
    } catch (error) {
      this._view?.webview.postMessage({
        type: 'promptPreview',
        error: String(error)
      });
    }
  }

  private _getHtmlForWebview(_webview: vscode.Webview) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sinco Prompt Generator</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 15px;
        }
        
        .header h1 {
            color: var(--vscode-titleBar-activeForeground);
            margin: 0;
            font-size: 1.5em;
        }
        
        .form-section {
            margin-bottom: 25px;
            padding: 15px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 5px;
            border: 1px solid var(--vscode-panel-border);
        }
        
        .form-title {
            font-weight: bold;
            color: var(--vscode-symbolIcon-functionForeground);
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            color: var(--vscode-input-foreground);
            font-weight: 500;
        }
        
        input, select, textarea {
            width: 100%;
            padding: 8px;
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            color: var(--vscode-input-foreground);
            border-radius: 3px;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            box-sizing: border-box;
        }
        
        input:focus, select:focus, textarea:focus {
            outline: 1px solid var(--vscode-focusBorder);
            border-color: var(--vscode-focusBorder);
        }
        
        textarea {
            resize: vertical;
            min-height: 80px;
            font-family: var(--vscode-editor-font-family);
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        button {
            padding: 8px 16px;
            border: 1px solid var(--vscode-button-border);
            border-radius: 3px;
            cursor: pointer;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            transition: all 0.2s;
        }
        
        .btn-primary {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        
        .btn-primary:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        
        .preview-section {
            margin-top: 20px;
            padding: 15px;
            background-color: var(--vscode-textBlockQuote-background);
            border-left: 3px solid var(--vscode-textLink-activeForeground);
            border-radius: 3px;
            display: none;
        }
        
        .preview-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--vscode-symbolIcon-functionForeground);
        }
        
        .preview-content {
            white-space: pre-wrap;
            font-family: var(--vscode-editor-font-family);
            font-size: 0.9em;
            max-height: 300px;
            overflow-y: auto;
            background-color: var(--vscode-textCodeBlock-background);
            padding: 10px;
            border-radius: 3px;
        }
        
        .error {
            color: var(--vscode-errorForeground);
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            padding: 8px;
            border-radius: 3px;
            margin-top: 10px;
        }
        
        .success {
            color: var(--vscode-terminal-ansiGreen);
            background-color: var(--vscode-diffEditor-insertedTextBackground);
            border: 1px solid var(--vscode-diffEditor-insertedTextBorder);
            padding: 8px;
            border-radius: 3px;
            margin-top: 10px;
        }
        
        .hidden {
            display: none;
        }
        
        .conditional-fields {
            margin-top: 10px;
        }
        
        .help-text {
            font-size: 0.85em;
            color: var(--vscode-descriptionForeground);
            margin-top: 5px;
        }

        .project-context {
            background-color: var(--vscode-editor-selectionBackground);
            padding: 10px;
            border-radius: 3px;
            margin-bottom: 15px;
            font-size: 0.9em;
        }

        .context-item {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Sinco Prompt Generator</h1>
        <p>Genera prompts estructurados para IA basados en comandos Backend</p>
    </div>

    <div id="projectContext" class="project-context" style="display: none;">
        <strong>📁 Contexto del Proyecto:</strong>
        <div id="contextDetails"></div>
    </div>

    <div class="form-section">
        <div class="form-title">Configurar Comando Backend</div>
        
        <div class="form-group">
            <label for="action">Acción:</label>
            <select id="action" onchange="updateForm()">
                <option value="">-- Selecciona una acción --</option>
                <option value="crear">Crear - Crea un nuevo recurso</option>
                <option value="obtener">Obtener - Recupera recursos</option>
                <option value="actualizar">Actualizar - Modifica un recurso</option>
                <option value="eliminar">Eliminar - Borra un recurso</option>
                <option value="ejecutar">Ejecutar - Acción personalizada</option>
                <option value="crearTabla">🗂️ Crear Tabla - Genera tabla completa con entidad, repositorio y controlador</option>
            </select>
        </div>

        <div class="form-group" id="resourceGroup">
            <label for="resource">Recurso/Entidad:</label>
            <input type="text" id="resource" placeholder="Ej: usuario, proyecto, comprador" onchange="updatePreview()">
            <div class="help-text" id="resourceHelp">Nombre de la entidad o recurso sobre el que operar</div>
        </div>

        <div class="conditional-fields">
            <!-- Campos específicos para cada acción -->
            <div id="crearFields" class="hidden">
                <div class="form-group">
                    <label for="crearData">Datos (JSON):</label>
                    <textarea id="crearData" placeholder='{ "nombre": "Juan", "email": "juan@test.com" }' onchange="updatePreview()"></textarea>
                    <div class="help-text">Objeto JSON con los datos para crear el recurso</div>
                </div>
            </div>

            <div id="obtenerFields" class="hidden">
                <div class="form-group">
                    <label for="obtenerQuery">ID o Query (opcional):</label>
                    <input type="text" id="obtenerQuery" placeholder='123 o { "estado": "activo" }' onchange="updatePreview()">
                    <div class="help-text">ID específico o objeto JSON con filtros de búsqueda</div>
                </div>
            </div>

            <div id="actualizarFields" class="hidden">
                <div class="form-group">
                    <label for="actualizarId">ID del recurso:</label>
                    <input type="text" id="actualizarId" placeholder="123" onchange="updatePreview()">
                </div>
                <div class="form-group">
                    <label for="actualizarData">Actualizaciones (JSON):</label>
                    <textarea id="actualizarData" placeholder='{ "email": "nuevo@test.com" }' onchange="updatePreview()"></textarea>
                    <div class="help-text">Objeto JSON con los campos a actualizar</div>
                </div>
            </div>

            <div id="eliminarFields" class="hidden">
                <div class="form-group">
                    <label for="eliminarId">ID del recurso:</label>
                    <input type="text" id="eliminarId" placeholder="123" onchange="updatePreview()">
                </div>
            </div>

            <div id="ejecutarFields" class="hidden">
                <div class="form-group">
                    <label for="ejecutarPayload">Payload (JSON, opcional):</label>
                    <textarea id="ejecutarPayload" placeholder='{ "monto": 1000, "metodo": "tarjeta" }' onchange="updatePreview()"></textarea>
                    <div class="help-text">Datos adicionales para la acción personalizada</div>
                </div>
            </div>

            <div id="crearTablaFields" class="hidden">
                <div class="form-group">
                    <label for="modulo">Módulo:</label>
                    <select id="modulo" onchange="updatePreview()">
                        <option value="">-- Selecciona un módulo --</option>
                        <option value="Compartido">Compartido - Entidades compartidas entre módulos</option>
                        <option value="Postventas">Postventas - Gestión de servicios post-venta</option>
                        <option value="SalaDeVentas">SalaDeVentas - Procesos de ventas y cotizaciones</option>
                        <option value="Tramites">Tramites - Gestión de trámites y documentos</option>
                        <option value="Ventas">Ventas - Procesos comerciales y clientes</option>
                    </select>
                    <div class="help-text">Módulo del proyecto Génesis donde se creará la tabla</div>
                </div>
                
                <div class="form-group">
                    <label for="nombreTabla">Nombre de la Tabla:</label>
                    <input type="text" id="nombreTabla" placeholder="Ej: Cliente, Producto, Contrato" onchange="updatePreview()">
                    <div class="help-text">Nombre de la entidad/tabla en PascalCase (sin espacios)</div>
                </div>
                
                <div class="form-group">
                    <label for="camposTabla">Campos de la Tabla:</label>
                    <textarea id="camposTabla" rows="8" placeholder="Ej:
Id:int:PK:Identity
Nombre:string(100):Required
Email:string(50):Unique
Telefono:string(20)
FechaCreacion:datetime:Default(GetDate())
EstaActivo:bool:Default(true)
IdUsuarioCreador:int:FK(Usuarios.Id)" onchange="updatePreview()"></textarea>
                    <div class="help-text">
                        <strong>Formato:</strong> Campo:Tipo:Restricciones<br/>
                        <strong>Tipos:</strong> int, string(longitud), bool, datetime, decimal(p,s), guid<br/>
                        <strong>Restricciones:</strong> PK (Primary Key), FK(Tabla.Campo), Required, Unique, Identity, Default(valor)
                    </div>
                </div>
            </div>
        </div>

        <div class="button-group">
            <button class="btn-primary" onclick="generatePrompt()">🎯 Generar Prompt</button>
            <button class="btn-secondary" onclick="previewPrompt()">👁️ Vista Previa</button>
            <button class="btn-secondary" onclick="clearForm()">🗑️ Limpiar</button>
        </div>

        <div id="message"></div>
    </div>

    <div id="previewSection" class="preview-section">
        <div class="preview-title">📋 Vista Previa del Prompt</div>
        <div id="previewContent" class="preview-content"></div>
        <div class="button-group" style="margin-top: 10px;">
            <button class="btn-secondary" onclick="copyPrompt()">📋 Copiar</button>
            <button class="btn-secondary" onclick="exportPrompt('markdown')">📄 Exportar MD</button>
            <button class="btn-secondary" onclick="exportPrompt('json')">💾 Exportar JSON</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentPrompt = '';

        function updateForm() {
            const action = document.getElementById('action').value;
            const fields = ['crearFields', 'obtenerFields', 'actualizarFields', 'eliminarFields', 'ejecutarFields', 'crearTablaFields'];
            
            // Ocultar todos los campos
            fields.forEach(field => {
                document.getElementById(field).classList.add('hidden');
            });
            
            // Mostrar campos relevantes
            if (action) {
                const targetField = action + 'Fields';
                document.getElementById(targetField).classList.remove('hidden');
                
                // Mostrar/ocultar campo de resource según la acción
                const resourceGroup = document.getElementById('resourceGroup');
                if (action === 'crearTabla') {
                    resourceGroup.classList.add('hidden');
                } else {
                    resourceGroup.classList.remove('hidden');
                }
                
                // Actualizar texto de ayuda del recurso
                const resourceHelp = document.getElementById('resourceHelp');
                switch(action) {
                    case 'crear':
                        resourceHelp.textContent = 'Nombre de la entidad a crear (ej: usuario, proyecto)';
                        break;
                    case 'obtener':
                        resourceHelp.textContent = 'Nombre de la entidad a consultar';
                        break;
                    case 'actualizar':
                        resourceHelp.textContent = 'Nombre de la entidad a actualizar';
                        break;
                    case 'eliminar':
                        resourceHelp.textContent = 'Nombre de la entidad a eliminar';
                        break;
                    case 'ejecutar':
                        resourceHelp.textContent = 'Nombre de la acción a ejecutar';
                        break;
                    case 'crearTabla':
                        resourceHelp.textContent = 'No aplica para creación de tabla - usar campos específicos abajo';
                        break;
                }
            }
            
            updatePreview();
        }

        function buildCommand() {
            const action = document.getElementById('action').value;
            const resource = document.getElementById('resource').value;
            
            // Validación específica para crearTabla
            if (action === 'crearTabla') {
                const modulo = document.getElementById('modulo').value;
                const nombreTabla = document.getElementById('nombreTabla').value;
                const camposTabla = document.getElementById('camposTabla').value;
                
                if (!action || !modulo || !nombreTabla || !camposTabla) {
                    return null;
                }
            } else if (!action || !resource) {
                return null;
            }
            
            const command = { action, resource };
            
            switch(action) {
                case 'crear':
                    const crearData = document.getElementById('crearData').value;
                    if (crearData) {
                        try {
                            command.data = JSON.parse(crearData);
                        } catch {
                            command.data = crearData;
                        }
                    }
                    break;
                case 'obtener':
                    const query = document.getElementById('obtenerQuery').value;
                    if (query) {
                        try {
                            command.query = JSON.parse(query);
                        } catch {
                            command.query = isNaN(Number(query)) ? query : Number(query);
                        }
                    }
                    break;
                case 'actualizar':
                    const id = document.getElementById('actualizarId').value;
                    const updates = document.getElementById('actualizarData').value;
                    if (id) command.id = isNaN(Number(id)) ? id : Number(id);
                    if (updates) {
                        try {
                            command.updates = JSON.parse(updates);
                        } catch {
                            command.updates = updates;
                        }
                    }
                    break;
                case 'eliminar':
                    const deleteId = document.getElementById('eliminarId').value;
                    if (deleteId) command.id = isNaN(Number(deleteId)) ? deleteId : Number(deleteId);
                    break;
                case 'ejecutar':
                    const payload = document.getElementById('ejecutarPayload').value;
                    if (payload) {
                        try {
                            command.payload = JSON.parse(payload);
                        } catch {
                            command.payload = payload;
                        }
                    }
                    break;
                case 'crearTabla':
                    const modulo = document.getElementById('modulo').value;
                    const nombreTabla = document.getElementById('nombreTabla').value;
                    const camposTabla = document.getElementById('camposTabla').value;
                    
                    if (modulo) command.modulo = modulo;
                    if (nombreTabla) command.nombreTabla = nombreTabla;
                    if (camposTabla) command.camposTabla = camposTabla;
                    
                    // Para crearTabla, no necesitamos el campo resource genérico
                    delete command.resource;
                    break;
            }
            
            return command;
        }

        function updatePreview() {
            const command = buildCommand();
            if (command) {
                vscode.postMessage({
                    type: 'previewPrompt',
                    command: command
                });
            }
        }

        function previewPrompt() {
            const command = buildCommand();
            if (!command) {
                const action = document.getElementById('action').value;
                if (action === 'crearTabla') {
                    showMessage('Por favor completa el módulo, nombre de tabla y campos', 'error');
                } else {
                    showMessage('Por favor completa al menos la acción y el recurso', 'error');
                }
                return;
            }
            updatePreview();
        }

        function generatePrompt() {
            const command = buildCommand();
            if (!command) {
                const action = document.getElementById('action').value;
                if (action === 'crearTabla') {
                    showMessage('Por favor completa el módulo, nombre de tabla y campos', 'error');
                } else {
                    showMessage('Por favor completa al menos la acción y el recurso', 'error');
                }
                return;
            }
            
            vscode.postMessage({
                type: 'generatePrompt',
                command: command
            });
        }

        function copyPrompt() {
            if (currentPrompt) {
                vscode.postMessage({
                    type: 'copyPrompt',
                    prompt: currentPrompt
                });
            }
        }

        function exportPrompt(format) {
            if (currentPrompt) {
                vscode.postMessage({
                    type: 'exportPrompt',
                    prompt: currentPrompt,
                    format: format
                });
            }
        }

        function clearForm() {
            document.getElementById('action').value = '';
            document.getElementById('resource').value = '';
            ['crearData', 'obtenerQuery', 'actualizarId', 'actualizarData', 'eliminarId', 'ejecutarPayload'].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.value = '';
            });
            updateForm();
            hidePreview();
            clearMessage();
        }

        function showPreview(content) {
            document.getElementById('previewContent').textContent = content;
            document.getElementById('previewSection').style.display = 'block';
            currentPrompt = content;
        }

        function hidePreview() {
            document.getElementById('previewSection').style.display = 'none';
            currentPrompt = '';
        }

        function showMessage(message, type) {
            const messageEl = document.getElementById('message');
            messageEl.textContent = message;
            messageEl.className = type;
        }

        function clearMessage() {
            const messageEl = document.getElementById('message');
            messageEl.textContent = '';
            messageEl.className = '';
        }

        // Manejar mensajes del backend
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'promptPreview':
                    if (message.error) {
                        showMessage('Error en vista previa: ' + message.error, 'error');
                        hidePreview();
                    } else {
                        showPreview(message.prompt);
                        clearMessage();
                    }
                    break;
                case 'promptGenerated':
                    if (message.success) {
                        showMessage('✅ Prompt generado exitosamente', 'success');
                        if (message.prompt) {
                            showPreview(message.prompt);
                        }
                    } else {
                        showMessage('❌ Error generando prompt: ' + message.error, 'error');
                    }
                    break;
            }
        });
    </script>
</body>
</html>`;
  }
}