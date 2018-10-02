'use strict';

const Homey = require('homey');
const HomeyLite = require('../../lib/homey-lite/lib');

function guid() {
 		function s4() {
 			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
 		}
 		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
 	}

class DeviceGroupDriver extends Homey.Driver {

  onPair( socket ) {

      let library = new HomeyLite();
      let pairingDevice = {};
          pairingDevice.name = 'Grouped device';
          pairingDevice.settings = {};
          pairingDevice.settings.capabilities = {};
          pairingDevice.data = {};
          pairingDevice.class = false;

          socket.on('startedClasses', function( data, callback ) {
              callback( null, library.getCategories() );
          });

          socket.on('addClass', function( data, callback ) {
              pairingDevice.class = data.class;
              pairingDevice.icon = '/app/com.swttt.devicegroups/drivers/devicegroup/assets/icons/'+data.class+'.svg';
              callback( null, pairingDevice );
          });

          socket.on('getCapabilities', function( data, callback ) {
              callback( null, library.getCategories() );
          });

          socket.on('startedCapabilities', function( data, callback ) {

              let categoryCapabilities = library.getCategoryCapabilities(pairingDevice.class);
              console.log(categoryCapabilities);
              let result = {};
              for (let i in categoryCapabilities) {

                  result[categoryCapabilities[i]] = library.getCapability(categoryCapabilities[i]);
              }
                console.log(result);
              callback(null, result)

              // callback( null, pairingDevice );
          });

          socket.on('capabilitiesChanged', function( data, callback ) {

              pairingDevice.settings.capabilities = {};
              pairingDevice.capabilities = data.capabilities;

              // Set the capability method to the default
              // @todo allow this to be changed on the next screen
              for (let i in data.capabilities) {
                  pairingDevice.settings.capabilities[data.capabilities[i]] = {}
                  pairingDevice.settings.capabilities[data.capabilities[i]].method = library.getCapability(data.capabilities[i]).method
              }

              callback( null, pairingDevice );
          });

          socket.on('startedDevices', function( data, callback ) {
              var result = {};
                  result.pairingDevice = pairingDevice;
                  Homey.app.getDevices().then(res => {
                      result.devices = res;
                      callback(null, result);
                    })
                    .catch(error => callback(error, null));
          });

          socket.on('devicesChanged', function( data, callback ) {
              pairingDevice.settings.groupedDevices = data.devices;
              callback( null, pairingDevice );
          });

          // Adds the Unique ID, returns to the view for it to be added.
          socket.on('almostDone', function( data, callback ) {
              pairingDevice.data.id = guid();
              callback( null, pairingDevice );
          });

      }
}

module.exports = DeviceGroupDriver;
