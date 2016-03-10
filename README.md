# Feature Based Extraction Dataset Descriptions

## Synth 1

A subsynth of the form [sawtooth, triangle, square] => [gain1, gain2, gain3] => lowpassfilter, with the parameters [gain1,gain2,gain3] and output ['rms'];

### Datasets

* `s1`: rms, each of the gains described above

## Synth 2

A more fully featured subsynth. 6 oscillators, just a double of the above, exposing parameters for the filter (q and frequency), as well as detune params on 3 of the oscillators

### Datasets

* `s2`: Feature data includes [rms, spectral centroid, spectral rolloff], plus the normalised parameter values
* `s5`: Same as above, but s/rolloff/flatness.

## Synth 3

An FM synth, exposing parameters for the volume of each oscillator. Has a carrier, a modulator, and a higher order modulator.

### Datasets

* `s3`: Feature data includes [rms, spectral centroid, spectral rolloff] _(may be broken)_.
* `s4`: An attempt to fix s3. Also currently broken.
