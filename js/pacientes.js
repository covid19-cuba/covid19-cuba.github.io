$(document).ready(function(){
$.getJSON("data/data.json", function(data){
	var pacientes = data[ "pacientes" ];
	var centros_de_diagnostico = data[ "centros_de_diagnostico" ];
	var centros_de_aislamiento = data[ "centros_de_aislamiento" ];
	var nombre_de_provincias = data[ "provincias" ];
	var nombre_de_municipios = data[ "municipios" ];

	function get_date(d){
		d = d.split('/');
		return new Date(d[ 2 ], d[ 1 ] - 1, d[ 0 ]);
	}

	let last_date = new Date(0, 0, 0);
	let lista_de_pacientes = $("#lista_de_pacientes");
	let _id = 0, _row = 0, _count = 0;
	pacientes.forEach(function(paciente){
		let date = get_date(paciente.fecha_de_deteccion);

		if(last_date.getTime() != date.getTime()){
			_id++;
			_count = 0;
			last_date = date;
			lista_de_pacientes.append(`<button class="collapsible">${paciente.fecha_de_deteccion}</button>`);
			lista_de_pacientes.append(`<div class="collapsible-content" id="coll-${_id}"></div>`);
		}

		if(_count % 3 == 0){
			_row++;
			$("#coll-" + _id).append(`<div class="w3-row" id="row-${_row}"></div>`);
		}
		$("#row-" + _row).append(`<div class="w3-col s12 l4 w3-padding  w3-border-top">
		Paciente ${paciente.id}:<br><br>
		Nacionalidad: ${paciente.nacionalidad ? "<img src=\"images/country/" + paciente.nacionalidad + ".png\" style=\"border-radius:50%;height:25px;width:25px;\"> " + paciente.nacionalidad : "&lt;desconocido&gt;"}<br>
		Residencia: ${paciente.residencia ? "<img src=\"images/country/" + paciente.residencia + ".png\" style=\"border-radius:50%;height:25px;width:25px;\"> " + paciente.residencia : "&lt;desconocido&gt;"}<br>
		${paciente.pais_de_origen != "Cuba" ? "Pa&iacute;s de origen: " + "<img src=\"images/country/" + paciente.pais_de_origen + ".png\" style=\"border-radius:50%;height:25px;width:25px;\"> " + paciente.pais_de_origen + "<br>" : ""}<br>
		Edad: ${paciente.edad ? paciente.edad : "&lt;desconocido&gt;"}<br>
		G&eacute;nero: ${paciente.genero ? paciente.genero : "&lt;desconocido&gt;"}<br><br>
		${paciente.fecha_de_arribo_a_cuba ? "Fecha de arribo a Cuba: " + paciente.fecha_de_arribo_a_cuba + "<br>" : ""}
		Fecha de sintomatolog&iacute;a: ${paciente.fecha_de_sintomatologia ? paciente.fecha_de_sintomatologia : "&lt;desconocido&gt;"}<br>
		Fecha de detecci&oacute;n: ${paciente.fecha_de_deteccion ? paciente.fecha_de_deteccion : "&lt;desconocido&gt;"}<br><br>
		Centro de aislamiento: ${paciente.id_centro_de_aislamiento ? centros_de_aislamiento[ paciente.id_centro_de_aislamiento ].name : "&lt;desconocido&gt;"}<br>
		Centro de diagn&oacute;stico: ${paciente.id_centro_de_diagnostico ? centros_de_diagnostico[ paciente.id_centro_de_diagnostico ].name : "&lt;desconocido&gt;"}<br>
		Forma de contagio: ${paciente.forma_de_contagio ? paciente.forma_de_contagio : "&lt;desconocido&gt;"}<br><br>
		Municipio de detecci&oacute;n: ${paciente.id_municipio_de_deteccion ? nombre_de_municipios[ paciente.id_municipio_de_deteccion ] : "&lt;desconocido&gt;"}<br>
		Provincia de detecci&oacute;n: ${paciente.id_provincia_de_deteccion ? nombre_de_provincias[ paciente.id_provincia_de_deteccion ] : "&lt;desconocido&gt;"}<br><br>
		Estado: ${paciente.estado ? paciente.estado : "&lt;desconocido&gt;"}
	</div>`);
		_count++;
	});

	let coll = document.getElementsByClassName("collapsible");
	let i;
	for(i = 0 ; i < coll.length ; i++){
		coll[ i ].addEventListener("click", function(){
			this.classList.toggle("active");
			var content = this.nextElementSibling;
			if(content.style.maxHeight){
				content.style.maxHeight = null;
			}
			else{
				content.style.maxHeight = content.scrollHeight + "px";
			}
		});
	}
});
});