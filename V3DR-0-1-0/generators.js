const DEG_to_RAD = Math.PI/180;
const generators = [
    {
        name: "Example Object",     // name is the internal name, used for errors, etc.
        genID: "exm",               // genID is the string in the input used to generate the object.
                                    //      LENGTH MUST BE EXACTLY 3
                                    //      caps sensitive.
        
        generate: function() {},    // generate is the function to generate the object. It should NOT add to the scene,
                                    //      that will be handled elsewhere. You should, however, set the position & rotation.
    },
    { // cylinder
        name: "Cylinder",
        genID: "cyl",
        generate: function(pos, rot, radius, height, color, opacity=1) {
            let geometry = new THREE.CylinderGeometry(radius, radius, height, 32);

            let material = new THREE.MeshBasicMaterial();
            if(opacity<1){
                material.opacity = opacity;
                material.transparent = true;
            }
            material.color = new THREE.Color(color);

            let obj = new THREE.Mesh(geometry, material);
            
            obj.position.set(...pos);
            obj.rotation.set(rot[0]*DEG_to_RAD, rot[1]*DEG_to_RAD, rot[2]*DEG_to_RAD);

            return obj;
        }
    },
    { // line
        name: "Line",
        genID: "lin",
        generate: function(start, end, color, opacity) {
            let points = [];
            points.push(new THREE.Vector3(...start));
            points.push(new THREE.Vector3(...end));

            let geometry = new THREE.BufferGeometry().setFromPoints(points);

            let material = new THREE.LineBasicMaterial({color: color});
            if(opacity<1){
                material.opacity = opacity;
                material.transparent = true;
            }

            let line = new THREE.Line(geometry, material);
            return line;
        }
    },
    { // sphere
        name: "Sphere",
        genID: "sph",
        generate: function(pos, rot, radius, color, opacity=1) {
            let geometry = new THREE.SphereGeometry(radius, 32, 16);

            let material = new THREE.MeshBasicMaterial();
            if(opacity<1){
                material.opacity = opacity;
                material.transparent = true;
            }
            material.color = new THREE.Color(color);

            let obj = new THREE.Mesh(geometry, material);
            
            obj.position.set(...pos);
            obj.rotation.set(rot[0]*DEG_to_RAD, rot[1]*DEG_to_RAD, rot[2]*DEG_to_RAD);

            return obj;
        }
    },
    { // box
        name: "Box",
        genID: "box",
        generate: function(pos, rot, scl, color, opacity=1) {
            let geometry = new THREE.BoxGeometry(scl[0], scl[1], scl[2], 32, 16);

            let material = new THREE.MeshBasicMaterial();
            if(opacity<1){
                material.opacity = opacity;
                material.transparent = true;
            }
            material.color = new THREE.Color(color);

            let obj = new THREE.Mesh(geometry, material);
            
            obj.position.set(...pos);
            obj.rotation.set(rot[0]*DEG_to_RAD, rot[1]*DEG_to_RAD, rot[2]*DEG_to_RAD);

            return obj;
        }
    },
    { // cone
        name: "Cone",
        genID: "con",
        generate: function(pos, rot, radius, height, color, opacity=1) {
            let geometry = new THREE.ConeGeometry(radius, height, 32);

            let material = new THREE.MeshBasicMaterial();
            if(opacity<1){
                material.opacity = opacity;
                material.transparent = true;
            }
            material.color = new THREE.Color(color);

            let obj = new THREE.Mesh(geometry, material);
            
            obj.position.set(...pos);
            obj.rotation.set(rot[0]*DEG_to_RAD, rot[1]*DEG_to_RAD, rot[2]*DEG_to_RAD);

            return obj;
        }
    },
    { // plane
        name: "plane",
        genID: "pln",
        generate: function(pos, rot, width, height, color, opacity=1) {
            let geometry = new THREE.PlaneGeometry(width, height, 32, 16);

            let material = new THREE.MeshBasicMaterial();
            if(opacity<1){
                material.opacity = opacity;
                material.transparent = true;
            }
            material.color = new THREE.Color(color);

            let obj = new THREE.Mesh(geometry, material);
            
            obj.position.set(...pos);
            obj.rotation.set(rot[0]*DEG_to_RAD, rot[1]*DEG_to_RAD, rot[2]*DEG_to_RAD);

            return obj;
        }
    },
    { // pyramid
        name: "Pyramid",
        genID: "pyr",
        generate: function(pos, rot, radius /* max radius, point to point */, height, baseEdges, color, opacity=1) {
            let geometry = new THREE.ConeGeometry(radius, height, baseEdges);

            let material = new THREE.MeshBasicMaterial();
            if(opacity<1){
                material.opacity = opacity;
                material.transparent = true;
            }
            material.color = new THREE.Color(color);

            let obj = new THREE.Mesh(geometry, material);
            
            obj.position.set(...pos);
            obj.rotation.set(rot[0]*DEG_to_RAD, rot[1]*DEG_to_RAD, rot[2]*DEG_to_RAD);

            return obj;
        }
    },
    { // prism
        name: "Prism",
        genID: "prm",
        generate: function(pos, rot, radius /* max radius, point to point */, height, baseEdges, color, opacity=1) {
            let geometry = new THREE.CylinderGeometry(radius, radius, height, baseEdges);

            let material = new THREE.MeshBasicMaterial();
            if(opacity<1){
                material.opacity = opacity;
                material.transparent = true;
            }
            material.color = new THREE.Color(color);

            let obj = new THREE.Mesh(geometry, material);
            
            obj.position.set(...pos);
            obj.rotation.set(rot[0]*DEG_to_RAD, rot[1]*DEG_to_RAD, rot[2]*DEG_to_RAD);

            return obj;
        }
    },
    { // circle
        name: "Circle",
        genID: "crc",
        generate: function(pos, rot, radius, color, opacity=1) {
            let geometry = new THREE.CylinderGeometry(radius, radius, 0, 32);

            let material = new THREE.MeshBasicMaterial();
            if(opacity<1){
                material.opacity = opacity;
                material.transparent = true;
            }
            material.color = new THREE.Color(color);

            let obj = new THREE.Mesh(geometry, material);
            
            obj.position.set(...pos);
            obj.rotation.set(rot[0]*DEG_to_RAD, rot[1]*DEG_to_RAD, rot[2]*DEG_to_RAD);

            return obj;
        }
    },
    // { // sphere
    //     name: "Cylinder",
    //     genID: "cyl",
    //     generate: function(pos, rot, radius, color, opacity=1) {
    //         let geometry = new THREE.SphereGeometry(radius, 32, 16);

    //         let material = new THREE.MeshBasicMaterial();
    //         if(opacity<1){
    //             material.opacity = opacity;
    //             material.transparent = true;
    //         }
    //         material.color = new THREE.Color(color);

    //         let obj = new THREE.Mesh(geometry, material);
            
    //         obj.position.set(...pos);
    //         obj.rotation.set(rot[0]*DEG_to_RAD, rot[1]*DEG_to_RAD, rot[2]*DEG_to_RAD);

    //         return obj;
    //     }
    // },
    // { // sphere
    //     name: "Cylinder",
    //     genID: "cyl",
    //     generate: function(pos, rot, radius, color, opacity=1) {
    //         let geometry = new THREE.SphereGeometry(radius, 32, 16);

    //         let material = new THREE.MeshBasicMaterial();
    //         if(opacity<1){
    //             material.opacity = opacity;
    //             material.transparent = true;
    //         }
    //         material.color = new THREE.Color(color);

    //         let obj = new THREE.Mesh(geometry, material);
            
    //         obj.position.set(...pos);
    //         obj.rotation.set(rot[0]*DEG_to_RAD, rot[1]*DEG_to_RAD, rot[2]*DEG_to_RAD);

    //         return obj;
    //     }
    // },
    // { // sphere
        // name: "Cylinder",
        // genID: "cyl",
        // generate: function(pos, rot, radius, color, opacity=1) {
        //     let geometry = new THREE.SphereGeometry(radius, 32, 16);

        //     let material = new THREE.MeshBasicMaterial();
        //     if(opacity<1){
        //         material.opacity = opacity;
        //         material.transparent = true;
        //     }
        //     material.color = new THREE.Color(color);

        //     let obj = new THREE.Mesh(geometry, material);
            
        //     obj.position.set(...pos);
        //     obj.rotation.set(rot[0]*DEG_to_RAD, rot[1]*DEG_to_RAD, rot[2]*DEG_to_RAD);

        //     return obj;
        // }
    // }


];
