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
					validateError : false,
					dialogParams: {
						height: "400px",
						width: "250px",
					}
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
				oDialog.setEscapeHandler(this._pEscapeHandler.bind(this));
				oDialog.setBindingContext(oEntryContext);
				oDialog.open();
			})
		},

		_pEscapeHandler:function(){
			if(!this.oConfirmEscapePressPreventDialog){
				this.oConfirmEscapePressPreventDialog = new sap.m.Dialog({
					title:"Are you sure?",
					content: new sap.m.Text({
						text:"Your unsaved changes will be lost",
					}),
					type: sap.m.DialogType.Message,
					icon: sap.ui.core.IconPool.getIconURI("message-information"),
					buttons:[
						new sap.m.Button({
							text:"Yes",
							press: function(){
								this.oConfirmEscapePressPreventDialog.close();
								this.oCreateDialog.close();
							}.bind(this),
						}),
						new sap.m.Button({
							text:"No",
							press: function(){
								this.oConfirmEscapePressPreventDialog.close();
							}.bind(this),
						}),
					]
				})
			}
			this.oConfirmEscapePressPreventDialog.open();	
		},

		_clearCreateDialog:function(){
			[
				Fragment.byId("fCreateDialog", "iMaterialText"),
				Fragment.byId("fCreateDialog", "cbGroup"),
				Fragment.byId("fCreateDialog", "cbSubGroup"),
				Fragment.byId("fCreateDialog", "cbRating"),
			].forEach(oControl =>{oControl.setValueState("None")})

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
				this.oCreateDialog.close();
			}
			
		},

		onPressCloseCreateDialog:function(){
			this.getModel().resetChanges();
			this.oCreateDialog.close();
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

		onBeforeCloseDialog:function(oEvent){
			const oSource = oEvent.getSource();
			const oDialogSize = oEvent.getSource()._oManuallySetSize;

			if(oDialogSize){
				this.getModel("worklistView").setProperty("/dialogParams/height" , oDialogSize.height + "px");
				this.getModel("worklistView").setProperty("/dialogParams/width" , oDialogSize.width + "px");
			}else{
				oEvent.getSource().destroy();
				this.oCreateDialog = null;
			}
			this._clearCreateDialog();
		},

		onPressMaterialDopInfo:function(oEvent){
			const oSource = oEvent.getSource();
			if (!this._pPopover){
				this._pPopover = Fragment.load({
					id: this.getView().getId(),
					name: "zjblessons.pepethefrog.view.fragment.Popoover",
					controller: this,
				}).then((oPopover) => {
					this.getView().addDependent(oPopover);
					return oPopover;
				});
			}
			this._pPopover.then((oPopover) => {
				oPopover.setBindingContext(oSource.getBindingContext());
				oPopover.openBy(oSource);
			});
	},

		onPressClosePopover:function(oEvent){
			oEvent.getSource().getParent().getParent().close();
		},

		onPressGoToMaterial:function(oEvent){
			this._showObject(oEvent.getSource());
		},

		onPressOpenActionSheet:function(oEvent){
			const oSource = oEvent.getSource();
			if (!this._pAction){
				this._pAction = Fragment.load({
					id: this.getView().getId(),
					name: "zjblessons.pepethefrog.view.fragment.ActionsSheet",
					controller: this,
				}).then((oActions) => {
					this.getView().addDependent(oActions);
					return oActions;
				});
			}
			this._pAction.then((oActions) => {
				oActions.openBy(oSource);
			});
		}


		});
	},
);