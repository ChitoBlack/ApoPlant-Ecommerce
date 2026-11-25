# ApoPlant Ecommerce

Tienda Next.js con catálogo en Supabase, autenticación de clientes de Supabase, pagos con Mercado Pago y administración protegida de productos y pedidos.

## Configuración

Configura estas variables en `.env.local` (y en el proveedor de despliegue):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
NEXT_PUBLIC_URL=
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` y `RESEND_API_KEY` son secretos de servidor: no uses prefijos `NEXT_PUBLIC_` ni los compartas. Usa una contraseña de admin fuerte y un valor aleatorio independiente para `ADMIN_SESSION_SECRET`.

En el SQL Editor del proyecto de Supabase ejecuta:

1. `supabase/plantas-table.sql` (si la tabla `plantas` aún no existe).
2. `supabase/plant-care-fields.sql` (para agregar los campos de cuidado a una tabla `plantas` existente; las plantas actuales quedarán con esos datos sin especificar hasta editarlas).
3. `supabase/favoritos-table.sql`.
4. `supabase/orders-table.sql`.
5. `supabase/order-receipts.sql`.

El rol de servicio del servidor se usa para escrituras de administración y pedidos; nunca debe exponerse al navegador. El catálogo requiere lectura pública de plantas.

## Pagos y pedidos

Configura en Mercado Pago la URL de notificaciones:

```text
https://TU-DOMINIO/api/webhooks/mercadopago
```

Guarda el secreto de firma del webhook en `MP_WEBHOOK_SECRET`. El webhook consulta el pago directamente en Mercado Pago y solo entonces actualiza el estado de pago del pedido. En local, el webhook necesita una URL pública accesible.
La preferencia de pago solo incluye la notificación si `MP_WEBHOOK_SECRET` está configurado. Sin esa variable puedes probar la redirección al checkout, pero el pedido permanecerá pendiente y el inventario no se actualizará automáticamente.

El panel `/admin` permite crear y editar productos, incluidos sus datos de luz, riego, dificultad y compatibilidad con mascotas. Estos datos son opcionales para no publicar información no confirmada; las plantas existentes se pueden completar desde el formulario de edición. `/admin/pedidos` permite revisar pedidos, sus datos de envío y actualizar el estado de preparación/envío. Los pedidos solo se pueden preparar o enviar después de que Mercado Pago confirme el pago. El inventario se descuenta una sola vez al aprobarse el pago; si ya no hay stock, el pedido queda marcado para revisión manual.

Al recibir un pago aprobado, el webhook envía al correo del comprador un comprobante ApoPlant con los productos, cantidades, precios y total. Configura `RESEND_API_KEY` y `RESEND_FROM_EMAIL` con una dirección remitente verificada en Resend; el estado del envío se guarda en el pedido para evitar duplicados en reintentos del webhook.

## Recuperación de contraseña por código

En Supabase abre **Authentication → Email Templates → Reset Password** y configura la plantilla para mostrar el OTP en vez de un enlace. Por ejemplo:

```html
<h2>Restablecer contraseña de ApoPlant</h2>
<p>Tu código de verificación es:</p>
<p style="font-size: 28px; font-weight: bold; letter-spacing: 8px">{{ .Token }}</p>
<p>Si no solicitaste este cambio, ignora este correo.</p>
```

La página `/recuperar` solicita el correo, verifica el código con Supabase y permite definir la nueva contraseña. No necesita que el teléfono esté en la misma red que el computador: el código se escribe en la dirección pública de la tienda abierta en ese dispositivo. En producción, configura los dominios permitidos en **Authentication → URL Configuration** y usa el dominio HTTPS de la tienda. Si abres la página con `localhost` o una IP privada, el teléfono no podrá acceder a ella desde otra red.

## Desarrollo

```bash
npm install
npm run dev
```

Verifica los cambios con:

```bash
npm run lint
npm run build
```
