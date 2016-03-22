(function($){
	var text={
		es:{
			chocar:'chocar con las paredes',
			idioma:'Idioma',
			iniciar:'iniciar un juego',
			mejor:'Mejor',
			'mover-xy':'moverse en x/y',
			'mover-xz':'moverse en x/z',
			'mover-yz':'moverse en y/z',
			fin:'Fin del juego',
			pausado:'Pausado',
			pausafocus:'Pausado (click sobre el juego para continuar)',
			puntos:'Puntos',
			salir:'Salir',
		},
		en:{
			chocar:'collide walls',
			'ctrl+flechas':'ctrl+arrows',
			idioma:'Language',
			iniciar:'start a game',
			entrar:'get inside',
			espacio:'space',
			'entra/sale':'get inside/outside',
			flechas:'arrows',
			mejor:'High Score',
			'mover-xy':'move in x/y',
			'mover-xz':'move in x/z',
			'mover-yz':'move in y/z',
			fin:'Game Over',
			pausa:'pause',
			pausado:'Paused',
			puntos:'Points',
			salir:'get outside',
			'shift+flechas':'shift+arrows',
		}
	};
	function lang(val){
		var lan=storage('lang')||'es';
		return val&&(text[lan][val]||text['es'][val])||val;
	}
	$.lang=function(){
		$('[data-lang]').each(function(){
			if(this.innerHTML!=lang(this.dataset.lang))
				this.innerHTML=lang(this.dataset.lang);
		});
	};
	$.fn.lang=function(val){
		this.each(function(){
			this.dataset.lang=val;
		});
		$.lang();
		return this;
	};
	$(function(){ $.lang(); });
})(jQuery);

var idiomas={
	en:'English',
	es:'Español'
};
