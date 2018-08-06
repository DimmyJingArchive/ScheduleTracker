const firebase = require("firebase/app");
require("firebase/database");
const $ = require("jquery");
import "./style.css";


// initialize firebase
// plz dont use this
var config = {
	apiKey: "AIzaSyAOw62ZHaQoREwvTx4Yg1GeZ-GWQrVNtBQ",
	authDomain: "test-c0cd1.firebaseapp.com",
	databaseURL: "https://test-c0cd1.firebaseio.com",
	projectId: "test-c0cd1",
	storageBucket: "test-c0cd1.appspot.com",
	messagingSenderId: "912404826355"
};
firebase.initializeApp(config);


var database = firebase.database();


function write_data(name, room_num)
{
	for (let i = 0; i < 8; i++)
	{
		if (room_num[i] == "") {
			continue;
		}
		database.ref("schedule/" + room_num[i] + "/" + i + "/" + name).set({exist: true});
	}
}


function get_data(room_num)
{
	let data = [];
	for (let i = 0; i < 8; i++)
	{
		data.push([]);
		if (room_num[i] === "") {
			continue;
		}
		database.ref("schedule/" + room_num[i] + "/" + i).once("value", function(snapshot) {
			snapshot.forEach(function(childSnapshot) {
				data[i].push(childSnapshot.key);
			});
		});
	}
	return data;
}


function delete_user(delete_name)
{
	const ref = database.ref("schedule/")
	ref.once("value", function(schedule) {
		schedule.forEach(function(room_num) {
			let room_num_ref = ref.child(room_num.key);
			room_num_ref.once("value", function(periods) {
				periods.forEach(function(period) {
					let period_ref = room_num_ref.child(period.key);
					period_ref.once("value", function(names) {
						names.forEach(function(name) {
							if (delete_name == name.key) {
								period_ref.child(name.key).remove();
							}
						});
					});
				});
			});
		});
	});
}


function check_valid(list)
{
	for (var i of list)
	{
		if (i !== "" && i.search(/\w?\d+/) == -1)
		{
			console.log("Wrong Input");
			return false;
		}
	}
}


$(document).ready(function() {
	$("#submitButton").click(function() {
		name = $("#InputName").val();
		let schedules = [];
		for (let i = 0; i < 8; i++)
		{
			schedules.push($("#InputPeriod" + i).val());
		}
		if (!check_valid(schedules))
		{
			$("#ErrorMsg").text("Wrong Input, use a ROOM NUMBER, if you have sport then too bad, just leave it empty");
			return;
		}
		write_data(name, schedules);
		let data = get_data(schedules);
		// Too lazy to do callbacks and Promises and stuff, deal with it
		window.setTimeout(function() {
			for (let i = 0; i < 8; i++)
			{
				for (let val of data[i]) {
					$("#ListPeriod" + i).append("<li>" + val + "</li>");
				}
			}
		}, 1000);
	});
	$("#deleteButton").click(function() {
		name = $("#DeleteUser").val();
		delete_user(name);
	});
});
