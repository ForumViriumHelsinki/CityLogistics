FROM node:13
# set working directory
# this is the working folder in the container
# from which the app will be running from
WORKDIR /city_logistics_ui
# add the node_modules folder to $PATH
ENV PATH /city_logistics_ui/node_modules/.bin:$PATH
COPY  * /city_logistics_ui/
RUN yarn install --network-timeout=30000
