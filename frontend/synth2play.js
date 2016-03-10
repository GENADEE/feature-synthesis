(function(){
  'use strict';
  var Synth = function(ctx, destination){
    var osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    var osc2 = ctx.createOscillator();
    osc2.type = "square";
    var osc3 = ctx.createOscillator();
    osc3.type = "triangle";

    var osc4 = ctx.createOscillator();
    osc1.type = "sawtooth";
    var osc5 = ctx.createOscillator();
    osc2.type = "square";
    var osc6 = ctx.createOscillator();
    osc3.type = "triangle";

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
    this.params.push(osc4.detune);
    this.params.push(osc5.detune);
    this.params.push(osc6.detune);

    osc1.start();
    osc2.start();
    osc3.start();

    osc1.connect(g1);
    osc2.connect(g2);
    osc3.connect(g3);
    osc4.connect(g4);
    osc5.connect(g5);
    osc6.connect(g6);
    g1.connect(f1);
    g2.connect(f1);
    g3.connect(f1);
    g4.connect(f1);
    g5.connect(f1);
    g6.connect(f1);
    f1.connect(ctx.destination);
  };

  var scales = [1,1,1,1,1,1,10,22050,1,1,1];

  Synth.prototype.set = function(vals){
    for(let a in this.params){
      this.params[a].value = vals[Math.min(a,vals.length-1)]*scales[a];
    }
  };

  let getSliderValues = function(){
    var vals = [];
    var sls = document.querySelectorAll('#slider');
    for(var i in sls){
      vals.push(sls[i].value);
    }
    return vals;
  };

  let ctx = new AudioContext();
  let s = new Synth(ctx);
  let updateParams = function(){
    console.log(this.value);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        let data = JSON.parse(xhttp.responseText);
        console.log(data);
        s.set(data);
      }
    };
    var vals = getSliderValues();
    xhttp.open("GET", 'http://localhost:5000/'+vals[0]+"/"+vals[1]+"/"+vals[2], true);
    xhttp.send();
  };

  let slider = document.querySelectorAll("#slider");
  console.log(slider);
  for(let i = 0; i < slider.length; i++){
    slider[i].addEventListener('change',updateParams);
  }
})();
