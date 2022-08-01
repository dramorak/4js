//javascript program to create / render / 4 dimensional objects.

/*
    Big picture:
        Operate (translate / rotate) a camera in a 4 dimensional space*, render what it sees to a screen
        *for now, a 4-dimensional space is just a collection of points (perhaps lines?) in 4d.

    Universe:
        : Camera
            :position
            :angling
            :?field of view
        : Objects
            : Points
                : (x,y,z,w)
            : Lines
                : 2 points
        
    methods:
        Render(canvas, universe)
            - Given a canvas to write to, and a universe with which to draw from (which includes objects and a camera), draw the universe as the 
              camera sees it on the canvas.

    TODO
        Objects
            instead of lines/points, have a general 'Object' class which supports transformations and drawing
*/

// @ts-check
function bits(n){
    //counts the bits in n
    let s = 0;
    while(n > 0){
        s += n & 1;
        n = n>>1;
    }
    return s
}
class Vector4{
    //4 dimensional vector
    constructor(x,y,z,w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        this.length = this.dot(this) ** (0.5)
    }

    add(v){
        //returns a new vector this + vec2
        //Args:
        //  v: a vector4
        return new Vector4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }

    mul(c){
        //returns a new vector c * this
        //Args:
        //  c: a scalar
        return new Vector4(this.x * c, this.y * c, this.z * c, this.w * c);
    }

    sub(v){
        //returns a new vector, this - v
        //Args:
        //  v: a vector4
        return this.add(v.mul(-1));
    }

    dot(v){
        //returns the standard euclidian dot product of two vectors
        //Args:
        //  v: a vector4
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }
}

class Point{
    //container class representing a 4d point.
    constructor(vec, color="#000000"){
        this.pos = vec;
        this.color = color;
    }

    draw(canvas){
        //draws the point on a canvas.

        //If the point is outside the field of view, do nothing.
        if (this.pos.z <= 0){
            return;
        }

        var ctx = canvas.getContext("2d");
        ctx.fillStyle = this.color; // defaults to black
        /* discussion on width as a function of distance
            theta(w,l) = arctan(w/l) ~ w/l for w/l << 1
        */
        let r = 4;
        ctx.fillRect(this.pos.x, this.pos.y, r,r);
    }
}
class Line{
    //container class representing a line in 4d.
    constructor(vec1, vec2, color="#000000"){
        this.endpoint1 = vec1;
        this.endpoint2 = vec2;
        this.color = color;
    }

    draw(canvas){
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.endpoint1.x, this.endpoint1.y);
        ctx.lineTo(this.endpoint2.x, this.endpoint2.y);
        ctx.stroke();
    }
}

class Camera{
    constructor(pos, facing, up, right, w, d){
        //constructor for camera class.
        //Args:
        //  pos: vector4 representing the cameras position in 4space
        //  facing: vector4 representing the point that the camera is facing
        //  up: vector4 representing 'up' to the camera
        //  right: vector4 representing 'right' to the camera
        //  w: a vector4 orthonormal to (facing - pos), up, right
        //  d: a scalar representing the distance from the eye to the viewport.
        this.pos = pos;
        this.facing = facing;
        this.up = up.mul(1/up.length);
        this.right = right.mul(1/right.length);
        this.w = w.mul(1/w.length);
        this.d = d;

        this.forward = facing.sub(pos);
        this.forward = this.forward.mul(1/this.forward.length);
    }

    rotate(){
        /*
            discussion on rotations in 4d, and in this simulator
            
            Ideally I'd like the mouse to be used to rotate
        */
    }
}

class Universe{
    constructor(){
        //All universes must have a camera (obvserver)
        this.addCamera();

        this.objects = [];
    }

    addObject(obj){
        //add object to Universe
        //Args:
        //  obj: Point / Line
        this.objects.push(obj);
    }

    addPoint(x,y,z,w,c='#000000'){
        //Adds points to Universe
        //Args:
        //  x,y,z,w: coordinates in 4d
        var obj = new Point(new Vector4(x,y,z,w));
        this.objects.push(obj);
    }

    addLine(x1, y1, z1, w1, x2, y2, z2, w2){
        //Adds line to Universe
        //Args:
        //  p1,p2: points
        var obj = new Line(new Vector4(x1,y1,z1,w1), new Vector4(x2,y2,z2,w2));
        this.objects.push(obj);
    }

    addCamera(pos = new Vector4(0,0,-1000,0), facing = new Vector4(0,0,1,0), up = new Vector4(1,0,0,0), right = new Vector4(0,-1,0,0), w = new Vector4(0,0,0,1), d = 1000){
        //adds camera to universe
        if (this.camera != undefined) {
            throw 'Cannot have more than one camera.';
        }
        this.camera = new Camera(pos, facing, up, right, w, d);
    }

    addCube(offset = new Vector4(0,0,0,0), outline=false){
        //Adds 4d cube to universe, translated by offset.
        var x = offset.x;
        var y = offset.y;
        var z = offset.z;
        var w = offset.w;
        var c1  = new Vector4(x,y,z,w);
        var c2  = new Vector4(100 + x,y,z,w);
        var c3  = new Vector4(x, 100 + y,0 + z,0 + w);
        var c4  = new Vector4(100 + x,100 + y,0 + z,0 + w);
        var c5  = new Vector4(0 + x,0 + y,100 + z,0 + w);
        var c6  = new Vector4(100 + x,0 + y,100 + z,0 + w);
        var c7  = new Vector4(x,100 + y,100 + z,0 + w);
        var c8  = new Vector4(100 + x,100 + y,100 + z,0 + w);
        var c9  = new Vector4(0 + x,0 + y,0 + z,100 + w);
        var c10 = new Vector4(100 + x,0 + y,0 + z,100 + w);
        var c11 = new Vector4(x,100 + y,0 + z,100 + w);
        var c12 = new Vector4(100 + x,100 + y,0 + z,100 + w);
        var c13 = new Vector4(0 + x,0 + y,100 + z,100 + w);
        var c14 = new Vector4(100 + x,0 + y,100 + z,100 + w);
        var c15 = new Vector4(x,100 + y,100 + z,100 + w);
        var c16 = new Vector4(100 + x,100 + y,100 + z,100 + w);
        var vectors = [c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11,c12,c13,c14,c15,c16];
        if(!outline){
            for(let i = 0; i < vectors.length; i++){
                let v = vectors[i]
                this.addPoint(v.x, v.y, v.z, v.w);
            }
        } else {
            for (let i = 0; i < 16; i ++ ){
                for(let j = i + 1; j < 16; j++){
                    if (bits(j ^ i) == 1){
                        this.addObject(new Line(vectors[i], vectors[j]))
                    }
                }
            }
        }
    }
}


function transform(vec, b1 = new Vector4(1,0,0,0), b2=new Vector4(0,1,0,0), b3=new Vector4(0,0,1,0), b4=new Vector4(0,0,0,1), offset=new Vector4(0,0,0,0)){
    //Gives the representation of the vector in the given basis.
    //Args:
    //  vec: Vector to be represented
    //  b1,v2,b3,b4: 4 vector4's representing the basis. Must be orthnormal.
    //  offset: position of the observer.
   vec = vec.sub(offset);
   return new Vector4(vec.dot(b1), vec.dot(b2), vec.dot(b3), vec.dot(b4));
}

function draw(canvas, Universe){
    // Renders the universe onto the canvas as the camerman would see it.

    /*
        Skeleton:
            Perform coordinate transformation on each vector in Universe (corresponding to camera's viewpoint)
            Of those objects which are in 'front' of the camera, display their 2-d projection onto the canvas.
    */
   
    // Transform objects to coordinate system centered on camera.
    var camera = Universe.camera;
    let ctx = canvas.getContext('2d');

    for(var i = 0; i < Universe.objects.length; i ++){
        let obj = Universe.objects[i];
        if (obj.constructor.name === "Point"){
            //vector from perspective of camera
            let v = transform(obj.pos, camera.right, camera.up, camera.forward, camera.w, camera.pos);
            

            // if the object lies in front of the camera
            if (v.z > 0){
                //Find coordinates with respect to the plane distance d in front of camera.
                let t = camera.d / v.z;
                let inPlane = v.mul(t);

                //draw
                ctx.fillStyle = obj.color;
                ctx.fillRect(inPlane.x - 2, inPlane.y - 2, 4,4);
            }
            
        }else if(obj.constructor.name === "Line"){
            let e1 = transform(obj.endpoint1, camera.right, camera.up, camera.forward, camera.w, camera.pos);
            let e2 = transform(obj.endpoint2, camera.right, camera.up, camera.forward, camera.w, camera.pos);
            // how do I handle lines?
            // if both points are behind the screen, don't draw
            // if both points are in front of the screen, draw
            // if one point is in front of the screen and one point behind...
            //  -let's get to that later
            if ((e1.z > 0) && (e2.z > 0)){
                let t1 = camera.d / e1.z;
                let t2 = camera.d / e2.z;

                let v1 = e1.mul(t1);
                let v2 = e2.mul(t2);

                ctx.fillStyle = obj.color;
                ctx.beginPath();
                ctx.moveTo(v1.x, v1.y);
                ctx.lineTo(v2.x, v2.y);
                ctx.stroke();
            }
        }
    }
}

function update(camera){
    let dt = 25;
    //updates state variables
    //Translations
    if(keyState["KeyW"]){
        //forward
        camera.pos = camera.pos.add(camera.forward.mul((dt/1000) * speed));
    }
    if(keyState["KeyA"]){
        //left
        camera.pos = camera.pos.add(camera.right.mul(-(dt/1000)* speed));
    }
    if(keyState["KeyS"]){
        //backward
        camera.pos = camera.pos.add(camera.forward.mul(-(dt/1000)* speed));
    }
    if(keyState["KeyD"]){
        //right
        camera.pos = camera.pos.add(camera.right.mul((dt/1000) * speed));
    }
    if(keyState["KeyE"]){
        //zorward
        camera.pos = camera.pos.add(camera.w.mul((dt/1000) * speed));
    }
    if(keyState["KeyZ"]){
        //backzard
        camera.pos = camera.pos.add(camera.w.mul((dt/1000) * speed));
    }

    //rotations

    /*discussion
        This is a tricky topic ... 
    */
}

//initialize canvas
var canvas = document.querySelector('canvas');
if(!canvas){throw 'must have a canvas'}
var width = canvas.width = document.querySelector('body').offsetWidth;
var height = canvas.height = document.querySelector('body').offsetHeight;
var ctx = canvas.getContext('2d');
if(!ctx){throw 'Shame on you! Initialize the context!'}
ctx.setTransform(1,0,0,-1,canvas.width/2, canvas.height/2);

//Add event listeners and link to program state
var keyState = {}
window.addEventListener('mousedown', (ev) => keyState.mousedown = true);
window.addEventListener('mouseup', (ev) => keyState.mousedown = false);
window.addEventListener('keydown', (ev) => keyState[ev.code] = true);
window.addEventListener('keyup', (ev) => setTimeout(()=> keyState[ev.code] = false, 5));
var body = document.querySelector('body');
window.addEventListener('resize', (ev) => {
    if(!canvas || !body){throw 'canvas/body not defined'};
    width = canvas.width = body.offsetWidth;
    height = canvas.height = body.offsetHeight;
    ctx.setTransform(1,0,0,-1,canvas.width/2, canvas.height/2);
});
//set universe constants
let speed = 200; // speed of translation on key input
let rot_speed = 1; //speed of rotation on mouse movement.

//initialize universe
var u = new Universe();
u.addCube(new Vector4(0,0,0, 0), true);


var callUpdate = setInterval(update, 25, u.camera);
function render(t){
    //clear
    ctx.clearRect(-width/2, -height/2, width, height);

    //draw
    draw(canvas, u);

    //repeat
    window.requestAnimationFrame(render);
}

window.addEventListener('load', render);

