FROM php:8.3-apache

# ==========================================
# Install system dependencies & PHP extensions
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
# FIX APACHE MPM
# Hapus SEMUA MPM yang mungkin aktif
# lalu aktifkan hanya prefork
# ==========================================
RUN a2dismod mpm_event mpm_worker mpm_prefork || true \
    && rm -f \
        /etc/apache2/mods-enabled/mpm_event.load \
        /etc/apache2/mods-enabled/mpm_event.conf \
        /etc/apache2/mods-enabled/mpm_worker.load \
        /etc/apache2/mods-enabled/mpm_worker.conf \
        /etc/apache2/mods-enabled/mpm_prefork.load \
        /etc/apache2/mods-enabled/mpm_prefork.conf \
    && a2enmod mpm_prefork \
    && a2enmod rewrite \
    && apache2ctl -t

# ==========================================
# Install Composer
# ==========================================
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ==========================================
# Working directory
# ==========================================
WORKDIR /var/www/html

# ==========================================
# Copy Laravel application
# ==========================================
COPY . .

# ==========================================
# Install Laravel dependencies
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
# Configure Apache DocumentRoot
# ==========================================
RUN sed -ri \
    -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

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
# Railway PORT
# Apache harus listen pada PORT Railway
# ==========================================
RUN printf '#!/bin/bash\n\
set -e\n\
PORT=${PORT:-8080}\n\
echo "Starting Apache on port ${PORT}"\n\
sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf\n\
sed -i "s/<VirtualHost \\*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf\n\
exec apache2-foreground\n\
' > /usr/local/bin/start-apache.sh \
    && chmod +x /usr/local/bin/start-apache.sh

# ==========================================
# Expose
# ==========================================
EXPOSE 80

# ==========================================
# Start Apache
# ==========================================
CMD ["bash", "-c", "a2dismod mpm_event mpm_worker mpm_prefork || true; rm -f /etc/apache2/mods-enabled/mpm_*.load /etc/apache2/mods-enabled/mpm_*.conf; a2enmod mpm_prefork; apache2ctl -t; exec /usr/local/bin/start-apache.sh"]