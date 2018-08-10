// Bits are numbered starting from the third trunk
// 0-39: 0x11, 0xDA, 0x27, 0x00, 0x00

// ======== byte 1
// 40: 0 = AC OFF    |    1 = AC ON
// 41: 0 = On Timer OFF    |    1 = On Timer ON
// 42: 0 = Off Timer OFF    |    1 = Off Timer ON
// 43: 1
// 44-47: 0000 = auto    |    0010 = dry    |    0011 = cool    |    0100 = heat    |    0110 = fan

// ======== byte 2
// 48-55: Temp in °C multiplied by 2 (25°C = 0x50). Auto 0x24-0x3C. Cool 0x24-0x40. Heat 0x14-0x3C. Dry & Fan = 0xC0.

// ======== byte 3
// 56-63: 0x00

// ======== byte 4
// 64-67: 0x0 = Vertical Swing OFF    |    0xF = Vertical Swing ON
// 68-71: Velocità della ventola: 0x3: Fan1 – 0x4: Fan2 – 0x5:Fan3 – 0x6:Fan4 – 0x7:Fan5 – 0xA:Auto – 0xB:NightMode. Dry & Fan = 0xA

// ======== byte 5
// 72-75: 0x0 = Horizontal Swing OFF    |    0xF = Horizontal Swing ON (Turns off Comfort/sensor)
// 76-79: 0x0

// ======== byte 6-8
// 80-91: On Timer minutes 
// 92-103: Off Timer minutes
// def: 0x00 0x06 0x60

// ======== byte 9
// 104: 0 = Powerful Mode OFF    |    1 = Powerful Mode ON
// 105-108: 0x0
// 109: 0 = Quiet Mode OFF    |    1 = Quiet Mode ON
// 110: 0x0
// 111: 0x0

// ======== byte 10
// 112-119: 0x00

// ======== byte 11
// 120-127: 0xC1

// ======== byte 12
// 128: 0x0
// 129: 0 = Sensor Mode OFF    |    1 = Sensor Mode ON
// 130: 0 = Econo Mode OFF    |    1 = Econo Mode ON
// 131: 0x0
// 132: 0 = Clean Mode OFF    |    1 = Clean Mode ON
// 133-134: 0x0
// 135: 0x1

// ======== byte 13
// 136-143: 0x0

// ======== byte 15
// 144-151: "Modular sum" Checksum (sum all bytes in binary mode, remove first two digits)



// ==== DECLARE CONSTANTS ==== //

const pulse = 430;
const space_0 = 430;
const space_1 = 1320;

const DAIKIN_0 = pulse +' '+space_0;
const DAIKIN_1 = pulse +' '+space_1;
const DAIKIN_A = pulse +' 25000';
const DAIKIN_B = '3440 1720';
const DAIKIN_C = pulse +' 35500';

const header = '00000';
const intro = '11';


var exports = module.exports = {};


// ==== UTILITIES ==== //

exports.bin2hex = function(bin){
  if(bin.length !== 8){
    return false;
  }
  bin = bin.split('').reverse().join('');
  return ('00' + parseInt(bin , 2).toString(16)).substr(-2).toUpperCase();
}

exports.hex2bin = function(hex){
    return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}

exports.getBytes = function(settings){

  var createdBytes = [];

  createdBytes[0] = exports.bin2hex('' + settings.power + settings.onTimerPower + settings.offTimerPower + '1' + settings.mode);
  createdBytes[1] = (settings.temp*2).toString(16);
  createdBytes[2] = '00';
  createdBytes[3] = exports.bin2hex('' + settings.verticalSwing + settings.verticalSwing + settings.verticalSwing + settings.verticalSwing + settings.fanSpeed);
  createdBytes[4] = exports.bin2hex('' + settings.horizontalSwing + settings.horizontalSwing + settings.horizontalSwing + settings.horizontalSwing + '0000');
  createdBytes[5] = '00';
  createdBytes[6] = '06';
  createdBytes[7] = '60';
  createdBytes[8] = exports.bin2hex(settings.powerfulMode + '0000' + settings.quietMode + '00');
  createdBytes[9] = '00';
  createdBytes[10] = 'C1';
  createdBytes[11] = exports.bin2hex('0' + settings.sensorMode + settings.econoMode + '0' + settings.cleanMode + '001');
  createdBytes[12] = '00';

  createdBytes.unshift('11','DA','27','00','00');
  var s = 0;

  createdBytes.forEach(function(hexByte){
    s += parseInt(hexByte, 16);
  })

  createdBytes.push(s.toString(16).substr(-2));
 return createdBytes;
}

exports.getBinary = function(trunk){
  return trunk.match(/.{1,2}/g).map(str => {
    return exports.hex2bin(str).split('').reverse().join('')
  }).join('');
}

exports.getBinaryString = function(binaryTrunks){
  return ''+header+'ab'+binaryTrunks[0]+'cb'+binaryTrunks[1]+'cb'+binaryTrunks[2];
}

exports.getRemote = function(binaryString){
  var result = binaryString.split('').map(val => {
    let v = '';
    if(val === '0'){
      v = DAIKIN_0 + '\n'
    }else if(val === '1'){
      v = DAIKIN_1 + '\n'
    }else if(val === 'a'){
      v = DAIKIN_A + '\n'
    }else if(val === 'b'){
      v = DAIKIN_B + '\n'
    }else if(val === 'c'){
      v = DAIKIN_C + '\n'
    }
    return v;
  } ).join('');

  result += ''+ pulse;
  return 'begin remote\n\n  name  daikin\n  flags RAW_CODES\n  eps            30\n  aeps          100\n\n  gap          34978\n\n      begin raw_codes\n\n          name command\n\n'+result+'\n\n     end raw_codes\n\nend remote\n';
}




exports.sendSignal = function(remote){
  var cmd=require('node-cmd');
  var fs = require('fs');
  fs.writeFile('./daikin.lircd.conf', remote, function(err) {
    if(err) {
      return console.log(err);
    }

    console.log("File created.");
    cmd.run('sudo /etc/init.d/lircd stop');
    cmd.run('sudo cp ./daikin.lircd.conf /etc/lirc/lircd.conf.d/');
    console.log("File copyed.");
    cmd.run('sudo /etc/init.d/lircd start');
    setTimeout(function(){
      console.log("Command sent");
      cmd.run('irsend SEND_ONCE daikin command');
    }, 500);
  });
}