let seedRandom = {
    math: Math,
    global: (0, eval)('this'),
    pool: [],
    width: 256,        // each RC4 output is 0 <= x < 256
    chunks: 6,         // at least six RC4 outputs for each double
    digits: 52,        // there are 52 significant digits in a double
    rngname: 'random', // rngname: name for Math.random and Math.seedrandom
    startdenom: Math.pow(256, 6),
    significance: Math.pow(2, 52),
    overflow: Math.pow(2, 52) * 2,
    mask: 256 - 1,
    nodecrypto: null,   
    seedrandom: function (seed, options, callback) {
        var key = [];
        options = (options === true) ? { entropy: true } : (options || {});

        // Flatten the seed string or build one from local entropy if needed.
        var shortseed = seedRandom.mixkey(seedRandom.flatten(
            options.entropy ? [seed, seedRandom.tostring(seedRandom.pool)] :
                (seed === null) ? seedRandom.autoseed() : seed, 3), key);

        // Use the seed to initialize an ARC4 generator.
        var arc4 = new seedRandom.ARC4(key);

        // This function returns a random double in [0, 1) that contains
        // randomness in every bit of the mantissa of the IEEE 754 value.
        var prng = function () {
            var n = arc4.g(seedRandom.chunks),             // Start with a numerator n < 2 ^ 48
                d = seedRandom.startdenom,                 //   and denominator d = 2 ^ 48.
                x = 0;                          //   and no 'extra last byte'.
            while (n < seedRandom.significance) {          // Fill up all significant digits by
                n = (n + x) * seedRandom.width;              //   shifting numerator and
                d *= seedRandom.width;                       //   denominator and generating a
                x = arc4.g(1);                    //   new least-significant-byte.
            }
            while (n >= seedRandom.overflow) {             // To avoid rounding up, before adding
                n /= 2;                           //   last byte, shift everything
                d /= 2;                           //   right using integer math until
                x >>>= 1;                         //   we have exactly the desired bits.
            }
            return (n + x) / d;                 // Form the number within [0, 1).
        };

        prng.int32 = function () { return arc4.g(4) | 0; }
        prng.quick = function () { return arc4.g(4) / 0x100000000; }
        prng.double = prng;

        // Mix the randomness into accumulated entropy.
        seedRandom.mixkey(seedRandom.tostring(arc4.S), seedRandom.pool);

        // Calling convention: what to return as a function of prng, seed, is_math.
        return (options.pass || callback ||
            function (prng, seed, is_math_call, state) {
                if (state) {
                    // Load the arc4 state from the given state if it has an S array.
                    if (state.S) { seedRandom.copy(state, arc4); }
                    // Only provide the .state method if requested via options.state.
                    prng.state = function () { return seedRandom.copy(arc4, {}); }
                }

                // If called as a method of Math (Math.seedrandom()), mutate
                // Math.random because that is how seedrandom.js has worked since v1.0.
                if (is_math_call) { seedRandom.math[seedRandom.rngname] = prng; return seed; }

                // Otherwise, it is a newer calling convention, so return the
                // prng directly.
                else return prng;
            })(
                prng,
                shortseed,
                'global' in options ? options.global : (this === seedRandom.math),
                options.state);
    },
    ARC4: function (key) {
        var t, keylen = key.length,
            me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];
   
        // The empty key [] is treated as [0].
        if (!keylen) { key = [keylen++]; }

        // Set up S using the standard key scheduling algorithm.
        while (i < seedRandom.width) {
            s[i] = i++;
        }
        for (i = 0; i < seedRandom.width; i++) {
            s[i] = s[j = seedRandom.mask & (j + key[i % keylen] + (t = s[i]))];
            s[j] = t;
        }

        // The "g" method returns the next (count) outputs as one number.
        (me.g = function (count) {
            // Using instance members instead of closure state nearly doubles speed.
            var t, r = 0,
                i = me.i, j = me.j, s = me.S;
            while (count--) {
                t = s[i = seedRandom.mask & (i + 1)];
                r = r * seedRandom.width + s[seedRandom.mask & ((s[i] = s[j = seedRandom.mask & (j + t)]) + (s[j] = t))];
            }
            me.i = i; me.j = j;
            return r;
            // For robust unpredictability, the function call below automatically
            // discards an initial batch of values.  This is called RC4-drop[256].
            // See http://google.com/search?q=rsa+fluhrer+response&btnI
        })(seedRandom.width);
    },
    getState: function() {
        return seedRandom.state();
    },
    copy: function (f, t) {
        t.i = f.i;
        t.j = f.j;
        t.S = f.S.slice();
        return t;
    },
    flatten: function (obj, depth) {
        var result = [], typ = (typeof obj), prop;
        if (depth && typ === 'object') {
            for (prop in obj) {
                try { result.push(seedRandom.flatten(obj[prop], depth - 1)); } catch (e) { }
            }
        }
        return (result.length ? result : typ === 'string' ? obj : obj + '\0');
    },
    mixkey: function (seed, key) {
        var stringseed = seed + '', smear, j = 0;
        while (j < stringseed.length) {
            key[seedRandom.mask & j] =
                seedRandom.mask & ((smear ^= key[seedRandom.mask & j] * 19) + stringseed.charCodeAt(j++));
        }
        return seedRandom.tostring(key);
    },
    autoseed: function () {
        try {
            var out;
            if (seedRandom.nodecrypto && (out = seedRandom.nodecrypto.randomBytes)) {
                // The use of 'out' to remember randomBytes makes tight minified code.
                out = out(seedRandom.width);
            } else {
                out = new Uint8Array(seedRandom.width);
                (seedRandom.global.crypto || seedRandom.global.msCrypto).getRandomValues(out);
            }
            return seedRandom.tostring(out);
        } catch (e) {
            var browser = seedRandom.global.navigator,
                plugins = browser && browser.plugins;
            return [+new Date, seedRandom.global, plugins, seedRandom.global.screen, seedRandom.tostring(seedRandom.pool)];
        }
    },
    tostring: function tostring(a) {
        return String.fromCharCode.apply(0, a);
    }
};

seedRandom.math['seed' + seedRandom.rngname] = seedRandom.seedrandom;
seedRandom.mixkey(seedRandom.math.random(), seedRandom.pool);


export { seedRandom };
