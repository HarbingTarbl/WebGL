function SimpleScene() {

	this.meshes = {
        cube: new Cube(),
        plane: new Plane(),
        quad: new Quad(),
    };

    this.instances = {
        cube: new Instance(this.meshes.cube, mat4.create()),
        floor: new Instance(this.meshes.cube, mat4.create()),
        southwall: new Instance(this.meshes.cube, mat4.create()),
        westwall: new Instance(this.meshes.cube, mat4.create()),
        eastwall: new Instance(this.meshes.cube, mat4.create())
    };


    this.instances.cube.translate([0,0.5,0]);
    this.instances.cube.color = [1,0,0,1];


    this.instances.floor.translate([0, -1, 0]);
    this.instances.floor.scale([10,0.5,10]);
    this.instances.floor.color = [1,1,1,1];

    this.instances.southwall.translate([0, 1.0, -5]);
    this.instances.southwall.scale([5.5, 2.1, 0.5]);
    this.instances.southwall.rotateX(3.14 / 2);
    this.instances.southwall.color = [0.3, 0.6, 0.8, 1];

    this.instances.westwall.translate([-5, 1.0, 0.0]);
    this.instances.westwall.scale([0.5, 2.1, 4.75]);
    this.instances.westwall.rotateZ(-3.14 / 2);
    this.instances.westwall.color = [0.3, 0.6, 0.8, 1];


    this.instances.eastwall.translate([5, 1.0, 0.0]);
    this.instances.eastwall.scale([0.5, 2.1, 4.75])
    this.instances.eastwall.rotateZ(3.14 / 2);
    this.instances.eastwall.color = [0.8, 0.6, 0.8, 1];

    this.viewMatrix = mat4.create();
    mat4.lookAt(this.viewMatrix, [10,10,10], [0,0,0], [0,1,0]);
    this.projectionMatrix = mat4.create();

    var canvas = document.querySelector("#canvas");
   	mat4.perspective(this.projectionMatrix, 65.0 * 3.14 / 180, canvas.width / canvas.height, 1, 40.0);

   	this.cameraMatrix = mat4.create();
   	mat4.mul(this.cameraMatrix, this.projectionMatrix, this.viewMatrix);

    console.log(this.instances.cube.bounds.center);
    this.instances.cube.update();
    console.log(this.instances.cube.bounds.center);
    this.instances.floor.update();
    this.instances.southwall.update();
    this.instances.westwall.update();
    this.instances.eastwall.update();


    this.bounds = new BoundingVolume([0,0,0], [1,1,1]);
    for(var i = 0; i < 3; i++){
        this.bounds.center[i] = this.instances.cube.bounds.center[i];
        this.bounds.extents[i] = this.instances.cube.bounds.extents[i];     
    };

    this.bounds.union(this.instances.floor.bounds);
    this.bounds.union(this.instances.westwall.bounds);
    this.bounds.union(this.instances.eastwall.bounds);
    this.bounds.union(this.instances.southwall.bounds);

    console.log(this.bounds);
};