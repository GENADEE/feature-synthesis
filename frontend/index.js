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
  window.play = function(){
    let ctx = new AudioContext();
    let gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = 0;

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
        var sc = features["spectralCentroid"]/22050;
        var sr = features["spectralFlatness"];
        data.push({in:randnums,out:[features['rms'],sc,sr]});
      };
      ctx.startRendering().then(success).catch(failure);
    }
    return data;
  };
})();
