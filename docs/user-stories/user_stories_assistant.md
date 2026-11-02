# Historias de Usuario — BC Assistant

Esta sección presenta la Épica y las Historias de Usuario identificadas para el bounded context de **Assistant (Asistente IA)** de la plataforma Clair IoT. Cada historia está redactada desde la perspectiva de un rol real de la plataforma e incluye criterios de aceptación que describen el flujo de negocio y el comportamiento del sistema.

---

## Epics

| Epic / Story ID | Título | Descripción | Criterios de Aceptación | Relacionado con (Epic ID) |
|---|---|---|---|---|
| WA-EP-06 | Asistente IA de Calidad del Aire | Como Usuario, quiero conversar con un asistente que conoce mis dispositivos, lecturas, umbrales y alertas, para entender el estado del aire de mis espacios y saber qué acciones tomar sin interpretar los datos yo mismo. | La Épica se completa cuando todas las historias de usuario relacionadas han sido implementadas, validadas y aceptadas. | - |

---

## User Stories

| Epic / Story ID | Título | Descripción | Criterios de Aceptación | Relacionado con (Epic ID) |
|---|---|---|---|---|
| WA-US-67 | Preguntar al Asistente IA | Como Usuario, quiero escribirle una pregunta al asistente sobre la calidad del aire, para recibir una explicación basada en los datos de mis propios espacios. | Dado que el Usuario escribe una pregunta de 1 a 1000 caracteres, cuando la envía, entonces el sistema muestra la pregunta, un indicador de que el asistente está escribiendo y, al llegar, la respuesta del asistente en el idioma activo de la plataforma. Dado que el Usuario intenta enviar una pregunta vacía, cuando confirma el envío, entonces el sistema no la envía. | WA-EP-06 |
| WA-US-68 | Usar Preguntas Sugeridas | Como Usuario, quiero ver preguntas sugeridas cuando la conversación está vacía, para empezar a usar el asistente sin pensar cómo formular la primera pregunta. | Dado que el Usuario abre una conversación nueva, cuando no hay mensajes, entonces el sistema muestra preguntas sugeridas sobre el estado del aire, el CO2, las alertas activas y la ventilación. Dado que el Usuario elige una sugerencia, cuando la selecciona, entonces el sistema la envía como pregunta. | WA-EP-06 |
| WA-US-69 | Ver Mensajes Disponibles del Día | Como Usuario, quiero ver cuántos mensajes del asistente usé hoy y cuál es mi límite, para administrar mi cupo diario. | Dado que el Usuario ingresa al asistente, cuando el sistema consulta su uso, entonces muestra los mensajes usados y el límite del día según su plan (10 en Free, 100 en Premium). Dado que el Usuario envía una pregunta con éxito, cuando llega la respuesta, entonces el contador se actualiza. | WA-EP-06 |
| WA-US-70 | Alcanzar el Límite Diario del Asistente | Como Usuario Free, quiero saber cuándo agoté mis mensajes del día y cómo obtener más, para decidir si mejoro mi plan. | Dado que el Usuario agotó su cupo diario, cuando intenta enviar otra pregunta, entonces el sistema muestra un aviso con el límite alcanzado, indica que el cupo se renueva a medianoche, deshabilita el envío y, si su plan es Free, ofrece un acceso para mejorar al plan Premium. | WA-EP-06 |
| WA-US-71 | Retomar Conversaciones Anteriores | Como Usuario, quiero ver mis conversaciones anteriores con el asistente y abrir cualquiera de ellas, para continuar una consulta sin repetir el contexto. | Dado que el Usuario tiene conversaciones previas, cuando ingresa al asistente, entonces el sistema las lista de la más reciente a la más antigua con el inicio de la primera pregunta. Dado que el Usuario selecciona una conversación, cuando se carga, entonces el sistema muestra sus mensajes en orden y las nuevas preguntas continúan esa conversación. Dado que el Usuario elige iniciar una conversación nueva, cuando lo confirma, entonces el sistema limpia el chat. | WA-EP-06 |
| WA-US-72 | Calificar Respuestas del Asistente | Como Usuario, quiero indicar si una respuesta del asistente me fue útil, para ayudar a mejorar la calidad del asistente. | Dado que el Usuario ve una respuesta del asistente, cuando la califica como útil o no útil, entonces el sistema registra la calificación y la mantiene visible al volver a abrir la conversación. Dado que el registro de la calificación falla, cuando el sistema recibe el error, entonces restablece el estado anterior de la respuesta. Dado que el asistente no está disponible, cuando el Usuario envía una pregunta, entonces el sistema muestra un aviso y conserva el texto escrito para reintentar. | WA-EP-06 |
