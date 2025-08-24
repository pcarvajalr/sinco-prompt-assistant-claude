# Sinco Prompt Assistant para VS Code

Una extensión de Visual Studio Code que genera prompts estructurados y consistentes para IA a partir de comandos predefinidos, optimizada para el proyecto Génesis.

## 🚀 Características

- **Generación automática de prompts**: Convierte comandos Backend simples en instrucciones detalladas para IA
- **Autocompletado inteligente**: IntelliSense para todos los comandos Backend
- **Detección de contexto**: Reconoce automáticamente proyectos Génesis y enriquece los prompts con información contextual
- **Panel lateral interactivo**: Vista de árbol con todos los comandos disponibles
- **Historial de prompts**: Mantiene un registro de todos los prompts generados
- **Múltiples formatos de salida**: Markdown, texto plano o JSON
- **Snippets integrados**: Atajos rápidos para insertar comandos comunes

## 📦 Instalación

### Desde el marketplace de VS Code
1. Abre VS Code
2. Ve a la pestaña de Extensiones (Ctrl+Shift+X)
3. Busca "Sinco Prompt Assistant"
4. Click en Instalar

### Instalación manual
1. Clona este repositorio
2. Ejecuta `npm install` en la carpeta del proyecto
3. Ejecuta `npm run compile`
4. Presiona F5 en VS Code para probar la extensión

## 🎯 Comandos Backend Disponibles

### Backend.crear(resource, data)
Crea un nuevo recurso en el backend.

```javascript
Backend.crear("usuario", { 
  nombre: "Juan", 
  email: "juan@test.com" 
});
```

### Backend.obtener(resource, idOrQuery?)
Recupera uno o más recursos del backend.

```javascript
Backend.obtener("usuario", 123);
Backend.obtener("proyectos", { estado: "activo" });
```

### Backend.actualizar(resource, id, updates)
Modifica los datos de un recurso existente.

```javascript
Backend.actualizar("usuario", 123, { 
  email: "nuevo@test.com" 
});
```

### Backend.eliminar(resource, id)
Borra un recurso del backend.

```javascript
Backend.eliminar("usuario", 123);
```

### Backend.ejecutar(action, payload?)
Ejecuta una acción personalizada en el backend.

```javascript
Backend.ejecutar("procesarPago", { 
  monto: 1000, 
  metodo: "tarjeta" 
});
```

## ⌨️ Atajos de Teclado

- `Ctrl+Shift+P` → `Ctrl+Shift+G`: Generar prompt desde el comando actual
- `Ctrl+Shift+P` → `Ctrl+Shift+B`: Abrir generador de prompts Backend

## 🛠️ Configuración

Personaliza la extensión en VS Code Settings:

```json
{
  // Habilitar comandos Backend
  "sinco.backend.enabled": true,
  
  // Generar prompts automáticamente al detectar comandos
  "sinco.backend.autoGenerate": false,
  
  // Mostrar estado en la barra de estado
  "sinco.backend.showInStatusBar": true,
  
  // Formato de salida (markdown, plain, json)
  "sinco.output.format": "markdown",
  
  // Ruta al proyecto Génesis (opcional)
  "sinco.genesis.projectPath": "",
  
  // Detectar automáticamente proyecto Génesis
  "sinco.genesis.autoDetect": true
}
```

## 📝 Snippets Disponibles

La extensión incluye snippets para acelerar la escritura de comandos:

- `bcrear` → Backend.crear()
- `bobtener` → Backend.obtener()
- `bobtenerf` → Backend.obtener() con filtro
- `bactualizar` → Backend.actualizar()
- `beliminar` → Backend.eliminar()
- `bejecutar` → Backend.ejecutar()
- `bcrud` → Ejemplo completo de operaciones CRUD

## 🏗️ Integración con Proyecto Génesis

Cuando la extensión detecta que estás trabajando en un proyecto Génesis, automáticamente:

1. **Escanea las entidades** en `Compartido.Entidades`
2. **Identifica los modelos** en `Compartido.Modelos`
3. **Reconoce los repositorios** en `Compartido.Repositorio`
4. **Enriquece los prompts** con información contextual relevante

Esto asegura que los prompts generados estén perfectamente alineados con la arquitectura del proyecto.

## 💡 Uso Típico

1. **Escribir un comando Backend en tu código:**
   ```javascript
   Backend.crear("comprador", { nombre: "Pedro", telefono: "555-1234" });
   ```

2. **Generar el prompt:**
   - Posiciona el cursor sobre el comando
   - Presiona `Ctrl+Shift+P` → `Ctrl+Shift+G`
   - O haz click derecho y selecciona "Generar Prompt"

3. **Resultado:**
   La extensión genera un prompt estructurado que incluye:
   - Instrucciones detalladas para la IA
   - Contexto del proyecto si es aplicable
   - Formato consistente y reutilizable

## 🔍 Panel Lateral

El panel lateral "Comandos Sinco" muestra:
- Lista jerárquica de todos los comandos disponibles
- Parámetros requeridos y opcionales
- Ejemplos de uso
- Click para insertar comandos directamente en el editor

## 📊 Historial

Accede al historial de prompts generados:
1. Click en el icono de historial en el panel lateral
2. O usa el comando "Sinco: Mostrar Historial de Prompts"
3. Selecciona un prompt anterior para reutilizarlo

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo MIT License.

## 🆘 Soporte

Si encuentras algún problema o tienes sugerencias:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo de Sinco

## 🎉 Roadmap

Próximas características planeadas:
- [ ] Comandos para Frontend
- [ ] Comandos para QA
- [ ] Integración con más frameworks
- [ ] Exportación a diferentes formatos de documentación
- [ ] Sincronización de prompts en equipo
- [ ] Análisis inteligente de código para sugerir comandos

---

Desarrollado con ❤️ por el equipo Sinco para optimizar el desarrollo del proyecto Génesis.