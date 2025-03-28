var dialog = document.getElementById("dialog"); /*usado en mostrarModal*/
var disparador = document.getElementById("btnSolicitarPresupuesto");
var botonCerrar = document.getElementById("botonCerrar");

console.log("hola");
console.log(disparador);

const elementosFoco =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let primerElementoFoco;
let ultimoElementoFoco;

/* Gestión de la ventana modal accesible */
function mostrarModal() {
  /* muestra la ventana modal y realiza acciones asociadas */
  dialog.setAttribute("open", "");
  document.getElementById("cover").style.display = "block";

  const contenidoFoco = dialog.querySelectorAll(elementosFoco);
  primerElementoFoco = contenidoFoco[0];
  ultimoElementoFoco = contenidoFoco[contenidoFoco.length - 1];

  primerElementoFoco.focus();

  document.addEventListener("keydown", pulsadoTabulador);
  document.addEventListener("keydown", pulsadoEscape);
}

function cerrarDialog() {
  /* cierra ventana modal y desactiva pulsación escape */
  dialog.removeAttribute("open");
  document.getElementById("cover").style.display = "none";
  document.removeEventListener("keydown", pulsadoEscape);

  disparador.focus();
}

function pulsadoTabulador(e) {
  /* gestiona pulsaciones de tabulador para no salirse de la ventana */
  if (e.key === "Tab") {
    if (e.shiftKey) {
      // Navegar hacia atrás
      if (document.activeElement === primerElementoFoco) {
        e.preventDefault();
        ultimoElementoFoco.focus();
      }
    } else {
      // Navegar hacia adelante
      if (document.activeElement === ultimoElementoFoco) {
        e.preventDefault();
        primerElementoFoco.focus();
      }
    }
  }
}

/*closeDialog parece que no se llama en ningún sitio*/
function closeDialog() {
  dialog.removeAttribute("open");
  document.getElementById("cover").style.display = "none";
  document.removeEventListener("keydown", addESC);
}

var pulsadoEscape = function (e) {
  if (e.keyCode == 27) {
    cerrarDialog();
  }
};

disparador.addEventListener("click", mostrarModal);
botonCerrar.addEventListener("click", cerrarDialog);

/* hasta aquí todo lo que tiene que ver con la ventana modal */

/* Gestión de errores en el formulario para solicitar el presupuesto */

function enviarSolicitudFormulario(e) {
  const resumenErrores = document.getElementById("resumenErrores");
  resumenErrores.innerHTML = "";
  resumenErrores.style.display = "none";

  bandera = false; //se hace global automaticamente

  const campos = [
    /*  patrón para validar nombre y apellidos
        ^ → Inicio de la cadena.
        [A-ZÁÉÍÓÚÑ] → Primera letra debe ser mayúscula (incluye letras acentuadas y Ñ).
        [a-záéíóúñ]+ → Minúsculas permitidas con tildes y ñ.
        (?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)* → Permite uno o más nombres o apellidos adicionales con la misma estructura.
        $ → Fin de la cadena
    */
    {
      id: "nombre",
      validacion: (value) =>
        /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/.test(value),
      error:
        "El nombre y apellidos deben empezar por mayúscula seguidos por minúsculas. Se incluyen vocales acentuadas y la eñe.",
    },
    /* patrón para validar un e-mail
       ^ → Inicio de la cadena.
       [a-zA-Z0-9._%+-]+ → Usuario del correo (puede contener letras, números, puntos, guiones y signos permitidos).
      @ → Obliga a que haya un @.
      [a-zA-Z0-9.-]+ → Dominio (puede contener letras, números, puntos y guiones).
      \. → Punto obligatorio antes de la extensión.
      [a-zA-Z]{2,} → Extensión del dominio (mínimo 2 letras, como .com, .es, .org).
      $ → Fin de la cadena.
    
    */
    {
      id: "email",
      validacion: (value) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
      error:
        "El correo electrónico no es válido. El usuario del correo puede contener letras, números, puntos, guiones y signos permitidos _ % + -. Luego debe ir un  @, un dominio y finalmente una extensión del dominio de mínimo 2 letras",
    },
    /* patrón para validar un teléfono fijo o movil de España:
       ^(?:\+34|0034)? → Permite el prefijo internacional opcional +34 o 0034.
       \s? → Permite un espacio opcional después del prefijo.
       [6789] → Asegura que el número comience por 6 o 7 (móviles) o 8 o 9 (fijos).
       \d{2} → Dos dígitos después del prefijo del operador.
       [\s.-]? → Un espacio, punto o guion opcional como separador.
       \d{3} → Tres dígitos más.
       [\s.-]? → Otro separador opcional.
       \d{3} → Últimos tres dígitos.
       $ → Fin de la cadena.
    */
    {
      id: "telefono",
      validacion: (value) =>
        /^(?:\+34|0034)?\s?[6789]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}$/.test(value),
      error:
        "El número de teléfono introducido no es el de un teléfono móvil ni fijo de España.",
    },
    /* patrón para validar el tipo de trabajo solicitado:
       La opción "Selecciona una opción" tiene un valor igual a "". Por tanto
       si se ha seleccionado una opción que tiene como valor algo distinto de "" entonces se satisface el patrón.
    */
    {
      id: "tipo",
      validacion: (value) => value.length !== 0,
      error: "El tipo de trabajo seleccionado no es válido.",
    },
    /* Patrón para validar la información introducida en un textarea. Permitiriremos letras, números y signos de puntuación comunes .,;!?¿¡
       El patrón considerado acepta:
            (a) Letras mayúsculas y minúsculas (incluidas ñ y vocales acentuadas).
            (b) Números (0-9).
            (c) Algunos signos de puntuación (.,;!?¿¡).
            (d)Espacios y saltos de línea (\s).
    */
    {
      id: "descripciontrabajo",
      validacion: (value) => /^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9.,;!?¿¡\s]+$/.test(value),
      error:
        "En la descripción del trabajo solo se aceptan letras (acentuadas o no), números, espacios y saltos de línea, y signos de puntuación comunes . , ; ! ? ¿ ¡",
    },
  ];

  const errors = [];
  campos.forEach(({ id, validacion, error }) => {
    const campo = document.getElementById(id);
    const mensajeError = document.getElementById(`${id}-error`);

    if (!validacion(campo.value)) {
      campo.setAttribute("aria-invalid", "true");
      mensajeError.innerHTML = error;
      errors.push({ id, message: error });
    } else {
      campo.removeAttribute("aria-invalid");
      mensajeError.textContent = "";
      mensajeError.hidden = true;
    }
  });

  if (errors.length > 0) {
    let h2 = document.createElement("h2");
    h2.id = "encabezado_errores"; // creamos un h2 para indicar cuantos errores hay
    h2.classList.add("h2cantidadErrores"); // Añadir la clase 'h2cantidadErrores'

    console.log("errors.length");
    console.log(errors.length);
    h2.innerHTML = `Hay ${errors.length} errores en el formulario`;
    resumenErrores.appendChild(h2);

    errors.forEach(({ id, message }) => {
      const errorLink = document.createElement("a");
      errorLink.href = "#";
      errorLink.textContent = message;
      errorLink.addEventListener("click", function (event) {
        event.preventDefault();
        const campo = document.getElementById(id);
        campo.focus();
        const mensajeError = document.getElementById(`${id}-error`);
        mensajeError.hidden = false;
      });
      const errorItem = document.createElement("div");
      errorItem.appendChild(errorLink);
      resumenErrores.appendChild(errorItem);
    });

    /*Asegúrate de que esté 'block' primero. Se hace visible*/
    resumenErrores.style.display = "block";
    /*
    resumenErrores.style.height = "auto"; // Ajusta el tamaño del div
    resumenErrores.style.width = "100%"; // Asegúrate de que tenga un ancho visible 
    */

    /*Pongo el foco en el cuadro de resumen de errores */
    resumenErrores.setAttribute("tabindex", "-1"); // También se puede usar "0"
    setTimeout(() => {
      resumenErrores.focus(); // Aplica el foco después de que se haya hecho visible
    }, 100); // Espera un poco antes de aplicar el foco

    /*resumenErrores.focus();*/
  } else {
    // Pregunta al usuario si desea realizar la acción
    if (
      confirm(
        "¿Quieres subir además un archivo?. Pulsa aceptar en caso afirmativo y pulsa cancelar en caso negativo"
      )
    ) {
      e.preventDefault();
      // Acción si el usuario acepta
      //alert("Has aceptado la acción.");
      console.log("Has aceptado la acción.");
      bandera = true; //A PESAR DE NO EJECUTAR archivoss.click(); DENTRO DEL BLOQUE confirm NO SE SUELE ABRIR EL CUADRO DE DIALOGO DEL SELECTOR DE ARCHIVOS
      // Aquí puedes agregar la lógica de la acción a realizar
      /*el siguiente en el foco del area de texto es el input de subir el archivo*/
      //////////const archivoss = document.getElementById("archivo");
      //////////console.log(archivoss);
      //archivoss.focus();   //focus() no funciona en <input type="file"> por restricciones del navegador.

      //archivoss.click() Si lo llamas dentro de un evento asincrónico (por ejemplo, después de un setTimeout() o dentro de un confirm()), el navegador lo bloqueará por razones de seguridad.
      //////////archivoss.click(); // Esto abrirá la ventana para seleccionar un archivo si esta sentencia se ejecuta dentro de un evento de usuario, como click en un botón.
    } else {
      // Acción si el usuario cancela
      //alert("Has cancelado la acción.");
      console.log("Has cancelado la acción.");
      console.log("enviando la solicitud del presupuesto");
      alert(
        "Información del formulario para solicitar presupuesto enviada con éxito"
      );
      // Envía el formulario automáticamente
      document.getElementById("formPresupuesto").submit();
    }

    if (bandera) {
      const archivoss = document.getElementById("archivo");
      console.log(archivoss);
      archivoss.click();
    }
  }
} /* fin función enviarSolicitudFormulario */

document
  .getElementById("botonBotonEnviarSolicitud")
  .addEventListener("click", enviarSolicitudFormulario);

/* inicio función cancelarSolicitudFormulario */
function cancelarSolicitudFormulario(e) {
  e.preventDefault();
  alert("Cancelado el envío de solicitud de presupuesto.");
  console.log(
    "Pulsado botón Cancelar del Formulario de Solicitud de Presupuesto"
  );
}

document
  .getElementById("cancelar")
  .addEventListener("click", cancelarSolicitudFormulario);

/* A continuación se hace el tratamiento T para que cuando se pulse enter sobre el desplegable del formulario se pase el foco al siguiente
   elemento. Se recalculan los errores y si los hay se pasa el control al div del formulario con id igual a resumenErrores.
   Si no hay errores entonces se muestra un mensaje de alerta indicando que se ha enviado la información con éxito */

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("tipo").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Evita la acción por defecto
      moverFocoAlSiguiente(event.target);
    }
  });
});

function moverFocoAlSiguiente(elementoActual) {
  enviarSolicitudFormulario();
}
/* Fin del tratamiento  T */

/* A continuación se hace el tratamiento P de que ocurre cuando PIERDE EL FOCO el area de texto en el que se describe el trabajo a realizar */
document
  .getElementById("descripciontrabajo")
  .addEventListener("blur", function () {
    enviarSolicitudFormulario();
  });

/* hasta aquí todo lo que tiene que ver con la gestión de errores en el formulario para solicitar el presupuesto */
