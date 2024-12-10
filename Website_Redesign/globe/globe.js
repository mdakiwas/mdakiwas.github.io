import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { updateMarkerInfo } from '../script.js';

import { getStarfield } from "./src/getStarfield.js";

console.log("Globe.js script is loaded");

let renderer;

export function initGlobe() {
    console.log("globe rendering");

    const globeContainer = document.getElementById('globe-container');
    console.log(globeContainer);
    console.log('Container size:', globeContainer.offsetWidth, globeContainer.offsetHeight);

    if (renderer) {
        renderer.dispose();
        globeContainer.innerHTML = '';
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, globeContainer.offsetWidth / globeContainer.offsetHeight, 0.1, 1000);

    // Create Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    console.log("render check created: ", renderer);
    renderer.setSize(globeContainer.offsetWidth, globeContainer.offsetHeight);
    globeContainer.appendChild(renderer.domElement);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const radius = 5;
    const globeCenter = latLonToVector3(0, 0, radius);
    const loader = new THREE.TextureLoader();
    const globeMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load("globe/textures/8081_earthmap2k.jpg"),
        specularMap: new THREE.TextureLoader().load("globe/textures/earthspec1k.jpg"),
        bumpMap: new THREE.TextureLoader().load("globe/textures/earthbump1k.jpg"),
        bumpScale: 0.04,
    });
    if (globeMaterial.map == null || globeMaterial.specularMap == null || globeMaterial.bumpMap == null) {

        globeMaterial = new THREE.MeshBasicMaterial({ color: 0x0077ff });
    }
    const globeGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globeMesh);

    const cloudsMaterial = new THREE.MeshBasicMaterial({
        map: loader.load("globe/textures/earthcloudmap.jpg"),
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        alphaMap: loader.load("globe/textures/earthcloudmaptrans.jpg"),
    })
    const cloudsMesh = new THREE.Mesh(globeGeometry, cloudsMaterial);
    cloudsMesh.scale.setScalar(1.005);
    scene.add(cloudsMesh);

    /*const stars = getStarfield({ numStars: 2000 });
    scene.add(stars);*/

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    let cameraDistance = 1.25;
    const cameraPosition = globeCenter.clone().multiplyScalar(cameraDistance);

    camera.position.copy(cameraPosition);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = radius * 1.1;  // Minimum distance the camera can zoom in (set this to be larger than the radius of your globe)
    controls.maxDistance = radius * 2; // Maximum distance the camera can zoom out

    controls.maxPolarAngle = Math.PI / 2;  // Keep the camera from rotating below the globe's equator    


    function updateCameraWithLocation(latitude, longitude) {
        const direction = latLonToVector3(latitude, longitude, 15).normalize();
        const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        const newPosition = direction.multiplyScalar(distance);

        camera.position.copy(newPosition);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        controls.update();
    }

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`User location: Latitude ${latitude}, Longitude ${longitude}`);
                updateCameraWithLocation(latitude, longitude);
            },
            (error) => {
                console.error("Error accessing location:", error.message);
                alert("Unable to access your location. Default camera position will be used.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }


    function latLonToVector3(latitude, longitude, radius) {
        const phi = (90 - latitude) * (Math.PI / 180);
        const theta = (longitude + 180) * (Math.PI / 180);

        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
    }

    // Markers Array
    const markers = [];

    function addMarkers(airports) {
        airports.forEach(airport => {
            const { lat, lon, name, city, country, code } = airport;

            // Convert latitude and longitude to 3D position
            const position = latLonToVector3(parseFloat(lat), parseFloat(lon), radius + 0.01);

            // Create a unique material for each marker
            const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

            // Create the marker mesh
            const markerGeometry = new THREE.SphereGeometry(0.2, 15, 15);
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);


            marker.position.copy(position);
            marker.userData = { name, city, country, code};
            /*const boxHelper = new THREE.BoxHelper(marker, 0xffff00);
            marker.userData.boxHelper = boxHelper;
            scene.add(boxHelper);*/

            scene.add(marker);
            markers.push(marker);

            console.log(`Added marker for ${name} (${code}) at (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
        });
    }

    fetch('airports.json')
        .then(response => response.json())
        .then(data => addMarkers(data))
        .catch(error => console.error('Error loading JSON:', error));


    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 1;
    const mouse = new THREE.Vector2();

    let hoveredMarker = null;
    let selectedMarker = null;

    function onMouseMove(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markers, true);

        if (hoveredMarker && hoveredMarker !== selectedMarker) {
            hoveredMarker.material.color.set(0xff0000);
        }

        if (intersects.length > 0) {
            hoveredMarker = intersects[0].object;
            if (hoveredMarker !== selectedMarker) {
                hoveredMarker.material.color.set(0x00ff00);
            }
        } else {
            hoveredMarker = null;
        }
    }

    let selectedMarkerData = null;

    function onMouseClick(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markers, true);

        if (intersects.length > 0) {
            const clickedMarker = intersects[0].object;
            console.log(clickedMarker);

            if (selectedMarker) {
                selectedMarker.material.color.set(0xff0000);
            }

            selectedMarker = clickedMarker;
            selectedMarker.material.color.set(0x0000ff);

            const { city, country, code } = selectedMarker.userData;
            const selectedMarkerData = [];

            if (city) selectedMarkerData.push(`${city}`);
            if (country) selectedMarkerData.push(`${country}`);
            if (code) selectedMarkerData.push(`${code}`);

            const formattedData = selectedMarkerData.join(", ");

            if (formattedData) {
                if (typeof window.updateMarkerInfo === "function") {
                    console.log("Calling updateMarkerInfo with data:", formattedData);
                    window.updateMarkerInfo(formattedData);
                } else {
                    console.error("updateMarkerInfo is not defined or not a function");
                }
            } else {
                console.error("No valid data found for the clicked marker");
            }
        }
        console.log(`Clicked on marker ${selectedMarkerData}`);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        //stars.rotation.y -= 0.0002;
        controls.update();

        markers.forEach(marker => {
            const distance = marker.position.distanceTo(camera.position);
            const scaleFactor = distance / 20;
            marker.scale.set(scaleFactor, scaleFactor, scaleFactor);
        });

        renderer.render(scene, camera);
    }

    animate();

    function handleWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleWindowResize, false);
    console.log("globe rendering complete");
}

export function disposeGlobe() {
    if (renderer) {
        renderer.dispose();
        const globeContainer = document.getElementById('globe-container');
        globeContainer.innerHTML = '';
    }
}