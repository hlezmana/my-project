function CustomHeader() {
}

CustomHeader.prototype.init = function (agParams) {
    this.agParams = agParams;
    this.eGui = document.createElement('div');
    this.isNumeric = this.agParams.column.colDef.field !== 'rownum' && this.agParams.column.colDef.type === 'numeric';
    this.eGui.innerHTML =
        `<div class="customHeaderLabel">${this.agParams.displayName} 
        <div class="customHeaderContainer"> 
        <div class="customHeaderFilter inactive" title="Filter"><i class="fa fa-filter"></i></div>
        ${this.isNumeric ? '<div class="customStatistics inactive" title="Numeric"><i class="fa fa-calculator"></i></div>' : ''}
        <div class="customHeaderSortDesc inactive" title="Sort Desc"><i class="fa fa-long-arrow-down"></i></div>
        <div class="customHeaderSortAsc inactive" title="Sort Asc"><i class="fa fa-long-arrow-up"></i></div>
        ${this.agParams.column.colDef.field !== 'rownum' ? '<div class="customRemoveColumn" title="Hide"><i class="fa fa-times"></i></div>' : ''}
        </div>
        </div>`;

    this.eMenuButton = this.eGui.querySelector(".customHeaderFilter");
    
    this.eSortDescButton = this.eGui.querySelector(".customHeaderSortDesc");
    this.eSortAscButton = this.eGui.querySelector(".customHeaderSortAsc");
    this.eSortRemoveButton = this.eGui.querySelector(".customRemoveColumn");

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
        this.eSortAscButton.addEventListener('click', this.onSortAscRequestedListener);
        this.onSortDescRequestedListener = this.onSortRequested.bind(this, 'desc');
        this.eSortDescButton.addEventListener('click', this.onSortDescRequestedListener);

        this.onSortChangedListener = this.onSortChanged.bind(this);
        this.agParams.column.addEventListener('sortChanged', this.onSortChangedListener);
        this.onSortChanged();
    } else {
        this.eGui.removeChild(this.eSortDescButton);
        this.eGui.removeChild(this.eSortAscButton);
    }
};

CustomHeader.prototype.onSortChanged = function () {
    if (this.agParams.column.isSortAscending()) {
        deactivate([this.eSortDescButton]);
        activate(this.eSortAscButton)
    } else if (this.agParams.column.isSortDescending()) {
        deactivate([this.eSortAscButton]);
        activate(this.eSortDescButton)
    } else {
        deactivate([this.eSortAscButton, this.eSortDescButton]);
    }
};

CustomHeader.prototype.getGui = function () {
    return this.eGui;
};

CustomHeader.prototype.onMenuClick = function () {
    this.agParams.showColumnMenu(this.eMenuButton);
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

    this.eSortDescButton.removeEventListener('click', this.onSortRequestedListener);
    this.eSortAscButton.removeEventListener('click', this.onSortRequestedListener);
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