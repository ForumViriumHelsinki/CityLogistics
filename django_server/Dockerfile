# Pull base image
FROM python:3.7

# Set work directory
WORKDIR /usr/src/app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copy Pipfile
COPY Pipfile* ./

# Install dependencies
RUN pip install pipenv

# Install dependencies (Deploy Mode)
RUN pipenv --python 3.7 install --system --deploy --ignore-pipfile

# Install dependencies (Debug Mode)
#RUN pipenv --python 3.7 install --system

# Install netcat (used in entrypoint)
RUN wget http://sourceforge.net/projects/netcat/files/netcat/0.7.1/netcat-0.7.1.tar.gz -q &&\
    echo "088def25efe04dcdd1f8369d8926ab34 netcat-0.7.1.tar.gz" | md5sum -c - &&\
    tar -xzf netcat-0.7.1.tar.gz &&\
    cd netcat-0.7.1 &&\
    ./configure &&\
    make -s 2>/dev/null &&\
    make install -s 

# Delete netcat installer
RUN rm netcat-0.7.1.tar.gz

# Copy project
COPY . .

# Run entrypoint.sh
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
