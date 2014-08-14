//console.log("pathways.js loaded")

// Loading the data
gene = "Smad3";
pathways = function(){};
pathways.readData=function(){
    y = $.get("NCI-Nature_Curated.xml",
    function(x){
        pathways.xml = x;
        console.log('Data loaded')
        $("<div>Pathway data Loaded</div>").appendTo($(document.body))
        pathways.parseFile();
		pathways.createMolecules();
		pathways.createInteractions();
		pathways.linkInteractions();
		//pathways.printTable();
        }
    )
}

/////////////////Create All Objects/////////////
// Create Level
function objectLevel() {
	this.level1 = [];	
	this.setLevel = function(x){
		this.level1.push(x);
	}
}

// Create Interact
function objectInteract() {
	var interactionID = "ooga";
	this.molecule = [];
	
	this.getInteractionID = function() {
		return interactionID;
	}	
	this.setInteractionID = function(x) {
		this.interactionID = x;
	}
	this.setMolecule = function(x) {
		this.molecule.push(x);
	}
}

// Create Molecule
function objectMolecule() {
	var moleculeID = "booga";
	var moleculeName = "cooga";
	
	this.getMoleculeID = function() {
		return moleculeID;
	}
	this.getMoleculeName = function() {
		return moleculeName;
	}	
	this.setMoleculeID = function(x) {
		this.moleculeID = x;
	}
	this.setMoleculeName = function(x) {
		this.moleculeName = x;
	}	
}

/////////////////Create All Functions/////////////
// Parse XML FIle
pathways.parseFile=function(){
    console.log("Parsing ...");
    pathways.json=$.xml2json(pathways.xml);
    console.log("... xml parsed");
    $("<div>Data Parsed</div>").appendTo($(document.body))
}

// Create Molecules with nameToID & idProperties
pathways.createMolecules=function(){
	molecules = new Object();
	console.log("Creating Molecules ...");
	molecules = {nameToID: {}, idProperties: {}};
	temp_molecule = pathways.json.Model.MoleculeList.Molecule;
	molecule_length = temp_molecule.length;
	for (var molecule_ctr = 0; molecule_ctr<molecule_length; molecule_ctr+=1) {
		if (!temp_molecule[molecule_ctr].ComplexComponentList && temp_molecule[molecule_ctr].Name[1]){
			molecules.nameToID[temp_molecule[molecule_ctr].Name[1].value]=temp_molecule[molecule_ctr].id;
			molecules.idProperties[temp_molecule[molecule_ctr].id]=temp_molecule[molecule_ctr].molecule_type;
			//console.log(temp_molecule[molecule_ctr].Name[1].value);
		}
		else if ((!temp_molecule[molecule_ctr].ComplexComponentList && !temp_molecule[molecule_ctr].Name[1]) || temp_molecule[molecule_ctr].ComplexComponentList){
			molecules.nameToID[temp_molecule[molecule_ctr].Name.value]=temp_molecule[molecule_ctr].id;
			molecules.idProperties[temp_molecule[molecule_ctr].id]=temp_molecule[molecule_ctr].molecule_type;
			//console.log(temp_molecule[molecule_ctr].Name.value);
		}
		//console.log(molecule_ctr);
	}
	console.log("... created");
}

pathways.createInteractions=function(){
	console.log("Creating Interactions ...");
	temp_interaction = pathways.json.Model.InteractionList.Interaction;
	level1_ctr = 0;
	interaction_length=temp_interaction.length;
	interactions = new objectLevel();
	for (var interation_ctr = 0; interation_ctr<interaction_length; interation_ctr+=1) {
		if (temp_interaction[interation_ctr].InteractionComponentList) {
			if(temp_interaction[interation_ctr].InteractionComponentList.InteractionComponent.molecule_idref === molecules.nameToID[gene]) {
				interactions.setLevel(level1_ctr);
				interactions.level1[level1_ctr] = new objectInteract();
				interactions.level1[level1_ctr].setInteractionID(temp_interaction[interation_ctr].id);
				interactions.level1[level1_ctr].molecule[0] = new objectMolecule();
				interactions.level1[level1_ctr].molecule[0].setMoleculeID(temp_interaction[interation_ctr].InteractionComponentList.InteractionComponent.molecule_idref);
				//console.log("level1_ctr: " + level1_ctr);
				level1_ctr+=1;
			}				
			else if (temp_interaction[interation_ctr].InteractionComponentList.InteractionComponent) {
				var interactionComponent_length = temp_interaction[interation_ctr].InteractionComponentList.InteractionComponent.length;
				for (interactionComponent_ctr = 0; interactionComponent_ctr<interactionComponent_length; interactionComponent_ctr+=1) {
					if (temp_interaction[interation_ctr].InteractionComponentList.InteractionComponent[interactionComponent_ctr].molecule_idref === molecules.nameToID[gene]) {
						interactions.setLevel(level1_ctr);
						interactions.level1[level1_ctr] = new objectInteract();
						interactions.level1[level1_ctr].setInteractionID(temp_interaction[interation_ctr].id);
						for (interactionComponent_ctr = 0; interactionComponent_ctr<temp_interaction[interation_ctr].InteractionComponentList.InteractionComponent.length; interactionComponent_ctr+=1) {
							interactions.level1[level1_ctr].setMolecule(interactionComponent_ctr);
							interactions.level1[level1_ctr].molecule[interactionComponent_ctr] = new objectMolecule();
							interactions.level1[level1_ctr].molecule[interactionComponent_ctr].setMoleculeID(temp_interaction[interation_ctr].InteractionComponentList.InteractionComponent[interactionComponent_ctr].molecule_idref);
						}
						//console.log("level1_ctr: " + level1_ctr);
						level1_ctr+=1;
					}
				}
			}		
			//console.log("interation_ctr: " + interation_ctr);
		}
	}
	console.log("... created");
}

pathways.linkInteractions=function(){
	console.log("Linking Interaction ...");
	for (level1_ctr = 0; level1_ctr<interactions.level1.length; level1_ctr+=1) {
		for (molecule_ctr = 0; molecule_ctr<interactions.level1[level1_ctr].molecule.length; molecule_ctr+=1) {
			$.each(molecules.nameToID, function(key, val) {
				//console.log("key: " + key + " val: " + val);
				if (val === interactions.level1[level1_ctr].molecule[molecule_ctr].moleculeID){
				console.log("Match " + val + " = " + interactions.level1[level1_ctr].molecule[molecule_ctr].moleculeID + " " + key);
				interactions.level1[level1_ctr].molecule[molecule_ctr].setMoleculeName(key);
				}
			});
		}
	}
	console.log("... linked");
}

// Stringify Object
/*pathways.string=function(){
	pathwaysString = JSON.stringify(data.nameToID);
	alert(pathwaysString);
}*/

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

// Initiate
pathways.readData();
