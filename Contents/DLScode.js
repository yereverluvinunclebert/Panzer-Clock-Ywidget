// Version 3.1	February 5, 2016

/*property
	Apr, Aug, Dec, Feb, Fri, Jan, Jul, Jun, Mar, May, Mon, Nov, Oct, Sat, Sep,
	Sun, Thu, Tue, UTC, Wed, debug, floor, forEach, getDay, getTime,
	getUTCFullYear, getUTCMonth, indexOf, parse, readFile, some, split,
	substring, toUTCString
*/

//////////////////////////////////// Daylight Saving Time Code /////////////////////////////////////

"use strict";

var eprint = function (s) {
	if (widget.debug === "on") {
		print(s);
	}
	return;
};

var lprint = function (s) {
	if (widget.debug === "on") {
		log(s);
	}
	return;
};

// read the rules list entries from file and parse each separate rule elements into a 
// array elements within each rule (rules becomes a two dimensional array)
function getDLSrules(path) {
    //print ("%DST func getDLSrules");
    //print ("%DST-I path " + path);
    
	// ["US", "Apr", "Sun>=1", "120", "60", "Oct", "lastSun", "60"]
	var ruleList = filesystem.readFile(path).split(/\r\n?|\n/);
	var rules = [];

	ruleList.forEach(function (ele, i) {
		rules[i] = JSON.parse(ele);
	});
    //print ("%DST-O getDLSrules(eg.) " + rules[1]);
	return rules;
}

var DLSrules = getDLSrules("Resources/DLSRules.txt");

//var gTheStart = "";
//var gTheEnd = "";

//---------------------------------------------------------------------------------------
// Function  : getNumberOfMonth
// Author    : 
// Date      : 07/10/2023
// Purpose   : get the number of the month given a month name
//---------------------------------------------------------------------------------------
function getNumberOfMonth(month) {
    //print ("%DST func getNumberOfMonth");
    //print ("%DST-I month " + month);
    
	var months = {Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11};
	var i;

	i = months[month];
	if (i !== undefined) {
        //print ("%DST-O getNumberOfMonth " + i);
		return i;
	}
	print ("getNumberOfMonth: " + month + " is not a valid month name");
    //print ("%DST-O abnormal getNumberOfMonth -1");
    
	return -1;
}


//---------------------------------------------------------------------------------------
// Function   : getNumberOfDay
// Author    : beededea
// Date      : 07/10/2023
// Purpose   : get the number of the day given a day name
//---------------------------------------------------------------------------------------
function numberOfDay(day) {
	var days = {Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6};
	var i;
    
    //print ("%DST func getNumberOfDay");
    //print ("%DST-I day " + day);

	i = days[day];
	if (i !== undefined) {
        //print ("%DST-O getNumberOfDay " + i);
		return i;
	}
    //print ("%DST-O Abnormal getNumberOfDay " + i);
	eprint("numberOfDay: " + day + " is not a valid day name");
	return -1;
}


//---------------------------------------------------------------------------------------
// Function  : getDaysInMonth
// Author    : beededea
// Date      : 07/10/2023
// Purpose   : get the number of natural full days in a given month
//---------------------------------------------------------------------------------------
function getDaysInMonth(month, year) {
	var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    //print ("%DST func getDaysInMonth");
    //print ("%DST-I month " + month);
    //print ("%DST-I year " + year);

	if (month !== 1) {
        //print ("%DST-O getDaysInMonth " + monthDays[month]);
		return monthDays[month];
	}
	if ((year % 4) !== 0) {
        //print ("%DST-O getDaysInMonth 28" );
		return 28;
	}
	if ((year % 400) === 0) {
        //print ("%DST-O getDaysInMonth 29" );
		return 29;
	}
	if ((year % 100) === 0) {
		//print ("%DST-O getDaysInMonth 28" );
        return 28;
	}
    //print ("%DST-O getDaysInMonth 29" );
	return 29;
}

//---------------------------------------------------------------------------------------
// Function  : getDateOfFirst
// Author    : beededea
// Date      : 07/10/2023
// Purpose   :  get Date (1..31) Of First dayName (Sun..Sat) after date (1..31) of monthName (Jan..Dec) of year (2004..)
//              dayName:     Sun, Mon, Tue, Wed, Thu, Fr, Sat
//              monthName:   Jan, Feb, etc.
//---------------------------------------------------------------------------------------
function getDateOfFirst(dayName, date, monthName, year) {
	// get Date (1..31) Of First dayName (Sun..Sat) after date (1..31) of monthName (Jan..Dec) of year (2004..)
	// dayName:		Sun, Mon, Tue, Wed, Thu, Fr, Sat
	// monthName:	Jan, Feb, etc.

    //print ("%DST func getDateOfFirst");
    //print ("%DST-I dayName " + dayName);
    //print ("%DST-I date " + date);
    //print ("%DST-I monthName " + monthName);
    //print ("%DST-I year " + year);
    
	var day = numberOfDay(dayName);
	var month = getNumberOfMonth(monthName);
	var last = date + 6;
	var d = new Date(year, month, last);
	var lastDay = d.getDay();

    //print ("%DST-O getDateOfFirst " + last - (lastDay - day + 7) % 7);
	return last - (lastDay - day + 7) % 7;
}


//---------------------------------------------------------------------------------------
// Function  : getDateOfLast
// Author    : beededea
// Date      : 07/10/2023
// Purpose   : get Date (1..31) Of Last dayName (Sun..Sat) of monthName (Jan..Dec) of year (2004..)
//             dayName:     Sun, Mon, Tue, Wed, Thu, Fr, Sat
//             monthName:   Jan, Feb, etc.
//---------------------------------------------------------------------------------------
function getDateOfLast(dayName, monthName, thisYear) {

    //print ("%DST func getDateOfLast");
    //print ("%DST-I dayName " + dayName);
    //print ("%DST-I monthName " + monthName);
    //print ("%DST-I thisYear " + thisYear);
    
    var lastResult;
    
	var tDay = numberOfDay(dayName); 
    //print ("%DST-I tDay " + tDay);
    
	var tMonth = getNumberOfMonth(monthName);
    //print ("%DST-I tMonth " + tMonth);
    
	var last = getDaysInMonth(tMonth, thisYear);
    //print ("%DST-I last " + last);
    
	var d = new Date(thisYear, tMonth, last);
    //print ("%DST-I d " + d);
    
	var lastDay = d.getDay();
    //print ("%DST-I lastDay " + lastDay);
    
    lastResult = last - (lastDay - tDay + 7) % 7;
    //print ("%DST-O getDateOfLast " + lastResult);
	return lastResult;
}

//---------------------------------------------------------------------------------------
// Function  : dayOfMonth
// Author    : beededea
// Date      : 09/10/2023
// Purpose   : get day of the month
//---------------------------------------------------------------------------------------
function dayOfMonth(monthName, dayRule, year) {
 
    //print ("%DST func dayOfMonth");
    //print ("%DST-I monthName " + monthName);
    //print ("%DST-I dayRule " + dayRule);
    //print ("%DST-I year " + year);
    
	var dayName;
	var date;
	var day = parseInt(dayRule, 10);
    var dateResult;
    
	if (isFinite(day)) {
        //print ("%DST-O-1 dayOfMonth " + day);
		return day;
	}
    
	// dayRule of form lastThu or Sun>=15
	if (dayRule.indexOf("last") === 0) {	// dayRule of form lastThu
            
		dayName = dayRule.substring(4);
         
        dateResult = getDateOfLast(dayName, monthName, year);
        
        //print ("%DST-O-2 dayOfMonth " + dateResult);
		return dateResult;
	}
    
	// dayRule of form Sun>=15
	dayName = dayRule.substring(0, 3);
	date = Number(dayRule.substring(5));
    
    dateResult = getDateOfFirst(dayName, date, monthName, year);
    
    //print ("%DST-O-3 dayOfMonth " + dateResult);
	return dateResult;
}

      //---------------------------------------------------------------------------------------
// Function  : theDLSdelta
// Author    : beededea
// Date      : 09/10/2023
// Purpose   :
// parameter 1 prefs selected rule eg. EU - Europe - European Union
// parameter 2 remote GMT Offset
//---------------------------------------------------------------------------------------
//
function theDLSdelta(rule, cityTimeOffset) {
    // 
    // set up variables
    var monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var arrayNumber;
    var startMonth;
    var startDay;
    var startTime;
    var delta;
    var endMonth;
    var endDay;
    var endTime;
    var useUTC;
    var theDate;
    var startYear;
    var endYear;
    var currentMonth;
    var newMonthNumber;
    var startDate;
    var endDate;
    var stdTime;
    var theGMTOffset;
    var startHour;
    var startMin;
    var theStart;
    var endHour;
    var endMin;
    var theEnd;
    var dlsRule;
    var numberOfMonth;

    print ("%DST func theDLSdelta");
    print ("%DST-I  DLSrules(eg.) " + DLSrules[0]);
    print ("%DST-I  rule " + rule);
    print ("%DST-I  cityTimeOffset " + cityTimeOffset);
    
    // check whether DLS is in operation 
    
    if (rule === "NONE") {	
//		gTheStart = "";
//		gTheEnd = "";
        print ("%DST-O theDLSdelta = 0 Abnormal ");
        return 0;
    }
    
    // use the .some function to find at least one matching rule in the list, 
    // using the some function is more elegant than than for...looping through 
    // the whole list
    
    if (!DLSrules.some(function (ele, idx) {
        arrayNumber = idx;
        return ele[0] === rule;
    })) {
        print ("%DST-O Abnormal DLSdelta: " + rule + " is not in the list of DLS rules.");
        return 0;
    }

    // extract the current rule from the rules array using the index

    dlsRule = DLSrules[arrayNumber];
    
    // read the various components of the pre-parsed rule

    startMonth = dlsRule[1];
    startDay = dlsRule[2];
    startTime = dlsRule[3];
    delta = dlsRule[4];
    endMonth = dlsRule[5];
    endDay = dlsRule[6];
    endTime = dlsRule[7];

    // negative times for UTC transitions (GMT starts a mid-day)

    useUTC = (startTime < 0) && (endTime < 0);	

    if (useUTC) {
        startTime = 0 - startTime;
        endTime = 0 - endTime;
    }

    print ("%DST   Rule:       " + rule);
    print ("%DST   startMonth: " + startMonth);
    print ("%DST   startDay:   " + startDay);
    print ("%DST   startTime:  " + startTime);
    print ("%DST   delta:      " + delta);
    print ("%DST   endMonth:   " + endMonth);
    print ("%DST   endDay:     " + endDay);
    print ("%DST   endTime:    " + endTime);
    print ("%DST   useUTC:     " + useUTC);

    print ("*****************************");

    theDate = new Date();
    print ("%DST-I  theDate " + theDate);
    
    startYear = theDate.getUTCFullYear();
    print ("%DST-I  startYear " + startYear);
    
    endYear = startYear;
    print ("%DST-I  endYear " + endYear);

    if (getNumberOfMonth(startMonth) >= 6) {			// Southern Hemisphere
        currentMonth = theDate.getUTCMonth();
        if (currentMonth >= 6) {
            endYear += 1;
        } else {
            startYear -= 1;
        }
    }

    if (startTime < 0) {
        startTime = 0 - startTime;
    }	// ignore invalid sign

    startDate = dayOfMonth(startMonth, startDay, startYear);
    if (startDate === 0) {
        print ("%DST   theDLSdelta 0");
        return 0;
    }

    endDate = dayOfMonth(endMonth, endDay, endYear);
    if (endDate === 0) {
        print ("%DST   theDLSdelta 0");
        return 0;
    }

    if (endTime < 0) {	// transition on previous day in standard time
        endTime = 0 - endTime;
        endDate = endDate - 1;
        endTime = 1440 - endTime;
        if (endDate === 0) {
            newMonthNumber = getNumberOfMonth(endMonth) - 1;
            endMonth = monthName[newMonthNumber];
            endDate = getDaysInMonth(newMonthNumber, endYear);
        }
    }

    print ("%DST   startDate:	" + startMonth + " " + startDate + "," + startYear);
    print ("%DST    startTime:	" + (startTime - startTime % 60) / 60 + ":" + startTime % 60);
    print ("%DST   endDate:	" + endMonth + " " + endDate + "," + endYear);
    print ("%DST   endTime:	" + (endTime - endTime % 60) / 60 + ":" + endTime % 60);

    theGMTOffset = 60000 * cityTimeOffset;	  // was preferences.cityTimeOffset.value;

    theDate = new Date();
    stdTime = theDate.getTime();
    //eprint("stdTime=" + stdTime);

    startHour = Math.floor(startTime / 60);
    startMin = startTime % 60;
    
    numberOfMonth = getNumberOfMonth(startMonth);

    print("%DST   ----");
    print("%DST   startYear=" + startYear);
    print("%DST   numberOfMonth=" + numberOfMonth);
    print("%DST   startDate=" + startDate);
    print("%DST   startHour=" + startHour);
    print("%DST   startMin=" + startMin);
    
    

    theStart = Date.UTC(startYear, numberOfMonth, startDate, startHour, startMin, 0, 0);
    if (!useUTC) {
        theStart -= theGMTOffset;
    }

    print("%DST   theStart= " + theStart);
    print("%DST   theStartUTC=" + (new Date(theStart)).toUTCString());
    
    endHour = Math.floor(endTime / 60);
    endMin = endTime % 60;
    
    numberOfMonth = getNumberOfMonth(endMonth);
    
    print("%DST   ----");
    print("%DST   endYear=" + endYear);
    print("%DST   numberOfMonth=" + numberOfMonth);
    print("%DST   endDate=" + endDate);
    print("%DST   endHour=" + endHour);
    print("%DST   endMin=" + endMin);

    theEnd = Date.UTC(endYear, numberOfMonth, endDate, endHour, endMin, 0, 0);
    if (!useUTC) {
        theEnd -= theGMTOffset;
    }

    print("%DST   theEnd=	  " + theEnd);

//	gTheStart = (new Date(theStart + theGMTOffset)).toUTCString().split(" ", 5).join(" ") + " LST";
//	gTheEnd = (new Date(theEnd + theGMTOffset + 60000 * delta)).toUTCString().split(" ", 5).join(" ") + " DST";

    print("%DST   stdTime=" + (new Date(stdTime)).toUTCString());
    print("%DST   theStart=" + (new Date(theStart)).toUTCString());
    print("%DST   theEnd=" + (new Date(theEnd)).toUTCString());

    if (stdTime < theStart) {
        print("%DST   DLS starts in " + Math.floor((theStart - stdTime) / 60000) + " minutes.");
    } else if (stdTime < theEnd) {
        print("%DST   DLS ends in	  " + Math.floor((theEnd - stdTime) / 60000) + " minutes.");
    }

    if ((theStart <= stdTime) && (stdTime < theEnd)) {
        print ("%DST   theDLSdelta " + delta);
        return Number(delta); 
    } else {
        print ("%DST   theDLSdelta 0");
        return 0;
    }
}

///////////////////////////////// End of Daylight Saving Time Code /////////////////////////////////

/*
eprint("Denver, Colorado");
eprint(theDLSdelta("US", -420));	 // Denver, Colorado
eprint("--");

eprint("Sydney, New South Wales");
eprint(theDLSdelta("AU-NSW", 600));	 // Sydney, New South Wales
eprint("--");

eprint("Wellington, New Zealand");
eprint(theDLSdelta("NZ", 720));	  // Wellington, New Zealand
*/