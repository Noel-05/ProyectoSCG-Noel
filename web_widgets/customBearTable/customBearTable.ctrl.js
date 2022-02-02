/**
 * The controller is a JavaScript function that augments the AngularJS scope and exposes functions that can be used in the custom widget template
 * 
 * Custom widget properties defined on the right can be used as variables in a controller with $scope.properties
 * To use AngularJS standard services, you must declare them in the main function arguments.
 * 
 * You can leave the controller empty if you do not need it.
 */
function BearTable ($scope, $filter) {

    var ctrl=this;
    
	this.message='';
	
    this.myListOptions = [{key:"IE",            display:"Internet"},
                {key:"CHROME",           display:"Chrome" },
                {key:"FIREFOX",          display:"Firefox" }];
    this.choosenValue_select= this.myListOptions[2];
    
    //---------
	// Log
	this.logBear = function(isError, label ) {
		if (isError || $scope.properties.showdebug)
			console.log("widgetBearTable : "+label);		
	}
	this.logBearHeader = function( header, isError, label )
	{
		if (isError)
			console.log("widgetBearTable(E) : ["+header.name+"] "+label);		
		else if (header.isDebug)
			console.log("widgetBearTable : ["+header.name+"] "+label);
		   
	}

	this.getActionsRules = function() {
		if (typeof $scope.properties.actionsRules === 'undefined')
			return null;

		return $scope.properties.actionsRules;
	}	
	
    this.getTestListSelect = function() { 
        return this.myListOptions; };
        
    this.getTestListDisplay = function() { 
        this.logBear(false,"getTestListDisplay.BEGIN");
        var listDisplay=[];
        for (var i=0;i<this.myListOptions.length;i++) {
            listDisplay.push( this.myListOptions[ i ].display);
        }
        this.logBear(false,"getTestListDisplay.END");
        return listDisplay; 
    };
    
  

    this.getTestDisplay = function( item )
    {
        return item.display;
    }
	
	this.isHeaderDate = function ( header ) {
		if ((header.control === 'datelong') || (header.control === 'date') || (header.control === 'datetime'))
			return true;
		return false;
	}
    //---------
	// Return the InitValue
	this.getWSelectDateLongInitValue = function(header, valueDate) {
		// console.log( "getWSelectDateLongInitValue: Header["+header+"] Value="+JSON.stringify(valueDate)+"]");
		if (! this.isHeaderDate( header ))
			return valueDate;
	
		if (valueDate === null)
			return null;
		// return true if value is not a number
		if (isNaN(valueDate) && isFinite(valueDate))
			return null;
		
		// console.log( "getWSelectDateLongInitValue: valueDate["+JSON.stringify(valueDate)+"]");
		var dateObject=null;
		try
		{
			dateObject = new Date( valueDate );  
			// console.log( "getWSelectDateLongInitValue: valueDate["+valueDate+"] dateLong["+dateObject.getTime()+"]");
			return dateObject.toISOString().substring(0, 10);
		} catch( err )
		{ 
			console.log( "widgetBearTable:getWSelectDateLongInitValue: valueDate["+valueDate+"] dateLong["+dateObject+"] error:"+err);
			return null;
		}

	}
	
	//---------
	// User select a date, then calculate the new DateLong from the date
	// input : "2016-03-30T07:00:00.000Z" => Produce 1459321200000
	this.getWSelectDateLongFromDate = function(header, valueDate) {
		if (! this.isHeaderDate( header ))
			return valueDate;
		var dateObject=null;
		try
		{
			dateObject = new Date( valueDate );
			// console.log( "selectDateLongFromDate: valueDate["+valueDate+"] dateLong["+dateObject.getTime()+"]");
			return dateObject.getTime();
		} catch( err )
		{ 
			this.logBear( false, "getWSelectDateLongFromDate: valueDate["+valueDate+"] dateLong["+dateObject+"] error:"+err);
			return null;
		}
	}
	
	//--------- widget SELECT : for one OptionItem (ex {key:"FR", display:"France"}, according header.listoptiondisplay === "display", return "France"
	this.getWSelectDisplayFromItem = function ( header, optionItem ) {
	    if (header.control === 'select' || header.control === "textselect")
	    {
			// 
			if (header.name === 'assigned_to')
				this.logBear(false, "########################### Wiged Bar : getWSelectDisplayFromItem= "+ JSON.stringify( optionItem ));

            if (header.listoptiondisplay===null)
            {
    	        // console.log(" -defaultdisplay:"+optionItem.display+")");
	            return optionItem.display;
            }
	        return optionItem[ header.listoptiondisplay ];
	    }
	    return null;
	}
	// ------------ Widget TEXTSELECT : get the display information from the value
	this.getWSelectDisplayFromListItem = function ( header, value )
	{
		// this.logBearHeader( header, false, "getWSelectDisplayFromListItem : search the value["+angular.toJson( value)+"]" );
		if (typeof value === 'undefined' || value===null)
			return "";
			
		// search in the list the value
		var listItems= this.getWSelectListOptionsItem(header);
		var valueKey = this.getWSelectItemToKey( header, value );
		this.logBearHeader( header, false, "getWSelectDisplayFromListItem: value["+angular.toJson( value )+"] key["+valueKey+"] List["+angular.toJson(listItems));
	
		for (var i in listItems)
		{
			var optionItem= listItems[ i ];
			if (optionItem[ header.listoptionkey ] === valueKey )
				return this.getWSelectDisplayFromItem( header, optionItem );
		}
		this.logBearHeader( header, true, "getWSelectDisplayFromListItem: value["+value+"] not found in list["+angular.toJson(listItems));
		
		return "";
	}
	this.changeCheckList = function( header, oneRecord, keyCheckbox )
	{
		if (oneRecord[ header.name+'_'+keyCheckbox] === true )
		{
			if (typeof oneRecord[ header.name ] === 'undefined')
				oneRecord[ header.name ] = [];
			oneRecord[ header.name ].push( keyCheckbox );
		}
		else
		{
			var listValues = oneRecord[ header.name ];
			for (var i=0;i<listValues.length;i++)
			{
				if (keyCheckbox === listValues[ i ]) {
					listValues = listValues.splice( i, 1);
				}
			}
		}
	};
	// --------------------------------------------------
    // ------------------ Check
    // --------------------------------------------------

    this.errorMessage="";
    this.checkRules = function() {
		var timeBegin = this.beginTime("checkRules");

		this.message='Checking Rules';
		
        // console.log("~~~~~~~~~~~~~~~~~~ CheckRules");
        // console.log("checkRules : value="+$scope.properties.value );
	    if (($scope.properties.value === null) || (typeof $scope.properties.value === 'undefined')) {
			// console.log("~~~~~~~~~~~~~~~~~~ CheckRules: no data");
			this.message='';
			this.endTime(timeBegin, "checkRules - no Data");

			return;
		}
        this.errorMessage="";
        if ($scope.properties.checkrules === null) {
            // console.log("~~~~~~~~~~~~~~~~~~ CheckRules:No rules defines");
			this.message='';
			this.endTime(timeBegin, "checkRules - no Rules");

            return;
        }
        for (var i=0;i<$scope.properties.checkrules.length;i++) {
            var rule = $scope.properties.checkrules[ i ];
            // console.log("~~~~~~~~~~~~~~~~~~ CheckRules:rule "+rule.rule);
              
            if (rule.rule === 'sumcol') {
                var totalCol = 0;
                // console.log("~~~~~~~~~~~~~~~~~~ CheckRules:SumCol");
                if (rule.totalsum === null) {
                    this.errorMessage = this.errorMessage+ "rule "+rule.name+" the properties[totalsum] is not defined;"
                }
                if (rule.colname === null) {
                    this.errorMessage = this.errorMessage+ "rule "+rule.name+" the properties[colname] is not defined;"
                }
                // now do the job
                if ($scope.properties.value === null) {
                    // console.log("~~~~~~~~~~~~~~~~~~ CheckRules:NoData");
                } else {
                    for (var j=0; j<$scope.properties.value.length; j++){
    	                var oneRow = $scope.properties.value[ j ];
    	                var valueRow = oneRow[ rule.colname ];
    	                // console.log("OneRow.value = "+valueRow);
    	                if (valueRow!==null) {
    	                    totalCol = totalCol + valueRow;
    	                }
                    }
                }
                // console.log("compare "+totalCol+" and "+rule.totalsum);
                if (totalCol !== rule.totalsum) {
                    this.errorMessage = this.errorMessage+ rule.message+" : "+totalCol+";"
                }
            
            } else if (rule.rule === 'uniquecol') {
                 if (rule.colname === null) {
                    this.errorMessage = this.errorMessage+ "rule "+rule.name+" the properties[colname] is not defined;"
                }
                // now do the job
                if ($scope.properties.value === null) {
                    // console.log("~~~~~~~~~~~~~~~~~~ CheckRules:NoData");
                } else {
                    var message="";
                    for (var j2=0; j2<$scope.properties.value.length; j2++){
    	                var oneRow2 = $scope.properties.value[ j2 ];
    	                var valueRow2 = oneRow2[ rule.colname ];
    	                // console.log("OneRow.value = "+valueRow);
    	                for (var k=j2+1; k<$scope.properties.value.length; k++){
    	                    var oneNextRow = $scope.properties.value[ k ];
    	                    var valueNextRow = oneNextRow[ rule.colname ];
                            if (valueRow2 === valueNextRow) {
                                message = message +" : line "+(j+1)+"["+valueRow2+"] and "+(k+1)+"["+valueNextRow+"];"
                            }
    	                }
                    }
                    if (message!=="") {
                        this.errorMessage = this.errorMessage+ rule.message+" "+message+" are identical";
                    }
                }
            }
            else {
              this.errorMessage = this.errorMessage+ "Unknow rule ["+rule.rule+"];";
            }
        }
        // console.log("~~~~~~~~~~~~~~~~~~~ Rule message: "+this.errorMessage);
		this.message='';
		this.endTime(timeBegin, "checkRules");

	}
    
    this.getErrorMessage = function () {
        this.logBear(false,"Get Error message: "+this.errorMessage);
        return this.errorMessage;
    }
    
    
  
        
    // add a new variable in AngularJS scope. It'll be usable in the template directly with {{ backgroundColor }} 
    this.filterrecord={};
    this.reverseSort=false;
    this.orderByField="";
    // this then the HTML can directly modify this value
    this.recordpagenumber=1;
	this.recorditemsperpage= 1000;
	
	// --------------------------------------------------
    //------------------ Action rules
    // --------------------------------------------------
    this.defaultSort = function () 
    {
				
		this.logBear(false,"--------------- DefaultSort? actionRule="+this.getActionsRules() );
		
        if (this.getActionsRules() !== null)
        {			
			var actionsRules=this.getActionsRules();            

			for (var i=0;i< actionsRules.length;i++) {
                var actionRule = actionsRules[ i ];
                if (this.isShowDebug)
					console.log("--------------- Sort:actionrule.action="+actionRule.action);
				
				if (actionRule.action === 'sort') {
                    
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>> Sort ! ");
                     $scope.properties.value.sort( function(a, b){
                         if (typeof actionRule.sort1 === 'undefined')
                            return 0;
                         var valueA = a[ actionRule.sort1 ];
                         var valueB = b[ actionRule.sort1 ];
                         // console.log(" -- sort on["+ actionRule.sort1+"] a["+JSON.stringify(a)+"] b["+JSON.stringify(b)+"]");
                        
                         // console.log(" -- sort type["+( typeof valueA )+"] valueA["+valueA+"] valueB["+valueB+"]");
                         if (valueA < valueB)
                            return -1;
                         if (valueA > valueB)
                            return 1;
                        // egals : check sort2
                         var valueA2 = a[ actionRule.sort2 ];
                         var valueB2 = b[ actionRule.sort2 ];
                         if (valueA2 < valueB2)
                            return -1;
                         if (valueA2 > valueB2)
                            return 1;
                        return 0;
                     } );
                }
			
            }
        }
		 
    }
    this.defaultSort();
    
    // style on header
    this.getStyleHeader= function (header) {
	    if (typeof header.styleheader !== 'undefined') {
            return header.styleheader ;
        }
		return "";
	}
	
	// colspan
	this.getColSpan = function( header, oneRecord )
	{
		if (typeof header.colspan !== 'undefined')
			return header.colspan;
		return 1;
	}
    // ActionStyle
    this.getActionStyleCell = function( header, oneRecord )
    {
		this.logBearHeader(header, false, "getActionStyleCell");
        /* BABAR */
        if (this.getActionsRules() !== null)
        {
			var listActionsRules=this.getActionsRules();
            for (var i=0;i<listActionsRules.length;i++) {
                var actionRule = listActionsRules[ i ];
                this.logBearHeader(header, false,"--------------- getActionStyleCell:actionrule.action="+actionRule.action);
                if (actionRule.action === 'styleline') {
                    if (this.actionApply("Style", actionRule, oneRecord, header))
                    {
                       this.logBearHeader(header, false, "--------------- getActionStyleCell:actionRule Styleline TRUE return ["+actionRule.style+"]");
                       return actionRule.style;
                    }
                }
            }
        }
	   

       var attrName = header.name + "_style";
        // console.log("--------------- getActionStyleCell: by attrName ["+ attrName + "]" );
        if ((typeof oneRecord[ attrName ] !== 'undefined') && ( oneRecord[ attrName ] !== null)) {
            return oneRecord[ attrName ];
        }
        
        // console.log("--------------- getActionStyleCell: by styleCol" );
        if ((typeof header.stylecol != 'undefined') && (header.stylecol !== null)) {
            return header.stylecol;
        }

     
        return "";
    }
    
    // ------------- P1 T getActionReadOnly
    this.getActionReadOnly = function(header, oneRecord )
    {       
		if ((typeof oneRecord === 'undefined'))
       {
          this.logBearHeader(header, false,"-----------getActionReadOnly:["+header.name+"] :oneRecord undefined  HeaderReadOnly ["+header.readonly+"]");
          return header.readonly; 
       }
        var readOnlyAttribut = oneRecord[ header.name+'_readonly' ];
        // console.log("----------- getActionReadOnly: ["+header.name+"] : ReadOnly ["+header.readonly+"] readOnlyAttribut ["+readOnlyAttribut+"]")
        if ((typeof readOnlyAttribut != 'undefined') && (readOnlyAttribut !== null)) {
            return readOnlyAttribut;
        }
       
        // console.log("-----------getActionReadOnly:actionRules=["+$scope.properties.actionsRules+"]");
        if (this.getActionsRules() !== null)
        {
			var listActionsRules=this.getActionsRules();
            for (var i=0;i< listActionsRules.length;i++) {
                var actionRule = listActionsRules[ i ];
                if (actionRule.action === 'readonlyline') {
					var resultAction = this.actionApply( "ReadOnly", actionRule, oneRecord, header);
                   
				   this.logBearHeader(header, false, "--------------- getReadOnly:["+header.name+"] :actionrule.action="+actionRule.action+" result="+resultAction);
                    if ( resultAction)
                    {
                       return true;
                    }
                }
            }
        }
        
		
        // less priority : the header
         if ((typeof header.readonly != 'undefined') && (header.readonly !== null)) {
            return header.readonly;
        }
		this.logBearHeader(header, false,"--------------- getReadOnly: return default false");
        return false;
    }
    
    // HideLine
    this.getActionHideLine = function( oneRecord )
    {
		
		// user manual operation by the user get the lead
		if ( ! (typeof oneRecord[ "prefixchildrenbearwidget"] === 'undefined'))
		{
		    var prefixName = oneRecord[ "prefixchildrenbearwidget"];
			// this is a Children ! So, go up in the list to the parent
			var parentToggle = oneRecord[ "parenttooglebearwidget"];
			// console.log("--------------- getActionHideLine: CHILD record, get the PARENT record : "+JSON.stringify( parentToggle ) );
			if (! (typeof parentToggle === 'undefined'))
				return ! parentToggle; 
		}
		
		
        //console.log("--------------- getActionHideLine: by record "+JSON.stringify( oneRecord ) );
        if (this.getActionsRules() !== null)
        {
			var listActionsRules=this.getActionsRules();
            for (var i=0;i< listActionsRules.length;i++) {
				var actionRule = listActionsRules[ i ];
				// console.log("---------------  actionRule.action="+actionrule.action);
				if (actionRule.action === 'hideline') {
					var result=this.actionApply( "HideLine", actionRule, oneRecord, null);
					// console.log("--------------- getActionHideLine::actionrule.name="+actionRule.name+"] result="+result+" oneRecord="+angular.toJson(oneRecord));
					if (result)
					{
					   // console.log("--------------- getActionHideLine: ActionRule return [true]");
					   return true;
					}
				} 
			}				
        }
		
        return false;
    }
    
    // private: check if the rule apply to this record
    this.actionApply= function( source, actionRule, oneRecord, header) {
        var analyzeApplication="--------------- actionApply:actionRule Styleline name["+ actionRule.name+"] attribut["+ actionRule.attribut+"] Variable["+actionRule.variable+"]";
        
		
		var finalResult=true;
        var valueAttribute = null;
        var valueVariable = null;
        
        if ((typeof actionRule.attribut != 'undefined') && actionRule.attribut !== null) {
            valueAttribut = oneRecord[ actionRule.attribut ];
			analyzeApplication += "BY_Attribut;Value["+valueAttribut+"]";
			
            if ((typeof valueAttribut != 'undefined') && (valueAttribut === actionRule.valueattribut ))
                finalResult= true;
            else
                finalResult=false;
				

			analyzeApplication += "ResultAttribut="+finalResult;
        }
        // by the variable
        if ((typeof actionRule.variable != 'undefined') &&  actionRule.variable !== null) {

            valueVariable = $scope.properties.dynamicLists[ actionRule.variable ];
			analyzeApplication += "BY_Variable;Value(dynamicList)["+valueVariable+"]; dynamicList:"+angular.toJson( $scope.properties.dynamicLists);
			if (typeof valueVariable === 'undefined')
			{
				valueVariable = oneRecord[ actionRule.variable ];
				analyzeApplication += "Value(Record)["+valueVariable+"]";
			}
            // console.log("--------------- actionApply["+source+"] By Variable["+ actionRule.variable +"] (["+actionRule.valuevariable+"])=["+valueVariable+"] ? "+resultVariable);
			
			if (typeof actionRule.valuevariable === 'undefined')
				this.logBear(true, "Action ["+actionRule.name+"] define a variableAttribut["+actionRule.variable+"] : YOU MUST DEFINED AN ATTRIBUTE[valuevariable] TOO to specify the value to compare");
			
            if ((typeof valueVariable != 'undefined') && (valueVariable === actionRule.valuevariable ))
                finalResult= true;
            else 
                finalResult = false; 
			

			analyzeApplication += "resultVariable="+finalResult;
        }

		
        if (header===null)	
		{
			// this.logBear(false, analyzeApplication);
		}
		else
		{
			// this.logBearHeader( header, false, analyzeApplication);
		}
		
		return finalResult;

    };
    
   this.btnRemove = function (header, oneRecord) {
		
		if (header.confirmation) {
			var message= header.confirmationmessage;
			if (typeof message === 'undefined')
				message = "Would you like to delete this line ?";
			if (! confirm( message ))
					return;
		}
		var index=-1;
		for (var i=0;i<$scope.properties.value.length;i++)
		{
			console.log("btnRemove check ["+i+"]");
			if (typeof header.parent !== 'undefined')
			{
				// search in the child 
				listChildren = $scope.properties.value[ i ] [ header.parent ];
				console.log("btnRemove checkInChildren ["+angular.toJson( listChildren ) +"]");
				if (typeof listChildren != 'undefined')
				{
					for (var j in listChildren)
					{
						if (listChildren [ j ] === oneRecord)
						{
							console.log("btnRemove Found a children ["+j+"]!!");
							listChildren.splice( j ,1);
							break;
						}
					}
				}
			} else
			{
				if (oneRecord === $scope.properties.value[ i ]) {
					index=i;
				}
			}
		}
		if (index != -1)
			$scope.properties.value.splice( index ,1);
		console.log("btnRemove End");
			
   }
   this.getBtnLabel = function( header, oneRecord, defaultLabel )
   {
	if (typeof header.btnLabel !== 'undefined' && header.btnLabel !== null)
		return header.btnLabel;
	return defaultLabel;
   }
   
   this.getBtnCss = function( header, oneRecord, defaultStyle )
   {
	if (typeof header.cssClass  !== 'undefined' && header.cssClass  !== null)
		return header.cssClass ;
	return defaultStyle;
   }
   this.btnInsert = function (header, oneRecord, isAdd) {

		var index=-1;
		for (var i=0;i<$scope.properties.value.length;i++)
		{
			if (oneRecord === $scope.properties.value[ i ]) {
				index=i;
			}
		}
		var defaultValue;
		if (typeof header.defaultvalue === 'undefined')
			defaultValue={};
		else
			defaultValue = angular.copy( header.defaultvalue);
		
		var increment=0;
		if (isAdd)
			increment=1;
		this.logBearHeader( header, false,"btnInsert addChild["+header.addChild+"]");
		// console.log("btnInsert addChild ? ["+header.addChild+"]");
		
		if (typeof header.addChild != 'undefined' && isAdd)
		{
			this.logBearHeader( header, false, "addChild in["+header.addChild+"]");
			console.log("btnInsert Yes addChild["+header.addChild+"]");

			var parent = $scope.properties.value[ index ];
			listchildren=parent[ header.addChild ];
			console.log("btnInsert addChild parent="+angular.toJson(parent));
			console.log("btnInsert addChild listchildren="+listchildren);
			

			if (typeof  listchildren == 'undefined')
			{
				console.log("btnInsert addChild create a list["+header.addChild+"]");
				listchildren=[];
			}
			listchildren.push( defaultValue );
			console.log("btnInsert addChild Final listchildren="+angular.toJson(listchildren));
			parent[ header.addChild ]= listchildren;
		}
		else
		{
			if (index != -1)
				$scope.properties.value.splice( index + increment, 0, defaultValue);
			else
				$scope.properties.value.push( defaultValue );
		}
		this.prepareData();
   }
  
	// ------------------- control
	
	
	// widget SELECT : return the list of option for the header. Return a list like [{key:"IE", display:"Internet"},{key:"CHROME",display:"Chrome" },{key:"FIREFOX", display:"Firefox" }]
	//   Note at this moment, we don't know which attribut is the DISPLAY and which is the KEY
	this.getWSelectListOptionsItem = function( header )
	{
	    this.logBearHeader( header, false, "getWSelectListOptionsItem: header["+header.name+"] control["+header.control+"]");
    	
	    if (header.control === 'select' || header.control === 'textselect' || header.control === 'checkboxlist')
	    {
    	    // console.log('getWSelectListOptionsItem: based on listoption/header='+ JSON.stringify(header));
    	    if ((typeof header.listoptions != 'undefined') && header.listoptions !== null) {
    	        this.logBearHeader( header, false, 'getWSelectListOptionsItem: return STATIC  listOptions='+ JSON.stringify(header.listoptions));
    	        return header.listoptions;
    	    }
    	    if ((typeof header.listoptionsvariable != 'undefined') &&  header.listoptionsvariable !== null) {
    	        this.logBearHeader( header, false, "getWSelectListOptionsItem: return DYNAMIC listoptionsvariable["+ header.listoptionsvariable+"]");
    	        var value = $scope.properties.dynamicLists[ header.listoptionsvariable ];
    	        this.logBearHeader( header, false,  "getWSelectListOptionsItem:return DYNAMIC listoptionsvariable["+ header.listoptionsvariable+"] listOptions= "+ JSON.stringify( value ));
    	        return value;
    	    }
            this.logBearHeader( header, false, "getWSelectListOptionsItem: return NO LIST");
    	    this.errorMessage = this.errorMessage + header.name+": no option defined in the list use [listoptions] or [listoptionsvariable] properties;";
	    }
	    return null;
	};
	
	// Widget Select : get the select optionItem. Record is 
	// [ browser:"FR", pid:334] and header = {name:browser, listoptionkey:"key", listoption: [{key:"GR", display:"Germany"}, {key:"FR", display:"France"}]}
	// then the function return the optionItem {key:"FR", display:"France"}
	this.getWSelectGetSelected = function(  header, record ) {
	     if (header.control === 'select' || header.control === 'textselect' ) {
    	    var listOptionsItem = this.getWSelectListOptionsItem( header );
    	    // console.log("getWSelectGetSelected: ******* name["+header.name+"] listOptions="+JSON.stringify(listOptionsItem)+" record="+JSON.stringify( record )+";");
    	    if (listOptionsItem === null || typeof( listOptionsItem ) === 'undefined')
    	        return null;
    	    
    	    var valueInRecord = record[ header.name ];
    	    // console.log("getWSelectGetSelected:  InitSelect ["+header.name+"] : valueInRecord["+valueInRecord+"]");

    	    for (var i=0;i<listOptionsItem.length;i++) { 
    	        var optionRange = listOptionsItem[ i ];
    	        // console.log( "getWSelectGetSelected X"+JSON.stringify(optionRange) );
    	        var keyRange = this.getWSelectItemToKey( header, optionRange );
        	    // console.log( "getWSelectGetSelected KeyRange=["+keyRange+"];" );

    	        if (keyRange === valueInRecord ) {
            	    // console.log( "getWSelectGetSelectedReturnRange=["+i+"] : ["+JSON.stringify(listOptionsItem[ i ])+"];" );
    	            return listOptionsItem[ i ];
    	        }
    	    };
    	    // console.log("getWSelectGetSelectedInitSelect ["+header.name+"] : ** DefaultValueNotFound ** defaultValue["+defaultValue+"] listOptions=["+ JSON.stringify(listOptions )+"]");
	     }
    	 return null;
    	    
	}
	
	
	this.getListSelect = function() { return null };
	
	// widget SELECT : return the VALUE of the key of the list. Example : itemOption={ "country":"France", "PIB":"445"} / header.listoptionkey="country" => return "France"
	this.getWSelectItemToKey = function ( header, itemOption ) {
	        // this.errorMessage = this.errorMessage+" (getListKey";
	        // console.log('getListKey= '+ JSON.stringify( itemOption ));
	        if (header.listoptionkey===null) {
    	        // console.log(" -defaultkey:"+record.key+")");
				if (itemOption == null)
					return "";
	            return itemOption.key;
	        }
	        // console.log(" -indirect("+header.listoptionkey+") : "+itemOption[ header.listoptionkey ]+")");
			if (itemOption == null)
				return "";
	        return itemOption[ header.listoptionkey ];
	}
	
	// --- pie data
	this.getListPieData = function (header ) {
	    var data = [ 12, 40, 66 ];
	    // console.log('getListPieData='+JSON.stringify(data) );
	    return data;
	}
	this.getListPieHeader = function (header ) {
	    var header = [ "France","Germany","USA" ];
	    // console.log('getListPieHeader='+JSON.stringify(header) );
	    return header;
	}

	
	
    // --------------------------------------------------
    // ------------------ Prepare Data
    // --------------------------------------------------
	this.prepareData = function() {
	
		var timeBegin = this.beginTime("PrepareData");

		this.message='Preparing data';
		
	    
	    
	    if (typeof $scope.properties.headervalue === 'undefined') {
	        // console.log( "prepareData/timeLong: headervalue is undefined");
			this.endTime(timeBegin, "PrepareData - headerUndefined");

	        return false;
	    }
	    // this.logBear(false, "PrepareData : value="+angular.toJson($scope.properties.value) );
	    if (($scope.properties.value === null) || (typeof $scope.properties.value === 'undefined')) {
            // console.log("~~~~~~~~~~~~~~~~~~ prepareData:NoData");
			this.endTime(timeBegin, "PrepareData - NoData");

            return false;
	     }

		 
		var listHeaderName="";
        for (var i=0; i<$scope.properties.headervalue.length; i++){
			listHeaderName += $scope.properties.headervalue[ i ].name+"("+$scope.properties.headervalue[ i ].control+"),";
		}
		
		
	    this.logBear(false, "~~~~~~~~~~~~~~~~~~PrepareData : nbData="+$scope.properties.value.length+"header="+$scope.properties.headervalue.length+" : "+listHeaderName );
		
		
	    for (var i=0; i<$scope.properties.headervalue.length; i++){

			var header = $scope.properties.headervalue[ i ];
			this.logBear(false, "prepareData/manager header["+header.name+"] control["+header.control+"]");
			
			for (var j=0; j<$scope.properties.value.length; j++){
				var oneRecord = $scope.properties.value[ j ];
				
				if (typeof header.parent !== 'undefined') {
					// apply on each children
					var listChildren = oneRecord[ header.parent ];
					console.log("prepareData  checkInChildren ["+angular.toJson( listChildren ) +"]");
					if (typeof listChildren !== 'undefined')
					{
						for (var k in listChildren)
						{
							var oneKidsRecord = listChildren[ k ];
							this.prepareDataRecord( header, oneKidsRecord, "line ["+j+"] kids["+k+"] " );
						}
					}
				}
				else
					this.prepareDataRecord(header, oneRecord, "line ["+j+"]" );
			}
		} // end for header
		this.message='';
		
		
		// pagination ?
		if (this.isShowPagination() && this.recorditemsperpage === 1000)
		{
			// setup the pagination to the first range
			var stepsPagination= this.getStepsPagination();
			// console.log(" calculate recorditemsperpage from "+angular.toJson( stepsPagination) );
			this.recorditemsperpage= stepsPagination[0].value;
			this.logBear(false, "PrepareData : setup the pagination to the first Range ["+this.recorditemsperpage+"]");
		}
	
		// mark all theses data has prepared
		for (j=0; j<$scope.properties.value.length; j++){
			var oneRecord = $scope.properties.value[ j ];
			oneRecord.beartablepreparation = true;
		 }
	
		this.endTime(timeBegin, "PrepareData ");

		return true;
	
	} // end of prepareData
	
	// Prepare the data for the record (record may be in the list, a children...)
	this.prepareDataRecord = function (header, oneRecord, contextlog ) {
		this.logBear(false, "prepareData/manager header["+header.name+"] control["+header.control+"]");

		if (header.control === 'date') {
			var timeRow = oneRecord[ header.name ];
			this.logBearHeader(header, false, "prepareData/date: timeRow["+timeRow+"]");
			if (timeRow !== 'undefined' && timeRow !== null && timeRow.length < 11)
			{
				timeRow = timeRow.toString()+"T08:00:00.000Z";
				oneRecord[ header.name ] = timeRow;
			}
			if (typeof timeRow === 'string')
				oneRecord[ header.name ] = new Date( timeRow );
		}
		if (header.control === 'datelong') {
			var timeRow = oneRecord[ header.name ];
			this.logBearHeader(header, false, "prepareData/timeLong_1: timeRow["+timeRow+"]");
			// date is a Time, need to change it in a Date String format
			var date = new Date(timeRow);
			// when the input are in ReadOnly, the value on '_date' is not working, and the init value must be different
			// than the init value ( ! ). In Read, Write, ng-model and value can be the same, or differrent
			// so, to avoid that, on the datelong field, a method getWSelectDateLongInitValue is called.
			oneRecord[ header.name+'_date' ] = date.toISOString().substring(0, 10);
		}
		
		if (header.control === 'select' || header.control === 'textselect') {
		    this.logBearHeader(header,false, "prepareData/manager headerControlSelect CHECK ["+header.name+"]");
		    console.log( "prepareData/manager headerControlSelect CHECK ["+header.name+"]");
			
			var selected = this.getWSelectGetSelected( header, oneRecord );
	  	    
			 var listOptionsItem = this.getWSelectListOptionsItem( header );
    	    
			this.logBearHeader(header,false, "prepareData/manager headerControlSelect value["+angular.toJson( oneRecord[ header.name]) +"] found selected:"+angular.toJson( selected)+" List "+angular.toJson( listOptionsItem) );
			
			
			//console.log( "prepareData/manager headerControlSelect ["+header.name+"] value["+oneRecord[ header.name]+"] found selected:"+angular.toJson( selected)+" List "+angular.toJson( listOptionsItem) );
			//console.log("  header.listoptionsvariable="+header.listoptionsvariable+" list="+angular.toJson( $scope.properties.dynamicLists ));
			  
			oneRecord[ header.name+'_select' ] = selected;						
		}
			
		if (header.control === 'checkboxlist') {
			var listvalues = oneRecord[ header.name ];
			if (typeof listvalues != 'undefined')
			{
				for (k=0; k<listvalues.length; k++){
					oneRecord[ header.name+'_'+listvalues[ k ] ]=true;
				}
			}
		} // end checkboxlist
			
	} // end prepareDataRecord
	
	
	
    // ------------------- debug 
	this.isShowDebug = function() {
	    return $scope.properties.showdebug;
	}
	this.isShowDebugHeader = function( header ) {
	    return $scope.properties.showdebug || header.isDebug;
	}
	this.getContent = function () {
		if (typeof $scope.properties.value === 'undefined')
			return null;
	    return $scope.properties.value;
	}
	
	
	// ------------------- pagination 
	this.isShowPagination = function() {
		var showPagination = this.getStepsPagination() != null;
		//console.log("isShowPagination :"+showPagination);
	    return showPagination;
	}
	
	this.getStepsPagination = function () {
		var stepsPagination=$scope.properties.pagination;
		
		// console.log("getPagination : start");
		if (stepsPagination == null || typeof stepsPagination === 'undefined')
			return null;

        if (stepsPagination[ 0 ] == null || typeof stepsPagination[ 0 ]== 'undefined')
        	return null;
        	
		// if the user give a constante (so a String) with the JSON, let's give a chance to translate it to a real Array
		var step0 = stepsPagination[0].value;
		// console.log("getPagination : stepsPagination="+angular.toJson(stepsPagination));
		if (typeof step0 ==='undefined')
		{
			//console.log("getPagination : properties pagination is a String");
			stepsPagination = JSON.parse( stepsPagination);
			step0 = stepsPagination[0].value;
			//console.log("getPagination : After Jsonparse "+step0);			
		}
		
		// console.log("getPagination : stepsPagination="+angular.toJson(stepsPagination)+" typeof= "+(typeof stepsPagination)+" step0="+step0);
		if (typeof step0 ==='undefined')
		{	
			console.log("getPagination : properties pagination must be an Array (it's maybe a STRING)");
			return null;
		}
		// console.log("getPagination :"+stepsPagination+" typeof= "+(typeof stepsPagination)+" isArray="+Array.isArray(stepsPagination) );
		return stepsPagination;
	}

	this.getRecordsNumber = function() {
	    if (($scope.properties.value === null) || (typeof $scope.properties.value === 'undefined')) {
            return 0;
	    }
	    return $scope.properties.value.length;
	}
	
	this.getRecordsFilterNumber = function() {
	    // console.log("************ filterRecordNumber = "+this.listrecordsfiltered.length);
	    return this.listrecordsfiltered.length;
	}
	this.getRecordsItemPerPage = function() {
	    // console.log("************ getRecordItemPerPage = "+this.recorditemsperpage);
	    if (this.recorditemsperpage === null)
	      return 100;
	    return this.recorditemsperpage;
	}
	
    this.getRecordsPage = function()
	{
		var timeBegin = this.beginTime("getRecordsPage");

	    if (($scope.properties.value === null) || (typeof $scope.properties.value === 'undefined')) {
		    this.endTime(timeBegin, "getRecordsPage - no Data");

            return null;
	    }
		if (($scope.properties.headervalue == null) || (typeof $scope.properties.headervalue === 'undefined'))
		{
		    this.endTime(timeBegin, "getRecordsPage - no Headers");
            return null;
	    }
	    //console.log("===== getRecordsPage : ="+ $scope.properties.value);
		//console.log("getRecordsPage : ="+ angular.toJson($scope.properties.value,true));
	    //console.log("getRecordsPage : Orderby:"+this.orderByField+" - direction : "+this.reverseSort);
	    var listOrdered = [];
	    for (var i=0; i<$scope.properties.value.length; i++){
	        var oneRow = $scope.properties.value[ i ];
	        if (oneRow === null)
	            $scope.properties.value[ i ] = {};
	            
	        listOrdered.push( oneRow );
	    }

		listOrdered = $filter('orderBy')($scope.properties.value, this.orderByField, this.reverseSort);
		$scope.properties.value = listOrdered;
		
	    //console.log("Result After Order="+ angular.toJson(listOrdered  , true));
	    //console.log("filter : ="+ angular.toJson(this.filterrecord , true));
	    
		this.listrecordsfiltered = $filter('filter') (listOrdered, this.filterrecord );
		
		if (this.listrecordsfiltered===null)
		{
			this.endTime(timeBegin, "getRecordsPage - no Filter");
			return null;
		}
		
		var listChildren = [];
		var listHeaderControlChilden = {};
		for (var h=0; h<$scope.properties.headervalue.length; h++){		
	        var header = $scope.properties.headervalue[ h ];
			// we look for all header.parent = "period" 
			if ( ! (typeof header.parent === 'undefined')) {
				if (listChildren.indexOf(header.parent)=== -1)
					listChildren.push( header.parent );
			}
			// is an header pilot a children ? 
			if ( header.control === 'children') {
				listHeaderControlChilden[ header.name ] = header;
			}
		}
			
		
		 // Ok, this is now the time to include the CHILDREN in the list
		this.listrecordsFlat = [];
	    for (var j=0; j<this.listrecordsfiltered.length; j++){
			var oneRow = this.listrecordsfiltered[ j ];
			this.listrecordsFlat.push( oneRow );
			
					
			// children ?
			for (var k=0;k<listChildren.length;k++) {
			   var childName = listChildren[ k ];
			   var childRowList = oneRow[ childName ];
		
			   if ( ! (typeof childRowList === 'undefined')) {
				for (var l=0;l<childRowList.length;l++) {
					var oneChild = childRowList[ l ];
					oneChild["prefixchildrenbearwidget"] = childName;

					// we link the toogle to the parent value ? If an header.name exist, type=CHILDREN then do it
					var controlChildren = listHeaderControlChilden[ childName ];
					// console.log("==== ControlChildren for childname["+childName+"] ? "+JSON.stringify( controlChildren ));
					
					if ( ! (typeof controlChildren === 'undefined'))
		            {
						// yes, there are one !
						// the value must exist in the Parent !
						if (typeof oneRow[ childName+"_bearwidget"] === 'undefined')
							oneRow[ childName+"_bearwidget"]=false;
						oneChild["parenttooglebearwidget"] = oneRow[ childName+"_bearwidget"];
					}
					this.listrecordsFlat.push( oneChild );
				}
			   }
			   
			}
		}
		  
		//console.log(' listrecordsFlat='+angular.toJson(this.listrecordsFlat));
	    if (this.isShowPagination() )
	    {
			// be sure this is not a String
			this.recorditemsperpage = parseInt( this.recorditemsperpage);
		    var begin = ((this.recordpagenumber - 1) * this.recorditemsperpage);
		    var end =  begin + this.recorditemsperpage;
	        //console.log("Result After Filter begin/end="+begin+"/"+end+":"+ angular.toJson(this.listFlat , true));
			this.endTime(timeBegin, "getRecordsPage - ShowPagination from begin["+begin+"] to end["+end+"] recorditemsperpage=["+this.recorditemsperpage+"] nblines["+this.listrecordsFlat.length+"]");

    		return this.listrecordsFlat.slice(begin, end);
	    }
		this.endTime(timeBegin, "getRecordsPage - listRecordFlats");
		return this.listrecordsFlat;
	    
	}
	
	
   
	//-------------------------- getter
	this.getSubtitle = function( header, oneRecord)
	{	
		if (typeof oneRecord[ header.name+"_subtitle"] !== 'undefined')
			oneRecord[ header.name+"_subtitle"];
		if (typeof header.subtitle !== 'undefined')
			return header.subtitle;
		return '';
	}
	
	this.getHeader = function( oneRecord ) {
	    var timeBegin = this.beginTime("getHeader");
    
		var prefixRecord="";
        // alert("getheader oneRecord ="+  JSON.stringify( oneRecord ));
		
		// this is the Header itself
		if (typeof oneRecord !== 'undefined') {
		  // this is the description of one line. If the prefixchildrenbearwidget exist, this is a Child description.
	      prefixRecord = oneRecord[ "prefixchildrenbearwidget" ];
		  
		
	      if (typeof prefixRecord =='undefined')
	        prefixRecord="";
		}
		
		var headerFilter = [];
		// return all header where there are no . in the name
			
		// this.logBear(false, "getheader numberHeader.length="+$scope.properties.headervalue.length);
	
		 for (var i=0; i<$scope.properties.headervalue.length; i++){
	        var header = $scope.properties.headervalue[ i ];
			var prefixHeader = "";
			if ( typeof header.parent !== 'undefined')
				prefixHeader = header.parent;
				
			if (prefixHeader === prefixRecord ) {
				headerFilter.push( header );
			}
	    }
		this.endTime(timeBegin, "getHeader");

		return headerFilter;
	}
	this.getCheckRule = function() {
	    return $scope.properties.checkrules;
	}
	this.getOrderByField = function() {
	    return this.orderByField;
	}
	
	this.isReverseSort = function() {
	    return this.reverseSort;
	}
	
	this.getTableCss = function () {
		var cssClass=$scope.properties.tablecssclass;
		if (typeof $scope.properties.tablecssclass === 'undefined' || $scope.properties.tablecssclass ==='') {
			cssClass="table table-striped table-hover";
		}
		this.logBear(false, "TableCSS ["+cssClass+"]");
			
	    return cssClass;
	}
	
	this.getStyleCss = function () {
	    return $scope.properties.tablecssstyle;
	}
	// --  setter
	this.setOrder= function( paramorderfield, paramreversesort)
	{	
		this.orderByField = paramorderfield;
		this.reverseSort = paramreversesort;
		// console.log("SET Order : ["+this.orderByField+"] order="+this.reverseSort);		
	}
	
	
    //------------------- init
    ctrl.enablePrepareData =true;
    
	$scope.$watch('properties.headervalue', function(newValue, oldValue) {
		// header change : replay the prepare data
		ctrl.logBear( false, "Watch properties.headervalue : replay the preparation");

		var prepareDataDone = ctrl.prepareData();
        ctrl.checkRules();    
        ctrl.enablePrepareData = ! prepareDataDone;
		
	},true);

	/* may be too hard
	$scope.$watch('properties.dynamicLists', function(newValue, oldValue) {
		// list change : replay the prepare data
		ctrl.logBear( false, "Watch properties.dynamicLists : replay the preparation");

		var prepareDataDone = ctrl.prepareData();
        ctrl.checkRules();    
        ctrl.enablePrepareData = ! prepareDataDone;
		
	},true);
   */
	
    $scope.$watch('properties.value', function(newValue, oldValue) {
		var timeBegin = ctrl.beginTime("watch");
		// ctrl.logBear( false, "Watch properties.value");

		if (typeof ( newValue ) === 'undefined' && typeof( oldValue ) === 'undefined')
		{
			ctrl.enablePrepareData=false;
		}
		else if (typeof (newValue ) == 'undefined' || typeof( oldValue) =='undefined')
		{
			ctrl.enablePrepareData=true;
		}
		else if (newValue.length != oldValue.length )
		{
			ctrl.enablePrepareData=true;
		}
		else
		{
			// be smart : save in each row a "beartablepreparation"
			ctrl.enablePrepareData=false;
			 for (var j=0; j<$scope.properties.value.length; j++)
			 {
				var oneRecord = $scope.properties.value[ j ];
				if (typeof (oneRecord.beartablepreparation ) == 'undefined')
					ctrl.enablePrepareData=true;
			 }
			ctrl.logBear( false, "Watch properties.value Value different ?"+ctrl.enablePrepareData);
		}
		ctrl.logBear( false, "Watch properties.value Value prepareData="+ctrl.enablePrepareData);
       if (ctrl.enablePrepareData)
        {
            var prepareDataDone = ctrl.prepareData();
            ctrl.checkRules();    
            ctrl.enablePrepareData = ! prepareDataDone;
        }
		ctrl.endTime(timeBegin, "watch");

    }, true);
    
	
	//-------------------------- performance
	this.beginTime=function( logMessage )
	{
		// console.log("BearWidget.BEGIN "+logMessage);
		var d = new Date();
		return d.getTime();
	}

	this.endTime = function( timeBegin, logMessage )
	{
		var d = new Date();
		var delay= d.getTime() - timeBegin;
		this.logBear(false,"BearWidget.END  "+delay+" ms :"+ logMessage);
	}
	
 
}