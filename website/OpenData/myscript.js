function onEachLibrary(feature, layer) {   
	
	var elem = '<div id="my-contents"> <div><b> Site </b>: <p style = "display: inline">'+feature.properties.location+'</p></div>' +
	'<div><b> Address </b>: <p style = "display: inline">'+feature.properties.street+'</p></div>' +
	'<div><b> Total seats </b>: <p style = "display: inline">'+feature.properties.library_capacity_seats+'</p></div>'
	
	if(isLibraryOpen(feature)) {
		elem += '<div><b> Available seats </b>: <p style = "display: inline">'+feature.properties.availability+'</p></div>'
	}
	else {
		elem += '<div><b> Available seats </b>: nessuno</div>'
	}

	layer.bindPopup(elem);  
}

function eachLibraryMarker(feature, latlng) {
						
	if (isLibraryOpen(feature) && feature.properties.availability != '0') 
		return L.marker(latlng, {
		  icon: new L.Icon({
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		  })
		})
	else if (isLibraryOpen(feature) && feature.properties.availability == '0') 
		return L.marker(latlng, {
		  icon: new L.Icon({
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		  })
		})
	else
		return L.marker(latlng, {
		  icon: new L.Icon({
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		  })
		})
}
					
function isLibraryOpen(feature) {
	var open = true;
	var today = new Date();
	var day_of_week = today.getDay();
	var current_hour = today.getHours();
	var current_minute = today.getMinutes();
	
	//var day_of_week = 2;
	//var current_hour = 18;
	//var current_minute = 10;
	
	
	var opening = "";
	var closing = "";
	if (day_of_week == 0 || day_of_week == 6)
		open = false;
	else {
		if (day_of_week == 1) {
			opening = feature.properties.library_hours.mon_open;
			closing = feature.properties.library_hours.mon_close;
		}
		else if(day_of_week == 2) {
			opening = feature.properties.library_hours.tue_open;
			closing = feature.properties.library_hours.tue_close;
		}
		else if(day_of_week == 3) {
			opening = feature.properties.library_hours.wed_open;
			closing = feature.properties.library_hours.wed_close;
		}
		else if(day_of_week == 4) {
			opening = feature.properties.library_hours.thu_open;
			closing = feature.properties.library_hours.thu_close;
		}
		else if(day_of_week == 5) {
			opening = feature.properties.library_hours.fri_open;
			closing = feature.properties.library_hours.fri_close;
		}
	}
	var opening_hour = parseInt(opening.substring(0, opening.indexOf(':')));
	var opening_minute = parseInt(opening.substring(opening.indexOf(':')+1));
	var closing_hour = parseInt(closing.substring(0, closing.indexOf(':')));
	var closing_minute = parseInt(closing.substring(closing.indexOf(':')+1));
	
	if(current_hour < opening_hour || current_hour > closing_hour)
		open = false;
	else if (current_hour == opening_hour && current_minute < opening_minute)
		open = false;
	else if (current_hour == closing_hour && current_minute > closing_minute)
		open = false;
	
	return open;
}
						
function updateLibraryMap(map, osm, first) {
	//chiamo get del servlet e passo il json ricevuto dal servlet alla mappa
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			
			var unige_access_points = JSON.parse(xmlHttp.responseText);
			
			var layer = L.geoJson(
				unige_access_points, {
					pointToLayer: eachLibraryMarker,					
					onEachFeature: onEachLibrary					
				}
			).addTo(map);
		
			if(first) {
				map.setView(new L.LatLng(44.41,8.92932),12);
				map.addLayer(osm);
				printTimeTable(unige_access_points);
			}
		}
	}			
	xmlHttp.open("GET", 'http://localhost:8080/Biblioteche/posti', true); // true for asynchronous 
	xmlHttp.send(null);
}
		
function onEachBuilding(feature, layer) {   
	
	var elem = '<div id="my-contents"> <div><b> Site </b>: <p style = "display: inline">'+feature.properties.location+'</p></div>' +
	'<div><b> Address </b>: <p style = "display: inline">'+feature.properties.street+'</p></div>'
	if(feature.properties.rooms){
		elem +='<div "><b> Rooms </b>: </div>'
		for (let i = 0; i < feature.properties.rooms.length; i++) {
			elem += '<div charset=utf-8><b><small> Name </b>: <p style = "display: inline">'+feature.properties.rooms[i].name+ '</small></p></div >' ;
			if(feature.properties.rooms[i].wheelchair_accessible == 'yes'){
				elem +='<div><b><small> Wheelchair_accessible  </b>: <p style = "display: inline"> &#10004' + '</small></p></div>';
			}
			else{
				elem +='<div><b><small> Wheelchair_accessible  </b>: <p style = "display: inline"> 	&#9940' + '</small></p></div>'
			}
		}
	}
	layer.bindPopup(elem);  
}

function eachBuildingMarker(feature, latlng) {
	var accessible = [];
	
	if(feature.properties.rooms){
		var n_accessible = 0;
		var n_not_accessible = 0;
		
		for (let i = 0; i < feature.properties.rooms.length; i++) {
			if(feature.properties.rooms[i].wheelchair_accessible == 'yes'){
				n_accessible = n_accessible + 1;
			}
			else
				n_not_accessible = n_not_accessible + 1;
		}
		if (n_accessible == feature.properties.rooms.length)
			return L.marker(latlng, {
				icon: new L.Icon({
					iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
					shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
					iconSize: [25, 41],
					iconAnchor: [12, 41],
					popupAnchor: [1, -34],
					shadowSize: [41, 41]
				})
			})
		else if (n_not_accessible == feature.properties.rooms.length)
			return L.marker(latlng, {
				icon: new L.Icon({
					iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
					shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
					iconSize: [25, 41],
					iconAnchor: [12, 41],
					popupAnchor: [1, -34],
					shadowSize: [41, 41]
				})
			})
		else
			return L.marker(latlng, {
				icon: new L.Icon({
					iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
					shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
					iconSize: [25, 41],
					iconAnchor: [12, 41],
					popupAnchor: [1, -34],
					shadowSize: [41, 41]
				})
			})
	}
	else
		return L.marker(latlng, {
			icon: new L.Icon({
				iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
				shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
				shadowSize: [41, 41]
			})
		})
}
					
function printTimeTable(json) {
	var tableData = '<tr> <th></th> <th>Lunedì</th> <th>Martedì</th> <th>Mercoledì</th> <th>Giovedì</th> <th>Venerdì</th> </tr> ';
	json.features.forEach(lib => 
		tableData += '<tr><td><b>' + lib.properties.location + 
			'</b></td><td>' + lib.properties.library_hours.mon_open + ' - ' + lib.properties.library_hours.mon_close + 
			'</td><td>' + lib.properties.library_hours.tue_open + ' - ' + lib.properties.library_hours.tue_close +
			'</td><td>' + lib.properties.library_hours.wed_open + ' - ' + lib.properties.library_hours.wed_close +
			'</td><td>' + lib.properties.library_hours.thu_open + ' - ' + lib.properties.library_hours.thu_close +
			'</td><td>' + lib.properties.library_hours.fri_open + ' - ' + lib.properties.library_hours.fri_close + '</td></tr>'		
	);
	document.getElementById("timetable").innerHTML = tableData;
}

async function getDatasetFileList( datasetId ) {
	
	var urlDataset = `https://demo.dataverse.org/api/datasets/${datasetId}`;
	var response = await fetch(urlDataset);
	// recupero l'oggetto json a partire da response
	var dataset = await response.json();
	
	var strTable = '<tr>';
	
	var dataset_name = '';
	var dataset_description = '';
	for (let j = 0; j < dataset.data.latestVersion.metadataBlocks.citation.fields.length; j++) {
		var field = dataset.data.latestVersion.metadataBlocks.citation.fields[j];										
		if (field.typeName == 'title')
			dataset_name = field.value;
		else if (field.typeName == 'dsDescription')
			dataset_description = field.value[0].dsDescriptionValue.value;										
	}	
	strTable += '<td style="width:50%;"><b>' + dataset_name + '</b><br>' + dataset_description + '</td>';
	
	strTable += '<td style="width:50%;">';
	var fileNum = dataset.data.latestVersion.files.length;
	for (let k = 0; k < fileNum; k++) {
		var file = dataset.data.latestVersion.files[k];												
		strTable += '<b>' + file.label + '</b><br>' + file.description + '<br><br>';
	}
	strTable += '</td>';
	
	strTable += '</tr>';
	return strTable;	
}

async function getDatasetsData( datasets ) {
	var strTable = '';	
	for (let i = 0; i < datasets.data.length; i++) {
							
		var datasetId = datasets.data[i].id;		
		strTable += await getDatasetFileList( datasetId );		
	}
	
	document.getElementById("datasets_table").innerHTML = strTable;
}

async function getDatasetList( dataverseAlias ) {
	var urlDataverse = `https://demo.dataverse.org/api/dataverses/${dataverseAlias}/contents`;
	var response = await fetch(urlDataverse);
	
	return await response.json();
}


var url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var attrib = 'Map data (c)OpenStreetMap contributors';

var mapLibrary = null;
var osmLibrary = null;

$(document).ready(function() {
		
	mapLibrary = new L.Map('map_library');
	osmLibrary = new L.TileLayer(url, {minZoom: 8, maxZoom: 16, attribution: attrib});
	
	updateLibraryMap(mapLibrary, osmLibrary, true);
	
	
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			//alert(xmlHttp.responseText);
			var unige_access_points = JSON.parse(xmlHttp.responseText);
						   
			var mapBuilding = new L.Map('map_building');		
			var osmBuilding = new L.TileLayer(url, {minZoom: 8, maxZoom: 16, attribution: attrib});	   
			var layer = L.geoJson(unige_access_points, {
				pointToLayer: eachBuildingMarker,
				onEachFeature: onEachBuilding
			}).addTo(mapBuilding);		
			mapBuilding.setView(new L.LatLng(44.41,8.92932),12);
			mapBuilding.addLayer(osmBuilding);
		}
	}
	xmlHttp.open( "GET", 'https://demo.dataverse.org/api/access/datafile/:persistentId?persistentId=doi:10.70122/FK2/FMEIW1/QF265U', true ); // false for synchronous request
	xmlHttp.send( null );
	
	
	setInterval(updateLibraryMap, 10000, mapLibrary, osmLibrary, false);
	
	//quando getDatasetsList finisce ritorna la risposta in datasets, poi viene chiamata getDatasetsData passandole datasets
	getDatasetList("unige_info").then(datasets => {
		getDatasetsData( datasets );
	});
	
} );

