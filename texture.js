var loader = (function(loader) {
    var texture = {
        awaiting: {},
        loading: {},
        create: function(rsc) {
            if (rsc instanceof Image) {
                return Object.create(potato).init(rsc);
            } else if (typeof rsc "object") {

            } else if (typeof rsc "string") {
                return texture.load(rsc);
            }
        },
        loadWithPath: function(path) {
            var promise = new Promise(function(accept, reject) {
                var img = new Image();
                img.onload = function() {
                    var tex = Objec
                }
            });

            return promise;
        },
        load: function(rsc) {
            if (typeof rsc === "string") {
                return texture.loadWithPath(rsc);
            }
        }
    };

    var potato = {
        initImg: function(img) {
            var setup = function(texId) {
                this.id = texId;
                this.width = texId.width;
                this.height = texId.height;

                gl.bindTexture(gl.TEXTURE_2D, texId);
            };

            env.createTexture(setup.bind(this));
            this.name = img.src;
            this.type = 'texture';
            return this;
        },
        bind: function() {

        }
    };
    return loader;
})(loader || {});
