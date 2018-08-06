function RegexFilter(column) {
    this.column = column;
}

RegexFilter.prototype.init = function (params) {
    this.eGui = document.createElement('div');
    
    this.eGui.innerHTML =
        `<div style="padding: 10px; text-align: center;">
            Filter Pattern
          <input type="textbox" name="RegexFilter" id="patternText"/>
        </div>
        </div>`;

    this.ePatternText = this.eGui.querySelector("#patternText");
    this.ePatternText.addEventListener("changed", this.onPatternChanged.bind(this));
    this.ePatternText.addEventListener("paste", this.onPatternChanged.bind(this));
    this.ePatternText.addEventListener("input", this.onPatternChanged.bind(this));
    this.ePatternText.addEventListener("keydown", this.onPatternChanged.bind(this));
    this.ePatternText.addEventListener("keyup", this.onPatternChanged.bind(this));

    this.filterActive = false;
    this.filterChangedCallback = params.filterChangedCallback;
    this.valueGetter = params.valueGetter;
    this.params = params;
};

RegexFilter.prototype.onPatternChanged = function (event) {
    this.patternText = event.target.value;
    this.filterActive = !!this.patternText;
    this.filterChangedCallback();
};

RegexFilter.prototype.getGui = function() {
    return this.eGui;
};

RegexFilter.prototype.doesFilterPass = function (params) {
    if (this.filterActive) {
        try {
            var regex = new RegExp(this.patternText.toLowerCase());
            return regex.test(this.valueGetter(params).toLowerCase());
        } catch (error) {
    
        }
    }

    return false;
};

RegexFilter.prototype.isFilterActive = function () {
    return this.filterActive;
};

RegexFilter.prototype.getModel = function() {
    var model = {value: this.patternText};
    return model;
};

RegexFilter.prototype.setModel = function(model) {
    this.patternText = model.value;
};

// this example isn't using getModel() and setModel(),
// so safe to just leave these empty. don't do this in your code!!!
RegexFilter.prototype.getModel = function() {};
RegexFilter.prototype.setModel = function() {};

export default RegexFilter;