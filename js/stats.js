var desconocidos_provincia = 0;
var desconocidos_municipio = 0;

$.getJSON("data/municipios.geojson", function(municipios){
$.getJSON("data/provincias.geojson", function(provincias){
$.getJSON("data/data.json", function(data){
	data["timeline"].forEach(function(info, index){
		$("#timeline").append(
			`<div class="container container-${info.type} right">
				<div class="content">
					<span class="title">
						${info.title}
					</span>
					<div class="body">
						${info.text}
					</div>
					<div class="footer">
						<span class="date">
							${info.date}
						</span>
						<a href="${info.link}" target="_blank">
							Leer más
						</a>
					</div>
				</div>
			</div>`
		);
	});

	var pacientes = data[ "pacientes" ];

	var criterio_activo = [ "estable", "crítico" ];
	function es_activo(paciente){
		let i;
		for(i = 0 ; i < criterio_activo.length ; i++)
			if(paciente.estado == criterio_activo[ i ])
				return true;
		return false;
	}

	// casos activos e inactivos
	function get_cant_pacientes_por_estado(){
		let cant_pacientes_por_estado = { activos: 0, inactivos: 0, estables: 0, muertes: 0, evacuados: 0, criticos: 0, recuperados: 0};
		pacientes.forEach(function(paciente){
			switch (paciente.estado){
				case "evacuado":
					cant_pacientes_por_estado.evacuados++;
					cant_pacientes_por_estado.inactivos++;
					break;

				case "recuperado":
					cant_pacientes_por_estado.recuperados++;
					cant_pacientes_por_estado.inactivos++;
					break;

				case "estable":
					cant_pacientes_por_estado.estables++;
					cant_pacientes_por_estado.activos++;
					break;

				case "crítico":
					cant_pacientes_por_estado.criticos++;
					cant_pacientes_por_estado.activos++;
					break;

				case "muerte":
					cant_pacientes_por_estado.muertes++;
					cant_pacientes_por_estado.inactivos++;
					break;
			}
		});
		return cant_pacientes_por_estado;
	}

	function get_tiny_text(text){
		return `<span class="w3-tiny">${text}</span>`;
	}

	function get_info_de_estado(cant, porciento){
		return `${cant} ${get_tiny_text("(" + porciento + "%)")}`;
	}

	var cant_pacientes_por_estado = get_cant_pacientes_por_estado();

	// pacientes activos
	var porciento_pacientes_estables = Math.round(cant_pacientes_por_estado.estables * 100 / cant_pacientes_por_estado.activos);
	var porciento_pacientes_criticos = 100 - porciento_pacientes_estables;
	$("#cantidad_casos_activos").html(cant_pacientes_por_estado.activos);
	$("#cantidad_casos_estables").html(get_info_de_estado(cant_pacientes_por_estado.estables, porciento_pacientes_estables));
	$("#cantidad_casos_graves_o_criticos").html(get_info_de_estado(cant_pacientes_por_estado.criticos, porciento_pacientes_criticos));

	// pacientes inactivos
	var porciento_pacientes_evacuados = Math.round(cant_pacientes_por_estado.evacuados * 100 / cant_pacientes_por_estado.inactivos);
	var porciento_pacientes_muertos = Math.round(cant_pacientes_por_estado.muertes * 100 / cant_pacientes_por_estado.inactivos);
	var porciento_pacientes_recuperados = 100 - porciento_pacientes_evacuados - porciento_pacientes_muertos;
	$("#cantidad_casos_inactivos").html(cant_pacientes_por_estado.inactivos);
	$("#cantidad_casos_recuperados").html(get_info_de_estado(cant_pacientes_por_estado.recuperados, porciento_pacientes_recuperados));
	$("#cantidad_casos_evacuados").html(get_info_de_estado(cant_pacientes_por_estado.evacuados, porciento_pacientes_evacuados));
	$("#cantidad_casos_muertos").html(get_info_de_estado(cant_pacientes_por_estado.muertes, porciento_pacientes_muertos));

	// grafico circular por genero
	function get_cant_pacientes_por_genero(){
		let cant_pacientes_por_genero = { total: 0, masculino: 0, masculinos_activos: 0, masculinos_inactivos: 0, femenino: 0, femeninas_activas: 0, femeninas_inactivas: 0 }
		pacientes.forEach(function(paciente){
			switch(paciente.genero){
				case "femenino":
					cant_pacientes_por_genero.femenino++;
					cant_pacientes_por_genero.total++;
					cant_pacientes_por_genero.femeninas_activas += es_activo(paciente);
					cant_pacientes_por_genero.femeninas_inactivas += !es_activo(paciente);
					break;

				case "masculino":
					cant_pacientes_por_genero.masculino++;
					cant_pacientes_por_genero.total++;
					cant_pacientes_por_genero.masculinos_activos += es_activo(paciente);
					cant_pacientes_por_genero.masculinos_inactivos += !es_activo(paciente);
					break;
			}
		});
		return cant_pacientes_por_genero;
	}

	var cant_pacientes_por_genero = get_cant_pacientes_por_genero();

	// pacientes totales por género
	var config_genero_totales = {
		type: 'pie',
		data: {
			datasets: [{
				data: [
					cant_pacientes_por_genero.femenino,
					cant_pacientes_por_genero.masculino
				],
				backgroundColor: [
					"pink",
					"rgba(29, 164, 254, 1)"
				],
			}],
			labels: [
				"Femenino",
				"Masculino"
			]
		},
		options: {
			title: {
				display: true,
				text: "Pacientes contagiados por género"
			},
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data){
						var dataset = data.datasets[ tooltipItem.datasetIndex ];
						var meta = dataset._meta[ Object.keys(dataset._meta)[ 0 ] ];
						var total = meta.total;
						var currentValue = dataset.data[ tooltipItem.index ];
						var percentage = Math.floor(currentValue / total * 10000) / 100;
						return `${data.labels[ tooltipItem.index ]}: ${currentValue} (${percentage}%)`;
					}
				}
			},
			rotation: 2
		}
	};
	new Chart(document.getElementById("chart_pie_genero_total").getContext('2d'), config_genero_totales);

	// pacientes activos por genero
	var config_genero_activos = {
		type: 'pie',
		data: {
			datasets: [{
				data: [
					cant_pacientes_por_genero.femeninas_activas,
					cant_pacientes_por_genero.masculinos_activos
				],
				backgroundColor: [
					"pink",
					"rgba(29, 164, 254, 1)"
				],
			}],
			labels: [
				"Femenino",
				"Masculino"
			]
		},
		options: {
			title: {
				display: true,
				text: "Pacientes activos contagiados por género"
			},
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data){
						var dataset = data.datasets[ tooltipItem.datasetIndex ];
						var meta = dataset._meta[ Object.keys(dataset._meta)[ 0 ] ];
						var total = meta.total;
						var currentValue = dataset.data[ tooltipItem.index ];
						var percentage = Math.floor(currentValue / total * 10000) / 100;
						return `${data.labels[ tooltipItem.index ]}: ${currentValue} (${percentage}%)`;
					}
				}
			},
			rotation: 2
		}
	};
	new Chart(document.getElementById("chart_pie_genero_activos").getContext('2d'), config_genero_activos);

	// pacientes inactivos por genero
	var config_genero_inactivos = {
		type: 'pie',
		data: {
			datasets: [{
				data: [
					cant_pacientes_por_genero.femeninas_inactivas,
					cant_pacientes_por_genero.masculinos_inactivos
				],
				backgroundColor: [
					"pink",
					"rgba(29, 164, 254, 1)"
				],
			}],
			labels: [
				"Femenino",
				"Masculino"
			]
		},
		options: {
			title: {
				display: true,
				text: "Pacientes inactivos contagiados por género"
			},
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data){
						var dataset = data.datasets[ tooltipItem.datasetIndex ];
						var meta = dataset._meta[ Object.keys(dataset._meta)[ 0 ] ];
						var total = meta.total;
						var currentValue = dataset.data[ tooltipItem.index ];
						var percentage = Math.floor(currentValue / total * 10000) / 100;
						return `${data.labels[ tooltipItem.index ]}: ${currentValue} (${percentage}%)`;
					}
				}
			}
		}
	};
	new Chart(document.getElementById("chart_pie_genero_inactivos").getContext('2d'), config_genero_inactivos);

	function stringify_date(dt){
		let day = dt.getDate();
		let month = dt.getMonth() + 1;
		let year = dt.getFullYear();
		return `${"0".repeat(2 - day.toString().length)}${day}/${"0".repeat(2 - month.toString().length)}${month}/${year}`;
	}

	var fecha_de_inicio = new Date(2020, 2, 9);
	var fecha_de_fin = new Date(2020, 2, 26);

	// grafico de linea para casos totales
	function get_casos_por_dia(){
		function getDates(start, end){
			let dates = {};
			let cur = new Date(start);

			while(cur <= end){
				dates[ stringify_date(new Date(cur)) ] = 0;
				cur.setDate(cur.getDate() + 1);
			}

			return dates;
		}

		let casos_por_dia = getDates(fecha_de_inicio, fecha_de_fin);
		let casos_activos_por_dia = {};
		Object.assign(casos_activos_por_dia, casos_por_dia);
		let casos_inactivos_por_dia = {};
		Object.assign(casos_inactivos_por_dia, casos_por_dia);

		pacientes.forEach(function(paciente){
			casos_por_dia[ paciente.fecha_de_deteccion ]++;
			casos_activos_por_dia[ paciente.fecha_de_deteccion ]++;

			if(paciente.fecha_dado_de_alta){
				casos_activos_por_dia[ paciente.fecha_dado_de_alta ]--;
				casos_inactivos_por_dia[ paciente.fecha_dado_de_alta ]++;
			}
		});
		return [ casos_por_dia, casos_activos_por_dia, casos_inactivos_por_dia ];
	}
	var casos_por_dia = get_casos_por_dia();
	var casos_activos_por_dia = casos_por_dia[ 1 ];
	var casos_inactivos_por_dia = casos_por_dia[ 2 ];
	casos_por_dia = casos_por_dia[ 0 ];

	// linea para casos por dia
	var config_casos_por_dia = {
		type: 'line',
		data: {
			labels: Object.keys(casos_por_dia),
			datasets: [{
				label: "Casos nuevos",
				backgroundColor: "rgba(255, 38, 38, 0.3)",
				borderColor: "red",
				pointBackgroundColor: "black",
				pointBorderColor: "black",
				data: Object.values(casos_por_dia),
				fill: true
			},
			{
				label: "Casos inactivos",
				backgroundColor: "rgba(128, 255, 128, 0.3)",
				borderColor: "rgba(0, 255, 0, 1)",
				pointBackgroundColor: "black",
				pointBorderColor: "black",
				data: Object.values(casos_inactivos_por_dia),
				fill: true
			}]
		},
		options: {
			title: {
				display: true,
				text: "Casos por día"
			},
			maintainAspectRatio: false
		}
	};
	new Chart(document.getElementById("chart_line_casos_por_dia").getContext('2d'), config_casos_por_dia);

	// casos totales por dia
	let fechas = Object.keys(casos_por_dia);
	let casos = Object.values(casos_por_dia);
	let casos_activos = Object.values(casos_activos_por_dia);
	let casos_inactivos = Object.values(casos_inactivos_por_dia);
	var casos_totales_por_dia = {};
	casos_totales_por_dia[ stringify_date(fecha_de_inicio) ] = 0;
	casos.reduce(function(total, current, index){
		casos_totales_por_dia[ fechas[ index ] ] = total + current;
		return total + current;
	});
	var casos_activos_totales_por_dia = {};
	casos_activos_totales_por_dia[ stringify_date(fecha_de_inicio) ] = 0;
	casos_activos.reduce(function(total, current, index){
		casos_activos_totales_por_dia[ fechas[ index ] ] = total + current;
		return total + current;
	});
	var casos_inactivos_totales_por_dia = {};
	casos_inactivos_totales_por_dia[ stringify_date(fecha_de_inicio) ] = 0;
	casos_inactivos.reduce(function(total, current, index){
		casos_inactivos_totales_por_dia[ fechas[ index ] ] = total + current;
		return total + current;
	});

	// linea para casos totales
	var config_casos_totales = {
		type: 'line',
		data: {
			labels: Object.keys(casos_totales_por_dia),
			datasets: [{
				label: "Casos detectados",
				backgroundColor: "rgba(255, 38, 38, 0.3)",
				borderColor: "red",
				pointBackgroundColor: "black",
				pointBorderColor: "black",
				data: Object.values(casos_totales_por_dia)
			},
			{
				label: "Casos activos",
				backgroundColor: "rgba(128, 255, 255, 0.3)",
				borderColor: "rgba(29, 164, 254, 1)",
				pointBackgroundColor: "black",
				pointBorderColor: "black",
				data: Object.values(casos_activos_totales_por_dia)
			},
			{
				label: "Casos inactivos",
				backgroundColor: "rgba(128, 255, 128, 0.3)",
				borderColor: "rgba(0, 255, 0, 1)",
				pointBackgroundColor: "black",
				pointBorderColor: "black",
				data: Object.values(casos_inactivos_totales_por_dia)
			}]
		},
		options: {
			title: {
				display: true,
				text: "Casos totales por día"
			},
			maintainAspectRatio: false
		}
	};
	new Chart(document.getElementById("chart_line_casos_totales").getContext('2d'), config_casos_totales);

	// factor de crecimiento
	// var factor_de_crecimiento = {};
	// casos.forEach(function(value, index){
	// 	if(index <= 1)
	// 		return;
	// 	factor_de_crecimiento[ fechas[ index ] ] = Math.round(value / casos_totales_por_dia[ fechas[ index - 1 ] ] * 100) / 100;
	// });

	// linea para el factor de crecimiento
	// var config_factor_de_crecimiento = {
	// 	type: 'line',
	// 	data: {
	// 		labels: Object.keys(factor_de_crecimiento),
	// 		datasets: [{
	// 			label: "Factor de crecimiento",
	// 			backgroundColor: "rgba(255, 38, 38,0.3)",
	// 			borderColor: "red",
	// 			pointBackgroundColor: "black",
	// 			pointBorderColor: "black",
	// 			data: Object.values(factor_de_crecimiento)
	// 		}]
	// 	},
	// 	options: {
	// 		title: {
	// 			display: true,
	// 			text: "Factor de crecimiento respecto al día anterior"
	// 		}
	// 	}
	// };
	// new Chart(document.getElementById("chart_line_factor_de_crecimiento").getContext('2d'), config_factor_de_crecimiento);

	// // media del factor de crecimiento
	// var media_factor_de_crecimiento = {};
	// casos.forEach(function(value, index){
	// 	if(index <= 1)
	// 		return;
	// 	factor_de_crecimiento[ fechas[ index ] ] = Math.round(value / casos_totales_por_dia[ fechas[ index - 1 ] ] * 100) / 100;
	// });

	// mapas
	function sum_colors(color1, color2){
		let ans = [];
		let i;
		for(i = 0 ; i < color1.length ; i++)
			ans.push(color1[ i ] + color2[ i ]);
		return ans;
	}

	function mul_color_and_factor(color, value){
		let ans = [];
		let i;
		for(i = 0 ; i < color.length ; i++)
			ans.push(color[ i ] * value);
		return ans;
	}

	let start_color = [ 255, 200, 200 ];
	let end_color = [ 200, 0, 0 ];
	function get_color(cant, _min, _max){
		if(cant > 0){
			let alpha = (cant - _min) / (_max - _min);
			let color = sum_colors(mul_color_and_factor(end_color, alpha), mul_color_and_factor(start_color, 1 - alpha));
			return `rgba(${color[ 0 ]}, ${color[ 1 ]}, ${color[ 2 ]}, 1)`
		}
		else
			return 'rgba(0, 189, 63, 0.5)';
	}

	// provincias
	function get_contagiados_por_provincia(){
		let contagiados_por_provincia = { min_contagiados: null, max_contagiados: null, desconocidos: 0 };
		pacientes.forEach(function(paciente){
			let code = paciente.id_provincia_de_deteccion;
			if(!code){
				contagiados_por_provincia.desconocidos++;
			}
			else if(code in contagiados_por_provincia){
				contagiados_por_provincia[ code ]++;
			}
			else{
				contagiados_por_provincia[ code ] = 1;
			}
			if(!((code + "_activos") in contagiados_por_provincia)){
				contagiados_por_provincia[ code + "_activos" ] = 0;
				contagiados_por_provincia[ code + "_inactivos" ] = 0;
			}
			contagiados_por_provincia[ code + "_activos" ] += es_activo(paciente);
			contagiados_por_provincia[ code + "_inactivos" ] += !es_activo(paciente);
		});
		provincias[ "features" ].forEach(function(feature){
			let code = feature[ "properties" ][ "ISO_province_code" ];
			if(!(code in contagiados_por_provincia)){
				contagiados_por_provincia[ code ] = 0;
				contagiados_por_provincia[ code + "_activos" ] = 0;
				contagiados_por_provincia[ code + "_inactivos" ] = 0;
			}
			let cant = contagiados_por_provincia[ code ];
			contagiados_por_provincia.min_contagiados = contagiados_por_provincia.min_contagiados == null ? cant : Math.min(contagiados_por_provincia.min_contagiados, cant);
			contagiados_por_provincia.max_contagiados = contagiados_por_provincia.max_contagiados == null ? cant : Math.max(contagiados_por_provincia.max_contagiados, cant);
		});
		return contagiados_por_provincia;
	}
	var contagiados_por_provincia = get_contagiados_por_provincia();
	desconocidos_provincia = contagiados_por_provincia.desconocidos;

	var geojson_provincias = L.geoJSON(provincias, {
		style: function(feature){
			return {
				weight: 2,
				opacity: 0.8,
				color: '#e0e0e0',
				fillOpacity: 1,
				fillColor: get_color(contagiados_por_provincia[ feature.properties.ISO_province_code ], contagiados_por_provincia.min_contagiados, contagiados_por_provincia.max_contagiados)
			}
		}
	});
	function get_texto_de_provincia(properties){
		let code = properties.ISO_province_code;
		return `${properties.province}<br><p>Casos totales: <span class="w3-badge w3-teal">${contagiados_por_provincia[ code ]}</span><br>Casos activos: <span class="w3-badge w3-red">${contagiados_por_provincia[ code + "_activos" ]}</span><br>Casos inactivos: <span class="w3-badge w3-green">${contagiados_por_provincia[ code + "_inactivos" ]}</span>`;
	}
	geojson_provincias.bindPopup(function(layer){
		return get_texto_de_provincia(layer.feature.properties);
	});
	geojson_provincias.bindTooltip(function(layer){
		return get_texto_de_provincia(layer.feature.properties);
	});
	var map_provincias = L.map('map-provincias', {
		center: [21.54995, -79.54235],
		minZoom: 0,
		maxZoom: 9,
		layers: [geojson_provincias],
		keyboard: false,
		dragging: true,
		zoomControl: true,
		boxZoom: false,
		doubleClickZoom: true,
		scrollWheelZoom: true,
		tap: true,
		touchZoom: true,
		zoomSnap: 0.05,
		zoomControl: true
	});
	map_provincias.zoomControl.setPosition('bottomright');
	map_provincias.fitBounds(geojson_provincias.getBounds());
	map_provincias.setMaxBounds(geojson_provincias.getBounds().pad(0.1));
	map_provincias.setMinZoom(map_provincias.getZoom());

	// municipios
	function get_contagiados_por_municipios(){
		let contagiados_por_municipios = { min_contagiados: null, max_contagiados: null, desconocidos: 0 };
		pacientes.forEach(function(paciente){
			let code = paciente.id_municipio_de_deteccion;
			if(!code){
				contagiados_por_municipios.desconocidos++;
			}
			else if(code in contagiados_por_municipios){
				contagiados_por_municipios[ code ]++;
			}
			else{
				contagiados_por_municipios[ code ] = 1;
			}
			if(!((code + "_activos") in contagiados_por_municipios)){
				contagiados_por_municipios[ code + "_activos" ] = 0;
				contagiados_por_municipios[ code + "_inactivos" ] = 0;
			}
			contagiados_por_municipios[ code + "_activos" ] += es_activo(paciente);
			contagiados_por_municipios[ code + "_inactivos" ] += !es_activo(paciente);
		});
		municipios[ "features" ].forEach(function(feature){
			let code = feature[ "properties" ][ "ISO_municipality_code" ];
			if(!(code in contagiados_por_municipios)){
				contagiados_por_municipios[ code ] = 0;
				contagiados_por_municipios[ code + "_activos" ] = 0;
				contagiados_por_municipios[ code + "_inactivos" ] = 0;
			}
			let cant = contagiados_por_municipios[ code ];
			contagiados_por_municipios.min_contagiados = contagiados_por_municipios.min_contagiados == null ? cant : Math.min(contagiados_por_municipios.min_contagiados, cant);
			contagiados_por_municipios.max_contagiados = contagiados_por_municipios.max_contagiados == null ? cant : Math.max(contagiados_por_municipios.max_contagiados, cant);
		});
		return contagiados_por_municipios;
	}
	var contagiados_por_municipios = get_contagiados_por_municipios();
	desconocidos_municipio = contagiados_por_municipios.desconocidos;

	var geojson_municipios = L.geoJSON(municipios, {
		style: function(feature){
			return {
				weight: 2,
				opacity: 0.8,
				color: '#e0e0e0',
				fillOpacity: 1,
				fillColor: get_color(contagiados_por_municipios[ feature.properties.ISO_municipality_code ], contagiados_por_municipios.min_contagiados, contagiados_por_municipios.max_contagiados)
			}
		}
	});
	function get_texto_de_municipio(properties){
		let code_p = properties.ISO_province_code;
		let code = properties.ISO_municipality_code;
		return `${properties.province}: ${properties.municipality}<br><p>Casos totales: <span class="w3-badge w3-teal">${contagiados_por_municipios[ code ]}</span><br>Casos activos: <span class="w3-badge w3-red">${contagiados_por_municipios[ code + "_activos" ]}</span><br>Casos inactivos: <span class="w3-badge w3-green">${contagiados_por_municipios[ code + "_inactivos" ]}</span>`;
	}
	geojson_municipios.bindPopup(function(layer){
		return get_texto_de_municipio(layer.feature.properties);
	});
	geojson_municipios.bindTooltip(function(layer){
		return get_texto_de_municipio(layer.feature.properties);
	});
	var map_municipios = L.map('map-municipios', {
		center: [21.54995, -79.54235],
		minZoom: 0,
		maxZoom: 10,
		layers: [geojson_municipios],
		keyboard: false,
		dragging: true,
		zoomControl: true,
		boxZoom: false,
		doubleClickZoom: true,
		scrollWheelZoom: true,
		tap: true,
		touchZoom: true,
		zoomSnap: 0.05,
		zoomControl: true
	});
	map_municipios.zoomControl.setPosition('bottomright');
	map_municipios.fitBounds(geojson_municipios.getBounds());
	map_municipios.setMaxBounds(geojson_municipios.getBounds().pad(0.1));
	map_municipios.setMinZoom(map_municipios.getZoom());
	$('#map-municipios').hide();

	$('.leaflet-control-attribution').hide();
	change_map();
});
});
});

function change_map(){
	$("#map-provincias").toggle("slow");
	$("#map-municipios").toggle("slow");

	let btn = document.getElementById("change_map_btn");
	let unknown = document.getElementById("unknown_text");
	if(btn.innerText == "Ver mapa de los municipios"){
		btn.innerText = "Ver mapa de las provincias";
		if(desconocidos_municipio > 0){
			unknown.innerHTML = `<small><b style="color: red;"><ins>Nota:</ins></b> hay ${desconocidos_municipio} ${desconocidos_municipio == 1 ? "paciente" : "pacientes"} sin información de su municipio de descubrimiento</small>`;
			unknown.style.display = "block";
		}
		else{
			unknown.style.display = "none";
		}
	}
	else{
		btn.innerText = "Ver mapa de los municipios";

		if(desconocidos_provincia > 0){
			unknown.innerHTML = `<small><b style="color: red;"><ins>Nota:</ins></b> hay ${desconocidos_provincia} ${desconocidos_provincia == 1 ? "paciente" : "pacientes"} sin información de su provincia de descubrimiento</small>`;
			unknown.style.display = "block";
		}
		else{
			unknown.style.display = "none";
		}
	}
}