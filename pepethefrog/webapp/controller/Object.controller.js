sap.ui.define([
		"zjblessons/pepethefrog/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zjblessons/pepethefrog/model/formatter",
		"sap/ui/model/Sorter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/ui/core/Fragment"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
		Sorter,
		Filter,
		FilterOperator,
		MessageBox,
		MessageToast,
		Fragment,) {
		"use strict";

		return BaseController.extend("zjblessons.pepethefrog.controller.Object", {

			formatter: formatter,

			onInit : function () {
				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0,
						editMode :false,
						selectedKeyITB: "list",
						validateError : false,
					});
					this.setModel(oViewModel, "objectView");

				
				
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					},
					sap.ui.getCore().getMessageManager().registerObject(this.getView(), true)
				);
			},

			
			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", {}, true);
				}
			},

			
			_onObjectMatched : function (oEvent) {
				const sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					const sObjectPath = this.getModel().createKey("/zjblessons_base_Materials", {
						MaterialID :  sObjectId
					});
					this._bindView(sObjectPath);
				}.bind(this));
			},

			
			_bindView : function (sObjectPath) {
				const oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel();

				this.getView().bindElement({
					path: sObjectPath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding();
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				let oResourceBundle = this.getResourceBundle(),
					oObject = oView.getBindingContext().getObject(),
					sObjectId = oObject.MaterialID,
					sObjectName = oObject.MaterialText;

				oViewModel.setProperty("/busy", false);

				oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},

			onPressEditMaterial: function(){
				this._setEditMode(true);
				this._clearValidateCreate();
			},


			onPressSaveMaterial: function(){
				this._validateSaveMaterial();

				if (this.getModel().hasPendingChanges() || !this.getModel("objectView").getProperty("/validateError")) {
					this.getModel().submitChanges();
					this._setEditMode(false);
				}
				// this.getModel().submitChanges();
				// this._setEditMode(false);
			},

			onPressCancelMaterial: function(){
				this._clearValidateCreateMaterial();
				this.getModel("objectView").setProperty("/validateError", false);
				this.getModel().resetChanges();
				this._setEditMode(false);
			},

			_validateSaveMaterial: function() {
				const aFieldsIds = this.getView().getControlsByFieldGroupId();
				aFieldsIds.forEach((oControl) => {
					if(oControl.mProperties.fieldGroupIds[0]){
						oControl.fireValidateFieldGroup()
					}
				})
			},

			_clearValidateCreate: function () {
				const aFieldsIds = this.getView().getControlsByFieldGroupId();
				aFieldsIds.forEach((oControl) => {
					if(oControl.mProperties.fieldGroupIds[0]){
						oControl.setValueState('None')
						oControl.setValueStateText(' ')
					}
				});
			},
			

			onChange: function(oEvent){
				const bState=oEvent.getParameter('state');
				if(!bState && this.getModel().hasPendingChanges()){
					sap.m.MessageBox.confirm(this.getResourceBundle().getText("msgSaveChanges"),{
						title: this.getResourceBundle().getText("ttlConfirmAction"),
						actions:[
							sap.m.MessageBox.Action.OK,
							sap.m.MessageBox.Action.CANCEL,
							sap.m.MessageBox.Action.CLOSE,
						],
						emphasizedAction: sap.m.MessageBox.Action.OK,
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit,
						onClose: function(sAction){
							if(sAction === "OK"){
								this.onPressSaveMaterial();
							}else if(sAction === "CANCEL"){
								this.onPressCancelMaterial();
							}
						}.bind(this),
					});
					this._setEditMode(true);
				}else{
					this._setEditMode(bState);
				}
			},

			_setEditMode: function(bMode){
				this.getModel("objectView").setProperty("/editMode", bMode);
				const sSelectedKey = this.getModel("objectView").getProperty("/selectedKeyITB");
				if(bMode && sSelectedKey ==="list"){
					this._bindGroupSelect();
					this._bindSubGroupSelect();
				}else if(sSelectedKey === "form"){
					this._addFormContent(bMode ? "Edit" : "View");
				}
			}, 

			_bindGroupSelect: function(){
				this.byId("groupSelect").bindItems({
					path:"/zjblessons_base_Groups",
					id:"subGroupSelect",
					template: new sap.ui.core.Item({
						key: "{GroupID}",
						text: "{GroupText}"
					}),
					sorter: new Sorter("GroupText",false),
					filters: new Filter("GroupText", FilterOperator.NE, null)
				})
			},

			_bindSubGroupSelect: function(){
				this._getSubGroupSelect().then((oTemplate) => {
					this.byId("subGroupSelect").bindAggregation("items", {
						path:'/zjblessons_base_SubGroups',
						template: oTemplate,
						sorter: 
						[new Sorter("SubGroupText",false), 
						 new Sorter({ path: 'Created', descending: true}),
						],
						filters: 
						[new Filter("SubGroupText",FilterOperator.NE, null),
						new Filter({path:'Created',operator: FilterOperator.BT, 
						value1:new Date("2023-03-11"),value2: new Date(),})
						],
						events:{
							dataRequested:() => {
								MessageToast.show("Requesting SubGroups...")
							},
							dataReceived: (oData) => {
								MessageBox.show(this._getMessageSubGroupsLoaded(oData),{
									title:this.getResourceBundle().getText("lSubGroupText"),
								})
							}
						},
					});
				}).catch(() => {
					this._setEditMode(false);
				});
			},

			_getMessageSubGroupsLoaded: function(oData){
				let sSubGroupText = "";
				oData.mParameters.data.results.forEach((oSubGroup) =>{
					sSubGroupText += oSubGroup.SubGroupText + ", "
				})
				return `${this.getResourceBundle().getText("msgGotSubGroups")} ${sSubGroupText.slice(0,sSubGroupText.length -2)}`;
			},

			_getSubGroupSelect: function(){
				return new Promise((resolve, reject) =>{
					if (!this._pSubGroupSelect){
						this._pSubGroupSelect = Fragment.load({
							id: this.getView().getId(),
							name: "zjblessons.pepethefrog.view.fragment.SubGroupSelect",
							controller: this,
						}).then((oTemplate) => oTemplate);
					}
					this._pSubGroupSelect.then((oTemplate) => {
						resolve(oTemplate);
					}).catch((oError) => {
						MessageBox.error(oError.toString());
						reject();
					});
				});
			},

			onSelectIconTabBar: function(oEvent) {
				const sSelectedKey = oEvent.getSource().getSelectedKey();
				this.getModel("objectView").setProperty("/selectedKeyITB", sSelectedKey);
				if(sSelectedKey !== "form") return;

				this._addFormContent("View");
				
			},

			_addFormContent: function(sMode){
				if(!this[`_pFrom${sMode}`]){
					this[`_pFrom${sMode}`] = Fragment.load({
							id: this.getView().getId(),
							name: "zjblessons.pepethefrog.view.fragment.Form" + sMode,
							controller: this,
						}).then((oContent) => {
							this.getView().addDependent(oContent);
							return oContent;
						});
					}
					this[`_pFrom${sMode}`].then((oContent) => {
						const oIconTabFilter = this.byId("formIconTabFilter");

						oIconTabFilter.removeAllContent();
						oIconTabFilter.insertContent(oContent, 0);
					})

				},


				//Validation

				onChangeMaterialTexts:function(oEvent){
					const oSource = oEvent.getSource();
					if(!oSource.getValue()){
						oSource.setValueState("Error");	
					}
				},

				onValidateFieldGroup: function(oEvent) {
					const oControl = oEvent.getSource();
					const sSelectedKey = this.getModel("objectView").getProperty("/selectedKeyITB");
	
					let bSuccess = true;
	
					switch (oControl.getFieldGroupIds()[0]) {
						case sSelectedKey === "list" ? "listInput" : "formInput":
							bSuccess = !!oControl.getValue();
							break;
	
						case sSelectedKey === "list" ? "listComboBox" : "formComboBox":
							bSuccess = oControl.getItems().includes(oControl.getSelectedItem());
							break;
					
						default:
							break;
					}
					this.getModel("objectView").setProperty("/validateError", !bSuccess);
	
					oControl.setValueState(bSuccess ? "None" : "Error");
					oControl.setValueStateText(sErrorText); 
				}
	
			});
	
		}
);