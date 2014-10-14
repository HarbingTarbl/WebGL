"use strict"

var loader = (function(loader) {
    var model = {
        load: function(path) {
            var promise = new Promise(function(accept, reject) {
                LoadModel(path, function(model) {
                    model.type = "model";
                    accept(model);
                })
            });
            return promise;
        }
    };

    var proto = {

    };

    loader.model = model;

    return loader;
})(loader || {});
