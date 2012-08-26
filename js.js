var MGR = function(c, w, h, fps){
    var self = this,
        ctx = c.getContext("2d"),
        bodies = this.getBodies();

    this.interval = setInterval(function(){
        ctx.fillStyle = "rgba(0, 0, 0, .26)";
        self.rect(ctx,0,0,w,h);
        for (var i = 0; i < bodies.length; i++) {
            bodies[i] = bodies[i].draw(ctx, w, h, bodies);
        }
        bodies = self.cleanupBodies(bodies);
    }, fps);
};

MGR.prototype.getBodies = function(){
    var bodies = [
        new Body(8000, 300, 400, 0, -1.2),
        new Body(8000, 700, 400, 0, 1.2),
        new Body(500, 800, 400, 0, -2),
        new Body(500, 200, 400, 0, 2)
    ];
    
    return bodies;
};

MGR.prototype.cleanupBodies = function(bodies){
    var a = [],
        b;
    for (var i = 0; i < bodies.length; i++) {
        b = bodies[i];
        if (b.pieces.length) {
            a.push.apply(a,b.pieces);
            b.pieces = [];
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


var Body = function(m, x0, y0, vx0, vy0) {
    this.m = m;
    this.r = this.getRfromM(m);
    this.x = x0;
    this.y = y0;
    this.vx = vx0;
    this.vy = vy0;
    this.color = this.getUniqueColor();
    this.pieces = [];
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
// (16777215).toString(16); // ffffff
Body.prototype.getUniqueColor = function(){
    if(this.usedColors === undefined){
        this.usedColors = {};
    }
    var used = this.usedColors;
    var n;
    while(1) {
        n = Math.floor(Math.random() * 16777216);
        if(used[n] === undefined) { break; }
    }
    used[n] = 0;
    this.usedColors = used;
    return "#" + n.toString(16);
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
        m = this.m,
        bx = body.x,
        by = body.y,
        bm = body.m,
        rSquared = Math.pow(bx-x0,2) + Math.pow(by-y0,2),
        r = Math.sqrt(rSquared),
        G = .1, //6.674 * Math.pow(10, -11),
        F = G * m * bm / rSquared,
        Fx = F * (bx - x0) / r,
        Fy = F * (by - y0) / r;
    
    // Collision
    if (r <= body.r + this.r) {
        /*
        var d = (m - bm) / (m + bm),
            vx = d * this.vx,
            vy = d * this.vy;
        if (x0 > bx) {
            this.vx = -vx > 0 ? -vx : vx;
        }
        else {
            this.vx = -vx > 0 ? vx : -vx;
        }
        if (y0 > by) {
            this.vy = -vy > 0 ? -vy : vy;
        }
        else {
            this.vy = -vy > 0 ? vy : -vy;
        }
        */
    }
    
    return {x: Fx, y: Fy};
};

Body.prototype.consume = function(ctx, body){
    
};


Body.prototype.circle = function(ctx,x,y,r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);
    ctx.fill();
};

$(document).ready(function(){
	var w = -5 + (window.innerWidth || document.body.clientWidth),
        h = -5 + (window.innerHeight || document.body.clientHeight);
    
    $('#canvas-wrap').append('<canvas id="c" width="'+w+'" height="'+h+'"></canvas>');
    
    var mgr = new MGR(document.getElementById("c"), w, h, 10);
});