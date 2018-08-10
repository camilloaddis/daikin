# Daikin Air Conditioner Remote with RaspberryPi
A personal home automation project, to make my Daikin M Series air conditioner smart!

## Overview
Check out what this is about [on Medium](https://medium.com/@camilloaddis/smart-air-conditioner-with-raspberry-pi-an-odissey-2a5b438fe984)

## Prerequisites
* A RasPi with an IR led transmitter, a DHT sensor (optional), and LIRC configured – as described on Medium
* Node and npm 
* vue-cli for building the controller UI

## Installation
* `git clone git@github.com:camilloaddis/daikin.git`
* install the BCM2835 library as described [here](http://www.airspayce.com/mikem/bcm2835/).
* `cd daikin`
* `npm install`
* `cd controller`
* create a `.env.development.local` file and add this line to it: `VUE_APP_API_URL=http://192.168.100.100:3000` (change the address with the local address of your RasPi, which should have a dedicated IP).
* as before create a `.env.production.local` file with the same line but with the remote server address (or the same address if you're using it only locally)

## Run
To run the app you should start the node server by running `node app.js` in the main folder, and run `npm run serve` in the controller folder; to build for production simply run `npm run build`.
