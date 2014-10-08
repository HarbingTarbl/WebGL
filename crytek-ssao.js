"u strict";

var crytekSSAO = function(width, height, near, far) {
    this.width = width;
    this.height = height;

    this.viewNormalMatrix = mat3.create();
    this.projectionMatrix = mat4.create();
    this.modelViewMatrix = mat4.create();
    this.viewInvT = mat3.create();
    this.farZ = 100.0;
    this.nearZ = 1.0;

    this.gbufferPass = {};
    var pass = this.gbufferPass;
    pass.framebuffer = gl.createFramebuffer();
    pass.diffuseTexture = gl.createTexture();
    pass.normalTexture = gl.createTexture(); ///RGB (Normal) A (Depth)
    pass.projectedDepthTexture = gl.createTexture();

    gl.bindFramebuffer(gl.FRAMEBUFFER, pass.framebuffer);
    gl.bindTexture(gl.TEXTURE_2D, pass.diffuseTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pass.diffuseTexture, 0);

    gl.bindTexture(gl.TEXTURE_2D, pass.normalTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + 1, gl.TEXTURE_2D, pass.normalTexture, 0);

    gl.bindTexture(gl.TEXTURE_2D, pass.projectedDepthTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, pass.projectedDepthTexture, 0);

    gl.ext.draw_buffers.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT0 + 1]);

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE) {
        alert("Incomplete Framebuffer for gbufferPass");
    }

    this.occlusionPass = {};
    pass = this.occlusionPass;
    pass.framebuffer = gl.createFramebuffer();
    pass.occlusionTexture = gl.createTexture();
    pass.texelSize = vec2.fromValues(1.0 / width, 1.0 / height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, pass.framebuffer);
    gl.bindTexture(gl.TEXTURE_2D, pass.occlusionTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pass.occlusionTexture, 0);

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE) {
        alert("Incomplete Framebuffer for gbufferPass");
    }


    this.blurPass = {};
    this.blurPass.pingFramebuffer = gl.createFramebuffer();
    this.blurPass.pongFramebuffer = gl.createFramebuffer();
    this.blurPass.pingTexture = gl.createTexture();
    this.blurPass.pongTexture = gl.createTexture();
    this.blurPass.texelSize = vec2.fromValues(1.0 / width, 1.0 / height);
    pass = this.blurPass;

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE) {
        alert("Incomplete Framebuffer for gbufferPass");
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, pass.pingFramebuffer);
    gl.bindTexture(gl.TEXTURE_2D, pass.pingTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pass.pingTexture, 0);



    gl.bindFramebuffer(gl.FRAMEBUFFER, pass.pongFramebuffer);
    gl.bindTexture(gl.TEXTURE_2D, pass.pongTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pass.pongTexture, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);


    var me = this;

    var promise = new Promise(function(accept, reject) {
        LoadShaders("crytek-ssao.glsl", [
            ["vPosition", 0],
            ["vNormal", 1],
            ["vTangent", 2],
            ["vBitangent", 3],
            ["vTexture", 4],
            ["vViewRay", 1]
        ], function(shaders) {
            me.gbufferPass.program = shaders.GBuffer;
            me.occlusionPass.program = shaders.SSAO;
            me.blurPass.program = shaders.Blur;

            me.occlusionPass.noiseTexture = gl.createTexture();
            var imgPromise = new Promise(function(accept, reject) {
                var img = new Image();
                img.onload = function() {
                    gl.bindTexture(gl.TEXTURE_2D, me.occlusionPass.noiseTexture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    accept();
                };
                img.onerror = reject;
                img.src = "noise.png";
            });

            var f = function() {
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
                gl.viewport(0, 0, width, height);
                this.program.use();
                gl.clearColor(1, 1, 1, 1);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            };

            me.gbufferPass.use = f;
            me.occlusionPass.use = f;
            me.blurPass.use = f;


            var pass = me.gbufferPass;
            pass.drawMesh = function(mesh) {
                if (typeof mesh.material.textures.diffuse0 === "undefined") return;

                this.program.sampler.diffuse0 = mesh.material.textures.diffuse0;
                this.program.sampler.height0 = mesh.material.textures.height0;
                this.program.sampler.specular0 = mesh.material.textures.specular0;

                this.program.uniform.lambertPower = 0.588;
                this.program.uniform.shininess = mesh.material.shininess;
                this.program.uniform.specularPower = 0.3;
                mesh.Draw();
            };

            pass.drawObject = function(obj) {
                obj.UpdateNormal();
                mat3.mul(me.viewNormalMatrix, me.viewInvT, obj.normalMatrix);
                mat4.mul(me.modelViewMatrix, me.viewMatrix, obj.transform);
                this.program.uniform.uMVMatrix = me.modelViewMatrix;
                this.program.uniform.uViewNormalMatrix = me.viewNormalMatrix;
                obj.meshes.forEach(this.drawMesh, this);
            };

            pass.drawModel = function(model) {
                model.BindBuffers();
                var keys = Object.keys(model.objects);
                keys.forEach(function(v) {
                    this.drawObject(model.objects[v]);
                }, this);
            };

            pass.drawStart = function() {
                this.use();
                me.viewMatrix = me.camera.view();
                me.viewInvT = me.camera.orientation();
                this.program.uniform.uPMatrix = me.projectionMatrix;
            };


            pass.program.use();
            pass.program.uniform.uFar = far;
            pass.program.uniform.uBumpScale = 2.0;


            var kernel = new Float32Array([-0.01498649266635391, 0.02055768025923563, 0.09670980725821117, -0.033790133124342925, -0.04959070811320776, 0.07999367832691415, -0.02421411825708185, 0.07935685287610988, 0.055822633211194086, -0.027615701668353698, -0.0658110241787151, 0.07004485789772912, -0.06388934756658066, -0.06363783057059665, 0.0432247358324454,
                0.06344498266012172, 0.07049700289615658, 0.031700264319341975, -0.05728654698090374, -0.039908856102129645, 0.07159284000250457,
                0.04098158664530109, 0.092171634941215, 0.011825424920360064, -0.0566720980965898, 0.14883238705645158, 0.049142360934196716, -0.08144403406343473, 0.045836699797961455, 0.2215462405135806,
                0.22163246559043107, 0.21101409280756483, 0.10308868242449269, -0.1922945399810687, -0.34363761241832097, 0.12799904347750005,
                0.32752360081847604, 0.3911290680035614, 0.06187190956340273, -0.010573469586983525, -0.4491776812358715, 0.4307019686176897, -0.2912861693522302, 0.25080137748872666, 0.6318500957808788, -0.4757496926441961, -0.2842341039324369, 0.6647400323738477
            ]);


            var pass = me.occlusionPass;

            pass.program.use();
            pass.program.uniform.uKernel = kernel;
            pass.program.uniform.uNoiseScale = width / 4.0;
            pass.program.uniform.uKernelSize = 25.0;
            pass.program.uniform.uScreenSize = new Float32Array([width, height]);
            pass.program.uniform.uFar = far;

            pass._use = pass.use;

            var k = mat4.create();
            me.k = k;
            mat4.perspective(k, 75 * 3.14159 / 180, width / height, near, far);
            pass.program.uniform.uPMatrix = k;
            mat4.invert(k, k);
            pass.program.uniform.uInversePMatrix = k;


            var data = new Float32Array([-1, 1, 0, 1, 0, 0, 0,
                1, 1, 0, 1, 0, 0, 0, -1, -1, 0, 1, 0, 0, 0,
                1, -1, 0, 1, 0, 0, 0
            ]);

            var viewRays = [
                new Adapter(data, 3, 4, 1),
                new Adapter(data, 3, 11, 1),
                new Adapter(data, 3, 18, 1),
                new Adapter(data, 3, 25, 1),
            ];

            vec4.set(viewRays[0], -1, 1, 1, 1);
            vec4.set(viewRays[1], 1, 1, 1, 1);
            vec4.set(viewRays[2], -1, -1, 1, 1);
            vec4.set(viewRays[3], 1, -1, 1, 1);

            var i = 0;
            for (; i < 4; i++) {
                vec4.transformMat4(viewRays[i], viewRays[i], k);
                vec4.scale(viewRays[i], viewRays[i], 1.0 / viewRays[i][3]);
            }


            var viewRaysBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, viewRaysBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            pass.use = function() {
                this._use();
                gl.enableVertexAttribArray(0);
                gl.enableVertexAttribArray(1);
                gl.bindBuffer(gl.ARRAY_BUFFER, viewRaysBuffer);
                gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 4 * 7, 0);
                gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 4 * 7, 4 * 4);
                this.program.sampler.sNormalDepthTex = me.gbufferPass.normalTexture;
                this.program.sampler.sDiffuseTex = me.gbufferPass.diffuseTexture;
                this.program.sampler.sProjectedDepthTexture = me.gbufferPass.projectedDepthTexture;
                this.program.sampler.sNoiseTexture = this.noiseTexture;
            };

            pass.apply = function() {
                this.use();
                this.program.uniform.uKernelSize = brdf.properties.ssaoRange;
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }

            pass = me.blurPass;

            pass.use = function() {
                this.program.use();
                gl.bindBuffer(gl.ARRAY_BUFFER, viewRaysBuffer);
                gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 4 * 7, 0);

            };

            pass.apply = function(passes) {
                this.use();


                while (passes--) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pingFramebuffer);
                    this.program.sampler.sInputTexture = me.occlusionPass.occlusionTexture;
                    vec2.set(this.apply.sampleDir, me.occlusionPass.texelSize[0], 0.0);
                    this.program.uniform.uSampleDirection = this.apply.sampleDir;
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

                    if (false && passes === 0) {
                        gl.bindFramebuffer(gl.FRAMEBUFFER, null); //DEBUG
                    } else {
                        gl.bindFramebuffer(gl.FRAMEBUFFER, me.occlusionPass.framebuffer);
                    }
                    this.program.sampler.sInputTexture = this.pingTexture;
                    vec2.set(this.apply.sampleDir, 0.0, this.texelSize[1])
                    this.program.uniform.uSampleDirection = this.apply.sampleDir;
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                }

                return this.pongTexture;
            };

            pass.apply.sampleDir = vec2.create();



            gl.useProgram(null);
            //Any other setup
            imgPromise.then(function() {
                accept();
            });
        });
    });

    this._promise = promise;
};



crytekSSAO.prototype.ready = function() {
    return this._promise;
};
