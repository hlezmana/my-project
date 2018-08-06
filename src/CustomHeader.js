function CustomHeader() {
}

CustomHeader.prototype.init = function (agParams) {
    this.agParams = agParams;
    this.eGui = document.createElement('div');
    this.isNumeric = this.agParams.column.colDef.field !== 'rownum' && this.agParams.column.colDef.type === 'numeric';
    this.eGui.innerHTML =
        `<div class="customHeaderLabel">${this.agParams.displayName} 
        <div class="customHeaderContainer"> 
        <div class="customHeaderMenuButton inactive" title="Filter"><i class="fa fa-filter"></i></div>
        ${this.isNumeric ? '<div class="customStatistics inactive" title="Numeric"><i class="fa fa-calculator"></i></div>' : ''}
        <div class="customSortDownLabel inactive" title="Sort Desc"><i class="fa fa-long-arrow-down"></i></div>
        <div class="customSortUpLabel inactive" title="Sort Asc"><i class="fa fa-long-arrow-up"></i></div>
        ${this.agParams.column.colDef.field !== 'rownum' ? '<div class="customRemoveColumn"><i class="fa fa-times"></i></div>' : ''}
        </div>
        </div>`;

    this.eMenuButton = this.eGui.querySelector(".customHeaderMenuButton");
    
    this.eSortDownButton = this.eGui.querySelector(".customSortDownLabel");
    this.eSortUpButton = this.eGui.querySelector(".customSortUpLabel");
    this.eSortRemoveButton = this.eGui.querySelector(".customRemoveColumn");

    if (this.isNumeric) {
        this.eStatistics = this.eGui.querySelector(".customStatistics");
        this.onStatisticsListener = this.onStatisticsListener.bind(this);
        this.eStatistics.addEventListener('click', this.onStatisticsListener);
    }

    if (this.agParams.enableMenu) {
        this.onMenuClickListener = this.onMenuClick.bind(this);
        this.eMenuButton.addEventListener('click', this.onMenuClickListener);
    } else {
        this.eGui.removeChild(this.eMenuButton);
    }

    this.onFilterChanged = this.onFilterChanged.bind(this);
    this.agParams.column.addEventListener('filterChanged', this.onFilterChanged);
    
    this.onRemoveColumnListener = this.onRemoveColumnListener.bind(this);

    if (this.eSortRemoveButton) {
        this.eSortRemoveButton.addEventListener('click', this.onRemoveColumnListener);
    }

    if (this.agParams.enableSorting) {
        this.onSortAscRequestedListener = this.onSortRequested.bind(this, 'asc');
        this.eSortUpButton.addEventListener('click', this.onSortAscRequestedListener);
        this.onSortDescRequestedListener = this.onSortRequested.bind(this, 'desc');
        this.eSortDownButton.addEventListener('click', this.onSortDescRequestedListener);

        this.onSortChangedListener = this.onSortChanged.bind(this);
        this.agParams.column.addEventListener('sortChanged', this.onSortChangedListener);
        this.onSortChanged();
    } else {
        this.eGui.removeChild(this.eSortDownButton);
        this.eGui.removeChild(this.eSortUpButton);
    }
};

CustomHeader.prototype.onSortChanged = function () {
    if (this.agParams.column.isSortAscending()) {
        deactivate([this.eSortDownButton]);
        activate(this.eSortUpButton)
    } else if (this.agParams.column.isSortDescending()) {
        deactivate([this.eSortUpButton]);
        activate(this.eSortDownButton)
    } else {
        deactivate([this.eSortUpButton, this.eSortDownButton]);
    }
};

CustomHeader.prototype.getGui = function () {
    return this.eGui;
};

CustomHeader.prototype.onMenuClick = function () {
    this.agParams.showColumnMenu(this.eMenuButton);
};

CustomHeader.prototype.onStatisticsListener = function () {
    //this.agParams.showColumnMenu(this.eStatistics);
};

CustomHeader.prototype.onRemoveColumnListener = function (event) {
    console.log(this.agParams);
    this.agParams.columnApi.setColumnVisible(this.agParams.column.colId, false);
    //this.agParams.setColumnVisible(this.agParams.column.colId, false);
};

CustomHeader.prototype.onSortRequested = function (order, event) {
    this.agParams.setSort(order, event.shiftKey);
};

CustomHeader.prototype.onFilterChanged = function () {
    if (this.agParams.column.filterActive) {
        activate(this.eMenuButton);
    } else {
        deactivate([this.eMenuButton]);
    }
}

CustomHeader.prototype.destroy = function () {
    if (this.onMenuClickListener) {
        this.eMenuButton.removeEventListener('click', this.onMenuClickListener)
    }
    if (this.onStatisticsListener) {
        this.eMenuButton.removeEventListener('click', this.onStatisticsListener)
    }
    this.eSortDownButton.removeEventListener('click', this.onSortRequestedListener);
    this.eSortUpButton.removeEventListener('click', this.onSortRequestedListener);
    this.agParams.column.removeEventListener('sortChanged', this.onSortChangedListener);
};

function deactivate(toDeactivateItems) {
    toDeactivateItems.forEach(function (toDeactivate) {
        toDeactivate.className = toDeactivate.className.split(' ')[0]
    });
}

function activate(toActivate) {
    toActivate.className = toActivate.className + " active";
}

export default CustomHeader;