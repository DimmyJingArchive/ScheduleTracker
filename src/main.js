import firebase from "firebase/app";
import "firebase/database";
import Vue from "vue";


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
	console.log("wrote data " + room_num + " with name " + name);
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
	console.log(list);
	for (var i of list)
	{
		if (i !== "" && i.search(/\w?\d+/) == -1)
		{
			console.log("Wrong Input");
			return false;
		}
	}
	return true;
}


var vm = new Vue({
	el: "#vm",
	data: {
		message: "",
		inputs: ["", "", "", "", "", "", "", "", ""],
		results: [[], [], [], [], [], [], [], []],
		delete_name: "",
		err_msg: "",
		show_input: true,
		show_output: false
	},
	methods: {
		submit: function() {
			let name = this.inputs[0]
			let schedule = this.inputs.slice(1);
			if (!check_valid(schedule))
			{
				this.err_msg = "Wrong Input, use a ROOM NUMBER, if you have sport then too bad, just leave it empty";
				return;
			}
			else
			{
				this.err_msg = "";
			}
			if (name !== "")
			{
				write_data(name, schedule);
			}
			let data = get_data(schedule);
			console.log(data);
			this.results = data;
			this.show_input = false;
			this.show_output = true;
		},
		back: function() {
			this.show_input = true;
			this.show_output = false;
		},
		delete_user: function() {
			delete_user(this.delete_name);
		}
	}
});
