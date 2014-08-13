console.log("pathways loaded :-) ")

// loading the data

gene = "Smad3";
pathways = function(){};
molecules = new Object();
interactions = new Object();

pathways.readData=function(){
    y = $.get("NCI-Nature_Curated.xml",
    function(x){
        pathways.xml = x;
        console.log('Data loaded')
        $("<div>Pathway data Loaded</div>").appendTo($(document.body))
        pathways.parseFile();
		pathways.createMolecules();
		pathways.createInteractions();
		//pathways.createIDProperties();
		//pathways.printTable();
        }
    )
}

// Parse XML FIle

pathways.parseFile=function(){
    console.log("Parsing ...");
    pathways.json=$.xml2json(pathways.xml);
    console.log("... xml parsed");
    $("<div>Data Parsed</div>").appendTo($(document.body))
}

// Create Tables as JSON Object

pathways.createMolecules=function(){
	console.log("Creating Molecules ...");
	molecules = {nameToID: {}, idProperties: {}};
	temp1 = pathways.json.Model.MoleculeList.Molecule;
	for (var i = 0; i<temp1.length; i+=1) {
		if (!temp1[i].ComplexComponentList && temp1[i].Name[1]){
			molecules.nameToID[temp1[i].Name[1].value]=temp1[i].id;
			molecules.idProperties[temp1[i].id]=temp1[i].molecule_type;
			//console.log(temp[i].Name[1].value);
		}
		else if ((!temp1[i].ComplexComponentList && !temp1[i].Name[1]) || temp1[i].ComplexComponentList){
			molecules.nameToID[temp1[i].Name.value]=temp1[i].id;
			molecules.idProperties[temp1[i].id]=temp1[i].molecule_type;
			//console.log(temp[i].Name.value);
		}
		//console.log(i);
	}
	console.log("... created");
}

pathways.createInteractions=function(){
	console.log("Creating Interactions ...");
	interactions = {level1: {}};
	temp2 = pathways.json.Model.InteractionList.Interaction;
	k = 0;
	for (var i = 0; i<temp2.length; i+=1) {
		if (temp2[i].InteractionComponentList) {
			if(temp2[i].InteractionComponentList.InteractionComponent.molecule_idref === molecules.nameToID[gene]) {
				interactions.level1[k]=temp2[i].id;
				//console.log("k: " + k);
				k+=1;
			}				
			else if (temp2[i].InteractionComponentList.InteractionComponent) {
				for (var j = 0; j<temp2[i].InteractionComponentList.InteractionComponent.length; j+=1) {
					if (temp2[i].InteractionComponentList.InteractionComponent[j].molecule_idref === molecules.nameToID[gene]) {
						interactions.level1[k]=temp2[i].id;
						//console.log("k: " + k);
						k+=1;
					}
				}
			}		
			//console.log("i: " + i);
		}
	}
	console.log("... created");
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
