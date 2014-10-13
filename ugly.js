var obj = Object.create({
    someFunc: function() {}
}, {
    someProperty: Object.create({
            get: function() {
                return 0; //How would this get used here?
            },
            set: function(v) {
                this.v = v;
            }
        }, {
            writable: false,
            configurable: false
        }
    }),
});
