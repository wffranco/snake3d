function storage(name,value){
	console.log(value);
	if(value===null) delete localStorage[name];
	else if(value!==undefined) localStorage[name]=JSON.stringify(value);
	return JSON.parse(localStorage[name]||'null');
}
