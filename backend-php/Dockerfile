# Basis: PHP 8.2 + Apache
FROM php:8.2-apache

# Systempakete & PHP-Erweiterungen
RUN apt-get update && apt-get install -y \
    git unzip libicu-dev libzip-dev libonig-dev \
 && docker-php-ext-install pdo_mysql intl zip \
 && a2enmod rewrite headers

# DocumentRoot auf /var/www/html/public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf \
 && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf \
 && echo "<Directory /var/www/html/public>\n\tAllowOverride All\n</Directory>" >> /etc/apache2/apache2.conf

# Composer aus offiziellem Composer-Image kopieren
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# App-Dateien
COPY . /var/www/html

# Composer install (ohne Dev, optimiert)
RUN composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader \
 && php artisan config:clear || true \
 && php artisan route:clear || true \
 && php artisan view:clear || true

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD curl -fsS http://localhost/health || exit 1
