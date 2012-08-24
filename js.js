var MGR = function(c, w, h, fps){
    var self = this,
        ctx = c.getContext("2d"),
        bodies = this.getBodies();

    this.interval = setInterval(function(){
        ctx.fillStyle = "rgba(0, 0, 0, .2)";
        self.rect(ctx,0,0,w,h);
        for (var i = 0; i < bodies.length; i++) {
            bodies[i] = bodies[i].draw(ctx, w, h, bodies);
        }
        bodies = self.cleanupBodies(bodies);
    }, fps);
};

// (16777215).toString(16); // ffffff
MGR.prototype.getUniqueColor = function(){
    if(this.usedColors === undefined){
        this.usedColors = {"#":0};
    }
    var used = this.usedColors;
    var a = ["5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    
    do {
        var s = "#";
        var c = 6;
        while(c--) {
            s += a[Math.floor(Math.random() * a.length)];
        }
    } while(used[s] !== undefined);
    
    this.usedColors[s] = 0;

    return s;
};

MGR.prototype.getBodies = function(){
    var bodies = [
        new Body(400, 400, 0, 0, 10000, this.getUniqueColor()),
        new Body(330, 400, 0, 4, 10, this.getUniqueColor()),
        new Body(260, 400, 0, 3, 10, this.getUniqueColor()),
        new Body(190, 400, 0, 2, 10, this.getUniqueColor()),
        new Body(470, 400, 0, -4, 10, this.getUniqueColor()),
        new Body(540, 400, 0, -3, 10, this.getUniqueColor()),
        new Body(610, 400, 0, -2, 10, this.getUniqueColor())
    ];
    
    return bodies;
};

MGR.prototype.cleanupBodies = function(bodies){
    var a = [],
        b;
    for (var i = 0; i < bodies.length; i++) {
        b = bodies[i];
        if (b.children.length) {
            a.push.apply(a,b);
            b.children = [];
        }
        if (b.m > 0) {
            a.push(b);
        }
    }
    return a;
};

MGR.prototype.rect = function(ctx,x,y,w,h) {
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.closePath();
    ctx.fill();
};

MGR.prototype.kill = function(){
    var self = this;
    clearInterval(self.interval);
};


var Body = function(ix, iy, ivx, ivy, m, color) {
    this.x = ix;
    this.y = iy;
    this.vx = ivx;
    this.vy = ivy;
    this.m = m;
    this.r = this.getRfromM(m);
    this.color = color;
    this.children = [];
};
Body.prototype.draw = function(ctx, w, h, otherBodies) {
    ctx.fillStyle = this.color;
    this.circle(ctx,this.x,this.y,this.r);
    
    this.update(ctx, w, h, otherBodies);
    return this;
};

Body.prototype.getRfromM = function(m){
    return Math.ceil(.4 + m/300);
};

Body.prototype.update = function(ctx, w, h, otherBodies) {
    var x0 = this.x,
        y0 = this.y,
        Fx = 0, 
        Fy = 0;
    
    var b, f;
    for (var i = 0; i < otherBodies.length; i++) {
        b = otherBodies[i];
        if (b.color !== this.color) {
            f = this.F(b);
            //this.G(ctx, b);
            Fx += f.x;
            Fy += f.y;
        }
    }
    
    var newVx = this.vx + (Fx / this.m);
    var newVy = this.vy + (Fy / this.m);

    this.vx = newVx;
    this.vy = newVy;
    
    var x1 = x0 + this.vx,
        y1 = y0 + this.vy;
    
    if (x1 > w || x1 < 0) {
        this.vx = -0.8 * this.vx;
        this.x = x0 + this.vx;
    }
    else {
        this.x = x1;
    }
    if (y1 > h || y1 < 0) {
        this.vy = -0.8 * this.vy;
        this.y = y0 + this.vy;
    }
    else {
        this.y = y1;
    }
};

Body.prototype.F = function(body){
    var x0 = this.x,
        y0 = this.y,
        bx = body.x,
        by = body.y,
        bm = body.m,
        rSquared = Math.pow(bx-x0,2) + Math.pow(by-y0,2),
        r = Math.sqrt(rSquared),
        G = .1, //6.674 * Math.pow(10, -11),
        F = G * this.m * bm / rSquared,
        Fx = F * (bx - x0) / r,
        Fy = F * (by - y0) / r;
    
    // Collision
    if (r <= body.r + this.r) {
        
    }
    
    return {x: Fx, y: Fy};
};

Body.prototype.G = function(ctx, body){
    var x0 = this.x,
        y0 = this.y,
        bx = body.x,
        by = body.y;
    
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(bx, by);
    ctx.closePath();
    ctx.strokeStyle = "#a0c6ff";
    ctx.stroke();
};

Body.prototype.consume = function(ctx, body){
    
};


Body.prototype.circle = function(ctx,x,y,r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);
    ctx.fill();
};

$(document).ready(function(){
	var w = window.innerWidth || document.body.clientWidth,
        h = window.innerHeight || document.body.clientHeight;
    
    $('#canvas-wrap').append('<canvas id="c" width="'+w+'" height="'+h+'"></canvas>');
    
    var mgr = new MGR(document.getElementById("c"), w, h, 10);
});