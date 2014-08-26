/**
 * Created by HarbingTarbl on 8/24/2014.
 */
"use strict";


function Quad() {
    var vertices = new Float32Array([
        1, 1, 0, 1,
        -1, 1, 0, 1,
        1, -1, 0, 1,
        -1, -1, 0, 1
    ]);

    this.vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.enableVertexAttribArray(0);

    this.draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
}

function Cube() {
    var vertices = new Float32Array([
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ]);

    var normals = new Float32Array([
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
    ]);

    var indices = new Uint8Array([
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23    // left
    ]);

    this.vertexBuffer = gl.createBuffer();
    this.normalBuffer = gl.createBuffer();
    this.elementBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);

    this.draw = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);

        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
    }
}

function Plane() {
    var vertices = new Float32Array([
        -1, 0, 1,
        1, 0, 1,
        -1, 0, -1,
        1, 0, -1,
    ]);

    var normals = new Float32Array([
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
    ]);

    this.vertexBuffer = gl.createBuffer();
    this.normalsBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);

    this.draw = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

function Instance(geo, transform) {
    this.modelMatrix = transform;
    this.fixNormal = true;
    this.geo = geo;
    this.color = [1,1,1,1];
    this.bounds = new BoundingVolume([0,0,0], [1,1,1]);



    this.normalMatrix = function() {
        if(this.fixNormal) {
            this._normalMatrix = mat3.fromMat4(mat3.create(), this.modelMatrix);
            var t = mat3.create();
            mat3.transpose(t, this._normalMatrix);
            mat3.invert(this._normalMatrix, t);


            this.fixNormal = false;
        }
        return this._normalMatrix;
    };

    this.translate = function(x) {
        this.fixNormal = true;
        mat4.translate(this.modelMatrix, this.modelMatrix, x);
    };

    this.scale = function(x) {
        this.fixNormal = true;
        mat4.scale(this.modelMatrix, this.modelMatrix, x);
    };

    this.rotateX = function(x) {
        this.fixNormal = true;
        mat4.rotateX(this.modelMatrix, this.modelMatrix, x);
    };

    this.rotateY = function(x) {
        this.fixNormal = true;
        mat4.rotateY(this.modelMatrix, this.modelMatrix, x);
    };

    this.rotateZ = function(x) {
        this.fixNormal = true;
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, x);
    };

    this.update = function(){
        this.bounds = new BoundingVolume([0,0,0], [1,1,1]);
        this.bounds.transform(this.modelMatrix);
    };
}