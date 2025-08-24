________________________________________
1. Librería del Backend 💻
Propósito General
Esta librería consolida todas las operaciones del backend en comandos de acción sencillos. El desarrollador no necesita saber si interactúa con una base de datos o un servicio de autenticación. Simplemente le dice a la IA lo que quiere hacer (crear, obtener, actualizar), y la IA se encarga de determinar el recurso y ejecutar la operación.
________________________________________
Estructura de la Librería y Prompts Específicos
•	Backend.crear(resource, data)
o	Propósito: Crea un nuevo recurso (tabla, registro, usuario, etc.) en el backend.
o	Prompt para la IA: "El usuario ha solicitado crear un nuevo recurso. La instrucción es Backend.crear(). El recurso a crear se identifica como {resource}. Los datos proporcionados para la creación son: {data}. Analiza el tipo de recurso y los datos. Si es una tabla, crea la estructura de la tabla. Si es un registro, inserta los datos en la tabla correspondiente. Si es un usuario, crea el perfil de usuario. Devuelve un mensaje de éxito con el ID del recurso creado o un mensaje de error si la operación falla."
•	Backend.obtener(resource, idOrQuery?)
o	Propósito: Recupera uno o más recursos del backend, usando un ID o condiciones de búsqueda.
o	Prompt para la IA: "El usuario quiere obtener datos del backend. La instrucción es Backend.obtener(). El recurso solicitado es {resource}. El identificador o la consulta de búsqueda es {idOrQuery}. Localiza el recurso {resource}. Si se proporciona un ID, busca un solo elemento. Si se proporciona un objeto de consulta, aplica los filtros para obtener múltiples resultados. Devuelve los datos en formato JSON o un mensaje de error si el recurso no se encuentra."
•	Backend.actualizar(resource, id, updates)
o	Propósito: Modifica los datos de un recurso existente.
o	Prompt para la IA: "El usuario quiere actualizar un recurso. La instrucción es Backend.actualizar(). El recurso a modificar es {resource} con el ID {id}. Los nuevos datos para la actualización son {updates}. Busca el recurso {resource} con el ID {id}. Aplica las actualizaciones del objeto {updates} a los campos correspondientes. Confirma la operación y devuelve los datos actualizados del recurso."
•	Backend.eliminar(resource, id)
o	Propósito: Borra un recurso del backend de forma definitiva.
o	Prompt para la IA: "El usuario quiere eliminar un recurso. La instrucción es Backend.eliminar(). El recurso a eliminar es {resource} con el ID {id}. Localiza y elimina el recurso especificado. Confirma la eliminación y devuelve un mensaje de éxito. Si el recurso no existe, informa al usuario."
•	Backend.ejecutar(action, payload?)
o	Propósito: Desencadena una acción o función compleja en el backend que no encaja en los comandos básicos.
o	Prompt para la IA: "El usuario quiere ejecutar una acción personalizada. La instrucción es Backend.ejecutar(). La acción a realizar es {action} y los datos asociados son {payload}. Identifica y ejecuta la función o lógica de negocio llamada {action}. Utiliza el objeto {payload} como entrada para la función. Devuelve el resultado de la ejecución."
________________________________________
2. Librería del Front-end 🎨
Propósito General
Simplifica las tareas de desarrollo web como la manipulación de la interfaz de usuario, la gestión del estado de la aplicación y la comunicación con el backend, sin tener que escribir código complejo.
________________________________________
Estructura de la Librería y Prompts Específicos
•	FrontEnd.UI.component(name, props?)
o	Propósito: Genera el código para un componente visual, como un botón o una tarjeta.
o	Prompt para la IA: "El usuario quiere generar un componente de UI. La instrucción es FrontEnd.UI.component(). El nombre del componente es {name} y sus propiedades son {props}. Genera el código HTML/JavaScript o el código de un framework (por ejemplo, React) para crear este componente. El resultado debe ser un objeto o una cadena que pueda ser renderizada."
•	FrontEnd.UI.render(element, container)
o	Propósito: Coloca un elemento visual en un contenedor HTML específico.
o	Prompt para la IA: "El usuario quiere renderizar un componente en la UI. La instrucción es FrontEnd.UI.render(). El elemento a renderizar es {element} y el contenedor de destino es {container}. Genera el código HTML o las instrucciones de manipulación del DOM para crear el elemento {element} y colocarlo dentro del contenedor {container}."
•	FrontEnd.UI.show(element, effect?) / FrontEnd.UI.hide(element, effect?)
o	Propósito: Muestra u oculta un elemento de la interfaz de usuario, opcionalmente con un efecto visual.
o	Prompt para la IA: "El usuario quiere manipular la visibilidad de un elemento. La instrucción es FrontEnd.UI.show() o FrontEnd.UI.hide(). El elemento objetivo es {element} y el efecto opcional es {effect}. Genera el código JavaScript para mostrar/ocultar el elemento. Si se especifica un efecto, añade la lógica para esa animación (por ejemplo, fadeIn)."
•	FrontEnd.State.get(key) / FrontEnd.State.set(key, value)
o	Propósito: Obtiene o establece el valor de una variable en el estado de la aplicación.
o	Prompt para la IA: "El usuario quiere manipular el estado de la aplicación. La instrucción es FrontEnd.State.get() o FrontEnd.State.set(). La variable es {key} y, si se establece, el valor es {value}. Simula la actualización del estado de la aplicación. Confirma la operación y devuelve el nuevo estado de la variable {key} o el valor actual."
•	FrontEnd.State.watch(key, callback)
o	Propósito: Ejecuta una función cada vez que una variable de estado cambia.
o	Prompt para la IA: "El usuario quiere monitorear un cambio en el estado. La instrucción es FrontEnd.State.watch(). La variable a observar es {key} y la función a ejecutar es {callback}. Genera el código de escucha de eventos que, cuando la variable {key} cambie de valor, ejecute la función {callback}. Devuelve una confirmación de que el 'observador' ha sido activado."
•	FrontEnd.API.get(path, params?) / post(path, data) / update(path, data) / delete(path)
o	Propósito: Abstrae las llamadas al backend, permitiendo interactuar con el servidor sin preocuparse por la sintaxis de las peticiones HTTP.
o	Prompt para la IA: "El usuario quiere hacer una llamada a la API. El tipo de petición es {método} (GET, POST, etc.). La ruta es {path} y los datos son {data/params}. Construye una solicitud HTTP {método} a la ruta {path} con los datos proporcionados. Devuelve una simulación de la respuesta del servidor."
•	FrontEnd.Router.goTo(path)
o	Propósito: Navega a una ruta o URL específica de la aplicación.
o	Prompt para la IA: "El usuario quiere cambiar de ruta. La instrucción es FrontEnd.Router.goTo(). La ruta de destino es {path}. Simula la navegación a esa ruta. Genera un mensaje que confirme el cambio de URL en el navegador."
•	FrontEnd.Router.getPath() / FrontEnd.Router.getParams()
o	Propósito: Obtiene la ruta o los parámetros de la URL actual.
o	Prompt para la IA: "El usuario quiere obtener información de la URL. La instrucción es FrontEnd.Router.getPath() o FrontEnd.Router.getParams(). Devuelve la ruta actual o un objeto con los parámetros de la URL."
•	FrontEnd.Storage.save(key, data, type?) / FrontEnd.Storage.load(key, type?)
o	Propósito: Guarda y carga datos en el almacenamiento local o de sesión del navegador.
o	Prompt para la IA: "El usuario quiere guardar o cargar datos en el navegador. La instrucción es FrontEnd.Storage.save() o FrontEnd.Storage.load(). La clave es {key}, los datos son {data} y el tipo de almacenamiento es {type}. Realiza la operación y devuelve un mensaje de éxito o los datos cargados."
________________________________________
3. Librería del QA (Quality Assurance) 🧪
Propósito General
Permite que el equipo de control de calidad escriba y ejecute pruebas de forma programática, automatizando el proceso de testing sin tener que seguir pasos manuales.
________________________________________
Estructura de la Librería y Prompts Específicos
•	QA.Test.suite(name, tests) / QA.Test.case(description, assertion) / QA.Test.runAll()
o	Propósito: Organiza, define y ejecuta pruebas.
o	Prompt para la IA: "El usuario está gestionando pruebas. La instrucción es QA.Test.suite(), QA.Test.case() o QA.Test.runAll(). La información de la prueba es {info}. Almacena o ejecuta la prueba según la instrucción. Al ejecutar, analiza la assertion y devuelve un reporte detallado del resultado de cada caso de prueba, indicando si pasó o falló."
•	QA.User.login(user, password) / QA.User.logout() / QA.User.visitPage(path)
o	Propósito: Simula acciones de un usuario real.
o	Prompt para la IA: "El usuario quiere simular una acción de usuario. La instrucción es QA.User.login(), QA.User.logout() o QA.User.visitPage(). Los datos de la acción son {data}. Simula el flujo completo de la acción y verifica que la respuesta del sistema sea la esperada. Devuelve un reporte del resultado."
•	QA.Element.click(selector) / QA.Element.type(selector, text)
o	Propósito: Simula la interacción de un usuario con los elementos de la interfaz.
o	Prompt para la IA: "El usuario quiere interactuar con un elemento de la UI. La instrucción es QA.Element.click() o QA.Element.type(). El selector del elemento es {selector} y el texto (si aplica) es {text}. Simula el evento en el elemento. Confirma que la acción se ejecutó correctamente."
•	QA.Element.exists(selector) / QA.Element.hasText(selector, text)
o	Propósito: Verifica la existencia o el contenido de un elemento.
o	Prompt para la IA: "El usuario quiere verificar el estado de un elemento de la UI. La instrucción es QA.Element.exists() o QA.Element.hasText(). El selector es {selector} y el texto a verificar es {text}. Busca el elemento y realiza la validación. Devuelve true si la condición se cumple o false en caso contrario, con un mensaje explicativo."
•	QA.Data.generate(type, options?) / QA.Data.seed(tableName, data)
o	Propósito: Genera datos de prueba y los carga en el sistema.
o	Prompt para la IA: "El usuario quiere manipular datos de prueba. La instrucción es QA.Data.generate() o QA.Data.seed(). El tipo o tabla es {type/tableName} y los datos son {options/data}. Genera datos de prueba según las especificaciones. Si es seed, inserta esos datos en la tabla. Devuelve los datos generados o un mensaje de éxito."
•	QA.Report.generate() / QA.Report.export(format)
o	Propósito: Crea y exporta informes de los resultados de las pruebas.
o	Prompt para la IA: "El usuario quiere un informe de las pruebas. La instrucción es QA.Report.generate() o QA.Report.export(). El formato deseado es {format}. Recopila los resultados de las pruebas ejecutadas. Genera un informe en el formato solicitado (por ejemplo, JSON, CSV o un resumen en texto plano) y lo devuelve al usuario."

