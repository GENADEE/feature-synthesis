# Web Audio Feature Based Synthesis

`index.js` provides a subtractive synthesiser comprising of three oscillators with each of the waveforms 'sawtooth', 'square', 'triangle', and exposes volume parameters of each of these oscillators to our data extraction method. It uses `meyda` to return rms value for each of 100 buffers each of whom have been generated with randomly assigned parameters. You can then run the following command:

`copy(data.map(function(e){return [e['in'][0],e['in'][1],e['in'][2],e['out']['rms']]}));`

in your browser console to copy the relevant data to your clipboard, massage it with sublime text or similar, to put into your favourite machine learning system as a csv.
