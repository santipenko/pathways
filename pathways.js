cconsole.log("pathways.js loaded")

// Loading the data
pathways = function(){};
pathways.readData=function(gene){
    y = $.get("NCI-Nature_Curated.xml",
    function(x){
        pathways.xml = x;
        console.log('Data loaded')
        pathways.parseFile();
		molecules = new molecDict();
		pathways.createMolecules(molecules);
		pathways.createInteractions(molecules);
		pathways.printResults(molecules, gene);
		//pathways.printTable();
        }
    )
}

/////////////////Create All Objects/////////////

// Create molecDict with nameToID, idToName, interactionToMolecule, moleculeToInteraction
function molecDict() {
	var that = this;
	that.nameToID = {};
	that.idMoleculeType = {};
	that.idToName = {};
	that.interactionToMolecule = {};
	that.moleculeToInteraction = {};
	that.dictionary = "``";
	
	that.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
	};

	that.addID = function(name, id) {
		if(that.nameToID.hasOwnProperty(name)) {
				that.nameToID[name].push(id);
			} else {
				that.nameToID[name] = [id];
			}
		that.dictionary += name + "``";
		that.idToName[id] = name;
	}
	
	that.addMoleculeType = function (id, moleculeType) {		
		that.idMoleculeType[id]=[moleculeType];
	}
	
	that.findByName = function(str) {
		var ret = {};
		
		var search = new RegExp('``[^`]*?' + str + '[^`]*?``', 'ig');
		var sol = that.dictionary.match(search);
		for(var i = 0; i < sol.length; i += 1) {
			sol[i] = sol[i].replace(/``/g, '');
			ret[sol[i]] = that.nameToID[sol[i]];
		}
		return ret;
	}
	
	that.addInteraction = function (interID, molecArr) {
		that.interactionToMolecule[interID] = molecArr;
		for( var i = 0; i < molecArr.length; i += 1 ) {
			var molecID = molecArr[i];
			if(that.moleculeToInteraction.hasOwnProperty(molecID)) {
				that.moleculeToInteraction[molecID].push(interID);
			} else {
				that.moleculeToInteraction[molecID] = [interID];
			}
		}
	}
}

/////////////////Create All Functions/////////////
// Parse XML FIle
pathways.parseFile=function(){
    console.log("Parsing ...");
    pathways.json=$.xml2json(pathways.xml);
    console.log("... xml parsed");
}

// Create Molecules with nameToID & idProperties
pathways.createMolecules=function(molecules){
	console.log("Creating Molecules ...");
	temp_molecule = pathways.json.Model.MoleculeList.Molecule;
	molecule_length = temp_molecule.length;
	for (var molecule_ctr = 0; molecule_ctr<molecule_length; molecule_ctr+=1) {
		if (!temp_molecule[molecule_ctr].ComplexComponentList && temp_molecule[molecule_ctr].Name[1]){
			molecules.addID(temp_molecule[molecule_ctr].Name[1].value , temp_molecule[molecule_ctr].id);
			molecules.addMoleculeType(temp_molecule[molecule_ctr].id,temp_molecule[molecule_ctr].molecule_type);
		}
		else if ((!temp_molecule[molecule_ctr].ComplexComponentList && !temp_molecule[molecule_ctr].Name[1]) || temp_molecule[molecule_ctr].ComplexComponentList){
			molecules.addID(temp_molecule[molecule_ctr].Name.value , temp_molecule[molecule_ctr].id);
			molecules.addMoleculeType(temp_molecule[molecule_ctr].id,temp_molecule[molecule_ctr].molecule_type);
		}
		//console.log(molecule_ctr);
	}
	console.log("... created");
}

pathways.createInteractions=function(molecules){
	console.log("Creating Interactions ...");
	temp_interaction = pathways.json.Model.InteractionList.Interaction;
	level1_ctr = 0;
	interaction_length=temp_interaction.length;
	for (var interation_ctr = 0; interation_ctr<interaction_length; interation_ctr+=1) {
		if (temp_interaction[interation_ctr].InteractionComponentList) {
			if (temp_interaction[interation_ctr].InteractionComponentList.InteractionComponent[1]) {
				temp_interactionComponent = temp_interaction[interation_ctr].InteractionComponentList.InteractionComponent;	
				var interactionComponent_length = temp_interactionComponent.length;
				var components = [];
				for (interactionComponent_ctr = 0; interactionComponent_ctr<interactionComponent_length; interactionComponent_ctr+=1) {
					components.push(temp_interactionComponent[interactionComponent_ctr].molecule_idref);
					level1_ctr+=1;
				} 
			molecules.addInteraction(temp_interaction[interation_ctr].id, components);
			}		
			else if (temp_interaction[interation_ctr].InteractionComponentList.InteractionComponent[1]) {		
				molecules.addInteraction(temp_interaction[interation_ctr].id, [temp_interactionComponent.molecule_idref]);
				level1_ctr+=1;
			}
		}
	}
	console.log("... created");
}

pathways.printResults=function(molecules, gene){
	console.log("Printing results ...");
	tempMoleculeID = molecules.nameToID[gene];
	//console.log(tempMoleculeID);
	tempInteractionID = molecules.moleculeToInteraction[tempMoleculeID];
	uniqueInteractionID = [];
	$.each(tempInteractionID, function(i, el){
		if($.inArray(el, uniqueInteractionID) === -1) {
		uniqueInteractionID.push(el);
		}
	});
	//console.log(uniqueInteractionID);
	tempInteractionMoleculeID = [];
	for (i=0; i<tempInteractionID.length; i+=1) {
		tempInteractionMoleculeID.push(molecules.interactionToMolecule[tempInteractionID[i]]);
	}
	uniqueInteractionMoleculeID = [];
	$.each(tempInteractionMoleculeID, function(i, el){
		if($.inArray(el, uniqueInteractionMoleculeID) === -1) {
		uniqueInteractionMoleculeID.push(el);
		}
	});
	//console.log(uniqueInteractionMoleculeID);
	tempInteractionMoleculeName = [];
	for (i=0; i<uniqueInteractionMoleculeID.length; i+=1) {
		for (j=0; j<uniqueInteractionMoleculeID[i].length; j+=1) {
			tempInteractionMoleculeName.push(molecules.idToName[uniqueInteractionMoleculeID[i][j]]);
		}
	}
	uniqueInteractionMoleculeName = [];
	$.each(tempInteractionMoleculeName, function(i, el){
		if (el !== gene) {
			if($.inArray(el, uniqueInteractionMoleculeName) === -1) {
			uniqueInteractionMoleculeName.push(el);
			}
		}
	});
	//console.log(uniqueInteractionMoleculeName);
	document.getElementById("myDiv").innerHTML += gene + " interacts with: </br>";
	for (i=0; i<uniqueInteractionMoleculeName.length; i+=1) {
		document.getElementById("myDiv").innerHTML += uniqueInteractionMoleculeName[i] + "</br>";
	}
	console.log("... printed");
}

// Print JSON Object as Table
/*pathways.printTable=function(){		
	$('<table border=5 id="display">').appendTo($(document.body));
	$.each(molecules, function(key, val) {
		console.log("key: " + key + "val: " + val);
		var tr=$('<tbody></tbody>');
		$.each(val, function(k, v){
			$('<tr><td>' + k + '</td><td>' + v + '</td></tr>').appendTo(tr);
		});
		tr.appendTo('#display');
	});
	$('</table>').appendTo($(document.body));
}*/
