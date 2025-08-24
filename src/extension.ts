import * as vscode from 'vscode';
import { CommandParser } from './parsers/command-parser';
import { PromptGenerator } from './generators/prompt-generator';
import { BackendCompletionProvider } from './providers/completion-provider';
import { CommandsTreeProvider, registerTreeCommands } from './providers/tree-provider';
import { SincoWebviewProvider } from './providers/webview-provider';
import { ProjectContext, ExtensionConfig } from './models/types';

let statusBarItem: vscode.StatusBarItem;
let projectContext: ProjectContext;

export async function activate(context: vscode.ExtensionContext) {
    console.log('Sinco Prompt Assistant está activo');
    
    // Obtener contexto del proyecto
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        projectContext = await CommandParser.getProjectContext(vscode.workspace.workspaceFolders[0]);
        console.log('Contexto del proyecto:', projectContext);
    }
    
    // Crear item de barra de estado
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'sinco.showCommands';
    statusBarItem.text = '$(code) Sinco Prompts';
    statusBarItem.tooltip = 'Mostrar comandos disponibles';
    
    const config = vscode.workspace.getConfiguration('sinco') as unknown as ExtensionConfig;
    if (config.backend?.showInStatusBar) {
        statusBarItem.show();
    }
    
    // Registrar comando para generar prompt
    const generatePromptCommand = vscode.commands.registerCommand('sinco.generatePrompt', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No hay editor activo');
            return;
        }
        
        const position = editor.selection.active;
        const command = CommandParser.getCommandAtPosition(editor.document, position);
        
        if (!command) {
            vscode.window.showWarningMessage('No se encontró ningún comando Backend en la posición actual');
            return;
        }
        
        try {
            const format = config.output?.format || 'markdown';
            const prompt = format === 'markdown' 
                ? PromptGenerator.generateMarkdownPrompt(command, projectContext)
                : PromptGenerator.generateBackendPrompt(command, projectContext).prompt;
            
            // Crear un nuevo documento con el prompt
            const doc = await vscode.workspace.openTextDocument({
                language: format === 'markdown' ? 'markdown' : 'plaintext',
                content: prompt
            });
            
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            vscode.window.showInformationMessage('Prompt generado exitosamente');
        } catch (error) {
            vscode.window.showErrorMessage(`Error generando prompt: ${error}`);
        }
    });
    
    // Registrar comando para generar prompt de Backend específicamente
    const generateBackendPromptCommand = vscode.commands.registerCommand('sinco.generateBackendPrompt', async () => {
        // Mostrar QuickPick para seleccionar acción
        const actions = ['crear', 'obtener', 'actualizar', 'eliminar', 'ejecutar'];
        const selectedAction = await vscode.window.showQuickPick(actions, {
            placeHolder: 'Selecciona una acción Backend'
        });
        
        if (!selectedAction) {
            return;
        }
        
        // Solicitar recurso
        const resource = await vscode.window.showInputBox({
            prompt: 'Ingresa el nombre del recurso',
            placeHolder: 'Ej: usuario, proyecto, comprador'
        });
        
        if (!resource) {
            return;
        }
        
        // Crear comando básico
        const command: any = {
            action: selectedAction,
            resource
        };
        
        // Solicitar parámetros adicionales según la acción
        switch (selectedAction) {
            case 'crear':
                const dataStr = await vscode.window.showInputBox({
                    prompt: 'Ingresa los datos (JSON)',
                    placeHolder: '{ "campo": "valor" }'
                });
                if (dataStr) {
                    try {
                        command['data'] = JSON.parse(dataStr);
                    } catch {
                        command['data'] = dataStr;
                    }
                }
                break;
            case 'obtener':
                const query = await vscode.window.showInputBox({
                    prompt: 'Ingresa ID o query (opcional)',
                    placeHolder: '123 o { "estado": "activo" }'
                });
                if (query) {
                    try {
                        command['query'] = JSON.parse(query);
                    } catch {
                        command['query'] = isNaN(Number(query)) ? query : Number(query);
                    }
                }
                break;
            case 'actualizar':
                const id = await vscode.window.showInputBox({
                    prompt: 'Ingresa el ID del recurso',
                    placeHolder: '123'
                });
                if (id) {
                    command['id'] = isNaN(Number(id)) ? id : Number(id);
                    
                    const updates = await vscode.window.showInputBox({
                        prompt: 'Ingresa las actualizaciones (JSON)',
                        placeHolder: '{ "campo": "nuevo_valor" }'
                    });
                    if (updates) {
                        try {
                            command['updates'] = JSON.parse(updates);
                        } catch {
                            command['updates'] = updates;
                        }
                    }
                }
                break;
            case 'eliminar':
                const deleteId = await vscode.window.showInputBox({
                    prompt: 'Ingresa el ID del recurso a eliminar',
                    placeHolder: '123'
                });
                if (deleteId) {
                    command['id'] = isNaN(Number(deleteId)) ? deleteId : Number(deleteId);
                }
                break;
            case 'ejecutar':
                const payload = await vscode.window.showInputBox({
                    prompt: 'Ingresa el payload (JSON, opcional)',
                    placeHolder: '{ "parametro": "valor" }'
                });
                if (payload) {
                    try {
                        command['payload'] = JSON.parse(payload);
                    } catch {
                        command['payload'] = payload;
                    }
                }
                break;
        }
        
        try {
            const format = config.output?.format || 'markdown';
            const prompt = format === 'markdown' 
                ? PromptGenerator.generateMarkdownPrompt(command as any, projectContext)
                : PromptGenerator.generateBackendPrompt(command as any, projectContext).prompt;
            
            // Crear un nuevo documento con el prompt
            const doc = await vscode.workspace.openTextDocument({
                language: format === 'markdown' ? 'markdown' : 'plaintext',
                content: prompt
            });
            
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            
            // Opcionalmente, insertar el comando en el editor actual
            const insertCommand = await vscode.window.showQuickPick(['Sí', 'No'], {
                placeHolder: '¿Insertar comando en el editor actual?'
            });
            
            if (insertCommand === 'Sí') {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const commandStr = `Backend.${command.action}("${command.resource}"${
                        command['data'] ? `, ${JSON.stringify(command['data'])}` : ''
                    }${
                        command['query'] ? `, ${JSON.stringify(command['query'])}` : ''
                    }${
                        command['id'] ? `, ${command['id']}` : ''
                    }${
                        command['updates'] ? `, ${JSON.stringify(command['updates'])}` : ''
                    }${
                        command['payload'] ? `, ${JSON.stringify(command['payload'])}` : ''
                    });`;
                    
                    editor.edit(editBuilder => {
                        editBuilder.insert(editor.selection.active, commandStr);
                    });
                }
            }
            
            vscode.window.showInformationMessage('Prompt generado exitosamente');
        } catch (error) {
            vscode.window.showErrorMessage(`Error generando prompt: ${error}`);
        }
    });
    
    // Registrar comando para mostrar comandos disponibles
    const showCommandsCommand = vscode.commands.registerCommand('sinco.showCommands', async () => {
        const panel = vscode.window.createWebviewPanel(
            'sincoCommands',
            'Comandos Sinco Disponibles',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );
        
        panel.webview.html = getCommandsWebviewContent();
    });
    
    // Registrar comando para mostrar historial
    const showHistoryCommand = vscode.commands.registerCommand('sinco.showHistory', () => {
        const history = PromptGenerator.getHistory();
        
        if (history.length === 0) {
            vscode.window.showInformationMessage('No hay prompts en el historial');
            return;
        }
        
        const items = history.map((item, index) => ({
            label: `${index + 1}. Backend.${item.command.action}("${item.command.resource}")`,
            description: new Date(item.timestamp).toLocaleString(),
            detail: item.prompt.substring(0, 100) + '...',
            item
        }));
        
        vscode.window.showQuickPick(items, {
            placeHolder: 'Selecciona un prompt del historial'
        }).then(selected => {
            if (selected) {
                const format = config.output?.format || 'markdown';
                const content = PromptGenerator.exportPrompt(selected.item, format);
                
                vscode.workspace.openTextDocument({
                    language: format === 'markdown' ? 'markdown' : 'plaintext',
                    content
                }).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            }
        });
    });
    
    // Registrar comando para limpiar historial
    const clearHistoryCommand = vscode.commands.registerCommand('sinco.clearHistory', () => {
        PromptGenerator.clearHistory();
        vscode.window.showInformationMessage('Historial de prompts limpiado');
    });
    
    // Registrar proveedor de autocompletado
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
        new BackendCompletionProvider(),
        '.' // Trigger en el punto después de "Backend."
    );
    
    // Registrar vista de árbol de comandos
    const treeProvider = new CommandsTreeProvider();
    vscode.window.createTreeView('sincoCommands', {
        treeDataProvider: treeProvider,
        showCollapseAll: true
    });
    
    // Registrar comandos del árbol
    registerTreeCommands(context);
    
    // Registrar webview provider
    const webviewProvider = new SincoWebviewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(SincoWebviewProvider.viewType, webviewProvider)
    );
    
    // Registrar comando para abrir el generador principal
    const openGeneratorCommand = vscode.commands.registerCommand('sinco.openGenerator', () => {
        vscode.commands.executeCommand('sincoPromptGenerator.focus');
    });
    
    // Registrar comando para refrescar árbol
    const refreshTreeCommand = vscode.commands.registerCommand('sinco.refreshCommands', () => {
        treeProvider.refresh();
    });
    
    // Detectar cambios en la configuración
    const configWatcher = vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('sinco')) {
            const newConfig = vscode.workspace.getConfiguration('sinco') as unknown as ExtensionConfig;
            if (newConfig.backend?.showInStatusBar) {
                statusBarItem.show();
            } else {
                statusBarItem.hide();
            }
        }
    });
    
    // Detectar comandos al escribir (si está habilitado auto-generate)
    const textChangeWatcher = vscode.workspace.onDidChangeTextDocument(e => {
        if (config.backend?.autoGenerate) {
            const text = e.contentChanges[0]?.text;
            if (text && text.includes('Backend.')) {
                // Mostrar sugerencia en la barra de estado
                statusBarItem.text = '$(zap) Comando detectado';
                setTimeout(() => {
                    statusBarItem.text = '$(code) Sinco Prompts';
                }, 2000);
            }
        }
    });
    
    context.subscriptions.push(
        generatePromptCommand,
        generateBackendPromptCommand,
        showCommandsCommand,
        showHistoryCommand,
        clearHistoryCommand,
        refreshTreeCommand,
        openGeneratorCommand,
        completionProvider,
        statusBarItem,
        configWatcher,
        textChangeWatcher
    );
}

function getCommandsWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comandos Sinco</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        h1 {
            color: var(--vscode-titleBar-activeForeground);
            border-bottom: 2px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        .command-section {
            margin: 20px 0;
            padding: 15px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 5px;
        }
        .command-header {
            font-weight: bold;
            color: var(--vscode-symbolIcon-functionForeground);
            margin-bottom: 10px;
        }
        .command-description {
            margin: 10px 0;
            color: var(--vscode-descriptionForeground);
        }
        .command-example {
            background-color: var(--vscode-textBlockQuote-background);
            padding: 10px;
            border-left: 3px solid var(--vscode-textLink-activeForeground);
            margin: 10px 0;
            font-family: var(--vscode-editor-font-family);
        }
        code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <h1>🚀 Comandos Backend Disponibles</h1>
    
    <div class="command-section">
        <div class="command-header">Backend.crear(resource, data)</div>
        <div class="command-description">Crea un nuevo recurso en el backend</div>
        <div class="command-example">
            <code>Backend.crear("usuario", { nombre: "Juan", email: "juan@test.com" })</code>
        </div>
    </div>
    
    <div class="command-section">
        <div class="command-header">Backend.obtener(resource, idOrQuery?)</div>
        <div class="command-description">Recupera uno o más recursos del backend</div>
        <div class="command-example">
            <code>Backend.obtener("usuario", 123)</code><br>
            <code>Backend.obtener("proyectos", { estado: "activo" })</code>
        </div>
    </div>
    
    <div class="command-section">
        <div class="command-header">Backend.actualizar(resource, id, updates)</div>
        <div class="command-description">Modifica los datos de un recurso existente</div>
        <div class="command-example">
            <code>Backend.actualizar("usuario", 123, { email: "nuevo@test.com" })</code>
        </div>
    </div>
    
    <div class="command-section">
        <div class="command-header">Backend.eliminar(resource, id)</div>
        <div class="command-description">Borra un recurso del backend</div>
        <div class="command-example">
            <code>Backend.eliminar("usuario", 123)</code>
        </div>
    </div>
    
    <div class="command-section">
        <div class="command-header">Backend.ejecutar(action, payload?)</div>
        <div class="command-description">Ejecuta una acción personalizada en el backend</div>
        <div class="command-example">
            <code>Backend.ejecutar("procesarPago", { monto: 1000, metodo: "tarjeta" })</code>
        </div>
    </div>
    
    <h2>📝 Atajos de Teclado</h2>
    <ul>
        <li><code>Ctrl+Shift+P</code> (Windows/Linux) o <code>Cmd+Shift+P</code> (Mac) - Generar prompt desde comando actual</li>
    </ul>
    
    <h2>⚙️ Configuración</h2>
    <ul>
        <li><strong>sinco.backend.enabled</strong>: Habilitar comandos Backend</li>
        <li><strong>sinco.backend.autoGenerate</strong>: Generar prompts automáticamente</li>
        <li><strong>sinco.backend.showInStatusBar</strong>: Mostrar en barra de estado</li>
        <li><strong>sinco.output.format</strong>: Formato de salida (markdown/plain)</li>
    </ul>
</body>
</html>`;
}

export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}