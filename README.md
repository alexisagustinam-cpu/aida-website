# AIDA Digital Solutions — sitio público

Landing page estática de una sola página para iniciar conversaciones de contacto. Está construida con HTML, CSS y JavaScript sin dependencias ni paso de compilación.

## Desarrollo local

Desde la raíz del repositorio:

```sh
python3 -m http.server 4274
```

Abre `http://localhost:4274` en el navegador.

## Antes de publicar

1. **Canales y formulario** — completa el objeto `SITE` al inicio de `app.js`:
   - `formEndpoint`: URL que recibe el formulario por POST (JSON), p. ej. un webhook de n8n.
   - `whatsapp`, `email`, `instagram`, `linkedin`. Los vacíos no se muestran.
   - Sin `formEndpoint`, el formulario abre WhatsApp (o el correo) con el mensaje redactado. Sin ningún canal, avisa que no está conectado.
2. **Dominio** — reemplaza `https://example.com` en `index.html`, `privacidad.html`, `robots.txt`, `sitemap.xml` y `llms.txt`.
3. **Analítica** — activa Web Analytics en el proyecto de Vercel. El formulario envía el evento `generate_lead` (y `whatsapp_click`) a Vercel y a `dataLayer`.

## Imágenes

El sitio usa las versiones WebP optimizadas de `assets/img/`. Los originales (`assets/reference/`, `assets/team/`, `assets/aida-*.jpg`) se conservan como fuente, pero `.vercelignore` los excluye del despliegue.
