import * as assert from 'assert';
import { CommandParser } from '../parsers/command-parser';

suite('Command Parser Test Suite', () => {
  
  test('Parse Backend.crear command', () => {
    const text = 'Backend.crear("usuario", { nombre: "Juan", email: "juan@test.com" })';
    const command = CommandParser.parseBackendCommand(text);
    
    assert.strictEqual(command?.action, 'crear');
    assert.strictEqual(command?.resource, 'usuario');
    assert.deepStrictEqual(command?.data, '{ nombre: "Juan", email: "juan@test.com" }');
  });
  
  test('Parse Backend.obtener command with ID', () => {
    const text = 'Backend.obtener("proyecto", 123)';
    const command = CommandParser.parseBackendCommand(text);
    
    assert.strictEqual(command?.action, 'obtener');
    assert.strictEqual(command?.resource, 'proyecto');
    assert.strictEqual(command?.query, 123);
  });
  
  test('Parse Backend.obtener command without parameters', () => {
    const text = 'Backend.obtener("usuarios")';
    const command = CommandParser.parseBackendCommand(text);
    
    assert.strictEqual(command?.action, 'obtener');
    assert.strictEqual(command?.resource, 'usuarios');
    assert.strictEqual(command?.query, undefined);
  });
  
  test('Parse Backend.actualizar command', () => {
    const text = 'Backend.actualizar("usuario", 456, { email: "nuevo@test.com" })';
    const command = CommandParser.parseBackendCommand(text);
    
    assert.strictEqual(command?.action, 'actualizar');
    assert.strictEqual(command?.resource, 'usuario');
    assert.strictEqual(command?.id, 456);
    assert.deepStrictEqual(command?.updates, '{ email: "nuevo@test.com" }');
  });
  
  test('Parse Backend.eliminar command', () => {
    const text = 'Backend.eliminar("proyecto", 789)';
    const command = CommandParser.parseBackendCommand(text);
    
    assert.strictEqual(command?.action, 'eliminar');
    assert.strictEqual(command?.resource, 'proyecto');
    assert.strictEqual(command?.id, 789);
  });
  
  test('Parse Backend.ejecutar command', () => {
    const text = 'Backend.ejecutar("procesarPago", { monto: 1000 })';
    const command = CommandParser.parseBackendCommand(text);
    
    assert.strictEqual(command?.action, 'ejecutar');
    assert.strictEqual(command?.resource, 'procesarPago');
    assert.deepStrictEqual(command?.payload, '{ monto: 1000 }');
  });
  
  test('Return null for invalid command', () => {
    const text = 'NotBackend.someMethod()';
    const command = CommandParser.parseBackendCommand(text);
    
    assert.strictEqual(command, null);
  });
  
  test('Parse command with single quotes', () => {
    const text = "Backend.crear('comprador', { nombre: 'Pedro' })";
    const command = CommandParser.parseBackendCommand(text);
    
    assert.strictEqual(command?.action, 'crear');
    assert.strictEqual(command?.resource, 'comprador');
  });
  
  test('Parse command with template literals', () => {
    const text = 'Backend.obtener(`unidad`, 999)';
    const command = CommandParser.parseBackendCommand(text);
    
    assert.strictEqual(command?.action, 'obtener');
    assert.strictEqual(command?.resource, 'unidad');
    assert.strictEqual(command?.query, 999);
  });
});