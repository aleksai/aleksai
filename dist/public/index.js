let robot;
let frame;

function setup() {
	createCanvas(window.innerWidth, window.innerHeight, WEBGL);
	angleMode(DEGREES);
	robot = loadModel('cursor.obj', true);
}

function draw() {
	frame = millis();

	background(0, 0, 255);

	scale(7);

	var y = mouseY;
	y = y < 0 ? 0 : y;
	y = y > height ? height : y;
	y = (y / height - 0.5) * 2;

	rotateX(85 + (y * 14));
	rotateZ(0.02 * frame);

	normalMaterial();
	model(robot);
}

// function frameWithMax(max) {
// 	return frameFromWithMax(0, max);
// }

// function frameFromWithMax(from, max) {
// 	var virtualFrame = frame - from;
// 	virtualFrame = virtualFrame < 0 ? 0 : virtualFrame;
// 	return virtualFrame > max ? max : virtualFrame;
// }