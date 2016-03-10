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

  Synth.prototype.setF = function(f){
    this.osc1.frequency.value = f;
    this.osc2.frequency.value = f;
    this.osc3.frequency.value = f;
    this.osc4.frequency.value = f;
    this.osc5.frequency.value = f;
    this.osc6.frequency.value = f;
  };

  module.exports = Synth;
})();
