<template>
  <div class="vertical-flex">
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
            <div>
              <input type="checkbox" id="min" value="min" v-model="checkedStats">
              <label for="min">Min</label>
            </div>
            <div>
            <input type="checkbox" id="max" value="max" v-model="checkedStats">
            <label for="max">Max</label>
            </div>
            <div>
            <input type="checkbox" id="mean" value="mean" v-model="checkedStats">
            <label for="mean">Average</label>
            </div>
            <div>
            <input type="checkbox" id="median" value="median" v-model="checkedStats">
            <label for="median">Median</label>
            </div>
            <div>
            <input type="checkbox" id="std" value="std" v-model="checkedStats">
            <label for="std">Standard Deviation</label>
            </div>
            <div>
            <input type="checkbox" id="var" value="var" v-model="checkedStats">
            <label for="var">Variance</label>
            </div>
            <button style="margin-left: 5px" v-on:click="addStatistics(checkedStats)"><i title="Add statistics" class="fa fa-calculator"></i></button>
            <button style="margin-left: 5px" v-on:click="checkedStats.length=0;addStatistics()"><i title="Clear statistics" class="fa fa-remove"></i></button>

          </div>
        </tab>
        <tab name="Columns">
          <div class="columns">
            Hide Column:
            <div v-for="column in columnDefs.slice(1)" v-bind:key="column.field" v-bind:title="column.headerName"> 
            <input type="checkbox" :checked="column.hide">
            <label for="column.field">{{column.headerName}}</label>
            </div>
          </div>
        </tab>
    </tabs>
    
    <ag-grid-vue style="margin-top: 5px; border-top:2px;"
                  class="ag-theme-balham vertical-flex"
                  :columnDefs="columnDefs"
                  :rowData="rowData"
                  :components="components"
                  :defaultColDef="defaultColDef"
                  :enableSorting="true"
                  :enableFilter="true"
                  :gridReady="onGridReady"
                  :cellMouseOver="onCellMouseOver"
                  :gridOptions="gridOptions">
    </ag-grid-vue>
  </div>
</template>

<script>
  import {AgGridVue} from "ag-grid-vue";
  import Papa from "papaparse";
  import RegexFilter from "./components/RegexFilter";
  import CustomHeader from "./components/CustomHeader";
  import _ from "lodash";
  import mathjs from "mathjs";
  import Vue from 'vue';
  import {Tabs, Tab} from 'vue-tabs-component';

  Vue.component('tabs', Tabs);
  Vue.component('tab', Tab);

  var cellWithTooltip = function(params) {
    return '<span title="Row: ' + (params.rowIndex+1) + ', Col: ' + params.column.colDef.headerName + '">' + params.value + '</span>';
  }

  var getTooltip = function(value) {
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
              hiddenColumns: [],
              gridOptions: {
                enableServerSideSorting: true,
                enableServerSideFilter: true,
                rowModelType: 'infinite',
                enableColResize: true,
                rowBuffer: 0,
                rowSelection: 'multiple',
                rowDeselection: true,
                paginationPageSize: 10,
                maxBlocksInCache: 1,
                pinnedTopRowData: this.addStatistics(),
              }
          }
      },
      components: {
        AgGridVue,
        loadingRenderer: function(params) {
            if (params.value !== undefined) {
                return params.value;
            } else {
                return '<img src="../images/loading.gif">'
            }
        }
      },
      beforeMount() {
        this.checkedStats = [];
        this.defaultColDef = {
          width: 120,
          headerComponentParams: {
            menuIcon: 'fa-filter'
          }
        };

        this.columnDefs = [{
          headerName: 'Row #',
          field: 'rownum',
          width: 80,
          pinned: 'left',
          lockPinned: true,
          filter: 'agNumberColumnFilter',
          filterParams: {
            newRowsAction: 'keep'
          }
        }, {
          headerName: 'Make',
          field: 'make',
          lockPinned: true,
          filter: RegexFilter,
          filterParams: {
            newRowsAction: 'keep'
          }
        }, {
          headerName: 'Model',
          field: 'model',
          lockPinned: true,
          filter: RegexFilter,
          filterParams: {
            newRowsAction: 'keep'
          }
        }, {
          headerName: 'Price',
          field: 'price',
          lockPinned: true,
          filter: 'agNumberColumnFilter',
          filterParams: {
            newRowsAction: 'keep'
          }
        }];

        this.rowData = [
          {rownum: 1, make: 'Toyota', model: 'Celica', price: 35000},
          {rownum: 2, make: 'Ford', model: 'Mondeo', price: 32000},
          {rownum: 3, make: 'Porsche', model: 'Boxter', price: 72000},
          {rownum: 4, make: 'Mazda', model: 'cx5', price: 25000},
          {rownum: 5, make: 'Ford', model: 'Focus', price: 18000},
          {rownum: 6, make: 'Hyundai', model: 'Sonata', price: 22000},
          {rownum: 7, make: 'Toyota', model: 'Camry', price: 24000},
          {rownum: 8, make: 'Ford', model: 'Fiesta', price: 14000},
          {rownum: 9, make: 'Ford', model: 'Mustang', price: 24000},
          {rownum: 10, make: 'Hyundai', model: 'Elantra', price: 17000},
          {rownum: 11, make: 'BMW', model: 'Series', price: 45000},
          {rownum: 12, make: 'Tesla', model: 'Model 3', price: 49000},
          {rownum: 13, make: 'Mini', model: 'Cooper', price: 22000},
          {rownum: 14, make: 'Honda', model: 'Civic', price: 19000},
          {rownum: 15, make: 'VW', model: 'Jetta', price: 19000},
          {rownum: 16, make: 'Audi', model: 'A4', price: 36000},
          {rownum: 17, make: 'Mercedez', model: 'C Class', price: 42000},
          {rownum: 18, make: 'Jaguar', model: 'XJ', price: 75000},
          {rownum: 19, make: 'Mercedez', model: 'S Class', price: 92000},
          {rownum: 20, make: 'BMW', model: 'Series 5', price: 54000},
          {rownum: 21, make: 'Toyota', model: 'Celica', price: 35000},
          {rownum: 22, make: 'Ford', model: 'Mondeo', price: 32000},
          {rownum: 23, make: 'Porsche', model: 'Boxter', price: 72000},
          {rownum: 24, make: 'Mazda', model: 'cx5', price: 25000},
          {rownum: 25, make: 'Ford', model: 'Focus', price: 18000},
          {rownum: 26, make: 'Hyundai', model: 'Sonata', price: 22000},
          {rownum: 27, make: 'Toyota', model: 'Camry', price: 24000},
          {rownum: 28, make: 'Ford', model: 'Fiesta', price: 14000},
          {rownum: 29, make: 'Ford', model: 'Mustang', price: 24000},
          {rownum: 30, make: 'Hyundai', model: 'Elantra', price: 17000},
          {rownum: 31, make: 'BMW', model: 'Series', price: 45000},
          {rownum: 32, make: 'Tesla', model: 'Model 3', price: 49000},
          {rownum: 33, make: 'Mini', model: 'Cooper', price: 22000},
          {rownum: 34, make: 'Honda', model: 'Civic', price: 19000},
          {rownum: 35, make: 'VW', model: 'Jetta', price: 19000},
          {rownum: 36, make: 'Audi', model: 'A4', price: 36000},
          {rownum: 37, make: 'Mercedez', model: 'C Class', price: 42000},
          {rownum: 38, make: 'Jaguar', model: 'XJ', price: 75000},
          {rownum: 39, make: 'Mercedez', model: 'S Class', price: 92000},
          {rownum: 40, make: 'BMW', model: 'Series 5', price: 54000},
          {rownum: 41, make: 'Toyota', model: 'Celica', price: 35000},
          {rownum: 42, make: 'Ford', model: 'Mondeo', price: 32000},
          {rownum: 43, make: 'Porsche', model: 'Boxter', price: 72000},
          {rownum: 44, make: 'Mazda', model: 'cx5', price: 25000},
          {rownum: 45, make: 'Ford', model: 'Focus', price: 18000},
          {rownum: 46, make: 'Hyundai', model: 'Sonata', price: 22000},
          {rownum: 47, make: 'Toyota', model: 'Camry', price: 24000},
          {rownum: 48, make: 'Ford', model: 'Fiesta', price: 14000},
          {rownum: 49, make: 'Ford', model: 'Mustang', price: 24000},
          {rownum: 50, make: 'Hyundai', model: 'Elantra', price: 17000},
          {rownum: 51, make: 'BMW', model: 'Series 3', price: 45000},
          {rownum: 52, make: 'Tesla', model: 'Model 3', price: 49000},
          {rownum: 53, make: 'Mini', model: 'Cooper', price: 22000},
          {rownum: 54, make: 'Honda', model: 'Civic', price: 19000},
          {rownum: 55, make: 'VW', model: 'Jetta', price: 19000},
          {rownum: 56, make: 'Audi', model: 'A4', price: 36000},
          {rownum: 57, make: 'Mercedez', model: 'C Class', price: 42000},
          {rownum: 58, make: 'Jaguar', model: 'XJ', price: 75000},
          {rownum: 59, make: 'Mercedez', model: 'S Class', price: 92000},
          {rownum: 60, make: 'BMW', model: 'Series 5', price: 54000}, 
          {rownum: 61, make: 'Toyota', model: 'Celica', price: 35000},
          {rownum: 62, make: 'Ford', model: 'Mondeo', price: 32000},
          {rownum: 63, make: 'Porsche', model: 'Boxter', price: 72000},
          {rownum: 64, make: 'Mazda', model: 'cx5', price: 25000},
          {rownum: 65, make: 'Ford', model: 'Focus', price: 18000},
          {rownum: 66, make: 'Hyundai', model: 'Sonata', price: 22000},
          {rownum: 67, make: 'Toyota', model: 'Camry', price: 24000},
          {rownum: 68, make: 'Ford', model: 'Fiesta', price: 14000},
          {rownum: 69, make: 'Ford', model: 'Mustang', price: 24000},
          {rownum: 70, make: 'Hyundai', model: 'Elantra', price: 17000},
          {rownum: 71, make: 'BMW', model: 'Series', price: 45000},
          {rownum: 72, make: 'Tesla', model: 'Model 3', price: 49000},
          {rownum: 73, make: 'Mini', model: 'Cooper', price: 22000},
          {rownum: 74, make: 'Honda', model: 'Civic', price: 19000},
          {rownum: 75, make: 'VW', model: 'Jetta', price: 19000},
          {rownum: 76, make: 'Audi', model: 'A4', price: 36000},
          {rownum: 77, make: 'Mercedez', model: 'C Class', price: 42000},
          {rownum: 78, make: 'Jaguar', model: 'XJ', price: 75000},
          {rownum: 79, make: 'Mercedez', model: 'S Class', price: 92000},
          {rownum: 80, make: 'BMW', model: 'Series 5', price: 54000}, 
          {rownum: 81, make: 'Toyota', model: 'Celica', price: 35000},
          {rownum: 82, make: 'Ford', model: 'Mondeo', price: 32000},
          {rownum: 83, make: 'Porsche', model: 'Boxter', price: 72000},
          {rownum: 84, make: 'Mazda', model: 'cx5', price: 25000},
          {rownum: 85, make: 'Ford', model: 'Focus', price: 18000},
          {rownum: 86, make: 'Hyundai', model: 'Sonata', price: 22000},
          {rownum: 87, make: 'Toyota', model: 'Camry', price: 24000},
          {rownum: 88, make: 'Ford', model: 'Fiesta', price: 14000},
          {rownum: 89, make: 'Ford', model: 'Mustang', price: 24000},
          {rownum: 90, make: 'Hyundai', model: 'Elantra', price: 17000},
          {rownum: 91, make: 'BMW', model: 'Series 3', price: 45000},
          {rownum: 92, make: 'Tesla', model: 'Model 3', price: 49000},
          {rownum: 93, make: 'Mini', model: 'Cooper', price: 22000},
          {rownum: 94, make: 'Honda', model: 'Civic', price: 19000},
          {rownum: 95, make: 'VW', model: 'Jetta', price: 19000},
          {rownum: 96, make: 'Audi', model: 'A4', price: 36000},
          {rownum: 97, make: 'Mercedez', model: 'C Class', price: 42000},
          {rownum: 98, make: 'Jaguar', model: 'XJ', price: 75000},
          {rownum: 99, make: 'Mercedez', model: 'S Class', price: 92000},
          {rownum: 100, make: 'BMW', model: 'Series 5', price: 54000},
          {rownum: 101, make: 'Toyota', model: 'Celica', price: 35000},
          {rownum: 102, make: 'Ford', model: 'Mondeo', price: 32000},
          {rownum: 103, make: 'Porsche', model: 'Boxter', price: 72000},
          {rownum: 104, make: 'Mazda', model: 'cx5', price: 25000},
          {rownum: 105, make: 'Ford', model: 'Focus', price: 18000},
          {rownum: 106, make: 'Hyundai', model: 'Sonata', price: 22000},
          {rownum: 107, make: 'Toyota', model: 'Camry', price: 24000},
          {rownum: 108, make: 'Ford', model: 'Fiesta', price: 14000},
          {rownum: 109, make: 'Ford', model: 'Mustang', price: 24000},
          {rownum: 110, make: 'Hyundai', model: 'Elantra', price: 17000},
          {rownum: 111, make: 'BMW', model: 'Series', price: 45000},
          {rownum: 112, make: 'Tesla', model: 'Model 3', price: 49000},
          {rownum: 113, make: 'Mini', model: 'Cooper', price: 22000},
          {rownum: 114, make: 'Honda', model: 'Civic', price: 19000},
          {rownum: 115, make: 'VW', model: 'Jetta', price: 19000},
          {rownum: 116, make: 'Audi', model: 'A4', price: 36000},
          {rownum: 117, make: 'Mercedez', model: 'C Class', price: 42000},
          {rownum: 118, make: 'Jaguar', model: 'XJ', price: 75000}
        ];

        this.components = {
          agColumnHeader: CustomHeader
        };

        this.dataSource = {
          rowCount: null, // behave as infinite scroll
          getRows: (params) => {
              console.log('asking for ' + params.startRow + ' to ' + params.endRow);
              console.log(params);
              // At this point in your code, you would call the server, using $http if in AngularJS 1.x.
              // To make the demo look real, wait for 500ms before returning
              
              setTimeout( () => {
                  var dataAfterSortingAndFiltering = this.sortAndFilter(this.rowData, params.sortModel, params.filterModel);
                  var rowsThisPage = dataAfterSortingAndFiltering.slice(params.startRow, params.endRow);
                  // if on or after the last page, work out the last row.
                  var lastRow = -1;
                  if (dataAfterSortingAndFiltering.length <= params.endRow) {
                      lastRow = dataAfterSortingAndFiltering.length;
                  }
                  // call the success callback
                  params.successCallback(rowsThisPage, lastRow);
              }, 500);
          }
        };
        this.populateColumnTypes();
      },
      methods: {
        onGridReady(params) {
          this.gridApi = params.api;
          this.columnApi = params.columnApi;

          this.gridApi.setDatasource(this.dataSource);
        },
        onCellMouseOver(event) {
          var {rowIndex, colDef, api} = event;          
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
              this.populateColumnTypes();
              this.gridApi.setDatasource(this.dataSource);
            }
          });
        },
        populateColumnTypes() {
          _.each(this.columnDefs, (columnDef) => {
            var isNumeric = !_.map(this.rowData, columnDef.field).some(isNaN);
            columnDef.type = isNumeric ? 'numeric' : 'text';
            columnDef.width = 120;
            columnDef.filter = isNumeric ? 'agNumberColumnFilter' : RegexFilter; 
          });
        },
        addStatistics() {
          this.rowData = _.filter(this.rowData, (row) => {
            return !isNaN(row.rownum);
          });

          var statRows = []
          _.each(this.checkedStats, (stat) => {
            var statRow = {
              rownum: stat
            };  
            _.each(_.filter(this.columnDefs, {type: 'numeric'}), (col) => {
              if (col.field !== 'rownum') {
                statRow[col.field] = mathjs[stat](_.map(this.rowData, col.field));
              }
            });
            statRows.unshift(statRow);
          });

          this.gridApi.setPinnedTopRowData(statRows);
          return statRows;
        },
        sortAndFilter(allOfTheData, sortModel, filterModel) {
            return this.sortData(sortModel, this.filterData(filterModel, allOfTheData));
        },
        sortData(sortModel, data) {
            var sortPresent = sortModel && sortModel.length > 0;
            if (!sortPresent) {
                return data;
            }
            // do an in memory sort of the data, across all the fields
            var resultOfSort = data.slice();
            resultOfSort.sort(function(a, b) {
                for (var k = 0; k < sortModel.length; k++) {
                    var sortColModel = sortModel[k];
                    var valueA = a[sortColModel.colId];
                    var valueB = b[sortColModel.colId];
                    // this filter didn't find a difference, move onto the next one
                    if (valueA == valueB) {
                        continue;
                    }
                    var sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
                    if (valueA > valueB) {
                        return sortDirection;
                    } else {
                        return sortDirection * -1;
                    }
                }
                // no filters found a difference
                return 0;
            });
            return resultOfSort;
        },
        filterData(filterModel, data) {
          var filterPresent = filterModel && Object.keys(filterModel).length > 0;
          if (!filterPresent) {
              return data;
          }

          var resultOfFilter = [];
          for (var i = 0; i < data.length; i++) {
              var item = data[i];

              var key = _.head(_.keys(filterModel));
              var model = filterModel[key]; 
              var value = item[key];
              var filterValue;
              if (model.filterType === 'number') {
                filterValue = parseInt(model.filter);
                if (model.type === 'equals') {
                  if (value !== filterValue) {
                    continue;
                  }
                } else if (model.type === 'lessThan') {
                  if (value >= filterValue) {
                    continue;
                  }
                } else if (model.type === 'greaterThan') {
                  if (value <= filterValue) {
                    continue;
                  }
                } else if (model.type === 'lessThanOrEqual') {
                  if (value > filterValue) {
                    continue;
                  }
                } else if (model.type === 'greaterThanOrEqual') {
                  if (value < filterValue) {
                    continue;
                  }
                } else if (model.type === 'inRange') {
                  var filterValueTo = parseInt(model.filterTo);
                  if (value > filterValueTo || value < filterValue) {
                    continue;
                  }
                } else {
                  if (value === filterValue) {
                    continue;
                  }
                }
              } else if (model.filterType === 'regex') {
                filterValue = model.filter;
                
                try {
                  var regex = new RegExp(model.filter.toLowerCase());
                  if (!regex.test(value.toLowerCase())) {
                    continue;
                  }
                } catch (error) {
                  continue;
                }
                
              }
              resultOfFilter.push(item);
          }

          return resultOfFilter;
        }
      }
  }
</script>

<style>
.customHeaderFilter {
  margin-left: 4px;
  float: right;
}

.customHeaderContainer {
  float: right;
}

.customHeaderSortDesc {
  float: right;
  margin-left: 3px;
}

.customHeaderSortAsc {
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
.tabs-component-tabs {
  border: solid 1px #ddd;
  border-radius: 6px;
  margin-bottom: 5px;
  margin-top: 0px;
}

@media (min-width: 700px) {
  .tabs-component-tabs {
    border: 0;
    align-items: stretch;
    display: flex;
    justify-content: flex-start;
    margin-bottom: -1px;
  }
}

.tabs-component-tab {
  color: #999;
  font-size: 14px;
  font-weight: 600;
  margin-right: 0;
  list-style: none;
}

.tabs-component-tab:not(:last-child) {
  border-bottom: dotted 1px #ddd;
}

.tabs-component-tab:hover {
  color: #666;
}

.tabs-component-tab.is-active {
  color: #000;
}

.tabs-component-tab.is-disabled * {
  color: #cdcdcd;
  cursor: not-allowed !important;
}

@media (min-width: 700px) {
  .tabs-component-tab {
    background-color: #fff;
    border: solid 1px #ddd;
    border-radius: 3px 3px 0 0;
    margin-right: .5em;
    transform: translateY(2px);
    transition: transform .3s ease;
  }

  .tabs-component-tab.is-active {
    border-bottom: solid 1px #fff;
    z-index: 2;
    transform: translateY(0);
  }
}

.tabs-component-tab-a {
  align-items: center;
  color: inherit;
  display: flex;
  padding: 5px 3px;
  text-decoration: none;
}

.tabs-component-panels {
  padding: 5px 3px;
}

@media (min-width: 700px) {
  .tabs-component-panels {
    border-top-left-radius: 0;
    background-color: #fff;
    border: solid 1px #ddd;
    border-radius: 0 6px 6px 6px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .05);
    padding: 5px 3px;
  }
}

html, body, .vertical-flex {
  display: flex;
  flex: 1 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  box-sizing: border-box;
  flex-direction: column;
}

</style>