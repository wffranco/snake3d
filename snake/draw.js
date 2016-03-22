/**
 * for any help with the 3d canvas modeling visit http://threejs.org/
 */

(function(){
	var materials={};
	window.Draw={
		depth:.4,
		material:function(str,unique){
			if(str&&(!materials[str]||unique)){
				var obj={};
				var color=str.match(/#(([0-9a-f]{3}){1,2})/i);
				if(color&&color[1]) eval('obj.color=0x'+color[1].replace(/^((.)(.)(.)|(.{6}))$/,'$2$2$3$3$4$4$5')+';');
				if(str.match('.wf')) obj.wireframe=true;
				if(str.match('.ba')) obj.blending=THREE.AdditiveBlending;
				if(str.match('.bs')) obj.blending=THREE.SubtractiveBlending;

				if(unique) return new THREE.MeshBasicMaterial(obj);
				materials[str]=new THREE.MeshBasicMaterial(obj);
			}
			return materials[str];
		},
		materials:function(){
			var i,list=[];
			for(i=0;i<arguments.length;i++) list.push(Draw.material(arguments[i]));
			return list;
		},
		cube:function(x,y,z,material){
			if(typeof material=='string') material=this.material(material);
			var geometry=new THREE.BoxGeometry(x,y,z*this.depth,x,y,z);
			var mesh=new THREE.Mesh(geometry,material||material_default);
			return mesh;
		},
		pos:function(obj,x,y,z){
			z*=this.depth;
			if(obj.geometry&&obj.geometry.parameters){
				p=obj.geometry.parameters;
				// if(p.width==p.height) console.log('pos',[x,y,z]);
				x+=p.width/2;
				y+=p.height/2;
				z+=p.depth/2;
			}
			obj.position.x=x;
			obj.position.y=-y;
			obj.position.z=-z;
		},
		move_to:function(obj,x,y,z){
			z/=2;
			obj.position.x=x;
			obj.position.y=-y;
			obj.position.z=-z;
		},
		move:function(obj,fn){
			x=obj.position.x;
			y=-obj.position.y;
			z=-obj.position.z/this.depth;
			if(obj.geometry&&obj.geometry.parameters){
				p=obj.geometry.parameters;
				x-=p.width/2;
				y-=p.height/2;
				z=Math.floor(z-p.depth/2);
			}
			var value=fn(Math.floor(x),Math.floor(y),z)||[x,y,z];
			this.pos(obj,value[0],value[1],value[2]);
		},
		set:function(el,material){
			if(el instanceof Array){
				var i,list=[];
				for(i=0;i<el.length;i++) list.push(THREE.Mesh(el[i],material));
				return list;
			}else
				return new THREE.Mesh(el,material);
		}
	};
	var material_default=Draw.material('#333.wf');
	// console.log(materials);
})();