FROM wordpress

COPY ./public/ /var/www/html
RUN usermod -u 1000 www-data