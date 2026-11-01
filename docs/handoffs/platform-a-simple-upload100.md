# Ajuste solicitado: subida normal100MB
Sustituye en el panel la carga multipart por una única petición normal de video, máximo100.000.000 bytes.32MiB era un límite propio;100MB corresponde al límite de petición Cloudflare Free/Pro. R2/S3 directo tiene otros límites. Cyberduck conserva selector incoming/ para archivos mayores. PDF permanece10MiB.
Servidor transmite mediante stream de longitud fija, comprueba cabecera y tamaño sin almacenar todo el video en memoria. Las rutas multipart previas permanecen por compatibilidad, pero el panel ya no las utiliza. Sin nuevas credenciales, migraciones ni costos activados.
Validación: pruebas, compilación y Pages Functions; se comprueba transferencia33MiB y rechazo de Content-Length mayor100MB. No se ha probado transferencia100MB real en producción.
