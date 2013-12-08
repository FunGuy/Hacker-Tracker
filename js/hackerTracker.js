	

var GUI = (function() {

	var gui = {
		_controller: null,

		setController: function(controller) {
			controller.on('sound:add', function(data) {
			});
			controller.on('sound:remove', function(data) {
			});
			controller.on('sound:frequency', function(data) {
			});

			this._controller = controller;
		}

	};
	_.extend(gui, Events);

	window.addEventListener("load", function () {
		init();
		createAlotOfCubes();
		animate();
	}, false);


	/* S - Basic Variables */
	var camera;
	var scene;
	var renderer;
	var geometry;
	var material;
	var mesh;

	var controls;

	var numberOfRows = 8;
	var numberOfColums = 8;

	var currentInstrument = [];

	var cubes = [];
	var cubesBacklit = [];
	var materials = [];
	var materialColors = [];
	var meshes = [];
	var meshesBacklit = [];

	var upOrDown = [];
	var currSize = [];

	var bouncy = false;

	var selectedBox;
	var oldSelectedMaterial;

	var pointerDetectRay, projector, mouse2D;

	var datGui, datGuiContainer, dontMoveThatGuiContainer = false;

	var GUIHeightOffset = 100;

	var currentlyClickedObject;

	var pitches = [];


	var block;





	/* E - Basic Variables */


	function initGUI()
	{
		this.Pitch = 0.0;
		this.Remove = function () {

			/* somehow it selected the above one*/
			if(currentlyClickedObject.name.indexOf("backLit") == -1)
			{
				currentlyClickedObject = scene.getObjectByName(currentlyClickedObject.name + "backLit");
			}

			currentlyClickedObject.material = new THREE.MeshBasicMaterial( { color: materialColors[0], wireframe: false, side: THREE.BackSide} );

			var objAboveName = scene.getObjectByName(getIndex(currentlyClickedObject));
			objAboveName.position.y = -3;
			objAboveName.visible = false;

			objAboveName.material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false, side: THREE.BackSide} );			

			pitches[getIndex(currentlyClickedObject)] = 50;
			currentInstrument[getIndex(currentlyClickedObject)] = 0;

			datGuiContainer.style.display = "none";
		};

	}

	function getIndex(obj)
	{
		return obj.name.split("backLit")[0];
	}

	window.onload = function(){
		block = new initGUI();
		datGui = new dat.GUI();

		datGui.add(block,"Remove");
		var p = datGui.add(block,"Pitch", 0, 100);
		p.onChange(function(event)
			{
				pitches[getIndex(currentlyClickedObject)] = block.Pitch;
			});
		p.listen();

		datGuiContainer = document.querySelector("div.dg.ac");
		datGuiContainer.style.display = "none";

		var closeBtn = document.querySelector("div.close-button");
		closeBtn.addEventListener("click",function(event){
			datGuiContainer.style.display = "none";
		}, false);
	}

	function isDatGuiContainer (elem) {
	 while(elem.parentNode) {
	  if(elem.parentNode == datGuiContainer)
	   return true;
	  elem = elem.parentNode;
	 }
	 return false;
	}

	function onDocumentMouseMove(event) {
	    //event.preventDefault();
	    mouse2D.x = (event.clientX / window.innerWidth) * 2 - 1;
	    mouse2D.y = -(event.clientY / window.innerHeight) * 2 + 1;
	    mouse2D.wx = event.clientX;
	    mouse2D.wy = event.clientY;
	}
	function onDocumentMouseUp(event) {

	}
	function onDocumentMouseDown(event) {
		pointerDetectRay = projector.pickingRay(mouse2D.clone(), camera);
		var intersects = pointerDetectRay.intersectObjects(scene.children);
		
		var hasIntersected = false;

		var isDefaultInstrument = false;

		if (intersects.length > 0) {
			hasIntersected = true;
			var obj2 = intersects[0].object;
			var str2 = getIndex(obj2);		
			if(currentInstrument[str2]%5 == 0)
			{
				isDefaultInstrument = true;
			}
		}
	    switch (event.which) {
	        case 1:
	        	if(hasIntersected)
	        	{
	        		if(datGuiContainer.style.display != "block")
	        		{
	        			var obj = intersects[0].object;
						var str = obj.name.split("backLit")[0];
						if(!scene.getObjectByName(str).visible)
						{
							currentInstrument[getIndex(obj)] += 1;
							obj.material = new THREE.MeshBasicMaterial( { color: materialColors[currentInstrument[str]%5], wireframe: false } );
						}
						gui.trigger('block:clicked', {
							which: 1,
							row: -1,
							col: -1
						});
	        		}			
				}
				if(!isDatGuiContainer(event.target))
				{
					datGuiContainer.style.display = "none";
				}
				//datGuiContainer.style.display = "none";
	            break;
	        case 2:
	            //alert('Middle mouse button pressed');
	            break;
	        case 3:
	            //alert('Right mouse button pressed');
	            gui.trigger('block:clicked', {
					which: 3,
					row: -1,
					col: -1
				});

	            /*Show Context Menu*/
	            if(isDatGuiContainer(event.target))
	            {
				   dontMovedatguiContainer = true;			   
				}
				else
				{
				   dontMovedatguiContainer = false;
				}

				if(hasIntersected && !dontMovedatguiContainer && !isDefaultInstrument)
				{
					datGui.open();
				    datGuiContainer.style.display = "block";
				    datGuiContainer.style.top = (mouse2D.wy - GUIHeightOffset) + "px";
				    datGuiContainer.style.right = (window.innerWidth - mouse2D.wx - datGui.width/2) + "px";
		            /*Lock the tile*/
		            var obj = intersects[0].object;
		            if(obj.name.indexOf("backLit") == false)
		            {
		            	currentlyClickedObject = scene.getObjectByName(obj.name+"backLit")
		        	}else
		            	currentlyClickedObject = obj;

		            var str = getIndex(obj);
		            if(currentInstrument[str] %5 != 0)
		            {
		            	scene.getObjectByName(str).position.y = 0.25;
						scene.getObjectByName(str).visible = true;
					}
				    block.Pitch = pitches[getIndex(currentlyClickedObject)];
				}
				else
				{
				   datGuiContainer.style.display = "none";
				}

	            break;
	        default:
	            //alert('You have a strange mouse');
	    }
	}
	function init()
	{

		/*Camera settings*/
		camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.z = 2;
		camera.position.x = 0;
		camera.position.y = 11;
		/*Create the scene*/
		scene = new THREE.Scene();
		/*Set the Renderer to a Canvas Renderer and set it's size*/
		renderer = new THREE.WebGLRenderer({antialias: true});
		renderer.setSize( window.innerWidth, window.innerHeight);
		
		/*set controls*/
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.userRotateSpeed = 10;
		//controls = new THREE.OrbitControls( camera );
		//controls.addEventListener( 'change', renderer );
		//controls.addEventListener( 'change', render );

		/* raycast */
		pointerDetectRay = new THREE.Raycaster();
		pointerDetectRay.ray.direction.set(0, -1, 0);
		projector = new THREE.Projector();
		mouse2D = new THREE.Vector3(0, 0, 0);

		document.addEventListener("mousemove",onDocumentMouseMove, false);
		document.addEventListener("mouseup",onDocumentMouseUp, false);
		document.addEventListener("mousedown",onDocumentMouseDown, false);

		window.addEventListener( 'resize', onWindowResize, false );

		document.body.appendChild( renderer.domElement );
	}

	function createAlotOfCubes()
	{
		materialColors[0] = 0x888888;
		materialColors[1] = 0x0066CC;
		materialColors[2] = 0x330066;
		materialColors[3] = 0x33FFCC;
		materialColors[4] = 0xFF9900;
		for(var l = 0; l < numberOfRows*numberOfColums; l++)
		{
			pitches[l] = 50;
			currentInstrument[l] = 0;
			if(Math.floor(Math.random()+0.5) == 0)
			{
				upOrDown[l] = true;
			}
			else
			{
				upOrDown[l] = false;
			}

			cubes[l] = new THREE.CubeGeometry(0.5,0.1,0.5);
			cubesBacklit[l] = new THREE.CubeGeometry(1,0.1,1);

			materials.push(new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } ));

			var obj = new THREE.Mesh( cubes[l], materials[l]);
			obj.name = ""+l;

			var obj2 = new THREE.Mesh( cubesBacklit[l],
			 new THREE.MeshBasicMaterial( { color: materialColors[0], wireframe: false, side: THREE.BackSide} ));
			
			obj2.name = l+"backLit";


			meshes.push(obj);
			meshesBacklit.push(obj2);
		}
		

		var sizeX = 1;
		var sizeZ = 1;

		var paddingX = 0.2;
		var paddingZ = 0.2;

		var startX = -((numberOfRows * (sizeX + paddingX)) / 2);
		var startZ = -((numberOfColums * (sizeZ + paddingZ)) / 2);

		for(var i = 0 ; i < numberOfRows; i++)
		{
			for(var j = 0 ; j < numberOfColums; j++)
			{
				meshes[(i*numberOfColums) + j].position.x = startX + (i * (sizeX + paddingX)); 
				meshes[(i*numberOfColums) + j].position.y = meshes[(i*numberOfColums) + j].position.y + 0.25;
				meshes[(i*numberOfColums) + j].position.z = startZ + (j * (sizeZ + paddingZ)); 

				meshesBacklit[(i*numberOfColums) + j].position.x = startX + (i * (sizeX + paddingX)); 
				meshesBacklit[(i*numberOfColums) + j].position.z = startZ + (j * (sizeZ + paddingZ));
			}
		}
		
		for(var u = 0; u < numberOfRows*numberOfColums; u++)
		{
			scene.add(meshes[u]);
			scene.getObjectByName(meshes[u].name).position.y = -3;
			scene.getObjectByName(meshes[u].name).visible = false;
			scene.add(meshesBacklit[u]);
		}	
	}
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function animate()
	{
		/*forcelock*/
		camera.position.z = 2;
		camera.position.x = 0;
		camera.position.y = 8;	

		requestAnimationFrame( animate );
		//controls.update();
		camera.lookAt(new THREE.Vector3( 0, 0, 0 ));

		var target = -camera.position;
		var cameraUp = camera.matrixWorld * new THREE.Vector4(0,1,0,0);
		var cameraRight = camera.matrixWorld * new THREE.Vector4(1,0,0,0);
		var cameraForward = camera.matrixWorld * new THREE.Vector4(0,0,-1,0);

		/*time*/
		//var time = performance.now() * 0.001;

		//camera.position = new THREE.Vector3(800,500,800);
		//camera.position = new THREE.Vector3(Math.cos(time)*1,500,Math.sin(time)*1);

		/*scene traverse game objects*/

		scene.traverse (function (object)
		{	
			if(bouncy)
			{
				var backLitName = [];
				backLitName[0] = "";
				if(getIndex(object) != -1)
				{
					backLitName = getIndex(object);
				}
				/* check if up or down */
				if(upOrDown[object.name] || upOrDown[backLitName[0]])
				{
					/*time to scale positive*/

					/*are you high enough?*/
					if(object.scale.y > -0.1)
					{
						/* that is high enough! Go down*/
						upOrDown[object.name] = false;
					}
					else
					{
						object.scale.set(object.scale.x,object.scale.y+=0.1, object.scale.z);
						object.position.y -= 0.05;
					}
				}
				else
				{
					/*are you low enough?*/
					if(object.scale.y < -currSize[object.name])
					{
						/* that is low enough! Go up*/
						upOrDown[object.name] = true;
					}
					else
					{
						object.scale.set(object.scale.x,object.scale.y-=0.1 ,object.scale.z);
						object.position.y += 0.05;
					}
				}
			}
		});

		renderer.render( scene, camera );
	}

	

	return gui;

}());