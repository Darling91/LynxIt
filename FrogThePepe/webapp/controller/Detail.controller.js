/*global location */
sap.ui.define([
		"zjblessons/FrogThePepe/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/FrogThePepe/model/formatter",
		"sam/m/VBox",
		"sap/m/Panel",
		"sap/ui/table/Table",
		"sap/ui/table/Column",
	], function (BaseController, JSONModel, formatter, VBox, Panel, Table, Column) {
		"use strict"

		return BaseController.extend("zjblessons.FrogThePepe.controller.Detail", {
			formatter: formatter,
			_oViewModel: new JSONModel({
				masterItem:"",
				count:"",
			}),
			onInit : function () {
				this.getRouter()
				.getRoute("object")
				.attachPatternMatched(this._onObjectMatched,this);
				
				this.setModel(this._oViewModel, "detailView");
			},
			_onObjectMatched : function (oEvent) {
				let sEntity = oEvent.getParameter("arguments").entity;
				this.getModel("detailView").setProperty("/masterItem",sEntity);
				
				switch("All"){
					case sEntity:
						this._createPanel();
						break;
					default:
						if(this.byId(sEntity).getBinding("rows")){
							(this.byId(sEntity).getBinding("rows").refresh();
						}else{
							this.byId(sEntity).bindRows({
								path:"/zjblessons_base_" + sEntity,
								events: {
									dataReceived: this.setCount.bind(this),
								},
								template: new sap.ui.table.Row({}),
							});
						}
				}
				this.byID("thDetail").setText(
					this.getModel("i18n")
					.getResourceBundle()
					.getText("t" + sEntity)
					);
			},
			
			setCount: functin(oEvent){
				this.getModel("detailView").setProperty(
					"/count",
					"(" + oEvent.getSource().getLength() + ")"
					);
			},
			
			
			_createPanel: function(){
				if(!this.oPanels) {
					this.oPanels = new VBox({
						visible:"{= (${detailView>/masterItem}) === 'All'}",
						items: [
							new Panel({
								expandable:true,
								headerText:"{i18n>tGroups}",
								content: [
									(this.oGroups = new Table({
										columns:[
											new Column({
												width:"auto",
												label: new sap.m.Label({
													text:"GroupID",
												}),
												teplate:new sap.m.Text({
													text:"GroupID,"
												}),
											}),
												new Column({
												width:"auto",
												label: new sap.m.Label({
													text:"GroupText",
												}),
												teplate:new sap.m.Text({
													text:"GroupText,"
												}),
											}),
												new Column({
												width:"auto",
												label: new sap.m.Label({
													text:"GroupDescription",
												}),
												teplate:new sap.m.Text({
													text:"GroupDescription,"
												}),
											}),
											],
									})),
									],
							}),
								new Panel({
								expandable:true,
								headerText:"{i18n>tSubGroups}",
								content: [
									(this.oSubGroups = new Table({
										columns:[
											new Column({
												width:"auto",
												label: new sap.m.Label({
													text:"SubGroupID",
												}),
												teplate:new sap.m.Text({
													text:"SubGroupID,"
												}),
											}),
												new Column({
												width:"auto",
												label: new sap.m.Label({
													text:"SubGroupText",
												}),
												teplate:new sap.m.Text({
													text:"SubGroupText,"
												}),
											}),
												new Column({
												width:"auto",
												label: new sap.m.Label({
													text:"SubGroupDescription",
												}),
												teplate:new sap.m.Text({
													text:"SubGroupDescription,"
												}),
											}),
											],
									})),
									],
							}),
								new Panel({
								expandable:true,
								headerText:"{i18n>tRegions}",
								content: [
									(this.oRegions = new Table({
										columns:[
											new Column({
												width:"auto",
												label: new sap.m.Label({
													text:"RegionID",
												}),
												teplate:new sap.m.Text({
													text:"RegionID,"
												}),
											}),
												new Column({
												width:"auto",
												label: new sap.m.Label({
													text:"RegionText",
												}),
												teplate:new sap.m.Text({
													text:"RegionText,"
												}),
											}),
												new Column({
												width:"auto",
												label: new sap.m.Label({
													text:"RegionDescription",
												}),
												teplate:new sap.m.Text({
													text:"RegionDescription,"
												}),
											}),
											],
									})),
									],
							}),
								new Panel({
								expandable:true,
								headerText:"{i18n>tPlants}",
								content: [
									(this.oPlants = new Table({
										columns:[
											new Column({
												width:"auto",
												label: new sap.m.Label({
													text:"PlantID",
												}),
												teplate:new sap.m.Text({
													text:"PlantID,"
												}),
											}),
												new Column({
												width:"auto",
												label: new sap.m.Label({
													text:"PlantText",
												}),
												teplate:new sap.m.Text({
													text:"PlantText,"
												}),
											}),
												new Column({
												width:"auto",
												label: new sap.m.Label({
													text:"PlantDescription",
												}),
												teplate:new sap.m.Text({
													text:"PlantDescription,"
												}),
											}),
											],
									})),
									],
							}),
							],
					});
					this.oGroups.bindRows({
						path:"/zjblessons_base_Groups",
						template:new sap.ui.table.Row({}),
					});
						this.oSubGroups.bindRows({
						path:"/zjblessons_base_SubGroups",
						template:new sap.ui.table.Row({}),
					});
						this.oRegions.bindRows({
						path:"/zjblessons_base_Regions",
						template:new sap.ui.table.Row({}),
					});
						this.oRegions.bindRows({
						path:"/zjblessons_base_Regions",
						template:new sap.ui.table.Row({}),
					});
					this.byId("contentVBox").addItem(this.oPanels);
				}	
			},
		});
	}
);