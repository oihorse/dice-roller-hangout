/*
* Copyright (c) 2012 Christian Gohlinghorst 
* contact: oihorse@gmail.com
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see http://www.gnu.org/licenses/.
*/

var nothingRolled = true

//audio resources
function rollDiceSound(diceRolled) {
	console.log("que sound");
  // There can only be one active resource, Audio or Image.
  // By playing the sound, we activate this resource 
  // and will automatically hide all the other overlays.
  // Thus, we hide the scaling controls.
  //setControlVisibility(false);
  
  var sound = diceRolled + '.wav';
  var addy = 'http://www.horsegoeswest.com/apps/diceroller/sounds/' + sound;
  console.log(addy);
  var diceRollSound = gapi.hangout.av.effects.createAudioResource(addy).createSound();
  
   diceRollSound.play({loop: false});
   console.log("sound played");
}

//The pseudo-random number generator
function getRandom(max) 
{
	return (Math.floor(Math.random()*max))+1;
}

//Gets the value of the die being rolled
function getDiceValue()
{
	var dieToRoll = 0;
	
	for (var i=0; i < document.Dice.dice.length; i++)
	{
		if (document.Dice.dice[i].checked)
		{
		dieToRoll = document.Dice.dice[i].value;
		}
   }
	
	return dieToRoll
}

function showAwesomeGif()
{
	var t=setTimeout("removeAwesomeGif()",10000);
	document.getElementById('natural20').style.display = 'block';
}

function removeAwesomeGif()
{
	document.getElementById('natural20').style.display = 'none';
}

function showTerribleGif()
{
	var t=setTimeout("removeTerribleGif()",10000);
	document.getElementById('natural1').style.display = 'block';
}

function removeTerribleGif()
{
	document.getElementById('natural1').style.display = 'none';
}

// The function is triggered by the dice button on the Hangout App
function diceButtonClick() 
{
	console.log('Dice Button clicked.');
	
	var dieRolled = getDiceValue(); //the die being rolled
	var numberOfDice = document.getElementById('NumberOfDice').value; //the number of dice being rolled
	console.log('User is rolling ' + numberOfDice + "d" + dieRolled);
	var diceRoller = gapi.hangout.getParticipantById(gapi.hangout.getParticipantId()); //the participant rolling the dice

	var i = 0;
	var resultArray = [];
	var totalValue = 0;
	while (i < numberOfDice)
	{
		var value = getRandom(dieRolled);
		totalValue += value;
		resultArray.push(value);
		i++;
		console.log('resultArray is: ' + resultArray);
		
		/*
		if(dieRolled == '20')
		{
		  if(value == 20)
		  {
		  	console.log("Rolled a natural 20!");
		   	showAwesomeGif();
		  }
		  else  if(value == 1)
		  {
		  	console.log("Rolled a natural 1.");
			showTerribleGif();
		  }
		}*/
	}
	console.log('totalValue is: ' + totalValue);
	console.log('Dice roller is ' + diceRoller.person.displayName);
		
	//Build an object to hold our data so we can stringify it

	var result = {}
	result.name = diceRoller.person.displayName;
	result.dieRolled = dieRolled;
	result.numberOfDiceRolled = numberOfDice;
	result.resultArray = resultArray;
	result.totalValue = totalValue;
	
	var finalResult = JSON.stringify(result);
	gapi.hangout.data.submitDelta({'finalResult': finalResult});	
	nothingRolled = false;
}
function updateUserList(){	console.log('updating user list');	setText(historyBox, "New user has logged on");}

//sets the new HTML text to appear on screen
function setText(element, text) 
{
	console.log("setText = " + text);
	element.innerHTML = text;
}

//updates the UI with the new state values
function updateStateUi(state) 
{
	console.log('updating UI');
	var diceElement = document.getElementById('diceValueRolled');
	var whoRolled = document.getElementById('theDiceRoller');
	var historyBox = document.getElementById('history');
	var historyBoxText = document.getElementById('history').innerHTML;
	
	if (nothingRolled)
	{
		setText(diceElement, 'Roll them bones already');
	} 
	else 
	{
		var finalResult = JSON.parse(state['finalResult']);
		console.log("Final Result has: " + finalResult.toString());
		var name = finalResult.name;
		console.log("Who rolled: " + name);
		var numberOfDice = finalResult.numberOfDiceRolled;
		console.log("Number of Dice: " + numberOfDice);
		var dieRolled = finalResult.dieRolled;
		console.log("Die rolled: " + dieRolled);
		var totalValue = finalResult.totalValue;
		console.log("Total value: " + totalValue);
		var arrayValue = finalResult.resultArray;
		console.log("arrayValue = " + arrayValue);
		
		var d = new Date();
		var h = d.getHours();
		var m = d.getMinutes();
		var s = d.getSeconds();
		var time = h + ":" + m + ":" + s;
		console.log("time = " + time);
		
		console.log("Dice were rolled!");
		try
		{
			var diceRolled = numberOfDice + 'd' + dieRolled;
			rollDiceSound(diceRolled);
		}
		catch (e) {
			console.log('Fail sound play');
			console.log(e);
		 }
		
		console.log('setting dice text in UI');
		setText(diceElement, arrayValue + " on " + numberOfDice + "d" + dieRolled + " for a total of: " + totalValue);
		setText(whoRolled, name + " rolled:");
		setText(historyBox, time + " " +  name + " rolled: " + arrayValue + " on " + numberOfDice + "d" + dieRolled + " for a total of: " + totalValue + "\n" + historyBoxText);
	}
}

// A function to be run at app initialization time which registers our callbacks
function init() 
{
	console.log('Init app.');

	var apiReady = function(eventObj) 
	{
    
		if (eventObj.isApiReady) 
		{
			console.log('API is ready');

			gapi.hangout.data.onStateChanged.add(function(eventObj) 
			{
				updateStateUi(eventObj.state);
			});
						//gapi.hangout.data.onParticipantsAdded.add(updateUserList())
						updateStateUi(gapi.hangout.data.getState());

			gapi.hangout.onApiReady.remove(apiReady);
		}
	};

	// This application is pretty simple, but use this special api ready state
	// event if you would like to any more complex app setup.
	gapi.hangout.onApiReady.add(apiReady);
}

gadgets.util.registerOnLoadHandler(init);
