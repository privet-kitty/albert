import * as MRD from './MRD.js'
import {mod, circularLerp} from './circle_arithmetic.js'

/**
* @file This converter processes a dark color (value < 1) separately
* because the values of the Munsell Renotation Data (all.dat) are not
* evenly distributed: [0, 0.2, 0.4, 0.6, 0.8, 1, 2, 3, ..., 10].
* 
* In the following functions, the real value equals scaledValue/5 if
* dark is true; the real chroma equals to halfChroma*2.
* @author Hugo I.
*/


function calcMHVCToLCHabAllIntegerCase(hue40, scaledValue, halfChroma, dark = false) {
     // Handles the case HVC are all integer. If chroma is larger than
     // 50, C*ab is linearly extrapolated.

     // The real value equals scaledValue/5 if dark is true. The real
     // chroma equals to halfChroma*2.

     // This function does no range checks: hue40 must be in {0, 1,
     // ..., 39}; scaledValue must be in {0, 1, ..., 10} if dark is
     // false, and {0, 1, ..., 6} if dark is true; halfChroma must be
     // a non-negative integer.
    if (dark) {
        if (halfChroma <= 25) {
            return [MRD.mrdLTableDark[scaledValue],
                    MRD.mrdCHTableDark[hue40][scaledValue][halfChroma][0],
                    MRD.mrdCHTableDark[hue40][scaledValue][halfChroma][1]];
        } else {
            const cstarab = MRD.mrdCHTableDark[hue40][scaledValue][25][0];
            const factor = halfChroma/25;
            return [MRD.mrdLTableDark[scaledValue],
                    cstarab * factor,
                    MRD.mrdCHTableDark[hue40][scaledValue][25][1]];
        }
    } else {
        if (halfChroma <= 25) {
            return [MRD.mrdLTable[scaledValue],
                    MRD.mrdCHTable[hue40][scaledValue][halfChroma][0],
                    MRD.mrdCHTable[hue40][scaledValue][halfChroma][1]];
        } else {
            const cstarab = MRD.mrdCHTable[hue40][scaledValue][25][0];
            const factor = halfChroma/25;
            return [MRD.mrdLTable[scaledValue],
                    cstarab * factor,
                    MRD.mrdCHTable[hue40][scaledValue][25][1]];
        }
    }
}

function calcMHVCToLCHabValueChromaIntegerCase(hue40, scaledValue, halfChroma, dark = false) {
    const hue1 = Math.floor(hue40);
    const hue2 = mod(Math.ceil(hue40), 40);
    const [lstar, cstarab1, hab1] = calcMHVCToLCHabAllIntegerCase(hue1, scaledValue, halfChroma, dark);
    if (hue1 === hue2) {
        return [lstar, cstarab1, hab1];
    } else {
        const [ , cstarab2, hab2] = calcMHVCToLCHabAllIntegerCase(hue2, scaledValue, halfChroma, dark);
        if ((hab1 === hab2) ||
            // workaround for the rare case hab1 exceeds hab2
            (mod(hab2 - hab1, 360) >= 180)) { 
            return [lstar, cstarab1, hab1];
        } else {
            const hab = circularLerp(hue40 - hue1, hab1, hab2, 360)
            const cstarab = (cstarab1 * mod(hab2 - hab, 360) / mod(hab2 - hab1, 360))
                  + (cstarab2 * mod(hab - hab1, 360) / mod(hab2 - hab1, 360));
            return [lstar, cstarab, hab];
        }
    }
}


