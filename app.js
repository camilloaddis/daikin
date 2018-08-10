var express = require('express');
var app = express();
var cors = require('cors');
var functions = require('./functions.js');
const storage = require('node-persist');
var schedule = require('node-schedule');


app.use(cors());

const props = {
  modes : {auto:'0000', dry:'0100', cool:'1100', heat:'0010', fan:'0110'},
  minMaxTempAuto : ['18', '30'],
  minMaxTempCool : ['18', '32'],
  minMaxTempHeat : ['10', '30'],
  fanSpeeds : {fan1:'1100', fan2:'0010', fan3:'1010', fan4:'0110', fan5:'1110', auto:'0101', night:'1101'}
};

var settings = {
  power: 0,
  temp: 25,
  mode: 'auto',
  verticalSwing: 0,
  horizontalSwing: 0,
  fanSpeed: 'auto',
  powerfulMode: 0,
  econoMode: 0,
  quietMode: 0,
  cleanMode: 0,
  comfortMode: 0,
  sensorMode: 0,
  onTimerPower: 0,
  onTimerMinutes: 0,
  offTimerPower: 0,
  offTimerMinutes: 0,
  automatic: 0
};

async function getStoredSettings(){
  await storage.init();
  return await storage.getItem('settings');
}
async function setStoredSettings(s){
  await storage.init();
  return await storage.setItem('settings', s)
}

async function getStoredTemps(){
  await storage.init();
  return await storage.getItem('temperatures');
}
async function setStoredTemps(s){
  await storage.init();
  return await storage.setItem('temperatures', s)
}



getStoredSettings().then((r) => {
  if(!r){
    setStoredSettings(settings).then((s) => {
      return s.content.value;
    });
  }else{
    settings = r;
    return r;
  }
});

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function setSettings(s){
  for(var k in s){
    if(s.hasOwnProperty(k)){
      settings[k] = s[k];
    }
  }

  return setStoredSettings(settings).then((ss) => {
    return ss.content.value;
  });
}

function send(settings){
  let s = Object.assign({}, settings);
  s.mode = props.modes[settings.mode];
  s.fanSpeed = props.fanSpeeds[settings.fanSpeed];

  var trunks = ['11DA270042581DC9'];
  if(settings.comfortMode === 1){
    trunks.unshift('11DA2700C5301017');
  }else{
    trunks.unshift('11DA2700C5300007');
  }

  trunks.push(functions.getBytes(s).join(''));
  var binaryTrunks = trunks.map(trunk => {
    return functions.getBinary(trunk);
  })

  functions.sendSignal(functions.getRemote(functions.getBinaryString(binaryTrunks)));
}

app.get('/', function (req, res) {
  res.json('Daikin AC - v0.1');
});


// ALL SETTINGS
app.get('/all', function(req, res){
  getStoredSettings().then((s)=>{
    res.json(s)
  });
});

// POWER
app.get('/power', function(req, res){
  res.json({value:settings.power});
});

app.post('/power/:val', function(req, res){
  let val = req.params.val;
  if( val !== 'on' && val !== 'off'){
    res.status(400).send('Cannot understand command.');
  }else{
    let v = val === 'on' ? 1 : 0;
    // res.json(setSettings('power', v));
    setSettings({power : v}).then((r) => {
      send(r);
      res.json(r);
    });
  }
});

// TEMP
app.get('/temp', function(req, res){
  res.json({value:settings.temp});
});

app.post('/temp/:val', function(req, res){
  let temp = req.params.val;
  temp = parseInt(temp);
  if(isNaN(temp)){
    res.status(400).send('Cannot understand command.');
  }
  else if( settings.mode === props.modes.dry ){
    res.status(400).send('Cannot set temp on Dry Mode');
  }
  else if( settings.mode === props.modes.fan ){
    res.status(400).send('Cannot set temp on Fan Mode');
  }
  else if( settings.mode === props.modes.auto && temp < props.minMaxTempAuto[0]){
    res.status(400).send('Minimum temp for Auto mode is '+props.minMaxTempAuto[0]+'°C');
  }
  else if( settings.mode === props.modes.auto && temp > props.minMaxTempAuto[1]){
    res.status(400).send('Maximum temp for Auto mode is ' + props.minMaxTempAuto[1] + '°C');
  }
  else if( settings.mode === props.modes.cool && temp < props.minMaxTempCool[0]){
    res.status(400).send('Minimum temp for Cool mode is '+props.minMaxTempCool[0]+'°C');
  }
  else if( settings.mode === props.modes.cool && temp > props.minMaxTempCool[1]){
    res.status(400).send('Maximum temp for Cool mode is '+props.minMaxTempCool[1]+'°C');
  }
  else if( settings.mode === props.modes.heat && temp < props.minMaxTempHeat[0]){
    res.status(400).send('Minimum temp for Heat mode is '+props.minMaxTempHeat[0]+'°C');
  }
  else if( settings.mode === props.modes.heat && temp > props.minMaxTempHeat[1]){
    res.status(400).send('Maximum temp for Heat mode is '+props.minMaxTempHeat[1]+'°C');
  }
  else{
    setSettings({temp: temp }).then((r) => {
      send(r);
      res.json(r);
    });
  }
});

// HOR SWING
app.get('/swing/horizontal', function(req, res){
  res.json({value:settings.horizontalSwing});
});

app.post('/swing/horizontal/:val', function(req, res){
  let val = req.params.val;
  if( val !== 'on' && val !== 'off'){
    res.status(400).send('Cannot understand command.');
  }else{
    let v = val === 'on' ? 1 : 0;
    setSettings({horizontalSwing : v}).then((r) => {
      send(r);
      res.json(r);
    });
  }
});

// VERT SWING
app.get('/swing/vertical', function(req, res){
  res.json({value:settings.verticalSwing});
});

app.post('/swing/vertical/:val', function(req, res){
  let val = req.params.val;
  if( val !== 'on' && val !== 'off'){
    res.status(400).send('Cannot understand command.');
  }else{
    let v = val === 'on' ? 1 : 0;
    setSettings({comfortMode: 0, verticalSwing : v}).then((r) => {
      send(r);
      res.json(r);
    });
  }
});

// FAN SPEED
app.get('/fan', function(req, res){
  let r = getKeyByValue(props.fanSpeeds, settings.fanSpeed);
  res.json({value:r});
});

app.post('/fan/:speed', function(req, res){
  let speed = req.params.speed;
  setSettings({fanSpeed: speed }).then((r) => {
    send(r);
    res.json(r);
  });
});

// MODE
app.get('/mode', function(req, res){
  let r = getKeyByValue(props.fanSpeeds, settings.fanSpeed);
  res.json({value:r});
});

app.post('/mode/:mode', function(req, res){
  let mode = req.params.mode;
  setSettings({mode: mode}).then((r) => {
    send(r);
    res.json(r);
  });
});

// POWERFUL
app.get('/powerful', function(req, res){
  res.json({value:settings.powerfulMode});
});

app.post('/powerful/:val', function(req, res){
  let val = req.params.val;
  if( val !== 'on' && val !== 'off'){
    res.status(400).send('Cannot understand command.');
  }else{
    let v = val === 'on' ? 1 : 0;
    setTimeout(function(){setSettings({powerfulMode: 0})}, 1000 * 60 * 20);
    setSettings({powerfulMode : v}).then((r) => {
      send(r);
      res.json(r);
    });
  }
});


// ECONO
app.get('/econo', function(req, res){
  res.json({value:settings.econoMode});
});

app.post('/econo/:val', function(req, res){
  let val = req.params.val;
  if( val !== 'on' && val !== 'off'){
    res.status(400).send('Cannot understand command.');
  }else{
    let v = val === 'on' ? 1 : 0;
    setSettings({econoMode : v}).then((r) => {
      send(r);
      res.json(r);
    });
  }
});

// QUIET
app.get('/quiet', function(req, res){
  res.json({value:settings.quietMode});
});

app.post('/quiet/:val', function(req, res){
  let val = req.params.val;
  if( val !== 'on' && val !== 'off'){
    res.status(400).send('Cannot understand command.');
  }else{
    let v = val === 'on' ? 1 : 0;
    setSettings({quietMode : v}).then((r) => {
      send(r);
      res.json(r);
    });
  }
});

// CLEAN
app.get('/clean', function(req, res){
  res.json({value:settings.cleanMode});
});

app.post('/clean/:val', function(req, res){
  let val = req.params.val;
  if( val !== 'on' && val !== 'off'){
    res.status(400).send('Cannot understand command.');
  }else{
    let v = val === 'on' ? 1 : 0;
    setSettings({cleanMode : v}).then((r) => {
      send(r);
      res.json(r);
    });
  }
});


// COMFORT
app.get('/comfort', function(req, res){
  res.json({value:settings.comfortMode});
});

app.post('/comfort/:val', function(req, res){
  let val = req.params.val;
  if( val !== 'on' && val !== 'off'){
    res.status(400).send('Cannot understand command.');
  }else{
    let v = val === 'on' ? 1 : 0;
    setSettings({verticalSwing: 0, comfortMode : v}).then((r) => {
      send(r);
      res.json(r);
    });
  }
});

// SENSOR
app.get('/sensor', function(req, res){
  res.json({value:settings.sensorMode});
});

app.post('/sensor/:val', function(req, res){
  let val = req.params.val;
  if( val !== 'on' && val !== 'off'){
    res.status(400).send('Cannot understand command.');
  }else{
    let v = val === 'on' ? 1 : 0;
    setSettings({sensorMode : v}).then((r) => {
      send(r);
      res.json(r);
    });
  }
});

// AUTOMATIC
app.get('/automatic', function(req, res){
  res.json({value:settings.automatic});
});

app.post('/automatic/:val', function(req, res){
  let val = req.params.val;
  if( val !== 'on' && val !== 'off'){
    res.status(400).send('Cannot understand command.');
  }else{
    let v = val === 'on' ? 1 : 0;
    setSettings({automatic : v}).then((r) => {
      res.json(r);
    });
  }
});


// ROOM TEMP 
app.get('/roomtemp', function(req, res){
  var sensor = require('node-dht-sensor');
  sensor.read(22, 24, function(err, temperature, humidity) {
    if (!err) {
      let t = temperature.toFixed(1) + '°C';
      let h = humidity.toFixed(1) + '%';
      res.json({temp: t, humidity: h});
    }else{
      console.log(err);
    }
  });
});


// ALL ROOM TEMPS
app.get('/records', function (req, res) {
  getStoredTemps().then((t)=>{
    res.json(t);
  });
});

function pad(n){return n<10 ? '0'+n : n}


var j = schedule.scheduleJob('*/30 */1 * * *', function(){
  let d = new Date();
  let moment = d.getFullYear() + '-' + pad(parseInt(d.getMonth() + 1)) + '-' + pad(d.getDate()) +'T'+ pad(d.getHours()) + ':'+ pad(d.getMinutes()) +':' + pad(d.getSeconds()) + 'Z';
  var sensor = require('node-dht-sensor');
  var t = null;
  var h = null;
  sensor.read(22, 24, function(err, temperature, humidity) {
    if (!err) {
      t = temperature.toFixed(1) + '';
      h = humidity.toFixed(1) + '';
      setTimeout(()=>{
        getStoredTemps().then((ts) => {
          if(!ts){
            let temps = [];
            temps.unshift({date: moment, temp: t, humidity: h});
            setStoredTemps(temps);
          }else{
            ts.unshift({date: moment, temp: t, humidity: h});
            setStoredTemps(ts);
          }
        });
      }, 6000);
    }else{
      console.log(err);
    }
  });
});

var automatic = schedule.scheduleJob('*/15 * * * *', function(){
  var sensor = require('node-dht-sensor');
  var t = null;
  sensor.read(22, 24, function(err, temperature, humidity) {
    if (!err) {
      t = temperature.toFixed(1);
      console.log('temp:' + parseInt(t));
      if(settings.automatic){
        console.log('automatic ON');
        if(parseInt(t) >= 28){
          if(!settings.power){
            console.log('Turning on');
            setSettings({
              power: 1,
              temp: 25,
              mode: 'cool',
              verticalSwing: 1,
              horizontalSwing: 1,
              fanSpeed: 'fan3',
              powerfulMode: 0,
              econoMode: 0,
              quietMode: 0,
              cleanMode: 1,
              comfortMode: 0,
              sensorMode: 1
            }).then(r => {
              send(r);
            });
          }
        }else{
          setSettings({power: 0}).then(r => {
            send(r);
          });
        }
      }
    }else{
      console.log(err);
    }
  });
});

var off = schedule.scheduleJob('30 22 * * *', function(){
  setSettings({power : 0}).then((r) => {
    send(r);
  });
});

app.listen(3000, function () {
  console.log('Daikin app listening on port 3000!');
});
