# ==========================================
# STAGE 1 - Build Vite frontend
# ==========================================
FROM node:22 AS frontend

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ==========================================
# STAGE 2 - Laravel + Apache
# ==========================================
FROM php:8.3-apache


# ==========================================
# Install PHP extensions
# ==========================================
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libzip-dev \
    libicu-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        bcmath \
        intl \
        exif \
        pcntl \
        gd \
        zip \
    && rm -rf /var/lib/apt/lists/*


# ==========================================
# Apache
# ==========================================
RUN a2enmod rewrite


# ==========================================
# Composer
# ==========================================
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer


# ==========================================
# Laravel
# ==========================================
WORKDIR /var/www/html

COPY . .


# ==========================================
# Vite production build
# ==========================================
COPY --from=frontend /app/public/build /var/www/html/public/build


# ==========================================
# Composer dependencies
# ==========================================
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --prefer-dist


# ==========================================
# Laravel environment
# ==========================================
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public


# ==========================================
# Apache DocumentRoot
# ==========================================
RUN sed -ri \
    -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf


# ==========================================
# SQLite
# ==========================================
RUN mkdir -p database \
    && touch database/database.sqlite \
    && chown -R www-data:www-data database \
    && chmod 775 database \
    && chmod 664 database/database.sqlite


# ==========================================
# Laravel permissions
# ==========================================
RUN mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && chown -R www-data:www-data \
        storage \
        bootstrap/cache \
    && chmod -R 775 \
        storage \
        bootstrap/cache


# ==========================================
# Apache startup script
# ==========================================
RUN printf '#!/bin/bash\n\
set -e\n\
\n\
echo "Fixing Apache MPM configuration..."\n\
\n\
a2dismod mpm_event 2>/dev/null || true\n\
a2dismod mpm_worker 2>/dev/null || true\n\
a2dismod mpm_prefork 2>/dev/null || true\n\
\n\
rm -f /etc/apache2/mods-enabled/mpm_event.load\n\
rm -f /etc/apache2/mods-enabled/mpm_event.conf\n\
rm -f /etc/apache2/mods-enabled/mpm_worker.load\n\
rm -f /etc/apache2/mods-enabled/mpm_worker.conf\n\
rm -f /etc/apache2/mods-enabled/mpm_prefork.load\n\
rm -f /etc/apache2/mods-enabled/mpm_prefork.conf\n\
\n\
a2enmod mpm_prefork\n\
a2enmod rewrite\n\
\n\
echo "Checking Apache configuration..."\n\
apache2ctl -t\n\
\n\
PORT=${PORT:-8080}\n\
echo "Starting Apache on port ${PORT}"\n\
\n\
sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf\n\
sed -i "s/<VirtualHost \\*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf\n\
\n\
exec apache2-foreground\n\
' > /usr/local/bin/start-apache.sh \
    && chmod +x /usr/local/bin/start-apache.sh


# ==========================================
# Railway
# ==========================================
EXPOSE 80


# ==========================================
# Start
# ==========================================
CMD ["/usr/local/bin/start-apache.sh"]