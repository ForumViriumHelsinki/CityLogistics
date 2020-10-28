# CityLogistics
Proof of concept app for last mile city logistics

## Installing a development environment

### Using Docker

Install Docker, then run `sh start_docker.sh` . It will take some time
to finish setting up 3 docker containers for the database,
backend and frontend.

Once it's done, you should be able to access the admin at 
127.0.0.1:8000/admin/ and frontend at 127.0.0.1:3000 .

To set up a superuser account to log into the admin with,
run `sh manage.sh createsuperuser` .

### Without Docker

**Prerequisites**: 
* Python 3.7 with pip
* Node.js 13 with ./node_modules/.bin in the PATH
* Postgres with a db available as configured in django_server/city_logistics/settings.py

In project root:

```
sudo pip install pipenv
cd django_server
pipenv install
pipenv shell
python manage.py migrate
python manage.py createsuperuser
<Configure user to your satisfaction>
python manage.py runserver
<Verify that you can login at 127.0.0.1:8000/admin/ >
<Create a courier user, e.g. "courier" which belongs to "courier" group>
```

In city_logistics_ui:

```
npm install yarn
yarn install
yarn start
<Verify that you can login to React UI at 127.0.0.1:3000 using your superuser or courier user credentials>
```
