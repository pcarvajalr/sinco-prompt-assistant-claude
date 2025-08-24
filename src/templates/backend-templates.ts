import { CommandTemplate } from '../models/types';

export const backendTemplates: { [key: string]: CommandTemplate } = {
  crear: {
    name: 'Backend.crear',
    description: 'Crea un nuevo recurso en el backend',
    promptTemplate: `El usuario ha solicitado crear un nuevo recurso. La instrucción es Backend.crear(). 
El recurso a crear se identifica como {resource}. 
Los datos proporcionados para la creación son: {data}. 
Analiza el tipo de recurso y los datos. Si es una tabla, crea la estructura de la tabla. 
Si es un registro, inserta los datos en la tabla correspondiente. 
Si es un usuario, crea el perfil de usuario. 
Devuelve un mensaje de éxito con el ID del recurso creado o un mensaje de error si la operación falla.`,
    requiredParams: ['resource', 'data'],
    examples: [
      {
        input: 'Backend.crear("usuario", { nombre: "Juan", email: "juan@test.com" })',
        output: 'Crear un nuevo usuario con nombre Juan y email juan@test.com',
        description: 'Creación de usuario'
      },
      {
        input: 'Backend.crear("proyecto", { nombre: "Génesis", tipo: "inmobiliario" })',
        output: 'Crear un nuevo proyecto llamado Génesis de tipo inmobiliario',
        description: 'Creación de proyecto'
      }
    ]
  },
  
  obtener: {
    name: 'Backend.obtener',
    description: 'Recupera uno o más recursos del backend',
    promptTemplate: `El usuario quiere obtener datos del backend. La instrucción es Backend.obtener(). 
El recurso solicitado es {resource}. 
El identificador o la consulta de búsqueda es {idOrQuery}. 
Localiza el recurso {resource}. Si se proporciona un ID, busca un solo elemento. 
Si se proporciona un objeto de consulta, aplica los filtros para obtener múltiples resultados. 
Devuelve los datos en formato JSON o un mensaje de error si el recurso no se encuentra.`,
    requiredParams: ['resource'],
    optionalParams: ['idOrQuery'],
    examples: [
      {
        input: 'Backend.obtener("usuario", 123)',
        output: 'Obtener el usuario con ID 123',
        description: 'Obtención por ID'
      },
      {
        input: 'Backend.obtener("proyectos", { estado: "activo" })',
        output: 'Obtener todos los proyectos con estado activo',
        description: 'Obtención con filtros'
      }
    ]
  },
  
  actualizar: {
    name: 'Backend.actualizar',
    description: 'Modifica los datos de un recurso existente',
    promptTemplate: `El usuario quiere actualizar un recurso. La instrucción es Backend.actualizar(). 
El recurso a modificar es {resource} con el ID {id}. 
Los nuevos datos para la actualización son {updates}. 
Busca el recurso {resource} con el ID {id}. 
Aplica las actualizaciones del objeto {updates} a los campos correspondientes. 
Confirma la operación y devuelve los datos actualizados del recurso.`,
    requiredParams: ['resource', 'id', 'updates'],
    examples: [
      {
        input: 'Backend.actualizar("usuario", 123, { email: "nuevo@test.com" })',
        output: 'Actualizar el email del usuario 123 a nuevo@test.com',
        description: 'Actualización de campo'
      }
    ]
  },
  
  eliminar: {
    name: 'Backend.eliminar',
    description: 'Borra un recurso del backend de forma definitiva',
    promptTemplate: `El usuario quiere eliminar un recurso. La instrucción es Backend.eliminar(). 
El recurso a eliminar es {resource} con el ID {id}. 
Localiza y elimina el recurso especificado. 
Confirma la eliminación y devuelve un mensaje de éxito. 
Si el recurso no existe, informa al usuario.`,
    requiredParams: ['resource', 'id'],
    examples: [
      {
        input: 'Backend.eliminar("usuario", 123)',
        output: 'Eliminar el usuario con ID 123',
        description: 'Eliminación por ID'
      }
    ]
  },
  
  ejecutar: {
    name: 'Backend.ejecutar',
    description: 'Desencadena una acción o función compleja en el backend',
    promptTemplate: `El usuario quiere ejecutar una acción personalizada. La instrucción es Backend.ejecutar(). 
La acción a realizar es {action} y los datos asociados son {payload}. 
Identifica y ejecuta la función o lógica de negocio llamada {action}. 
Utiliza el objeto {payload} como entrada para la función. 
Devuelve el resultado de la ejecución.`,
    requiredParams: ['action'],
    optionalParams: ['payload'],
    examples: [
      {
        input: 'Backend.ejecutar("procesarPago", { monto: 1000, metodo: "tarjeta" })',
        output: 'Ejecutar la acción procesarPago con monto 1000 usando tarjeta',
        description: 'Ejecución de acción personalizada'
      }
    ]
  },

  crearTabla: {
    name: 'Backend.crearTabla',
    description: 'Crea una nueva tabla completa con todos los archivos necesarios para el proyecto Génesis',
    promptTemplate: `Necesito crear una nueva tabla completa para el proyecto Génesis. Los detalles son:

**MÓDULO:** {modulo}
**NOMBRE DE LA TABLA:** {nombreTabla}
**CAMPOS DEFINIDOS:**
{camposTabla}

Por favor, genera TODOS los archivos necesarios siguiendo los patrones del proyecto Génesis:

## 1. ENTIDAD ({nombreTabla}.cs)
- Crear la clase entidad en {modulo}.Entidades
- Incluir todas las propiedades especificadas
- Agregar atributos Entity Framework apropiados
- Seguir convenciones de naming del proyecto
- Incluir propiedades de navegación si es necesario

## 2. CONFIGURACIÓN DE ENTIDAD ({nombreTabla}Configuracion.cs)
- Crear clase que implemente IEntityTypeConfiguration<{nombreTabla}>
- Ubicar en {modulo}.Repositorio.Configuracion
- Configurar mapeo de tabla y columnas
- Establecer claves primarias y foráneas
- Configurar restricciones y tipos de datos específicos

## 3. INTERFAZ DE REPOSITORIO (I{nombreTabla}Repositorio.cs)
- Crear interface en Repositorios.Interfaces.{modulo}
- Extender IBaseRepositorio<{nombreTabla}>
- Agregar métodos específicos del dominio
- Incluir métodos para consultas complejas

## 4. IMPLEMENTACIÓN DE REPOSITORIO ({nombreTabla}Repositorio.cs)
- Crear clase en {modulo}.Repositorio
- Implementar I{nombreTabla}Repositorio
- Incluir constructor con DbContext
- Implementar métodos específicos

## 5. CONTROLADOR ({nombreTabla}Controller.cs)
- Crear controlador en API.Controllers.{modulo}
- Implementar endpoints REST completos (GET, POST, PUT, DELETE)
- Incluir inyección de dependencias
- Agregar validaciones y manejo de errores
- Seguir patrones de respuesta del proyecto

## 6. INTERFAZ DE APLICACIÓN (I{nombreTabla}Comando.cs / I{nombreTabla}Buscador.cs)
- Crear interfaces en Aplicaciones.Interfaces.{modulo}
- Separar comandos (escritura) de consultas (lectura)
- Definir métodos de la lógica de aplicación

## 7. MIGRACIÓN DE BASE DE DATOS
- Generar código de migración Entity Framework
- Incluir método Up() con CreateTable
- Incluir método Down() con DropTable
- Configurar índices y constraints necesarios

## 8. REGISTRO EN DbContext
- Código para agregar DbSet<{nombreTabla}> en el contexto apropiado
- Código para registrar la configuración en OnModelCreating()

## CONSIDERACIONES ESPECÍFICAS DEL PROYECTO GÉNESIS:
- Usar los namespaces correctos según el módulo ({modulo}.Entidades, {modulo}.Repositorio, etc.)
- Seguir el patrón Entity-Repository-Controller existente
- Mantener consistencia con las configuraciones existentes
- Incluir manejo de sesión con ISesion cuando sea apropiado
- Usar los tipos de datos y convenciones de SQL Server del proyecto
- Considerar relaciones con entidades existentes si es relevante

Genera TODO el código necesario para que la nueva tabla {nombreTabla} esté completamente funcional en el módulo {modulo} del proyecto Génesis.`,
    requiredParams: ['modulo', 'nombreTabla', 'camposTabla'],
    examples: [
      {
        input: 'Backend.crearTabla("Compartido", "Cliente", "Id:int, Nombre:string(100), Email:string(50), FechaCreacion:datetime")',
        output: 'Crear tabla Cliente completa en módulo Compartido con campos Id, Nombre, Email y FechaCreacion',
        description: 'Creación completa de tabla con entidad, repositorio, controlador y migración'
      }
    ]
  }
};

export function getBackendTemplate(action: string): CommandTemplate | undefined {
  return backendTemplates[action];
}

export function getAllBackendTemplates(): CommandTemplate[] {
  return Object.values(backendTemplates);
}