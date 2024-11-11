FROM php:8.0-apache

# Copy the app files into the container
COPY ./app /var/www/html

# Set permissions for the web root
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Install mysqli extension
RUN docker-php-ext-install mysqli
