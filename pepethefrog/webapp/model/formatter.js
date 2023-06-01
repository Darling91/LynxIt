sap.ui.define([
	] , function () {
		"use strict";

		return {
			formatTime : function (oModified){
				if(oModified){
					const oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "HH:mm dd/MM/yyyy"
					}).format(new Date(oModified));
					return oDateFormat;
				}
			},
			numberUnit : function (sValue) {
				if (!sValue) {
					return "";
				}
				return parseFloat(sValue).toFixed(2);
			},
			formatName: function(sName){
				return sName.split(" ")
					.map((sPart,index) =>index === 0 ? `${sPart[0]}.`: sPart)
					.join(" ");
			}
		};
	},

);