(function(){$(function(){
	//manejo de pantalla
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(100,4/3,1,10000);
	var renderer = new THREE.WebGLRenderer({ antialias:true });
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(800,600);

	var focused,focus_paused;
	$(renderer.domElement).appendTo('.content #game')
	//validar teclas presionadas
	$(document).on('keydown',function(e){
		if(e.which==91) kb.winKey=true;
	}).on('keyup',function(e){
		if(e.which==91) kb.winKey=false;
		delete kb.last.key;
	}).on('keydown keypress',function(e){
		if(!focused) kb.check(e);
	}).on('focus focusout',':input',function(e){
		if(e.type=='focusout'){
			if(focused==e.target){
				focused=null;
				if(focus_paused){
					focus_paused=false;
					snake.toggle();
				}
			}
		}else{
			focused=e.target;
			if(!snake.paused){
				focus_paused=true;
				snake.toggle();
			}
		}
	});
	//acciones de teclado (keyboard)
	var kb={
		last:{},
		press:function(e){
			var keys=[],specials={9:'tab',27:'esc',32:'space',37:'left',38:'up',39:'right',40:'down'}
				ignore=[];
			if(this.winKey) keys.push('win');
			if(e.ctrlKey) keys.push('ctrl');
			if(e.altKey) keys.push('alt');
			if(e.shiftKey) keys.push('shift');
			var key=specials[e.which]||e.charCode&&String.fromCharCode(e.charCode).toLowerCase();
			if(e.which>64&&e.which<91) key=String.fromCharCode(e.which).toLowerCase();
			if(key) keys.push(key);
			// console.log(keys);
			return keys.join('+');
		},
		check:function(e){
			var type=e.type;
			var key=this.press(e);
			if(type=='keydown'&&this.last.key==key) return;
			if(type=='keypress'&&this.last.type=='keydown'&&this.last.key==key){ this.last.type=type; return; }
			if(type=='keypress'&&e.charCode<32) return;
			this.last={type:type,key:key};
			this.action(key);
		},
		action:function(key){
			var dir=snake.dir(),pos=snake.pos();
			if(key=='ctrl+left'||key=='ctrl+right')
				key=(key=='ctrl+right' ^ pos.x>matrix.max.x/2)?'a':'z';
			if(key=='shift+up'||key=='shift+down')
				key=(key=='shift+down' ^ pos.y>matrix.max.y/2)?'a':'z';
			//acciones al presionar una tecla
			switch(key){
				case 'left':case 'shift+left':		if(!snake.paused&&dir.x!= 1) snake.dir(-1, 0, 0);break;
				case 'right':case 'shift+right':	if(!snake.paused&&dir.x!=-1) snake.dir( 1, 0, 0);break;
				case 'up':case 'ctrl+up':			if(!snake.paused&&dir.y!= 1) snake.dir( 0,-1, 0);break;
				case 'down':case 'ctrl+down':		if(!snake.paused&&dir.y!=-1) snake.dir( 0, 1, 0);break;
				case 'a':							if(!snake.paused&&dir.z!=-1) snake.dir( 0, 0, 1);break;
				case 'z':							if(!snake.paused&&dir.z!= 1) snake.dir( 0, 0,-1);break;
				case 'p':case 'esc':case 'space':	if(!snake.dead) snake.toggle();break;
				case 'i':case 'r':case 's':			if(snake.dead) snake.start();break;
			}
		}
	};
	//matriz que llevara el control de los cuadros ocupados
	var matrix={
		max:{x:40,y:25,z:25},
		val:{},
		taken:function(x,y,z,val){
			if(val===undefined) return (((this.val||{})[x]||{})[y]||{})[z];
			if(!this.val) this.val={};
			if(!this.val[x]) this.val[x]={};
			if(!this.val[x][y]) this.val[x][y]={};
			this.val[x][y][z]=val;
			return val;
		},
		clean:function(){//dejar solo campos ocupados. no se recomienda usarlo en vivo
			var val=this.val||{},list=[];
			$.each(val,function(x,val){
				$.each(val,function(y,val){
					$.each(val,function(z,el){
						if(el) list.push([x,y,z,el]);
					});
				});
			});
			console.log(list);
		},
		reset:function(){ delete this.val; }
	};
	//caja contenedora (paredes)
	var walls={
		material:'#222.wf',
		put:function(){
			var max=matrix.max;
			this.add([max.x+2,1,max.z, 0, 0, 1]);
			this.add([1, max.y, max.z, 0, 1, 1]);
			this.add([max.x+2,1,max.z, 0, max.y+1, 1]);
			this.add([1, max.y, max.z, max.x+1, 1, 1]);
			// this.add([max.x, max.y, 1, 1, 1, max.z+1]);
		},
		add:function(pos){
			var el=Draw.cube(pos[0],pos[1],pos[2],this.material);
			Draw.pos(el,pos[3],pos[4],pos[5]);
			scene.add(el);
			this.el.push(el);
		},
		el:[]
	};
	//controlador de comida
	var food={
		material:'#0bb.ba',
		rand:function(a,b){
			return Math.floor((Math.random() * b) + a);
		},
		put:function(x,y,z){
			if(!this.el){
				var el=Draw.cube(1,1,1,this.material);
				scene.add(el);
				this.el=el;
			}
			//si no vienen las coordenadas indicadas, las generamos random
			while(!x||matrix.taken(x,y,z)){
				x=this.rand(1,matrix.max.x);
				y=this.rand(1,matrix.max.y);
				z=this.rand(1,matrix.max.z);
			}
			var $span=$('#food>li>span');
			$.each([x,y,z],function(i,val){
				$span[i].textContent=val;
			})
			Draw.move(this.el,function(x,y,z){
				if(matrix.taken(x,y,z)==1)
					matrix.taken(x,y,z,0);
			});
			Draw.pos(this.el,x,y,z);
			matrix.taken(x,y,z,1);
		}
	};
	var snake={
		material:'#06f.ba',
		start:function(){
			if(this.dead!==undefined&&!this.dead) return;
			delete this.dead;
			this.reduce_to(0);
			matrix.reset();
			this.pos(1,2,1);
			matrix.taken(1,2,1);
			food.put();
			this.size=5;
			this.dir(1,0,0);
			this.next();
			points.reset();
			$('#mensaje').text('');
			return this;
		},
		next:function(){
			if(this.paused||this.dead) return;
			var dir=this.dir(),pos=this.pos();
			var $span=$('#snake>li>span');
			var collide=storage('collide')?1:0;
			['x','y','z'].forEach(function(i,p){
				pos[i]=pos[i]+dir[i];
				if(collide&&i!='z'){
					if(pos[i]<1||pos[i]>matrix.max[i]) collide++;
				}else{
					if(pos[i]<1) pos[i]=matrix.max[i];
					if(pos[i]>matrix.max[i]) pos[i]=1;
					$span[p].textContent=pos[i];
				}
			});
			if(collide>1){
				this.die();
			}else{
				this.move([pos.x,pos.y,pos.z]);
				this.pos(pos);
			}
		},
		move:function(pos){
			if(this.paused||this.dead) return;
			if(this.el.length<this.size){
				return this.add(pos);
			}
			this.reduce_to(this.size);
			var taken=matrix.taken(pos[0],pos[1],pos[2]);
			if(taken>1){
				this.die();
			}else{
				if(taken==1){//si agarra comida
					this.size+=2;//crece
					food.put();//coloca nueva comida
					points.add();
				}
				var el=this.el.shift();
				Draw.move(el,function(x,y,z){
					matrix.taken(x,y,z,0);
					matrix.taken(pos[0],pos[1],pos[2],2);
					return pos;
				});
				this.el.push(el);
			}
		},
		toggle:function(value){
			this.paused=value!==undefined?value:!this.paused;
			$('#mensaje').lang(!this.paused?'':focus_paused?'pausafocus':'pausado');
			return this;
		},
		pos:function(x_or_all,y,z){
			if(x_or_all instanceof Object) this.__pos=x_or_all;
			else if(x_or_all instanceof Array) this.__pos={x:x_or_all[0],y:x_or_all[1],z:x_or_all[1]};
			else if(x_or_all||y||z) this.__pos={x:x_or_all,y:y,z:z}
			return this.__pos;
		},
		dir:function(x_or_all,y,z){
			if(x_or_all instanceof Object) this.__dir=x_or_all;
			else if(x_or_all instanceof Array) this.__dir={x:x_or_all[0],y:x_or_all[1],z:x_or_all[1]};
			else if(x_or_all||y||z) this.__dir={x:x_or_all,y:y,z:z}
			return this.__dir;
		},
		die:function(){
			$('#mensaje').lang('fin');
			matrix.clean();
			// matrix.reset();
			this.dead=true;
			return this;
		},
		add:function(pos){
			if(this.dead) return;
			var el;
			if(this.cache.length){
				el=this.cache.pop();
				Draw.pos(el,pos[0],pos[1],pos[2]);
				el.visible=true;
			}else{
				el=Draw.cube(1,1,1,this.material);
				Draw.pos(el,pos[0],pos[1],pos[2]);
				scene.add(el);
			}
			this.el.push(el);
		},
		remove:function(){
			if(this.el.length){
				var el=this.el.shift();
				el.visible=false;
				this.cache.push(el);
			}
		},
		reduce_to:function(val){
			while(this.el.length>val) this.remove();
		},
		clear:function(val){
			this.reduce_to(val===0?0:val||this.size);
			while(this.cache.length){
				scene.remove(this.cache[0]);
				delete this.cache.shift();
			}
			return this;
		},
		cache:[],
		el:[]
	};
	var points={
		max:5,
		delay:5,
		reset:function(){
			this.set(0);
		},
		add:function(){
			console.log('eat food');
		},
		set:function(val){
			this.points=val||0;
			if(this.points>(this.score||0)) this.score=this.points;
			$('#points>span').text(this.points||0);
			$('#score>span').text(this.score||0);
			storage('score',this.score||0);
		}
	};

	//posicionamos la camara
	Draw.pos(camera,21,14.5,-13.5/Draw.depth);
	//colocamos los muros
	walls.put();
	//iniciamos el movimiento de la serpiente
	snake.start();

	//controlar tiempo de actualizacion de pantalla
	var time={
		delay:50,
		get:function(){
			var d=new Date();
			return d.getTime();
		},
		start:function(){
			this.t=this.get();
		},
		elapsed:function(){ return this.get()-this.t; },
		next:function(){
			var e=this.elapsed();
			// var m=this.microtime;
			// this.microtime=!m||e<m?e>2?e:m:m;
			// if(!m||e<m) console.log('microtime:',e);
			if(e>this.delay){
				this.t+=e;
				return true;
			}
		}
	};
	time.start();
	food.put();
	function render() {
		requestAnimationFrame(render);

		if(time.next()) snake.next();

		renderer.render(scene, camera);
	};
	render();
})})();
