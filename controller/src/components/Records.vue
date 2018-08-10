<template>
    <div class="records">
        <div class="header"><router-link :to="{path:'remote'}">« Temperature History</router-link></div>
        <div class="main">
            <div class="day" v-if="records[day]"><span class="prev" @click="prevDay()">« </span>{{records[day][0].date | moment("ddd DD MMM")}} <span class="next" @click="nextDay()"> »</span> </div>
            <ul>
                <li v-for="(rec, index) in records[day]" v-bind:key="index">
                    <div class="bar" :style="{width: getWidth(rec.temp), backgroundColor: getColor(rec.temp)}"> <span class="hour">{{rec.date | moment("HH:mm")}}</span><span class="temp">{{rec.temp}} °C</span></div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import tinycolor from 'tinycolor2'
import _ from 'lodash'

export default {
    name: 'Records',
    data: () => ({
        records: {},
        day: 0
    }),
    methods: {
        prevDay(){
            console.log('prev')
            if(this.day < (this.records.length - 1)){
                this.day++;
            }
        },
        nextDay(){
            if(this.day > 0){
                this.day--;
            }
        },
        getWidth(temp){
        // range: 17-34;
        // formula: x: 100 = (temp - 17): 17;
        // return temp
        return parseInt(50 + ((((temp - 17) / 17) * 100)/4)) + '%';
    },
    getColor(temp){
        let color = '#53db12';
        const max = 28;
        const min = 25;
        if(temp <= min){
            return color;
        }else if( temp >= max){
            return tinycolor(color).spin(-100).toString();
        }else{
            // formula: x : 100 = ((max-min) - (temp-min)): (max-min)
            let p = -Math.abs(Math.round(100 - ((((max - min) - (temp - min)) / (max - min)) * 100)));
            return tinycolor(color).spin(p).toString();
        }
    }
  },
  mounted: function () {
    let self = this;
    axios.get('/records').then((r) => {
        let recs = {};
        r.data.forEach((rec) => {
            let d = new Date(rec.date)
            let t = 'd' + d.getFullYear() + ('0' + (d.getMonth()+1)).slice(-2) + ('0' + d.getDate()).slice(-2)
            if(recs[t]){
                recs[t].push(rec);
            }else{
                recs[t] = [rec]
            }
        });
        self.records = _.map(recs, function(o){
            return o
        });
    });
  }

}
</script>

<style lang="scss">

$dark-blue: #016FB9;
$light-blue: #279AF1;
$white: #FDFFFC;
$red: #FE4A49;
$turquoise: #03B5AA;
$margin-base: 1rem;

.records{
    background:$white;
    width:100%;
    position:relative;
    .header{
        background: $dark-blue;
        height:3rem;
        width: 100%;
        line-height: 3rem;
        text-align: center;
        color: white;
        position:abslute;
        top: 0;
        z-index:1;
        a{
            text-decoration: none;
            color: $white;
        }
    }
}
.main{
    .day{
        background: $dark-blue;
        text-align:center;
        color: $white;
        font-size: .9rem;
        text-transform: uppercase;
        position:relative;
        .prev, .next{
            position: absolute;
            width: 1rem;
            cursor: pointer;
        }
        .prev{
            left: 1rem;
        }
        .next{
            right: 1rem;
        }
    }
    ul{
        list-style:none;
        padding-left:0;
        li{
            .hour{
                margin-right: .5rem;
            }
            .bar{
                width:0;
                transition: all .2s ease-out;
                background-color: $turquoise;
                display:inline-block;
                position:relative;
                color: $white;
                padding-left: .5rem;
                margin: 0;
                .temp{
                    position:absolute;
                    right:.5rem;
                }
            }
        }
    }
}

</style>
