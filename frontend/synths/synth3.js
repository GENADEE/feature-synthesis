(function(){
  'use strict';
  var Synth = function(ctx, destination){
    var osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    var osc2 = ctx.createOscillator();
    osc2.type = "square";
    var osc3 = ctx.createOscillator();
    osc3.type = "triangle";

    var g1 = ctx.createGain();
    var g2 = ctx.createGain();
    var g3 = ctx.createGain();

    var f1 = ctx.createBiquadFilter();
    f1.type = "lowpass";

    this.params = [];

    this.params.push(g1.gain);
    this.params.push(g2.gain);
    this.params.push(g3.gain);
    // this.params.push(f1.Q);
    // this.params.push(f1.frequency);
    // this.params.push(osc1.frequency);
    // this.params.push(osc2.frequency);

    osc2.frequency.value = osc3.frequency.value*2;
    osc1.frequency.value = osc2.frequency.value*2;

    osc1.start();
    osc2.start();
    osc3.start();

    osc1.connect(g1);
    osc2.connect(g2);
    osc3.connect(g3);
    g1.connect(osc2.frequency);
    g2.connect(osc3.frequency);
    g3.connect(f1);
    f1.connect(destination);
    this.scales = [40,40,40];
  };

  Synth.prototype.set = function(vals){
    for(var a in this.params){
      this.params[a].value = vals[Math.min(a,vals.length-1)]*this.scales[a];
    }
  };

  module.exports = Synth;
})();
