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
    g1.connect(f1);
    g2.connect(f1);
    g3.connect(f1);
    f1.connect(ctx.destination);
  };

  var scales = [1,1,1,10,22050];

  Synth.prototype.set = function(vals){
    console.log(this.params);
    for(var a in this.params){
      this.params[a].value = vals[Math.min(a,vals.length-1)]*scales[a];
    }
  };

  window.nRandomNumbers = function(n){
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

  for (var i = 0; i < 10000; i++) {
    let ctx = new OfflineAudioContext(1,4096,44100);
    let s = new Synth(ctx);
    const randnums = nRandomNumbers(9);
    s.set(randnums);
    var success = function(renderedBuffer) {
      var features = Meyda.extract(['rms','spectralCentroid','spectralRolloff'],renderedBuffer.getChannelData(0));
      var sc = features["spectralCentroid"]/22050;
      var sr = features["spectralRolloff"]/22050;
      data.push({in:randnums,out:[features['rms'],sc,sr]});
    };
    ctx.startRendering().then(success).catch(failure);
  }

  // var ctx = new AudioContext();
  // window.s = new Synth(ctx);
})();
