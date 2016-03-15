(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){
  'use strict';
  var Synth = require('./synths/synth2');
  var ADSR = require('adsr');
  window.nRandomNumbers = function(n){
    let a = [];
    for(let i = 0; i < n; i++){
      a.push(Math.random());
    }
    return a;
  };

  let getSliderValues = function(){
    var vals = [];
    var sls = document.querySelectorAll('#slider');
    for(var i in sls){
      vals.push(sls[i].value);
    }
    return vals;
  };
  var mtof = function(m){
     return Math.pow(2,(m-69)/12)*440;
  };
  var valuesOf = function(a){
    let vals = [];
    for(let b in a){
      vals.push(a[b]);
    }
    return vals;
  };
  window.play = function(){
    let ctx = new AudioContext();
    let gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = 0;

    let m = Meyda.createMeydaAnalyzer({
      "audioContext":ctx,
      "source":gain,
      "bufferSize": 512
    });

    var sliders = document.querySelectorAll('#sliderDisplay');

    function step(timestamp) {
      let features = valuesOf(m.get(['rms', 'spectralCentroid', 'spectralFlatness']));
      if(features && gain.gain.value > 0.00001){
        for(let i = 0; i < 3; i ++){
          sliders[i].value = features[i]*(i==1?1/2048:1);
        }
      }
      else{
        for(let i = 0; i < 3; i ++){
          sliders[i].value = 0;
        }
      }
      window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);

    var keymap = {
      '65':mtof(60-12),
      '83':mtof(62-12),
      '68':mtof(64-12),
      '70':mtof(65-12),
      '71':mtof(67-12),
      '72':mtof(69-12),
      '74':mtof(71-12),
      '75':mtof(72-12),
      '76':mtof(74-12)
    };
    let s = new Synth(ctx,gain);
    window.s = s;

    document.addEventListener('keydown',function(e){
      s.setF(keymap[e.keyCode],ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1,ctx.currentTime+0.0005);
    });
    document.addEventListener('keyup',function(){
      gain.gain.exponentialRampToValueAtTime(0.00001,ctx.currentTime+0.0005);
    });

    let updateParams = function(){
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          let data = JSON.parse(xhttp.responseText);
          s.set(data);
        }
      };
      var vals = getSliderValues();
      xhttp.open("GET", 'http://localhost:5000/'+vals[0]+"/"+vals[1]+"/"+vals[2], true);
      xhttp.send();
    };
    let slider = document.querySelectorAll("#slider");
    for(let i = 0; i < slider.length; i++){
      slider[i].addEventListener('input',updateParams);
    }
  };
  window.getData = function(){
    var failure = function(err) {
      console.log('Rendering failed: ' + err);
    };
    window.data = [];
    for (var i = 0; i < 100; i++) {
      let ctx = new OfflineAudioContext(1,4096,44100);
      let s = new Synth(ctx, ctx.destination);
      const randnums = nRandomNumbers(9);
      s.set(randnums);
      var success = function(renderedBuffer) {
        var features = Meyda.extract(['rms','spectralCentroid','spectralFlatness'],renderedBuffer.getChannelData(0));
        var sc = features["spectralCentroid"]/2048;
        var sr = features["spectralFlatness"];
        data.push({in:randnums,out:[features['rms'],sc,sr]});
      };
      ctx.startRendering().then(success).catch(failure);
    }
    return data;
  };
  document.getElementById('playButton').addEventListener('click',play);
  document.getElementById('dataButton').addEventListener('click',function(){
    getData();
    console.log("100 data are in the `data` object. Hint: `copy` is a function in chrome's console.");
  });
})();

},{"./synths/synth2":3,"adsr":2}],2:[function(require,module,exports){
module.exports = ADSR

function ADSR(audioContext){
  var node = audioContext.createGain()

  var voltage = node._voltage = getVoltage(audioContext)
  var value = scale(voltage)
  var startValue = scale(voltage)
  var endValue = scale(voltage)

  node._startAmount = scale(startValue)
  node._endAmount = scale(endValue)

  node._multiplier = scale(value)
  node._multiplier.connect(node)
  node._startAmount.connect(node)
  node._endAmount.connect(node)

  node.value = value.gain
  node.startValue = startValue.gain
  node.endValue = endValue.gain

  node.startValue.value = 0
  node.endValue.value = 0

  Object.defineProperties(node, props)
  return node
}

var props = {

  attack: { value: 0, writable: true },
  decay: { value: 0, writable: true },
  sustain: { value: 1, writable: true },
  release: {value: 0, writable: true },

  getReleaseDuration: {
    value: function(){
      return this.release
    }
  },

  start: {
    value: function(at){
      var target = this._multiplier.gain
      var startAmount = this._startAmount.gain
      var endAmount = this._endAmount.gain

      this._voltage.start(at)
      this._decayFrom = this._decayFrom = at+this.attack
      this._startedAt = at

      var sustain = this.sustain

      target.cancelScheduledValues(at)
      startAmount.cancelScheduledValues(at)
      endAmount.cancelScheduledValues(at)

      endAmount.setValueAtTime(0, at)

      if (this.attack){
        target.setValueAtTime(0, at)
        target.linearRampToValueAtTime(1, at + this.attack)

        startAmount.setValueAtTime(1, at)
        startAmount.linearRampToValueAtTime(0, at + this.attack)
      } else {
        target.setValueAtTime(1, at)
        startAmount.setValueAtTime(0, at)
      }

      if (this.decay){
        target.setTargetAtTime(sustain, this._decayFrom, getTimeConstant(this.decay))
      }
    }
  },

  stop: {
    value: function(at, isTarget){
      if (isTarget){
        at = at - this.release
      }

      var endTime = at + this.release
      if (this.release){

        var target = this._multiplier.gain
        var startAmount = this._startAmount.gain
        var endAmount = this._endAmount.gain

        target.cancelScheduledValues(at)
        startAmount.cancelScheduledValues(at)
        endAmount.cancelScheduledValues(at)

        var expFalloff = getTimeConstant(this.release)

        // truncate attack (required as linearRamp is removed by cancelScheduledValues)
        if (this.attack && at < this._decayFrom){
          var valueAtTime = getValue(0, 1, this._startedAt, this._decayFrom, at)
          target.linearRampToValueAtTime(valueAtTime, at)
          startAmount.linearRampToValueAtTime(1-valueAtTime, at)
          startAmount.setTargetAtTime(0, at, expFalloff)
        }

        endAmount.setTargetAtTime(1, at, expFalloff)
        target.setTargetAtTime(0, at, expFalloff)
      }

      this._voltage.stop(endTime)
      return endTime
    }
  },

  onended: {
    get: function(){
      return this._voltage.onended
    },
    set: function(value){
      this._voltage.onended = value
    }
  }

}

var flat = new Float32Array([1,1])
function getVoltage(context){
  var voltage = context.createBufferSource()
  var buffer = context.createBuffer(1, 2, context.sampleRate)
  buffer.getChannelData(0).set(flat)
  voltage.buffer = buffer
  voltage.loop = true
  return voltage
}

function scale(node){
  var gain = node.context.createGain()
  node.connect(gain)
  return gain
}

function getTimeConstant(time){
  return Math.log(time+1)/Math.log(100)
}

function getValue(start, end, fromTime, toTime, at){
  var difference = end - start
  var time = toTime - fromTime
  var truncateTime = at - fromTime
  var phase = truncateTime / time
  var value = start + phase * difference

  if (value <= start) {
      value = start
  }
  if (value >= end) {
      value = end
  }

  return value
}

},{}],3:[function(require,module,exports){
(function(){
  'use strict';
  var Synth = function(ctx, destination){
    this.osc1 = ctx.createOscillator();
    this.osc1.type = "sawtooth";
    this.osc2 = ctx.createOscillator();
    this.osc2.type = "square";
    this.osc3 = ctx.createOscillator();
    this.osc3.type = "triangle";

    this.osc4 = ctx.createOscillator();
    this.osc1.type = "sawtooth";
    this.osc5 = ctx.createOscillator();
    this.osc2.type = "square";
    this.osc6 = ctx.createOscillator();
    this.osc3.type = "triangle";

    var g1 = ctx.createGain();
    var g2 = ctx.createGain();
    var g3 = ctx.createGain();

    var g4 = ctx.createGain();
    var g5 = ctx.createGain();
    var g6 = ctx.createGain();

    var f1 = ctx.createBiquadFilter();
    f1.type = "lowpass";

    this.params = [];

    this.params.push(g1.gain);
    this.params.push(g2.gain);
    this.params.push(g3.gain);
    this.params.push(g4.gain);
    this.params.push(g5.gain);
    this.params.push(g6.gain);
    this.params.push(f1.Q);
    this.params.push(f1.frequency);

    this.osc1.start();
    this.osc2.start();
    this.osc3.start();

    this.osc1.connect(g1);
    this.osc2.connect(g2);
    this.osc3.connect(g3);
    this.osc4.connect(g4);
    this.osc5.connect(g5);
    this.osc6.connect(g6);
    g1.connect(f1);
    g2.connect(f1);
    g3.connect(f1);
    g4.connect(f1);
    g5.connect(f1);
    g6.connect(f1);
    f1.connect(destination);
    this.scales = [1,1,1,1,1,1,10,22050];
  };

  Synth.prototype.set = function(vals){
    for(let a in this.params){
      this.params[a].value = vals[Math.min(a,vals.length-1)]*this.scales[a];
    }
  };

  Synth.prototype.setF = function(f, startTime){
    this.osc1.frequency.setValueAtTime(f, startTime);
    this.osc2.frequency.setValueAtTime(f, startTime);
    this.osc3.frequency.setValueAtTime(f, startTime);
    this.osc4.frequency.setValueAtTime(f, startTime);
    this.osc5.frequency.setValueAtTime(f, startTime);
    this.osc6.frequency.setValueAtTime(f, startTime);
  };

  module.exports = Synth;
})();

},{}]},{},[1]);
