# pull base image
FROM python:3.7

# set work directory
WORKDIR /django_server

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# copy Pipfile
COPY Pipfile /django_server/
COPY Pipfile.lock /django_server/

# install dependencies
RUN apt-get update; apt-get install -y netcat
RUN pip install pipenv
RUN pipenv install --system --deploy
ENTRYPOINT ["/django_server/entrypoint.sh"]
