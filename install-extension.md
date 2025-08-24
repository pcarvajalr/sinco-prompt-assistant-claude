# 📦 Guía de Instalación - Sinco Prompt Assistant

## Método 1: Modo Desarrollo (Recomendado)
1. Abrir VS Code
2. Archivo → Abrir Carpeta → Seleccionar carpeta del proyecto
3. Presionar `F5` (Launch Extension)
4. Se abre nueva ventana con la extensión activa

## Método 2: Copiar a Extensiones
1. Compilar: `npm run compile`
2. Copiar carpeta completa a:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\`
   - **macOS**: `~/.vscode/extensions/`
   - **Linux**: `~/.vscode/extensions/`
3. Reiniciar VS Code

## Método 3: VSIX (Si funciona vsce)
```bash
1. Instalar Node.js 20+ desde nodejs.org
2. Reinstalar vsce: npm install -g @vscode/vsce@latest
3. Crear VSIX: vsce package
4. Instalar extensión desde VSIX, en las extenciones Click en los 3 puntos → Install from VSIX... Seleccionar el archivo: sinco-prompt-assistant-0.0.1.vsix
```

## ✅ Verificar Instalación
1. `Ctrl+Shift+P` → Buscar "Sinco"
2. Deberías ver:
   - "Sinco: Generar Prompt"
   - "Sinco: Generar Prompt Backend"
   - "Sinco: Mostrar Comandos Disponibles"
3. Panel lateral → Ícono de Sinco Prompt Assistant
4. Barra de estado → "Sinco Prompts"

## 🎯 Comandos Disponibles
- `Ctrl+Shift+P + Ctrl+Shift+G` → Generar prompt
- `Ctrl+Shift+P + Ctrl+Shift+B` → Generador Backend
- `Ctrl+Shift+P + Ctrl+Shift+S` → Abrir generador

## 🐛 Resolución de Problemas
- Si no aparece: Reiniciar VS Code
- Verificar que la carpeta `out/` existe con archivos .js
- Revisar consola de desarrollador: `Ayuda → Alternar Herramientas de Desarrollador`