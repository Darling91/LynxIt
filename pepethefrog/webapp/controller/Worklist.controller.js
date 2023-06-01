sap.ui.define([
		"zjblessons/pepethefrog/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/pepethefrog/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator,Fragment) {
		"use strict";

		return BaseController.extend("zjblessons.pepethefrog.controller.Worklist", {

			formatter: formatter,


			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");


				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();

				this._aTableSearchState = [];


				oViewModel = new JSONModel({
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0,
					validateError : false
				});
				this.setModel(oViewModel, "worklistView");


				oTable.attachEventOnce("updateFinished", function(){

					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
				sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			},


			onUpdateFinished : function (oEvent) {

				var sTitle,
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");

				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			},
			
			_showObject: function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("MaterialID")
				});
			},

			onPressShowMaterial : function (oEvent) {

				this._showObject(oEvent.getSource());
			},


			onNavBack : function() {
				history.go(-1);
			},

	onShareInJamPress: function () {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		_loadCreateFragment: function(oEntryContext){
			if(!this.oCreateDialog){
				this.pCreateMaterial = Fragment.load({
					name:"zjblessons.pepethefrog.view.fragment.CreateMaterial",
					controller: this,
					id: "fCreateDialog"
				}).then(oDialog => {
					this.oCreateDialog = oDialog;
					this.getView().addDependent(this.oCreateDialog);
					return Promise.resolve(oDialog);
				});
			}
			this.pCreateMaterial.then(oDialog => {
				oDialog.setBindingContext(oEntryContext);
				oDialog.open();
			})
		},

		_closeCreateDialog:function(){
			[
				Fragment.byId("fCreateDialog", "iMaterialText"),
				Fragment.byId("fCreateDialog", "cbGroup"),
				Fragment.byId("fCreateDialog", "cbSubGroup"),
				Fragment.byId("fCreateDialog", "cbRating"),
			].forEach(oControl =>{oControl.setValueState("None")})
			this.oCreateDialog.close();
		},

		_validateSaveMaterial: function(){
			[
				Fragment.byId("fCreateDialog", "iMaterialText"),
				Fragment.byId("fCreateDialog", "cbGroup"),
				Fragment.byId("fCreateDialog", "cbSubGroup"),
				Fragment.byId("fCreateDialog", "cbRating"),	
			].forEach(oControl => {
				oControl.fireValidateFieldGroup();
			})
		},

		onPressSaveMaterial: function(){
			this._validateSaveMaterial();
			if(!this.getModel("worklistView").getProperty("/validateError")){
				this.getModel().submitChanges();
				this._closeCreateDialog();
			}
			
		},

		onPressCloseCreateDialog:function(){
			this.getModel().resetChanges();
			this._closeCreateDialog();
		},

		onPressCreateMaterial: function(){
			const mProperties = {
				MaterialID: "0",
				Version: "A",
				Language: "RU"
			};
			const oEntryContext = this.getModel().createEntry("/zjblessons_base_Materials",{
				properties: mProperties
			});
			this._loadCreateFragment(oEntryContext);
		},

		onPressDeleteMaterial: function(oEvent){
			const sEntryPath = oEvent.getSource().getBindingContext().getPath();
			this.getModel().remove(sEntryPath);
		},

		onSearch: function (oEvent) {
				const aFilters = [];
				const sValue = oEvent.getParameter("query") || oEvent.getParameter("newValue"); 	
				if (sValue) {
					aFilters.push(
						new Filter({
							filters: [
							new Filter({
								path:"MaterialText",
								operator:FilterOperator.Contains,
								value1: oEvent.getParameter("query") || oEvent.getParameter("newValue")
							}),
							new Filter("MaterialDescription",FilterOperator.Contains,sValue),
							new Filter({
								filters :[
									new Filter(
										"CreatedByFullName",FilterOperator.Contains,sValue
									),
									new Filter(
										"ModifiedByFullName",FilterOperator.Contains,sValue
									),
								],
								and: true,
							})
						],
						and:false,
						}),				
					); 
				}
				this.byId("table").getBinding("items").filter(aFilters);
		},

		onPressRefresh: function(){
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},
			//Validation
		onChangeMaterialText:function(oEvent){
			const oSource = oEvent.getSource();
			if(!oSource.getValue()){
				oSource.setValueState("Error");	
			}
		},

		onValidateFieldGroup: function(oEvent){
			const oControl = oEvent.getSource();
			let bSuccess = true;
			let sErrorText;
			switch(oControl.getFieldGroupIds()[0]){
				case "input":
					bSuccess = !!oControl.getValue();
					sErrorText = "Enter Text";
					break;
				case "comboBox":
					bSuccess = oControl.getItems().includes(oControl.getSelectedItem());
					sErrorText = "Select Value";
			}
			this.getModel("worklistView").setProperty("/validateError", !bSuccess);
			oControl.setValueState(bSuccess ? "None" : "Error");
			oControl.setValueStateText(sErrorText);
		},

		});
	},
);