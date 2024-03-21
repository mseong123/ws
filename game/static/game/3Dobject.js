
import * as THREE from 'https://threejs.org/build/three.module.js';
import { global } from './global.js';
import { createFirstHalfCircleGeometry, createSecondHalfCircleGeometry } from './3Dpowerup.js';

function createArenaMesh(arena3D) {
	const arenaMaterial = new THREE.LineBasicMaterial( { color: global.arena.color } );
	
	const arenaMesh = [];
	for (let i = 0; i < global.arena.thickness; i++) {
		const arenaGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry( (global.clientWidth + i) / global.arena.widthDivision,
		(global.clientWidth + i) / global.arena.aspect / global.arena.widthDivision , (global.clientWidth + 1) / global.arena.aspect));
		arenaMesh.push(new THREE.LineSegments( arenaGeometry, arenaMaterial ));
		arena3D.add(arenaMesh[i]);
	}
	global.arenaMesh = arenaMesh;
}

function createPowerUpCircle(sphereMesh) {
	const firstHalfCircleGeometry = createFirstHalfCircleGeometry(global.sphere.circleRadius);
	const SecondHalfCircleGeometry = createSecondHalfCircleGeometry(global.sphere.circleRadius);
	const circleMaterial = new THREE.LineBasicMaterial( { color: "#fff", transparent:true, opacity:1});
	const firstHalfCircleMesh = new THREE.Line( firstHalfCircleGeometry, circleMaterial);
	const secondHalfCircleMesh = new THREE.Line( SecondHalfCircleGeometry, circleMaterial);
	firstHalfCircleMesh.visible = false;
	secondHalfCircleMesh.visible = false;
	sphereMesh.add(firstHalfCircleMesh);
	sphereMesh.add(secondHalfCircleMesh);

}

function createSphereMesh(arena3D) {
	const sphereGeometry = new THREE.SphereGeometry( global.sphere.radius, global.sphere.widthSegments, global.sphere.heightSegments );
	const sphereMaterial = new THREE.MeshPhongMaterial( { color: global.sphere.color, emissive: global.sphere.color, shininess:global.sphere.shininess, transparent:true, opacity:1 } );
	
	for (let i = 0; i < global.powerUp.ultimate.count; i++) {
		const sphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
		const sphereMeshProperty = {
			positionX:0,
			positionY:0,
			positionZ:0,
			velocityX:global.sphere.velocityX,
			velocityY:global.sphere.velocityY,
			velocityZ:global.sphere.velocityZ,
			opacity:1,
			visible:false,
			circleVisible:false,
			circleColor:"#fff",
			circleOpacity:1,
		}
		if (i === 0)
			sphereMeshProperty.visible = true;
		//create powerup surrounding circle timer
		createPowerUpCircle(sphereMesh);
		sphereMesh.castShadow=true;
		global.sphere.sphereMesh.push(sphereMesh);
		global.sphere.sphereMeshProperty.push(sphereMeshProperty);
		arena3D.add(sphereMesh);
	}
}

function createCamera() {
	const camera = new THREE.PerspectiveCamera( global.camera.fov, global.arena.aspect, global.camera.near, global.camera.far );
	camera.position.z = global.camera.positionZ;
	// camera.position.y = global.arena.width;
	// 	camera.rotation.x = -Math.PI/5
	return camera;
}

function createPaddleMesh(arena3D) {
	const colorPalette = global.paddle.color[global.gameplay.backgroundIndex];
	const paddleGeometry = new THREE.BoxGeometry(global.paddle.defaultWidth, global.paddle.defaultHeight, global.paddle.thickness )
	const paddlesProperty = global.paddle.paddlesProperty;
	for (let i = 0; i < global.paddle.maxPaddle; i++) {
		const paddleMaterial = new THREE.MeshPhongMaterial( { color: colorPalette[i], emissive: colorPalette[i], transparent:true, opacity:global.paddle.opacity });
		const paddleMeshPropertyTemplate = {
			visible:false,
			positionX:0,
			positionY:0,
			positionZ:0,
			largePaddle:0,
			invisibility:0,
			width:global.paddle.defaultWidth,
			height:global.paddle.defaultHeight
		}
		const paddleMesh = new THREE.Mesh(paddleGeometry, paddleMaterial);
		paddleMesh.castShadow = true;
		global.paddle.paddles.push(paddleMesh);
		paddlesProperty.push(paddleMeshPropertyTemplate);
		arena3D.add(paddleMesh);
	}
	//render initial paddle
	paddlesProperty[0].positionX = 0;
	paddlesProperty[0].positionY = 0;
	paddlesProperty[0].positionZ = (global.clientWidth / global.arena.aspect / 2) - (global.paddle.thickness * global.paddle.distanceFromEdgeModifier);
	paddlesProperty[0].visible = true;
	paddlesProperty[1].positionX = 0;
	paddlesProperty[1].positionY = 0;
	paddlesProperty[1].positionZ = -(global.clientWidth / global.arena.aspect / 2) + (global.paddle.thickness * global.paddle.distanceFromEdgeModifier);
	paddlesProperty[1].visible = true;

}

function createDirectionalLight(arena3D) {
	const directionalLight = new THREE.DirectionalLight(global.directionalLight.color, global.directionalLight.intensity);
	directionalLight.position.set(global.directionalLight.positionX,global.directionalLight.positionY, global.directionalLight.positionZ);
	global.directionalLight = directionalLight;
	arena3D.add(directionalLight);
}

function createPointLight(arena3D) {
	const pointLight = new THREE.PointLight(global.pointLight.color , global.pointLight.intensity, global.pointLight.distance);
	global.pointLight = pointLight;
	arena3D.add(pointLight);
}

function createShadowPlanes(arena3D) {
	const geometrySides = new THREE.PlaneGeometry( global.shadowPlane.sideWidth, global.shadowPlane.sideHeight );
	const geometryTopBottom = new THREE.PlaneGeometry( global.shadowPlane.TopBottomWidth, global.shadowPlane.sideHeight );
	const material = new THREE.ShadowMaterial({side:THREE.DoubleSide});
	material.opacity = global.shadowPlane.opacity;
	const shadowPlanes = [];

	//sides
	for (let i = 0; i < 2; i++) {
		const plane = new THREE.Mesh( geometrySides, material );
		plane.rotateX( Math.PI /2 );
		plane.rotateY( Math.PI /2 );
		plane.receiveShadow = true;
		arena3D.add( plane );
		shadowPlanes[i] = plane;
	}
	shadowPlanes[0].position.set(-global.clientWidth / global.arena.widthDivision / 2, 0, 0);
	shadowPlanes[1].position.set(global.clientWidth / global.arena.widthDivision / 2, 0, 0);
	//top bottom
	for (let i = 2; i < 4; i++) {
		const plane = new THREE.Mesh( geometryTopBottom, material );
		plane.rotateX( Math.PI /2 );
		plane.receiveShadow = true;
		arena3D.add( plane );
		shadowPlanes[i] = plane;
	}
	shadowPlanes[2].position.set(0, global.clientWidth / global.arena.aspect/ global.arena.widthDivision / 2, 0);
	shadowPlanes[3].position.set(0,-global.clientWidth / global.arena.aspect/ global.arena.widthDivision / 2, 0);
	global.shadowPlanes = shadowPlanes;
}



export { createArenaMesh, createSphereMesh, createCamera, createPaddleMesh, createDirectionalLight, createPointLight, createShadowPlanes}