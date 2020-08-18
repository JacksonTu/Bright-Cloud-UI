FROM nginx:1.14.2
MAINTAINER TuMingLong tuminglong@126.com

COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/ /etc/nginx/html
