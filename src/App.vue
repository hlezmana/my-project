<template>
  <div>
    
    <tabs>
        <tab name="Import CSV">
          <div class="file-upload">
          Import CSV: 
          <input type="file" @change="fileChange($event.target)">
        </div>

        </tab>
        <tab name="Statistics">
          <div class="statistics">
            Add Statistic:
            <input type="checkbox" id="min" value="min" v-model="checkedStats">
            <label for="min">Min</label>
            <input type="checkbox" id="max" value="max" v-model="checkedStats">
            <label for="max">Max</label>
            <input type="checkbox" id="mean" value="mean" v-model="checkedStats">
            <label for="mean">Average</label>
            <input type="checkbox" id="median" value="median" v-model="checkedStats">
            <label for="median">Median</label>
            <input type="checkbox" id="std" value="std" v-model="checkedStats">
            <label for="std">Standard Deviation</label>
            <input type="checkbox" id="var" value="var" v-model="checkedStats">
            <label for="var">Variance</label>
            
            <button style="margin-left: 5px" v-on:click="addStatistics(checkedStats)"><i title="Add statistics" class="fa fa-calculator"></i></button>
            <button style="margin-left: 5px" v-on:click="checkedStats = [];addStatistics(checkedStats)"><i title="Clear statistics" class="fa fa-remove"></i></button>

          </div>
        </tab>
        <tab name="Columns">
          <div class="columns">
            Hide Column:
            <div v-for="column in columnDefs.slice(1)" v-bind:key="column.field" v-bind:title="column.headerName"> 
            <input type="checkbox" v-model="column.hide">
            <label for="column.field">{{column.headerName}}</label>
            </div>
          </div>
        </tab>
    </tabs>
    
    <ag-grid-vue style="width: 800px; height: 500px; margin-top: 5px; border-top:1px"
                  class="ag-theme-balham"
                  :columnDefs="columnDefs"
                  :rowData="rowData"
                  :components="components"
                  :defaultColDef="defaultColDef"
                  :enableSorting="true"
                  :enableFilter="true"
                  :gridReady="onGridReady"
                  :cellMouseOver="onCellMouseOver">
    </ag-grid-vue>
  </div>
</template>

<script>
  import {AgGridVue} from "ag-grid-vue";
  import Papa from "papaparse";
  import RegexFilter from "./RegexFilter";
  import CustomHeader from "./CustomHeader";
  import _ from "lodash";
  import mathjs from "mathjs";
  import Vue from 'vue';
  import {Tabs, Tab} from 'vue-tabs-component';

  Vue.component('tabs', Tabs);
  Vue.component('tab', Tab);

  var cellWithTooltip = function(params) {
    return '<span title="Row: ' + (params.rowIndex+1) + ', Col: ' + params.column.colDef.headerName + '">' + params.value + '</span>';
  }

  var getTooltip = function(value) {;
    var {colDef, rowIndex, api} = value;
    return `Row: ${rowIndex+1}, 
            Col: ${colDef.headerName},
            Type: ${colDef.type},
            Sort: ${api.filterManager.allFilters[colDef.field] && api.filterManager.allFilters[colDef.field].column.sort || 'None'}`;
  }

  export default {
      name: 'App',
      data() {
          return {
              columnDefs: null,
              rowData: null,
              checkedStats: [],
              hiddenColumns: []
          }
      },
      components: {
          AgGridVue
      },
      beforeMount() {
        this.columnDefs = [{
          headerName: 'Row #',
          field: 'rownum',
          width: 80,
          pinned: 'left',
          lockPinned: true,
          filter: 'agNumberColumnFilter'
        }, {
          headerName: 'Make',
          field: 'make',
          lockPinned: true,
          filter: RegexFilter
        }, {
          headerName: 'Model',
          field: 'model',
          lockPinned: true,
          filter: RegexFilter
        }, {
          headerName: 'Price',
          field: 'price',
          lockPinned: true,
          filter: 'agNumberColumnFilter'
        }];

        this.defaultColDef = {
          width: 100,
          headerComponentParams: {
            menuIcon: 'fa-filter'
          }
        };
        this.rowData = [
          {rownum: 1, make: 'Toyota', model: 'Celica', price: 35000},
          {rownum: 2, make: 'Ford', model: 'Mondeo', price: 32000},
          {rownum: 3, make: 'Porsche', model: 'Boxter', price: 72000}
        ];

        this.components = {
          agColumnHeader: CustomHeader
        };
        this.populateColumnTypes();
      },
      methods: {
        onGridReady(params) {
          this.gridApi = params.api;
          this.columnApi = params.columnApi;
          this.gridApi.sizeColumnsToFit();
        },
        onCellMouseOver(event) {
          var {rowIndex, colDef, api} = event;
          
          console.log(`Row: ${rowIndex+1}, 
            Col: ${colDef.headerName},
            Type: ${colDef.type},
            Sort: ${api.filterManager.allFilters[colDef.field] && api.filterManager.allFilters[colDef.field].column.sort || 'None'}`);
          
          var column = _.find(this.columnDefs, {field: colDef.field});
          if (column) {
            column.tooltip = () => getTooltip(event);
          }

          api.refreshCells();
        },
        fileChange(target) {
          // Import and parse csv
          Papa.parse(target.files[0], {
            complete: (results) => {
              // Default grid has row number column
              // Make this unresizable/unmovable
              var newHeaderNames = [{
                headerName: 'Row #',
                field: 'rownum',
                width: 80,
                pinned: 'left',
                lockPinned: true,
                cellRenderer: cellWithTooltip
              }];
              var columns = [
                'rownum'
              ];

              // Construct header from the first row
              var headers = results.data[0];
              headers.forEach((header) => {
                newHeaderNames.push({
                  headerName: header.charAt(0).toUpperCase() + header.slice(1),
                  field: header,
                  lockPinned: true,
                  cellRenderer: cellWithTooltip
                });

                columns.push(header);
              });
              this.columnDefs = newHeaderNames;

              // Construct data rows from second row and on
              var dataRows = results.data.slice(1);
              var newRowData = [];
              dataRows.forEach((dataRow, rownum) => {
                var row = {
                  rownum: rownum + 1
                };
                dataRow.forEach((cell, index) => {
                  row[columns[index+1]] = cell; 
                });

                newRowData.push(row);
              });

              this.rowData = newRowData;
              this.gridApi.sizeColumnsToFit();
            }
          });
        },
        populateColumnTypes() {
          _.each(this.columnDefs, (columnDef) => {
            var isNumeric = !_.map(this.rowData, columnDef.field).some(isNaN);
            columnDef.type = isNumeric ? 'numeric' : 'text';
            columnDef.filter = isNumeric ? 'agNumberColumnFilter' : RegexFilter; 
          });
        },
        addStatistics(stats) {
          console.log(this.rowData);
          this.rowData = _.filter(this.rowData, (row) => {
            return !isNaN(row.rownum);
          });

          _.each(stats, (stat) => {
            var statRow = {
              rownum: stat
            };  
            _.each(_.filter(this.columnDefs, {type: 'numeric'}), (col) => {
              if (col.field !== 'rownum') {
                statRow[col.field] = mathjs[stat](_.map(this.rowData, col.field));
              }
            });
            this.rowData.unshift(statRow);
          });
          
        }
      }
  }
</script>

<style>
    .customHeaderMenuButton {
        margin-left: 4px;
        float: right;
    }

    .customHeaderContainer {
      float: right;
    }

    .customSortDownLabel {
      float: right;
      margin-left: 3px;
    }

    .customSortUpLabel {
      float: right;
      margin-left: 3px;
    }

    .customStatistics {
      float: right;
      margin-left: 3px;
    }

    .customSortRemoveLabel {
      float: right;
      font-size: 11px;
      margin-left: 3px;
      display: none;
    }

    .customRemoveColumn {
      float: right;
      margin-left: 3px;
    }
    .active {
        color: cornflowerblue;
    }

</style>