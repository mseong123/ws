import * as THREE from 'https://threejs.org/build/three.module.js';
import { global } from './global.js';
import { resetPowerUp } from "./gameplay.js"

function createFirstHalfCircleGeometry(radius) {
	const circleRadius = radius;
	const circleSegments = 32;
	const circlePoints = [];
	
	for (let i = 0; i <= 12; i++) {
		{
			const theta = (i / circleSegments) * Math.PI * 2;
			const x = circleRadius * Math.cos(theta);
			const y = circleRadius * Math.sin(theta);
			const z = 0; // Set to 0 to lie on the surface of the sphere
			circlePoints.push(new THREE.Vector3(x, y, z));
		}
	}
	return new THREE.BufferGeometry().setFromPoints(circlePoints);
}

function createSecondHalfCircleGeometry(radius) {
	const circleRadius = radius;
	const circleSegments = 32;
	const circlePoints = [];
	
	for (let i = 16; i <= 28; i++) {
		{
			const theta = (i / circleSegments) * Math.PI * 2;
			const x = circleRadius * Math.cos(theta);
			const y = circleRadius * Math.sin(theta);
			const z = 0; // Set to 0 to lie on the surface of the sphere
			circlePoints.push(new THREE.Vector3(x, y, z));
		}
	}
	return new THREE.BufferGeometry().setFromPoints(circlePoints);
}

function createLargePaddle(arena3D, sphereGeometry, firstHalfCircleGeometry, SecondHalfCircleGeometry, meshProperty) {
	const sphereMaterial = new THREE.MeshPhongMaterial( { color: global.powerUp.color[0], emissive: global.powerUp.color[0], shininess:global.powerUp.shininess} );
	const circleMaterial = new THREE.LineBasicMaterial( { color: global.powerUp.color[0]} );
	const largePaddleSphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
	const firstHalfCircleMesh = new THREE.Line( firstHalfCircleGeometry, circleMaterial);
	const secondHalfCircleMesh = new THREE.Line( SecondHalfCircleGeometry, circleMaterial);
	
	largePaddleSphereMesh.add(firstHalfCircleMesh);
	largePaddleSphereMesh.add(secondHalfCircleMesh);
	largePaddleSphereMesh.visible = false;
	global.powerUp.mesh.push(largePaddleSphereMesh);
	global.powerUp.meshProperty.push({...meshProperty});
	arena3D.add(largePaddleSphereMesh);
}

function createShake(arena3D, sphereGeometry, firstHalfCircleGeometry, SecondHalfCircleGeometry, meshProperty) {
	const sphereMaterial = new THREE.MeshPhongMaterial( { color: global.powerUp.color[1], emissive: global.powerUp.color[1], shininess:global.powerUp.shininess} );
	const circleMaterial = new THREE.LineBasicMaterial( { color: global.powerUp.color[1]} );
	const shakeSphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
	const firstHalfCircleMesh = new THREE.Line( firstHalfCircleGeometry, circleMaterial);
	const secondHalfCircleMesh = new THREE.Line( SecondHalfCircleGeometry, circleMaterial);

	shakeSphereMesh.add(firstHalfCircleMesh);
	shakeSphereMesh.add(secondHalfCircleMesh);
	shakeSphereMesh.visible = false;
	global.powerUp.mesh.push(shakeSphereMesh);
	global.powerUp.meshProperty.push({...meshProperty});
	arena3D.add(shakeSphereMesh);
}

function createInvisibility(arena3D, sphereGeometry, firstHalfCircleGeometry, SecondHalfCircleGeometry, meshProperty) {
	const sphereMaterial = new THREE.MeshPhongMaterial( { color: global.powerUp.color[2], emissive: global.powerUp.color[2], shininess:global.powerUp.shininess });
	const circleMaterial = new THREE.LineBasicMaterial( { color: global.powerUp.color[2], transparent:true, opacity:1 } );
	const invisibilitySphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
	const firstHalfCircleMesh = new THREE.Line( firstHalfCircleGeometry, circleMaterial );
	const secondHalfCircleMesh = new THREE.Line( SecondHalfCircleGeometry, circleMaterial );

	invisibilitySphereMesh.add(firstHalfCircleMesh);
	invisibilitySphereMesh.add(secondHalfCircleMesh);
	invisibilitySphereMesh.visible = false;
	global.powerUp.mesh.push(invisibilitySphereMesh);
	global.powerUp.meshProperty.push({...meshProperty});
	arena3D.add(invisibilitySphereMesh);
}

function createDouble(arena3D, sphereGeometry, firstHalfCircleGeometry, SecondHalfCircleGeometry, meshProperty) {
	const sphereMaterial = new THREE.MeshPhongMaterial( { color: global.powerUp.color[3], emissive: global.powerUp.color[3], shininess:global.powerUp.shininess} );
	const circleMaterial = new THREE.LineBasicMaterial( { color: global.powerUp.color[3]} );
	const doubleSphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
	const firstHalfCircleMesh = new THREE.Line( firstHalfCircleGeometry, circleMaterial);
	const secondHalfCircleMesh = new THREE.Line( SecondHalfCircleGeometry, circleMaterial);

	doubleSphereMesh.add(firstHalfCircleMesh);
	doubleSphereMesh.add(secondHalfCircleMesh);
	doubleSphereMesh.visible = false;
	global.powerUp.mesh.push(doubleSphereMesh);
	global.powerUp.meshProperty.push({...meshProperty});
	arena3D.add(doubleSphereMesh);
}

function createUltimate(arena3D, sphereGeometry, firstHalfCircleGeometry, SecondHalfCircleGeometry, meshProperty) {
	const sphereMaterial = new THREE.MeshPhongMaterial( { color: global.powerUp.color[4], emissive: global.powerUp.color[4], shininess:global.powerUp.shininess} );
	const circleMaterial = new THREE.LineBasicMaterial( { color: global.powerUp.color[4]} );
	const ultimateSphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
	const firstHalfCircleMesh = new THREE.Line( firstHalfCircleGeometry, circleMaterial);
	const secondHalfCircleMesh = new THREE.Line( SecondHalfCircleGeometry, circleMaterial);
	

	ultimateSphereMesh.add(firstHalfCircleMesh);
	ultimateSphereMesh.add(secondHalfCircleMesh);
	ultimateSphereMesh.visible = false;
	global.powerUp.mesh.push(ultimateSphereMesh);
	global.powerUp.meshProperty.push({...meshProperty});
	arena3D.add(ultimateSphereMesh);
}

function createPowerUp(arena3D) {
	
	const sphereGeometry = new THREE.SphereGeometry( global.powerUp.radius, global.powerUp.widthSegments, global.powerUp.heightSegments );
	const firstHalfCircleGeometry = createFirstHalfCircleGeometry(global.powerUp.circleRadius);
	const SecondHalfCircleGeometry = createSecondHalfCircleGeometry(global.powerUp.circleRadius);
	const meshProperty = {
		positionX:0,
		positionY:0,
		positionZ:0,
		visible:false
	}

	//create all powerUp objects
	createLargePaddle(arena3D, sphereGeometry, firstHalfCircleGeometry, SecondHalfCircleGeometry, meshProperty);
	createShake(arena3D, sphereGeometry, firstHalfCircleGeometry, SecondHalfCircleGeometry, meshProperty);
	createInvisibility(arena3D, sphereGeometry, firstHalfCircleGeometry, SecondHalfCircleGeometry, meshProperty);
	createDouble(arena3D, sphereGeometry, firstHalfCircleGeometry, SecondHalfCircleGeometry, meshProperty);
	createUltimate(arena3D, sphereGeometry, firstHalfCircleGeometry, SecondHalfCircleGeometry, meshProperty);

	//enable powerup for starting screen
	resetPowerUp()
}

export { createFirstHalfCircleGeometry, createSecondHalfCircleGeometry, createPowerUp }

