# Decisiones de implementación

- Se utilizó la identidad verbal y la paleta proporcionadas. El logo suministrado se tomó únicamente como referencia para construir un wordmark CSS; no se incrustó su lienzo blanco en la cabecera.
- La composición orbital es una interpretación editorial inspirada en la forma de la marca, no una copia del logo.
- No se han inventado logos de clientes, testimonios, resultados, premios, casos, precios, personas, canales de contacto ni otras pruebas de marca. Tampoco se usaron imágenes de stock o generadas.
- El formulario se envía al `formEndpoint` configurado en `app.js`, o en su defecto abre WhatsApp o correo con el mensaje redactado. Nunca confirma un envío que no ocurrió.
- La sección de proyectos muestra solo trabajos reales (Rayces, Noble Barber Studio, Global Ferretería, Andes Floral Supply, La Nube del 10, Villas de San Pablo, Pepito). Los conceptos Raíces Santorini, Selfie Dental y Yakutours salieron de la web. En escritorio se ven en una rueda 3D (app.js) y en celular en un carrusel deslizable; sin JavaScript queda el carrusel. Solo se publican métricas de clientes reales y con su autorización.
- El contenido se marca como visible solo cuando JS corre (`.js .reveal`), para que la página nunca quede en blanco sin JavaScript.
- Se priorizó HTML semántico, foco visible, etiquetas de formulario, diálogo accesible y reducción de movimiento cuando la persona lo solicita en su sistema.
