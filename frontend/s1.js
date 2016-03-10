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

    this.params = [];

    this.params.push(g1.gain);
    this.params.push(g2.gain);
    this.params.push(g3.gain);

    var f1 = ctx.createBiquadFilter();
    f1.type = "lowpass";

    osc1.start();
    osc2.start();
    osc3.start();

    osc1.connect(g1);
    osc2.connect(g2);
    osc3.connect(g3);
    g1.connect(f1);
    g2.connect(f1);
    g3.connect(f1);
    f1.connect(ctx.destination);
  };

  Synth.prototype.set = function(vals){
    for(let a in this.params){
      this.params[a].value = vals[a];
    }
  };

  var nRandomNumbers = function(n){
    let a = [];
    for(let i = 0; i < n; i++){
      a.push(Math.random());
    }
    return a;
  };

  window.data = [];

  var failure = function(err) {
    console.log('Rendering failed: ' + err);
  };

  for (var i = 0; i < 100; i++) {
    let ctx = new OfflineAudioContext(1,4096,44100);
    let s = new Synth(ctx);
    const randnums = nRandomNumbers(3);
    s.set(randnums);
    var success = function(renderedBuffer) {
      data.push({in:randnums,out:Meyda.extract(['rms'],renderedBuffer.getChannelData(0))});
    };
    ctx.startRendering().then(success).catch(failure);
  }
})();
