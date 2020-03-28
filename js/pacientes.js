$(document).ready(function(){
$.getJSON("data/data.json", function(data){
	function get_date(d){
		d = d.split('/');
		return new Date(d[ 2 ], d[ 1 ] - 1, d[ 0 ]);
	}

	let last_date = new Date(0, 0, 0);
	let lista_de_pacientes = $("#lista_de_pacientes");
	let id = 0;
	pacientes.forEach(function(paciente){
		let date = get_date(paciente.fecha_de_deteccion);

		if(last_date.getTime() != date.getTime()){
			// alert(last_date);
			// alert(date);
			id++;
			last_date = date;
			lista_de_pacientes.append(`<button class="collapsible">${paciente.fecha_de_deteccion}</button>`);
			lista_de_pacientes.append(`<div class="collapsible-content" id="${id}"></div>`);
		}
		// alert(nombre_de_municipios);
		$("#" + id).append(`<div class="w3-col s12 l4 w3-border-bottom">
		Paciente ${paciente.id}:<br><br>
		Nacionalidad: ${paciente.nacionalidad ? paciente.nacionalidad : "<desconocido>"}<br>
		Residencia: ${paciente.residencia ? paciente.residencia : "<desconocido>"}<br>
		${paciente.pais_de_origen != "Cuba" ? "Pa&iacute;s de origen: " + paciente.pais_de_origen + "<br>" : ""}<br>
		Edad: ${paciente.edad ? paciente.edad : "<desconocido>"}<br>
		G&eacute;nero: ${paciente.genero ? paciente.genero : "<desconocido>"}<br><br>
		${paciente.fecha_de_arribo_a_cuba ? "Fecha de arribo a Cuba: " + paciente.fecha_de_arribo_a_cuba + "<br>" : ""}
		Fecha de sintomatolog&iacute;a: ${paciente.fecha_de_sintomatologia ? paciente.fecha_de_sintomatologia : "<desconocido>"}<br>
		Fecha de detecci&oacute;n: ${paciente.fecha_de_deteccion ? paciente.fecha_de_deteccion : "<desconocido>"}<br><br>
		Centro de aislamiento: ${paciente.id_centro_de_aislamiento ? centros_de_aislamiento[ paciente.id_centro_de_aislamiento ].name : "<desconocido>"}<br>
		Centro de diagn&oacute;stico: ${paciente.id_centro_de_diagnostico ? centros_de_diagnostico[ paciente.id_centro_de_diagnostico ].name : "<desconocido>"}<br>
		Forma de contagio: ${paciente.forma_de_contagio ? paciente.forma_de_contagio : "<desconocido>"}<br><br>
		Municipio de detecci&oacute;n: ${paciente.id_municipio_de_deteccion ? nombre_de_municipios[ paciente.id_municipio_de_deteccion ] : "<desconocido>"}<br>
		Provincia de detecci&oacute;n: ${paciente.id_provincia_de_deteccion ? nombre_de_provincias[ paciente.id_provincia_de_deteccion ] : "<desconocido>"}<br><br>
		Estado: ${paciente.estado ? paciente.estado : "<desconocido>"}
	</div>`);
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
				content.style.maxHeight = "2000px";
			}
		});
	}
});
});