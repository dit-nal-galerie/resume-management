# Basis: PHP 8.2 + Apache
FROM php:8.2-apache

# Pakete & Extensions
RUN apt-get update && apt-get install -y \
    git unzip libicu-dev libzip-dev libonig-dev \
 && docker-php-ext-install pdo_mysql intl zip \
 && a2enmod rewrite headers

# Render gibt automatisch $PORT vor -> NICHT fix auf 10000 setzen!
# Passe Apache an, damit er auf $PORT hört
RUN sed -ri -e 's/Listen 80/Listen ${PORT}/' /etc/apache2/ports.conf \
 && sed -ri -e 's!<VirtualHost \*:80>!<VirtualHost \*:${PORT}>!' /etc/apache2/sites-available/000-default.conf

# DocumentRoot auf /var/www/html/public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf \
 && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf \
 && printf "\n<Directory /var/www/html/public>\n\tAllowOverride All\n</Directory>\n" >> /etc/apache2/apache2.conf

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . /var/www/html

# Production-Install (ohne dev)
RUN composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader

# Hinweise zum Deploy auf Render:
# - KEIN "EXPOSE ${PORT}": PORT ist zur Build-Zeit nicht definiert, und Render
#   leitet Traffic selbst auf die zur Laufzeit gesetzte PORT-Variable um.
#   (Apache hoert dank sed-Logschrift auf ${PORT} - siehe oben - das reicht.)
# - KEIN Docker HEALTHCHECK: Render ignoriert ihn und nutzt eigene HTTP-Proben
#   (render.yaml: healthCheckPath: /health). curl waere zudem nicht installiert.
