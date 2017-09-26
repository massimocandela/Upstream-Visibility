function HeuristicsManager(type) {
	this.current_order, this.current_heuristic;
	this.date_converter = new DateConverter();
	this.metrics_manager = new MetricsManager();

	this.StreamgraphHeuristics = {
		"lev_rnd_cum":"asnStdDevByPointMinimizationRandomWalker",
		"lev_rnd_max":"asnLevDistMinimizationRandWalkMAX",
		"st_rnd_cum":"asnLevDistMinimizationRandWalkCUM",
		"st_inf_cum":"asnStdDevByPointMinimizationInference",
		"st_grdy_cum":"asnStdDevByPointMinimizationGreedy",
		"n_f":"getSortedASByExchanges",
		"w_cum":"wiggleSort",
		"w_max":"wiggleSort",
		"disc":"disconnectionsSort",
		"s_st":"getSortedAsnByFreqSTDEV",
		"s_var":"getSortedAsnByFreqVAR",
		"s_avg":"getSortedAsnByFreqAVG",
		"s_cum":"getSortedAsnByFreqSUM",
	};

	this.HeatmapHeuristics = {
		"st_grdy_cum":"getHeatStdev",
		"nf_1":"getSortedRRCByExchanges_level",
		"nf_2":"getSortedRRCByExchanges_level_var",
		"geo":"getGeoOrder",
		"asn":"getASNOrder"
	};

	this.Sorts = {
		"asc":"asc",
		"dsc":"dsc"
	};
	/*defaults*/
	this.default_heuristic_s = "n_f";
	this.default_heuristic_h = "nf_1";
	this.setDefaultHeuristic(type);
	this.current_sort_type;
}

HeuristicsManager.prototype.setDefaultHeuristic = function(type){
	if(type=="stream")
		this.current_heuristic=this.default_heuristic_s;
	else 
	if(type=="heat")
		this.current_heuristic=this.default_heuristic_h;
}

HeuristicsManager.prototype.getCurrentOrdering = function(current_parsed, type){
	var ordering,heuristic;
	if(type=="stream"){
		heuristic = this.StreamgraphHeuristics[this.current_heuristic];
		switch(this.current_heuristic){
			//STREAMGRAPH
			case "lev_rnd_cum" :
				ordering=this[heuristic](current_parsed);
			break;
			case "lev_rnd_max" :
				ordering=this[heuristic](current_parsed);
			break;
			case "st_rnd_cum" :
				ordering=this[heuristic](current_parsed);
			break;
			case"st_inf_cum" :
				ordering=this[heuristic](current_parsed);
			break;
			case "st_grdy_cum" :
				ordering=this[heuristic](current_parsed);
			break;
			case "n_f" :
				ordering=this[heuristic](current_parsed);
			break;
			case "w_cum" :
				ordering=this[heuristic](current_parsed,this.metrics_manager.sortByWiggleMinSum);
			break;
			case "w_max" :
				ordering=this[heuristic](current_parsed,this.metrics_manager.sortByWiggleMinMax);
			break;
			case "disc" :
				ordering=null;
			break;
			case "s_st" :
				ordering=this[heuristic](current_parsed,this.current_sort_type);
			break;
			case "s_var" :
				ordering=this[heuristic](current_parsed,this.current_sort_type);
			break;
			case "s_avg" :
				ordering=this[heuristic](current_parsed,this.current_sort_type);
			break;
			case "s_cum" :
				ordering=this[heuristic](current_parsed,this.current_sort_type);
			break;
			default:
				ordering=null;
			break;
		}
	}
	else
	if(type=="heat"){
		heuristic = this.HeatmapHeuristics[this.current_heuristic];
		switch(this.current_heuristic){
			case "st_grdy_cum" :
				ordering=this[heuristic](current_parsed);
			break;
			case "nf_1" :
				ordering=this[heuristic](current_parsed);
			break;
			case "nf_2" :
				ordering=this[heuristic](current_parsed);
			break;
			case"geo" :
				ordering=this[heuristic](current_parsed);
			break;
			case "asn" :
				ordering=this[heuristic](current_parsed);
			break;
			default:
				ordering=null;
			break;
		}
	}
	return ordering;
}

//STD DEV RANDOM
HeuristicsManager.prototype.asnStdDevByPointMinimizationRandomWalker = function(current_parsed){
	var start = moment().valueOf();
	var best_ordering = current_parsed.asn_set;
	var theorical_devs = current_parsed.asn_stdev;
	var best_devs = this.metrics_manager.lineDistancesStdDev(current_parsed, best_ordering);
	var best_cum =  Math.floor(this.metrics_manager.lineDistanceStdDevScore(best_devs));
	var tentatives = best_cum*Object.keys(best_devs).length;
	var temperature = 1;
	var done_ordering = [];
	done_ordering.push(best_ordering);
	console.log("STD_DEV_RND_WLK_CUM, DIST: "+best_cum+", TENTATIVES: "+tentatives);
	while(tentatives>0){
		var new_seq = random_sort(asn_ordering);
		if(!contains(done_ordering,new_seq)){
			var new_devs = this.metrics_manager.lineDistancesStdDev(current_parsed, new_seq);
			var new_cum = Math.floor(this.metrics_manager.lineDistanceStdDevScore(new_devs));
			if(new_cum<best_cum){
				best_devs=new_devs;
				best_cum=new_cum;
				best_ordering=new_seq;
				tentatives+=best_cum*asn_ordering.length*temperature;
				console.log("New best ["+best_cum+"], "+" tentatives left:"+tentatives);
			}
			else {
				tentatives-=Math.floor(temperature*Math.min(best_cum,asn_ordering.length)/Math.max(best_cum,asn_ordering.length));
			}
			temperature++;
		}
		else {
			tentatives=tentatives/best_ordering.length;
		}
		
	}
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return best_ordering;
}

//STD DEV SWAP
HeuristicsManager.prototype.asnStdDevByPointMinimizationGreedy = function(current_parsed){
	var start = moment().valueOf();
	var theorical_devs = current_parsed.asn_stdev;
	var done = [];
	for(var i in theorical_devs)
		if(theorical_devs[i]==0){
			done.push(i);
		}
	var d_l = done.length;
	var a_l = current_parsed.asn_set.length;
	console.log("STD_DEV_GREEDY "+d_l+" on "+a_l+" are on baseline (0% deviation)");
	while(d_l<a_l){
		d_l++;
		var best = this.pickbest(current_parsed,done,current_parsed.asn_set);
		console.log(d_l+" pick "+best);
		done.push(best);
	}

	var ordering = this.stdDevBubbles(current_parsed,done);
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return ordering;
}

HeuristicsManager.prototype.pickbest = function (current_parsed,done,asn_ordering) {
	var left = asn_ordering.filter(function(e){return done.indexOf(e)==-1});
	var best_choose = left[0];
	var best_order = done.slice(0);
	best_order.push(best_choose);
	var best_dist = Object.values(this.metrics_manager.lineDistancesStdDev(current_parsed, best_order));
	var best_score = cumulate(best_dist);
	for(var i=1; i<left.length; i++){
		var try_choose = left[i];
		var try_order = done.slice(0);
		try_order.push(try_choose);
		var try_dist = Object.values(this.metrics_manager.lineDistancesStdDev(current_parsed, try_order));
		var try_score = cumulate(try_dist);
		if(try_score<=best_score){
			if(try_score<best_score || (max(try_dist)<max(best_dist)&&try_score==best_score)) {
				best_score=try_score;
				best_choose=try_choose;
				best_dist=try_dist;
			}
		}
	}
	return best_choose;
}

HeuristicsManager.prototype.stdDevBubbles = function(current_parsed, asn_ordering){
	var improved=false;
	var best_score = this.metrics_manager.lineDistanceStdDevScore(this.metrics_manager.lineDistancesStdDev(current_parsed,asn_ordering));
	var best_order = asn_ordering.slice(0);
	var phase_max = asn_ordering.length-1;
	//var changed=false;
	console.log("BEST SCORE "+best_score);
	//while(!changed){
		var phase = 0;
		while(phase<phase_max){
			phase++;
			console.log("phase "+phase);
			for(var i=0; i<asn_ordering.length-1; i++){
				var new_order = swap(i,(i+phase)%phase_max,asn_ordering.slice(0));
				var new_score = this.metrics_manager.lineDistanceStdDevScore(this.metrics_manager.lineDistancesStdDev(current_parsed,new_order));
				if(new_score<best_score){
					//changed=true;
					best_score=new_score;
					best_order=new_order.slice(0);
					console.log("NEW BEST "+best_score);
				}
			}
		//}
		//changed=!changed;
	}
	return best_order;
}

HeuristicsManager.prototype.asnStdDevByPointMinimizationInference = function(current_parsed){
	var start = moment().valueOf();
	var theorical_devs = current_parsed.asn_stdev;
	var done = [];
	for(var i in theorical_devs)
		if(theorical_devs[i]==0){
			done.push(i);
		}
	var d_l = done.length;
	var a_l = current_parsed.asn_set;
	console.log("STD_DEV_INF "+d_l+" on "+a_l+" are on baseline (0% deviation)");
	while(d_l<a_l){
		d_l++;
		var best = this.pickbest(current_parsed, done, current_parsed.asn_set);
		console.log(d_l+" pick "+best);
		done.push(best);
	}
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return done;
}

/************************************************ LEVENSTHEIN DISTANCE METHODS ************************************************/
HeuristicsManager.prototype.asnLevDistMinimizationRandWalkCUM = function(current_parsed){
	var start = moment().valueOf();
	var best_ordering = current_parsed.asn_set.slice(0);
	var ordering_length = best_ordering.length;
	var best_lev = this.metrics_manager.computeLevenshteinDistance(current_parsed,best_ordering);
	var best_cum = cumulate(best_lev);
	var best_avg = Math.floor(average(best_lev,best_cum));
	var best_max = max(best_lev);
	var done_ordering = [];
	done_ordering.push(best_ordering);
	var tentatives = Math.floor(fact(Math.floor(Math.sqrt(ordering_length))))*Math.min(best_cum,ordering_length);
	var temperature=1;
	console.log("LEV_DIST_RND_WLK_CUM, DIST: "+best_cum+", TENTATIVES: "+tentatives);
	while(tentatives>0){
		var new_seq = random_sort(current_parsed.asn_set);
		if(!contains(done_ordering,new_seq)){
			done_ordering.push(new_seq);
			var new_dist = this.metrics_manager.computeLevenshteinDistance(current_parsed,new_seq);
			var new_dist_tot = cumulate(new_dist);
			if(new_dist_tot<best_cum) {
				best_ordering=new_seq;
				best_cum=new_dist_tot;
				best_avg = Math.max(Math.floor(average(best_lev,best_cum)),1);
				best_max = max(best_lev);
				tentatives+=best_cum*ordering_length;
				console.log("New best ["+best_cum+"], "+" tentatives left:"+tentatives);
			}
			else {
				tentatives-=Math.floor(temperature*Math.min(best_cum,ordering_length)/Math.max(best_cum,ordering_length));
			}
			temperature=temperature+1;
		}
		else
			tentatives=Math.floor(tentatives/best_cum);
		
	}
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return best_ordering;
}

HeuristicsManager.prototype.asnLevDistMinimizationRandWalkMAX = function(current_parsed){
	var start = moment().valueOf();
	var best_ordering = current_parsed.asn_set.slice(0);
	var ordering_length = best_ordering.length;
	var best_lev = this.metrics_manager.computeLevenshteinDistance(current_parsed,best_ordering);
	var best_cum = cumulate(best_lev);
	var best_avg = Math.floor(average(best_lev,best_cum));
	var best_max = max(best_lev);
	var done_ordering = [];
	done_ordering.push(best_ordering);
	var tentatives = Math.floor(fact(Math.floor(Math.sqrt(ordering_length))))*Math.max(best_max,ordering_length);
	var temperature=1;
	console.log("LEV_DIST_RND_WLK_MAX, DIST: "+best_max+", TENTATIVES: "+tentatives);
	while(tentatives>0){
		var new_seq = random_sort(current_parsed.asn_set);
		if(!contains(done_ordering,new_seq)){
			done_ordering.push(new_seq);
			var new_dist = this.metrics_manager.computeLevenshteinDistance(current_parsed,new_seq);
			var new_dist_tot = cumulate(new_dist);
			var new_dist_max = max(new_dist);
			if(new_dist_max<best_max) {
				best_ordering=new_seq;
				best_cum=new_dist_tot;
				best_avg = Math.max(Math.floor(average(best_lev,best_cum)),1);
				best_max = new_dist_max;
				tentatives+=best_max*temperature*ordering_length;
				console.log("New best ["+best_max+"], "+" tentatives left:"+tentatives);
			}
			else {
				tentatives-=Math.floor(temperature*Math.max(best_max,1)/ordering_length);
			}
			temperature=temperature+1;
		}
		else
			tentatives=Math.floor(tentatives/ordering_length);
		
	}
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return best_ordering;
}

/************************************************ SORTING METHODS ************************************************/
/* get ASN sorted by STD DEV VALUE */
HeuristicsManager.prototype.getSortedAsnByFreqSTDEV = function(current_parsed, sort_type){
	var start = moment().valueOf();
	var new_order = [];
	for (var i in current_parsed.asn_stdev)
	    new_order.push([i, current_parsed.asn_stdev[i]])
	if(sort_type=="asc"){
		console.log("SORT_STD_DEV_ASC");
		new_order.sort(function(a, b) {
		    return a[1] - b[1];
		});
	}
	else {
		console.log("SORT_STD_DEV_DSC");
		new_order.sort(function(a, b) {
		    return b[1] - a[1];
		});
	}
	var values=new_order.map((o)=>o[0]);
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return values;
}

/* get ASN sorted by VARIANCE VALUE */
HeuristicsManager.prototype.getSortedAsnByFreqVAR = function(current_parsed, sort_type){
	var start = moment().valueOf();
	var new_order = [];
	for (var i in current_parsed.asn_varfreqs)
	    new_order.push([i, current_parsed.asn_varfreqs[i]])
	if(sort_type=="asc"){
		console.log("SORT_VAR_ASC");
		new_order.sort(function(a, b) {
		    return a[1] - b[1];
		});
	}
	else {
		console.log("SORT_VAR_DSC");
		new_order.sort(function(a, b) {
		    return b[1] - a[1];
		});
	}
	var values=new_order.map((o)=>o[0]);
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return values;
}

/* get ASN sorted by AVERAGE VALUE */
HeuristicsManager.prototype.getSortedAsnByFreqAVG = function(current_parsed, sort_type){
	var start = moment().valueOf();
	var new_order = [];
	for (var i in current_parsed.asn_avgfreqs)
	    new_order.push([i, current_parsed.asn_avgfreqs[i]])
	if(sort_type=="asc"){
		console.log("SORT_AVG_ASC");
		new_order.sort(function(a, b) {
		    return a[1] - b[1];
		});
	}
	else {
		console.log("SORT_AVG_DSC");
		new_order.sort(function(a, b) {
		    return b[1] - a[1];
		});
	}
	var values=new_order.map((o)=>o[0]);
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return values;
}

/* get ASN sorted by CUMULATE VALUE*/
HeuristicsManager.prototype.getSortedAsnByFreqSUM = function(current_parsed, sort_type){
	var start = moment().valueOf();
	var new_order = [];
	for (var i in current_parsed.asn_sumfreqs)
	    new_order.push([i, current_parsed.asn_sumfreqs[i]])
	if(sort_type=="asc"){
		console.log("SORT_SUM_ASC");
		new_order.sort(function(a, b) {
		    return a[1] - b[1];
		});
	}
	else {
		console.log("SORT_SUM_DSC");
		new_order.sort(function(a, b) {
		    return b[1] - a[1];
		});
	}
	var values=new_order.map((o)=>o[0]);
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return values;
}


/************************ near flows ************************/
HeuristicsManager.prototype.getSortedASByExchanges = function(current_parsed){
	var start = moment().valueOf();
	console.log("NEAR_FLOWS");
	bind_structure = new GDBS();
	var asn_set = current_parsed.asn_set.slice(0);
	//ignore null
	//asn_set.push(null);

	//exchanges
	var exchanges = current_parsed.asn_by_exchanges;
	//as involved in exchanges
	var exchanges_as = Object.keys(exchanges).map(function(e){if(e!="null") return parseInt(e); else return null;});
	//as not involved in exchanges
	var non_exchange_as = asn_set.filter(function(e){return exchanges_as.indexOf(e)<0});

	//SORT exchanges from the most important to the less important
	var exchange_sorted=[];
	for(var s in exchanges){
		var dest = exchanges[s];
		for(var d in dest){
			var count = dest[d];
			var source = (s!="null")? parseInt(s) : null;
			var destination = (d!="null")? parseInt(d) : null;
			//IGNORE NULL 
			if(source!=null && destination!=null) {
				var o = {
					source: source,
					destination: destination,
					count: count
				};
				exchange_sorted.push(o);
			}
		}
	}
	exchange_sorted = exchange_sorted.sort(function(a,b){return b["count"]-a["count"];});

	//init the bind structure
	bind_structure.init(exchanges_as);

	//best effort add-binds
	for(var e in exchange_sorted){
		var ex = exchange_sorted[e];
		bind_structure.consecutive(ex["source"],ex["destination"]);
	}

	var ordering;
	//ordering = this.exchanges_as_is(current_parsed, bind_structure, non_exchange_as);
	ordering = this.exchanges_plus_sd_greedy_block(current_parsed, bind_structure, non_exchange_as);
	ordering = ordering.filter(function(e){return e!=null;});
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return ordering;
}

HeuristicsManager.prototype.exchanges_as_is = function(current_parsed, bind_structure, non_exchange_as){
	//PROBLEM NULL SHOULD STAY ALWAYS ON HEAD
	return non_exchange_as.concat(bind_structure.show());
}

HeuristicsManager.prototype.exchanges_plus_sd_greedy_block = function(current_parsed, bind_structure, non_exchange_as){
	var ordering = non_exchange_as;
	//find left blocks
	var left = [];
	var blocks = bind_structure.getStructure();
	for(var b in blocks)
		left.push(parseInt(b));
	//while there are left blocks
	while(left.length>0){
		var base = ordering.slice(0);
		var best_score = Infinity;
		var best_index = 0;
		var best_order = [];
		var block;
		for(var b in left){
			//straigth
			block = blocks[left[b]];
			var new_order = base.concat(block);
			var new_score = this.metrics_manager.lineDistanceStdDevScore(this.metrics_manager.lineDistancesStdDev(current_parsed,new_order));
			if(new_score<best_score){
				best_score=new_score;
				best_index=b;
				if(Array.isArray(block))
					best_order=block.slice(0);
				else
					best_order=block;
			}
			//reversed
			if(Array.isArray(block)){
				block = blocks[left[b]].slice(0).reverse();
				new_order = base.concat(block);
				new_score = this.metrics_manager.lineDistanceStdDevScore(this.metrics_manager.lineDistancesStdDev(current_parsed,new_order));
				if(new_score<best_score){
					best_score=new_score;
					best_index=b;
					best_order=block.slice(0);
				}
			}
		}
		//UPDATE with greedy best
		left.splice(best_index,1);
		ordering = ordering.concat(best_order);
	}
	return ordering;
}

/************************ wiggles ************************/
HeuristicsManager.prototype.wiggleFirstOrdering = function(current_parsed, asn_set, calc_type){
	var fixed_order = [];
	var best_order = [];
	var left = asn_set.slice(0);
	var layers = asn_set.length;
	for(var i=0;i<layers;i++){
		var best_w=Infinity;
		for(var j in left){
			var temp = fixed_order.slice(0);
			temp.push(left[j]);
			var w=this.metrics_manager.computeWiggle(current_parsed,temp);
			var curr_w = this.metrics_manager.wiggleScore(calc_type(w,temp));
			if(curr_w<best_w){
				best_w=curr_w;
				best_order=temp.slice(0);
			}
		}
		fixed_order=best_order;
		left=asn_set.filter(function(e){return fixed_order.indexOf(e)<0;});
		console.log(left.length+"/"+layers);
	}
	return fixed_order;
}

HeuristicsManager.prototype.wiggleBubblesPhase = function(current_parsed, asn_ordering, calc_type){
	var improved=false;
	var best_score = this.metrics_manager.wiggleScore(calc_type(this.metrics_manager.computeWiggle(current_parsed,asn_ordering,calc_type), asn_ordering));
	var best_order = asn_ordering.slice(0);
	var phase_max = asn_ordering.length-1;
	//var changed=false;
	console.log("BEST SCORE "+best_score);
	//while(!changed){
		var phase = 0;
		while(phase<phase_max){
			phase++;
			console.log("phase "+phase);
			for(var i=0; i<asn_ordering.length-1; i++){
				var new_order = swap(i,(i+phase)%phase_max,asn_ordering.slice(0));
				var new_wiggle = this.metrics_manager.computeWiggle(current_parsed,new_order);
				var new_score = this.metrics_manager.wiggleScore(calc_type(new_wiggle,new_order));
				if(new_score<best_score){
					//changed=true;
					best_score=new_score;
					best_order=new_order.slice(0);
					console.log("NEW BEST "+best_score);
				}
			}
		//}
		//changed=!changed;
	}
	return best_order;
}

HeuristicsManager.prototype.wiggleSort = function(current_parsed, calc_type){
	var start = moment().valueOf();
	console.log("WIGGLE_SORT");
	console.log("initial sorting");
	var order = this.wiggleFirstOrdering(current_parsed,current_parsed.asn_set, calc_type);
	console.log("bubble phase");
	order = this.wiggleBubblesPhase(current_parsed,order, calc_type);
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return order;
}

/************************ disconnections ************************/
HeuristicsManager.prototype.disconnectionsFirstOrdering = function(current_parsed,asn_set){
	var fixed_order = [];
	var best_order = [];
	var left = asn_set.slice(0);
	var layers = asn_set.length;
	for(var i=0;i<layers;i++){
		var best_w=Infinity;
		for(var j in left){
			var temp = fixed_order.slice(0);
			temp.push(left[j]);
			var w=this.metrics_manager.disconnections(current_parsed,temp);
			var curr_w = this.metrics_manager.disconnectionsScore(w);
			if(curr_w<best_w){
				best_w=curr_w;
				best_order=temp.slice(0);
			}
		}
		fixed_order=best_order;
		left=asn_set.filter(function(e){return fixed_order.indexOf(e)<0;});
		console.log(left.length+"/"+layers);
	}
	return fixed_order;
}

HeuristicsManager.prototype.disconnectionsBubblesPhase = function(current_parsed, asn_ordering){
	var best_score = this.metrics_manager.disconnectionsScore(this.metrics_manager.disconnections(current_parsed,asn_ordering));
	var best_order = asn_ordering.slice(0);
	var phase_max = asn_ordering.length-1;
	//var changed=false;
	console.log("BEST SCORE "+best_score);
	//while(!changed){
		var phase = 0;
		while(phase<phase_max){
			phase++;
			console.log("phase "+phase);
			for(var i=0; i<asn_ordering.length-1; i++){
				var new_order = swap(i,(i+phase)%phase_max,asn_ordering.slice(0));
				var new_disconnections = this.metrics_manager.disconnections(current_parsed,new_order);
				var new_score = this.metrics_manager.disconnectionsScore(new_disconnections);
				if(new_score<best_score){
					//changed=true;
					best_score=new_score;
					best_order=new_order.slice(0);
					console.log("NEW BEST "+best_score);
				}
			}
		}
		//changed=!changed;
	//}
	return best_order;
}

HeuristicsManager.prototype.disconnectionsSort = function(current_parsed){
	var start = moment().valueOf();
	console.log("DISCONNECTIONS_SORT");
	console.log("initial sorting");
	var order = this.disconnectionsFirstOrdering(current_parsed,current_parsed.asn_set);
	console.log("bubble phase");
	order=this.disconnectionsBubblesPhase(current_parsed,order);
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return order;
}

/************************ HEAT SORTING ************************/
HeuristicsManager.prototype.sortRRCByASOrdering_level = function(current_parsed,asn_ordering){
	var start = moment().valueOf();
	var rrc_composition = current_parsed.rrc_by_composition;
	var tail_set = Object.keys(rrc_composition);
	var result = [];
	//buckets
	var buckets = {};
	asn_ordering.push(null);
	for(var i in asn_ordering){
		buckets[asn_ordering[i]]=[];
	}
	//find max depth
	var max_depth = 0;
	for(var r in rrc_composition)
		max_depth=Math.max(max_depth, rrc_composition[r].length);
	//for every depth and every as in the ordering
	for(var i=1; i<=max_depth; i++){
		var current_set = [];
		var temp = [];
		tail_set.forEach(function(e){if(rrc_composition[e].length==i) current_set.push(e); else temp.push(e);});
		tail_set=temp;
		for(var c in current_set){
			var rrc = current_set[c];
			var asn = rrc_composition[rrc][(i-1)];
			if(asn=="null")
				asn=null;
			else
				asn=parseInt(asn);
			buckets[asn].push(rrc);
		}
	}
	//recompose
	for(var i in asn_ordering){
		var as = asn_ordering[i];
		for(var j in buckets[as]){
			var rrc = buckets[as][j];
			result.push(rrc);
		}
	}
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return result;
}

HeuristicsManager.prototype.sortRRCByASOrdering_level_var = function(current_parsed,asn_ordering){
	var start = moment().valueOf();
	var rrc_composition = current_parsed.rrc_by_composition;
	var tail_set = Object.keys(rrc_composition);
	var result = [];
	//buckets
	var buckets = {};
	asn_ordering.push(null);
	for(var i in asn_ordering){
		buckets[asn_ordering[i]]=[];
	}
	//find max depth
	var max_depth = 0;
	for(var r in rrc_composition)
		max_depth=Math.max(max_depth, rrc_composition[r].length);
	//for every depth and every as in the ordering
	for(var i=1; i<=max_depth; i++){
		var current_set = [];
		var temp = [];
		tail_set.forEach(function(e){if(rrc_composition[e].length==i) current_set.push(e); else temp.push(e);});
		tail_set=temp;
		for(var c in current_set){
			var rrc = current_set[c];
			//here the variation get always the first 
			var asn = rrc_composition[rrc][0];
			if(asn=="null")
				asn=null;
			else
				asn=parseInt(asn);
			buckets[asn].push(rrc);
		}
	}
	//recompose
	for(var i in asn_ordering){
		var as = asn_ordering[i];
		for(var j in buckets[as]){
			var rrc = buckets[as][j];
			result.push(rrc);
		}
	}
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return result;
}

HeuristicsManager.prototype.sortRRCByGeoOrder = function(current_parsed){
	var geo_counter = [];
	for(var r in current_parsed.rrc_set){
		var rrc = current_parsed.rrc_set[r];
		var geo = current_parsed.known_rrc[rrc]['geo'].split("-")[0];
		var to_insert = geo_counter[geo];
		if(!to_insert){
			to_insert=[];
		}
		to_insert.push(rrc);
		geo_counter[geo]=to_insert;
	}
	var sorted_geo = sorted_by_field_key_length(geo_counter);
	sorted_geo=sorted_geo.map(function(e){return e[0]});
	/*geo order found*/
	var order = [];
	for(var g in sorted_geo){
		var geo = sorted_geo[g];
		order = order.concat(geo_counter[geo]);
	}
	return order;
}

HeuristicsManager.prototype.sortRRCByAsnOrder = function(current_parsed){
	var geo_counter = [];
	var empty = [];
	for(var r in current_parsed.rrc_by_composition){
		var rrc = r;
		var as = current_parsed.rrc_by_composition[rrc][0];
		if(as=="null") {
			empty.push(rrc);
		}
		else{
			var as_string = current_parsed.known_asn[as];
			var split_index = as_string.lastIndexOf(",");
			var as_string = as_string.substring(split_index+1);
			var geo = (as_string).trim();//.split("-")[0]
			var to_insert = geo_counter[geo];
			if(!to_insert){
				to_insert=[];
			}
			to_insert.push(rrc);
			geo_counter[geo]=to_insert;
		}
	}
	var sorted_geo = sorted_by_field_key_length(geo_counter);
	sorted_geo=sorted_geo.map(function(e){return e[0]});
	/*as order found*/
	var order = [];
	for(var g in sorted_geo){
		var geo = sorted_geo[g];
		order = order.concat(geo_counter[geo]);
	}
	return empty.concat(order);
}

/**************************************************************************************/
HeuristicsManager.prototype.getSortedRRCByExchanges_level = function(current_parsed){
	var start = moment().valueOf();
	var asn_ordering = this.getSortedASByExchanges(current_parsed)
	var order = this.sortRRCByASOrdering_level(current_parsed,current_parsed.asn_set);
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return order;
}

HeuristicsManager.prototype.getSortedRRCByExchanges_level_var = function(current_parsed){
	var start = moment().valueOf();
	var asn_ordering = this.getSortedASByExchanges(current_parsed)
	var order = this.sortRRCByASOrdering_level_var(current_parsed,current_parsed.asn_set);
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return order;
}

HeuristicsManager.prototype.getHeatStdev = function(current_parsed){
	var start = moment().valueOf();
	var asn_ordering = this.asnStdDevByPointMinimizationGreedy(current_parsed)
	var order = this.sortRRCByASOrdering_level_var(current_parsed,current_parsed.asn_set);
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return order;
}

HeuristicsManager.prototype.getGeoOrder = function(current_parsed){
	var start = moment().valueOf();
	var order = this.sortRRCByGeoOrder(current_parsed);
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return order;
}

HeuristicsManager.prototype.getASNOrder = function(current_parsed){
	var start = moment().valueOf();
	var order = this.sortRRCByAsnOrder(current_parsed);
	var end = moment().valueOf();
	console.log("TIME_EXECUTED "+this.date_converter.executionTime(start,end));
	return order;
}