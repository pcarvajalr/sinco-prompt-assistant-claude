import * as assert from 'assert';
import { PromptGenerator } from '../generators/prompt-generator';
import { BackendCommand } from '../models/types';

suite('Prompt Generator Test Suite', () => {
  
  test('Generate prompt for Backend.crear', () => {
    const command: BackendCommand = {
      action: 'crear',
      resource: 'usuario',
      data: { nombre: 'Juan', email: 'juan@test.com' }
    };
    
    const result = PromptGenerator.generateBackendPrompt(command);
    
    assert.ok(result.prompt.includes('Backend.crear()'));
    assert.ok(result.prompt.includes('usuario'));
    assert.ok(result.prompt.includes('nombre'));
    assert.ok(result.prompt.includes('email'));
    assert.strictEqual(result.command, command);
  });
  
  test('Generate prompt for Backend.obtener with ID', () => {
    const command: BackendCommand = {
      action: 'obtener',
      resource: 'proyecto',
      query: 123
    };
    
    const result = PromptGenerator.generateBackendPrompt(command);
    
    assert.ok(result.prompt.includes('Backend.obtener()'));
    assert.ok(result.prompt.includes('proyecto'));
    assert.ok(result.prompt.includes('123'));
  });
  
  test('Generate prompt for Backend.actualizar', () => {
    const command: BackendCommand = {
      action: 'actualizar',
      resource: 'comprador',
      id: 456,
      updates: { telefono: '555-1234' }
    };
    
    const result = PromptGenerator.generateBackendPrompt(command);
    
    assert.ok(result.prompt.includes('Backend.actualizar()'));
    assert.ok(result.prompt.includes('comprador'));
    assert.ok(result.prompt.includes('456'));
    assert.ok(result.prompt.includes('telefono'));
  });
  
  test('Generate prompt for Backend.eliminar', () => {
    const command: BackendCommand = {
      action: 'eliminar',
      resource: 'unidad',
      id: 789
    };
    
    const result = PromptGenerator.generateBackendPrompt(command);
    
    assert.ok(result.prompt.includes('Backend.eliminar()'));
    assert.ok(result.prompt.includes('unidad'));
    assert.ok(result.prompt.includes('789'));
  });
  
  test('Generate prompt for Backend.ejecutar', () => {
    const command: BackendCommand = {
      action: 'ejecutar',
      resource: 'procesarVenta',
      payload: { monto: 50000, metodo: 'credito' }
    };
    
    const result = PromptGenerator.generateBackendPrompt(command);
    
    assert.ok(result.prompt.includes('Backend.ejecutar()'));
    assert.ok(result.prompt.includes('procesarVenta'));
    assert.ok(result.prompt.includes('monto'));
    assert.ok(result.prompt.includes('credito'));
  });
  
  test('Generate markdown format prompt', () => {
    const command: BackendCommand = {
      action: 'crear',
      resource: 'proyecto',
      data: { nombre: 'Génesis' }
    };
    
    const markdown = PromptGenerator.generateMarkdownPrompt(command);
    
    assert.ok(markdown.includes('## Prompt Generado'));
    assert.ok(markdown.includes('### Comando'));
    assert.ok(markdown.includes('```javascript'));
    assert.ok(markdown.includes('Backend.crear'));
  });
  
  test('Prompt history tracking', () => {
    PromptGenerator.clearHistory();
    
    const command1: BackendCommand = {
      action: 'crear',
      resource: 'test1'
    };
    
    const command2: BackendCommand = {
      action: 'obtener',
      resource: 'test2'
    };
    
    PromptGenerator.generateBackendPrompt(command1);
    PromptGenerator.generateBackendPrompt(command2);
    
    const history = PromptGenerator.getHistory();
    
    assert.strictEqual(history.length, 2);
    assert.strictEqual(history[0].command.resource, 'test1');
    assert.strictEqual(history[1].command.resource, 'test2');
  });
  
  test('Export prompt in different formats', () => {
    const command: BackendCommand = {
      action: 'crear',
      resource: 'usuario',
      data: { nombre: 'Test' }
    };
    
    const generated = PromptGenerator.generateBackendPrompt(command);
    
    const plain = PromptGenerator.exportPrompt(generated, 'plain');
    const markdown = PromptGenerator.exportPrompt(generated, 'markdown');
    const json = PromptGenerator.exportPrompt(generated, 'json');
    
    assert.strictEqual(plain, generated.prompt);
    assert.ok(markdown.includes('## Prompt Generado'));
    assert.ok(json.includes('"command"'));
    assert.ok(json.includes('"prompt"'));
  });
});