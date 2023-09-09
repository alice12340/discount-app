FROM php:8.1-fpm-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

RUN apk update && apk add --update nodejs npm \
    composer php-pdo_sqlite php-pdo_mysql php-pdo_pgsql php-simplexml php-fileinfo php-dom php-tokenizer php-xml php-xmlwriter php-session \
    openrc bash nginx

RUN docker-php-ext-install pdo pdo_mysql

COPY --chown=www-data:www-data web /app
WORKDIR /app

# Overwrite default nginx config
COPY web/nginx.conf /etc/nginx/nginx.conf

# Use the default production configuration
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

RUN composer install --no-scripts 
RUN composer clearcache
# RUN touch /app/storage/db.sqlite
# RUN chown www-data:www-data /app/storage/db.sqlite

# RUN cd frontend && npm install && npm cache clean && npm run build --force 
# RUN cd frontend && npm install -g npm@lastest && npm rm -rf node_modules && rm package-lock.json && npm install --save --legacy-peer-deps && npm run build --force 
RUN cd frontend && npm install && npm run build
RUN composer build
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]