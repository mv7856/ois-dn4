$(document).ready(function(){
	$("#readEhrForm").change(function() {
		$("#readEhrId").val($(this).val());
	});
	$("#formHealthInput").change(function() {
		var splits = $(this).val().split(",");
		$("#addId").val(splits[0]);
		$("#dan1").val(splits[1]);
		$("#leto1").val(splits[2]);
		$("#addHeight").val(splits[3]);
		$("#addWeigth").val(splits[4]);
		$("#addTemperature").val(splits[5]);
		$("#addSystolic").val(splits[6]);
		$("#addDiastolic").val(splits[7]);
		$("#addOxigen").val(splits[8]);
		$("#addCommiter").val(splits[9]);
	});
	$("#analyseTemplate").change(function() {
		$("#analyseId").val($(this).val());
	});
});

var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function createEhr(){
	console.log("Jea");
	sessionId=getSessionId();

	var ime=$("#createName").val();
	var priimek=$("#createSecondName").val();
	var email=$("#createEmail").val();
	var spol="UNKNOWN";
	if(document.getElementById("male").checked){
		spol="MALE";
	}
	else if(document.getElementById("female").checked){
		spol="FEMALE";
	}
	if(!($('#dan').val()) || !($('#leto').val()) || spol=="UNKNOWN"){
		$("#messages").html("<span class='label label-warning fade-in'>Please, fill in all required data !</span>");
	}
	else{
		var el=document.getElementById("mesec");
		var mesec=el.options[el.selectedIndex].value;
		var date=new Date($("#leto").val(),mesec,$("#dan").val());
		var birth=date.toISOString();

		if(!ime || !priimek || !email || !birth || ime.trim().length==0 || priimek.trim().length==0 || email.trim().length==0){
			$("#messages").html("<span class='label label-warning fade-in'>Please, fill in all required data !</span>");
		}
		else{
			$.ajaxSetup({
				headers: {
					"Ehr-Session": sessionId
				}
			});
			$.ajax({
				url: baseUrl + "/ehr",
				type: 'POST',
				success: function(data){
					var ehrId=data.ehrId;
					
					var partyData = {
			            firstNames: ime,
			            lastNames: priimek,
			            gender: spol,
			            dateOfBirth: birth,
			            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
			        };

			        $.ajax({
			        	url: baseUrl + "/demographics/party",
			        	type: 'POST',
			        	contentType: 'application/json',
			        	data: JSON.stringify(partyData),
			        	success: function(data){
			        		$("#login").hide();

			        		$("#box").append("<div class='row'> \
								<div class='col-md-7'>	\
									<div class='jumbotron'> \
										<h2>Successfully created !</h2> \
											<p>Remember your EHR ID to retrieve your data !</p> \
											<p>"+ime+" "+priimek+",your ID is <b>"+ehrId +"</b> <br>Remember it (or write it down) !! <br><br>Now you are ready to start using our application. Before doing it, we encourage you to watch the video by energy professionalist Ataana Method. Maybe it will change your life. <br> Now you can start using our application by clicking MyData ! <br><b>Enjoy !!!</b> </p> \
									</div> \
								</div> \
								<div class='col-md-5'> \
									<div class='jumbotron'> \
									<h4>Ataana Method, energy professionalist</h4> <br>\
									<div class='embed-responsive embed-responsive-16by9'> \
										<iframe class='embed-responsive-item' src='http://www.youtube.com/embed/kBNTtIJuxCw' allowfullscreen></iframe> \
									</div> \
									</div> \
								</div> \
							</div>"); 

			        		
			        	},
			        	error: function(err) {
			            	$("#messages").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
			            	console.log(JSON.parse(err.responseText).userMessage);
			            }
			        });
				},
				error: function(err){
					$('#messages').html("<span class='label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
			            	console.log(JSON.parse(err.responseText).userMessage);
				}
			});
		}
	}
}

function generate() {
	var osebe=[{ime:"Jesus",priimek:"Christus",email:"jesus.christus@prayme.com",dan:1,mesec:1,leto:1,spol: "MALE"},
	{ime:"Nona",priimek:"Z_Motiko",email:"NonaZMotiko@studio.com",dan:12,mesec:3,leto:1980,spol: "FEMALE"},
	{ime:"Adriana",priimek:"Lima",email:"adriana.lima@victoriaSecret.com",dan:12,mesec:6,leto:1981,spol: "FEMALE"}];

	osebe.forEach(function(data){
		$("#createName").val(data.ime);
		$("#createSecondName").val(data.priimek);
		$("#createEmail").val(data.email);
		$("#dan").val(data.dan);
		$("#mesec").val(data.mesec);
		$("#leto").val(data.leto);
		if(data.spol=="MALE"){
			document.getElementById("male").checked=true;
		}
		else{
			document.getElementById("female").checked=true;
		}
		createEhr();
	});
}

function readEhr() {
	console.log("Jea");
	var sessionId = getSessionId();
	var ehrId = $("#readEhrId").val();
	console.log(ehrId);

	if (!ehrId || ehrId.trim().length == 0) {
		alert("Please, insert required EHR ID !");
	}
	else{
		$.ajax({
			url: baseUrl+"/demographics/ehr/"+ehrId+"/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
			success: function(data) {
				var party=data.party;
				console.log(party.data);
				$("#readEhrResponse").append("<div class='col-md-12'> \
					<table class='table table-striped table-hover'><tr><td>Name: </td><td class='text-right'>"+party.firstNames+"</td></tr> \
					<tr><td>Second name: </td><td class='text-right'>"+party.lastNames+"<td></tr> \
					<tr><td>Date of birth: </td><td class='text-right'>"+party.dateOfBirth+"<td></tr> \
					<tr><td>Gender: </td><td class='text-right'>"+party.gender+"<td></tr> \
					</div>");
			},
			errorr: function() {
				alert((err.responseText).userMessage);
			}
		});
	}
}

function addHealthData() {
	sessionId=getSessionId();

	var ehrId = $("#addId").val();
	var height = $("#addHeight").val();
	var weigth = $("#addWeigth").val();
	var temperature = $("#addTemperature").val();
	var systolic = $("#addSystolic").val();
	var diastolic = $("#addDiastolic").val();
	var oxigen = $("#addOxigen").val();
	var commiter = $("#addCommiter").val();

	if(!($('#dan1').val()) || !($('#leto1').val())){
		alert("Please, fill in all required data !")
	}
	var el=document.getElementById("mesec1");
	var mesec=el.options[el.selectedIndex].value;
	var date=new Date($("#leto1").val(),mesec,$("#dan1").val());
	var datum=date.toISOString();

	if (!ehrId || !height || !weigth || !temperature || !systolic || !diastolic || !oxigen || !commiter || ehrId.trim().length == 0
		||  height.trim().length == 0 || weigth.trim().length == 0 || temperature.trim().length == 0 ||
		 systolic.trim().length == 0|| diastolic.trim().length == 0|| oxigen.trim().length == 0|| commiter.trim().length == 0) {
		alert("Please, insert all of required data !");
	}
	else{
		$.ajaxSetup({
		    headers: {
		    	"Ehr-Session": sessionId
		    }
		});
		var compositionData = {
			"ctx/time": datum,
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "vital_signs/body_temperature/any_event/temperature|magnitude": temperature,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": systolic,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolic,
		    "vital_signs/height_length/any_event/body_height_length": height,
		    "vital_signs/body_weight/any_event/body_weight": weigth,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": oxigen
		};
		var queryParams = {
		    "ehrId": ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: commiter
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(queryParams),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(compositionData),
		    success: function (res) {
		       	alert("Successfully added ! :"+res.meta.href);
		    },
		    errorr: function(err) {
		    	alert(JSON.parse(err.responseText).userMessage);
		    }
		});

	}
}

function analyse() {
	sessionId=getSessionId();

	var ehrId=$("#analyseId").val();
	var poizvedba=$("#izbira").val();

	if(!ehrId || !poizvedba || ehrId.trim().length==0 || poizvedba.trim().length==0){
		alert("Please, fill in all required data !!");
	}
	else{
		if(poizvedba==1){//body temperature
			$.ajaxSetup({
			    headers: {
			        "Ehr-Session": sessionId
			    }
			});
			var aql = "select a_a/data[at0002]/events[at0003]/time/value as cas,a_a/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temp from EHR e[e/ehr_id/value='"+ehrId+"'] contains COMPOSITION a contains OBSERVATION a_a[openEHR-EHR-OBSERVATION.body_temperature.v1] order by a_a/data[at0002]/events[at0003]/time/value offset 0 limit 100";
			$.ajax({
			    url: baseUrl + "/query?" + $.param({"aql": aql}),
			    type: 'GET',
			    success: function (res) {
			    	if(res){
			    		//$("#gumb").hide();
				    	var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
				    	var file=[];

				        var rows = res.resultSet;
				        //console.log(rows[0].cas);
				        for (var i in rows) {
				        	var dat=rows[i].cas.substring(8,10)+"-"+months[(rows[i].cas.substring(5,7))-1]+"-"+rows[i].cas.substring(2,4);
				        	var object={date: dat,close: rows[i].temp};
				        	file.push(object);
				        //	console.log(object.close);
				        	//tsv+=rows[i].cas.substring(8,10)+"-"+months[(rows[i].cas.substring(5,7))-1]+rows[i].cas.substring(2,4)+"\t"+rows[i].temp+"\n";          
				        }
				       $("#graf").empty();
				        narisiGraf(file,"temperature");

			    	}
			    	else{
			    		alert("No data ! Go to Edit tab and add some data.");
			    	}
			    },
			    error: function(err) {
			    	alert(JSON.parse(err.responseText).userMessage);
			    }
			});
		}
		else if(poizvedba==2){//height
			$.ajax({
				 url: baseUrl+"/view/"+ehrId+"/height",
					    type: "GET",
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if(res){
					    		//$("#gumb").hide();
						    	var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
						    	var file=[];
						    
						      	console.log(res);
						       for (var i=res.length-1;i>=0;i--) {
						        	var dat=res[i].time.substring(8,10)+"-"+months[(res[i].time.substring(5,7))-1]+"-"+res[i].time.substring(2,4);
						        	var object={date: dat,close: res[i].height};
						        	file.push(object);
						        	//console.log(object);

				        		}
				       		//console.log(file);
				       		$("#graf").empty();
				        	narisiGraf(file,"height");
					    	}
					    	else {alert("No data ! Go to Edit tab and add some data.");}
					    },
					    error: function(err) {
					    	alert(JSON.parse(err.responseText).userMessage);
					    }

			});
		}
		else if(poizvedba==3){//weigth
				$.ajax({
				 url: baseUrl+"/view/"+ehrId+"/weight",
					    type: "GET",
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if(res){
					    		//$("#gumb").hide();
						    	var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
						    	var file=[];
						    
						      	console.log(res.length);
						       for (var i=res.length-1;i>=0;i--) {
						        	var dat=res[i].time.substring(8,10)+"-"+months[(res[i].time.substring(5,7))-1]+"-"+res[i].time.substring(2,4);
						        	var object={date: dat,close: res[i].weight};
						        	file.push(object);
						        	//console.log(object);

				        		}
							$("#graf").empty();
				        	narisiGraf(file,"weight");

					    	}
					    	else {alert("No data ! Go to Edit tab and add some data.");}
					    },
					    error: function(err) {
					    	alert(JSON.parse(err.responseText).userMessage);
					    }

			});
		}
	}
}

function narisiGraf(file,zdravje) {
	console.log(file);
	var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%d-%b-%y").parse;

	var x = d3.time.scale()
	    .range([0, width]);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	var line = d3.svg.line()
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.close); });

	var svg = d3.select("#graf").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 
	//d3.csv(file, function(error, data) {
	//console.log(file);
	file.forEach(function(d) {
	    d.date = parseDate(d.date);
	    d.close = +d.close;

	  });

  x.domain(d3.extent(file, function(d) { return d.date; }));
  y.domain(d3.extent(file, function(d) { return d.close; }));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(zdravje);

  svg.append("path")
      .datum(file)
      .attr("class", "line")
      .attr("d", line);
//});
}