var extend = function() {
    [].reduceRight.call(arguments, function(prev, cur) {
        if (prev === cur)
            return;

        for (var name in prev) {
            if (prev.hasOwnProperty(name)) {
                cur[name] = prev[name];
            }
        }
    });
    return arguments[0];
};

var readonly = function(obj) {
    return {
        writable: false,
        configurable: false,
        value: obj
    };
};
