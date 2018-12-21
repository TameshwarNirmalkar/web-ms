#Base image for nginx
FROM srkay.azurecr.io/nginx:1.14.0

#Get nginx configurations
COPY nginx.conf /etc/nginx/nginx.conf
COPY ENV_NAME-nginx.conf /etc/nginx/conf.d/test-nginx.conf
COPY gzip.conf /etc/nginx/conf.d/gzip.conf

#SSL settings
COPY ssl/srk.best.key /etc/nginx/ssl/srk.best.key
COPY ssl/srk.best.chained.crt /etc/nginx/ssl/srk.best.chained.crt
COPY ssl-srk.best.conf /etc/nginx/snippets/ssl-srk.best.conf
COPY expires.conf /etc/nginx/snippets/expires.conf
COPY buffer.conf /etc/nginx/snippets/buffer.conf
COPY ssl-params.conf /etc/nginx/snippets/ssl-params.conf
RUN rm /etc/nginx/conf.d/default.conf

#COPY dist/login-app /usr/share/nginx/html
COPY dist/assets/ /usr/share/nginx/html/assets/
COPY dist/index.html /usr/share/nginx/html
#COPY dist/service-worker.js /usr/share/nginx/html
#COPY dist/login-index.html /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

COPY startup.sh /usr/share
RUN chmod +x /usr/share/startup.sh

EXPOSE 80 4200 443 4100

CMD /usr/share/startup.sh
