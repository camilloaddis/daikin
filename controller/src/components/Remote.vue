<template>
  <div class="remote">
    <div class="header">
      <router-link :to="{path:'records'}">
        <span>Salotto</span>
        <span><i class="fas fa-thermometer-half"></i> {{temp}}</span>
        <span><i class="fas fa-tint"></i> {{hum}}</span>
      </router-link>
    </div>
    <div class="main">
      <h1><span @click="setTemp(-1)" class="arrow down"></span>{{settings.temp}} °C<span @click="setTemp(1)" class="arrow up"></span></h1>
      <ul class="fan-speeds"><li v-for="(speed, k) in constants.fanSpeeds" :class="['fan'+speed, {'active': settings.fanSpeed === k}]" :key="k" @click="setSpeed(k)">{{speed}}</li></ul>
    </div>
    <v-touch :class="{'open':true}" id="footer">
      <div :class="{'btn':true, 'active':settings.power}" @click="setSetting('power','power', !settings.power)" ><img src="icons/i_power.png" class="icon" alt=""></div>

      <div :class="{'btn':true, 'active':settings.mode === 'auto'}" @click="setSetting('mode', 'mode', 'auto')" ><img src="icons/i_auto.png" class="icon" alt=""></div>
      <div :class="{'btn':true, 'active':settings.mode === 'cool'}" @click="setSetting('mode', 'mode', 'cool')" ><img src="icons/i_cool.png" class="icon" alt=""></div>
      <div :class="{'btn':true, 'active':settings.mode === 'dry'}" @click="setSetting('mode', 'mode', 'dry')" ><img src="icons/i_dry.png" class="icon" alt=""></div>
      <div :class="{'btn':true, 'active':settings.mode === 'heat'}" @click="setSetting('mode', 'mode', 'heat')" ><img src="icons/i_heat.png" class="icon" alt=""></div>
      <div :class="{'btn':true, 'active':settings.mode === 'fan'}" @click="setSetting('mode', 'mode', 'fan')" ><img src="icons/i_fan.png" class="icon" alt=""></div>

      <div :class="{'btn':true, 'active':settings.powerfulMode, 'disabled':!settings.power}" @click="settings.power && setSetting('powerful', 'powerfulMode', !settings.powerfulMode)" ><img src="icons/i_powerful.png" class="icon" alt=""></div>
      <div :class="{'btn':true, 'active':settings.econoMode}" @click="setSetting('econo','econoMode', !settings.econoMode)" ><img src="icons/i_econo.png" class="icon" alt=""></div>
      <div :class="{'btn':true, 'active':settings.cleanMode}" @click="setSetting('clean','cleanMode', !settings.cleanMode)" ><img src="icons/i_clean.png" class="icon" alt=""></div>
      <div :class="{'btn':true, 'active':settings.verticalSwing}" @click="setSetting('swing/vertical','verticalSwing', !settings.verticalSwing)" ><img src="icons/i_ver-swing.png" class="icon" alt=""></div>
      <div :class="{'btn':true, 'active':settings.horizontalSwing}" @click="setSetting('swing/horizontal', 'horizontalSwing', !settings.horizontalSwing)" ><img src="icons/i_hor-swing.png" class="icon" alt=""></div>
      <div :class="{'btn':true, 'active':settings.comfortMode}" @click="setSetting('comfort', 'comfortMode', !settings.comfortMode)" ><img src="icons/i_comfort.png" class="icon" alt=""></div>
      <div :class="{'btn':true, 'active':settings.sensorMode}" @click="setSetting('sensor', 'sensorMode', !settings.sensorMode)" ><img src="icons/i_sensor.png" class="icon" alt=""></div>
      <div :class="{'btn':true, 'active':settings.quietMode}" @click="setSetting('quiet','quietMode', !settings.quietMode)" ><img src="icons/i_quiet.png" class="icon" alt=""></div>
      <div :class="{'btn':true, 'active':settings.automatic}" @click="setSetting('automatic','automatic', !settings.automatic)" ><img src="icons/i_auto.png" class="icon" alt=""></div>
    </v-touch>
  </div>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'

export default {
  name: 'Remote',
  props: {
    msg: String
  },
  data: () => ({
    constants: {
      modes : {auto:'0000', dry:'0010', cool:'0011', heat:'0100', fan:'0110'},
      minMaxTempAuto : ['18', '30'],
      minMaxTempCool : ['18', '32'],
      minMaxTempHeat : ['10', '30'],
      fanSpeeds : {night:'night', fan1:'1', fan2:'2', fan3:'3', fan4:'4', fan5:'5', auto:'auto'}
    },
    settings: {},
    temp: null,
    hum: null,
    notClicable: [],
    footerOpened: false,
    footerBottom: null
  }),
  methods: {
    setSetting : _.debounce(function(route, name, val) {
        let realVal = null;
        if(val === 0 || val === false){
          realVal = 'off';
        }else if(val === 1 || val === true){
          realVal = 'on';
        }else{
          realVal = val;
        }
        axios.post('/'+route + '/' + realVal).then((r)=>{
          this.settings = r.data;
        })
      }, 800),
    setBottom(e){
      this.footerBottom = window.innerHeight - e.target.offsetTop - e.target.clientHeight;
    },
    openFooter (e){
      let f = document.getElementById('footer');
      if(this.footerBottom === null){
        this.setBottom(e);
      }
      if(e.additionalEvent === 'panup'){
        f.classList.add('open');
      }else if(e.additionalEvent === 'pandown'){
        f.classList.remove('open');
      }
    },
    toggleFooter(){
      this.footerOpened = !this.footerOpened;
    },
    setTemp(v){
      this.settings.temp = parseInt(this.settings.temp) + v;
      this.setSetting('temp', 'temp', this.settings.temp);
    },
    setSpeed(v){
      this.settings.fanSpeed = v;
      this.setSetting('fan', 'fanSpeed', this.settings.fanSpeed);
    }
  },
  mounted: function () {
    var self = this;
    axios.get('/all').then((res)=>{
      self.settings = res.data;
    });
    axios.get('/roomtemp').then((r)=>{
      self.temp = r.data.temp;
      self.hum = r.data.humidity;
    });
    setInterval(function(){
      axios.get('/roomtemp').then((r)=>{
        self.temp = r.data.temp;
        self.hum = r.data.humidity;
      });
    }, 1000*60*5);
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

$dark-blue: #016FB9;
$light-blue: #279AF1;
$white: #FDFFFC;
$red: #FE4A49;
$turquoise: #03B5AA;
$margin-base: 1rem;

.remote{
  overflow-y: hidden;
  text-align:center;
  position: relative;
  z-index:1;
  background: linear-gradient(to bottom, $dark-blue, $white);
  padding: $margin-base;
  height: 100%;
  box-sizing:border-box;
  color: $white;
  margin: 0;
  .header{
    a{
      color: white;
      text-decoration: none;
    }
    margin-bottom: $margin-base;
    span{
      $gutter: .7rem;
      margin-right: 0 $gutter;
      padding: 0 $gutter;
      border-right: 1px solid $white;
      border-width: 0 1px;
      &:last-child{
        border-right:0;
        margin-right: 0;
      }
    }
  }
  .main{
    h1{
      font-size: 4rem;
      margin: 0;
      padding:0;
      font-weight: 100;
      position: relative;
      span{
        border:solid white;
        border-width: 0 1px 1px 0;
        display: inline-block;
        padding: .8rem;
        position:absolute;
        opacity: .5;
        cursor: pointer;
        &.up{
          transform: rotate(225deg);
          right: .5rem;
          top: 2.3rem;
        }
        &.down{
          left: .5rem;
          top: 1.3rem;
          transform: rotate(45deg);
        }
      }
    }
    .fan-speeds{
      li{
        display: inline-block;
        margin: .3rem;
        padding: .3rem;
        cursor:pointer;
        opacity: .5;
        &.active{
          opacity: 1;
          font-weight: 700;
        }
      }
    }
  }
  #footer{
    position: absolute;
    bottom:-190px;
    left:0;
    width:100%;
    padding: 1.5rem 0 1rem 0;
    display:block;
    background-color: $white;
    transition: bottom .25s ease-in-out;
    .btn:nth-child(n+5){
      opacity:0;
      &.disabled{
        opacity: 0};
      }
      &.open{
        bottom:0;
        .btn{
          top:0;

        }
        .btn:nth-child(n+5){
          opacity:1;

        }
      }
      .btn{
        color: $light-blue;
        display:inline-block;
        border: 1px solid $light-blue;
        border-radius: 100%;
        width:3rem;
        height:3rem;
        position:relative;
        text-align:center;
        margin:.5rem;
        font-size:1.3rem;
        cursor: pointer;
        transition: all .25s ease-in-out;
        top:1rem;
        .icon{
          width:100%;
          height:100%;
          position:absolute;
          top:0;
          left:0;
        }
        &.active{
          background: $light-blue;
          color: $white;
          .icon{
            filter:brightness(0) invert(1);
          }
        }
        &.disabled{
          opacity: .5;
          cursor: not-allowed;
        }
        i{
          position:absolute;
          top:50%;
          margin-top:-.65rem;
          text-align:center;
          width:100%;
          height:1rem;
          display:block;
        }

      }
    }
  }

  </style>
