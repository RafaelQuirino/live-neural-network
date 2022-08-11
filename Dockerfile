FROM ubuntu:20.04


ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y && apt-get upgrade -y && apt-get install -y apt-utils
RUN apt-get install -y \
    wget \
    curl \
    unzip \
    findutils \
    gcc g++-8 libc6 \
    libncurses5-dev libncursesw5-dev \
    && ln -s /lib64/ld-linux-x86-64.so.2 /lib/ld-linux-x86-64.so.2


# https://github.com/hadolint/hadolint/wiki/DL4006
SHELL ["/bin/bash", "-o", "pipefail", "-c"]


RUN apt install -y nodejs npm
COPY ./app /app
RUN cd /app && npm init -y \
    && npm install webpack webpack-cli --save-dev \
    && npm install --save lodash \
    && npm install --save-dev csv-loader xml-loader



# Keep container running
ENTRYPOINT ["tail", "-f", "/dev/null"]