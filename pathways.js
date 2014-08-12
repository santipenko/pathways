console.log("pathways loaded :-) ")

// loading the data

pathways = function(){};
data = new Object();

pathways.readData=function(){
    y = $.get("NCI-Nature_Curated.xml",
    function(x){
        pathways.xml = x;
        console.log('data loaded')
        $("<div>Pathway data Loaded</div>").appendTo($(document.body))
        pathways.parseFile();
		pathways.createTable();
		//pathways.createIDProperties();
		//pathways.printTable();
        }
    )
}

// Parse XML FIle

pathways.parseFile=function(){
    console.log("parsing ...");
    pathways.json=$.xml2json(pathways.xml);
    console.log("... xml parsed");
    $("<div>Data Parsed</div>").appendTo($(document.body))
}

// Create Tables as JSON Object

pathways.createTable=function(){
	console.log("creating nameToID...")
	data = {nameToID: {}, idProperties: {}};
	temp = pathways.json.Model.MoleculeList.Molecule;
	for(var i = 0; i<temp.length; i+=1) {
		if (!temp[i].ComplexComponentList && temp[i].Name[1]){
			data.nameToID[temp[i].Name[1].value]=temp[i].id;
			data.idProperties[temp[i].id]=temp[i].molecule_type
			console.log(temp[i].Name[1].value);
		}
		else if ((!temp[i].ComplexComponentList && !temp[i].Name[1]) || temp[i].ComplexComponentList){
			data.nameToID[temp[i].Name.value]=temp[i].id;
			data.idProperties[temp[i].id]=temp[i].molecule_type
			console.log(temp[i].Name.value);
		}
		console.log(i);
	}
	console.log("data created");
}

// Stringify Object
/*pathways.string=function(){
	pathwaysString = JSON.stringify(data.nameToID);
	alert(pathwaysString);
}*/

// Print JSON Object as Table
/*pathways.printTable=function(){		
	$('<table border=5 id="display">').appendTo($(document.body));
	$.each(data, function(key, val) {
	console.log("key: " + key + "val: " + val);
	var tr=$('<tbody></tbody>');
	$.each(val, function(k, v){
	$('<tr><td>' + k + '</td><td>' + v + '</td></tr>').appendTo(tr);
	});
	tr.appendTo('#display');
	});
	$('</table>').appendTo($(document.body));
}*/

// Initiate
pathways.readData();