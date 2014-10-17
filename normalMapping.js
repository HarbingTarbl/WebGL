var demos = (function(demos) {
    var content = null;

    var normalMapping = {
        begin: function(scene) {

        },
        update: function(scene) {

        },
        draw: function(scene) {
            w

        },
        end: function(scene) {

        },
        loadContent: function(scene) {
            return loader.load(["normals.glsl"]).then(function(asset) {
                content = asset;
                return Promise.resolve(this);
            });
        },
        unloadContent: function(scene) {
            content = null;
        }
    };

    demos.normalMapping = normalMapping;

    return demos;
})(demos || {});
