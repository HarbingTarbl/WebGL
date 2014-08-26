function SimpleScene() {

	this.meshes = {
        cube: new Cube(),
        plane: new Plane(),
        quad: new Quad(),
    };

    this.instances = {
        cube: new Instance(meshes.cube, mat4.create()),
        floor: new Instance(meshes.cube, mat4.create()),
        southwall: new Instance(meshes.cube, mat4.create()),
        westwall: new Instance(meshes.cube, mat4.create()),
        eastwall: new Instance(meshes.cube, mat4.create())
    };


    this.instances.cube.translate([0,0.5,0]);
    this.instances.cube.color = [1,0,0,1];


    this.instances.floor.translate([0, -1, 0]);
    this.instances.floor.scale([10,0.5,10]);
    this.instances.floor.color = [1,1,1,1];

    this.instances.southwall.translate([0, 1.0, -5]);
    this.instances.southwall.scale([5.5, 2, 0.5]);
    this.instances.southwall.rotateX(3.14 / 2);
    this.instances.southwall.color = [0.3, 0.6, 0.8, 1];

    this.instances.westwall.translate([-5, 1.0, 0.0]);
    this.instances.westwall.scale([0.5, 2, 4.75]);
    this.instances.westwall.rotateZ(-3.14 / 2);
    this.instances.westwall.color = [0.3, 0.6, 0.8, 1];


    this.instances.eastwall.translate([5, 1.0, 0.0]);
    this.instances.eastwall.scale([0.5, 2, 4.75])
    this.instances.eastwall.rotateZ(3.14 / 2);
    this.instances.eastwall.color = [0.8, 0.6, 0.8, 1];

    this.viewMatrix = mat4.create();
    mat4.lookAt(this.viewMatrix, [10,10,10], [0,0,0], [0,1,0]);
    this.projectionMatrix = mat4.create();

    var canvas = document.querySelector("#canvas");
   	mat4.perspective(this.projectionMatrix, 65.0 * 3.14 / 180, canvas.width / canvas.height, 1, 40.0);

   	this.cameraMatrix = mat4.create();
   	mat4.mul(this.cameraMatrix, this.projectionMatrix, this.viewMatrix);
   	
};