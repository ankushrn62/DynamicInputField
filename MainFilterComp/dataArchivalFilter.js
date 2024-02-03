import { LightningElement, wire, track, api } from 'lwc';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomFilterComponent extends LightningElement {
    @track fieldOptions = [];
    @api objectApiName = 'Account';
    selectedObj;
    operatorOptions = [{ label: 'Equals', value: '=' }, { label: 'Not Equals', value: '!=' }];
    //conditionOptions = [{ label: 'AND', value: 'AND' }, { label: 'OR', value: 'OR' }];
    @track selectFieldVal;
    @track selectOperator;
    @track inputVal;
    @track filterCount = 2;
    @track filterConditions = [];
    finalData;

    renderedCallback() {
        console.log('rendered Callback runs objectApiName: ' + this.objectApiName);
        console.log('rendered Callback runs selected obj: ' + this.selectedObj);
        console.log('rendered Callback runs filterConditions: ' + this.filterConditions.length);

        if ((this.objectApiName != this.selectedObj && this.filterConditions.length > 0) || this.selectedObj == undefined) {
            console.log('inside render if');
            this.filterConditions = [];
            this.selectedObj = this.objectApiName;
            this.filterCount = 2;
            this.filterConditions = [{ index: 0, rowNum: 1, field: 'CreatedDate', operator: '', value: '', showChild: 'true', fieldType: 'DateTime', operatoreOptions: [{ label: 'Before', value: '<' }, { label: 'After', value: '>' }, { label: 'Before and Equal', value: '<=' }, { label: 'After and Equal', value: '>=' }] }];
        }
        console.log('after rendered Callback runs objectApiName: ' + this.objectApiName);
        console.log('afer rendered Callback runs selected obj: ' + this.selectedObj);
    }

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfo;

    @wire(getObjectInfo, { objectApiName: '$objectApiName', fieldDescribe: true })
    wiredObjectInfo({ data, error }) {
        if (data) {
            const fields = data.fields;
            //console.log('data.fields: ' + JSON.stringify(data.fields));
            this.fieldOptions = Object.keys(fields).map((field) => {
                //console.log('fields[field]:' + fields[field]);
                if (fields[field].dataType === 'Date' ||
                    (fields[field].dataType === 'DateTime' && field != 'CreatedDate') ||
                    fields[field].dataType === 'Picklist' ||
                    fields[field].dataType === 'MultiPicklist' ||
                    fields[field].dataType === 'Boolean') {
                    return { label: fields[field].label, value: field, type: fields[field].dataType };
                } else {
                    // Return null or an empty object based on your preference for non-matching items
                    return null;
                }
            });
            //this.fieldOptions = this.fieldOptions.filter((item) => item !== null);
            this.fieldOptions = this.fieldOptions.filter(option => option);
            this.fieldOptions.sort((a, b) => (a.label > b.label) ? 1 : -1);
            //console.log('this.fieldOptions ## ' + this.fieldOptions);
        } else if (error) {
            console.error('Error fetching object info', error);
        }
        //console.log('this.fieldOptions: ' + JSON.stringify(this.fieldOptions));
    }

    getFieldType(fieldName) {
        const selectedFieldOption = this.fieldOptions.find(option => option.value === this.inputVal);
        if (selectedFieldOption) {
            return selectedFieldOption.type;
        }
        return undefined;
    }

    addNewFilter() {
        if (this.filterConditions.length == 0) {
            this.filterConditions.push({ index: this.filterCount - 1, rowNum: this.filterCount, field: '', operator: '', value: '', showChild: 'false', fieldType: '', operatoreOptions: [] });
            //this.filterConditions.push({ rowNum: this.filterCount, field: '', operator: '', value: '', condition: '' });
            this.filterCount++;
        } else {
            const allFieldsFilled = this.filterConditions.every(filterCondition => {
                return filterCondition.field && filterCondition.operator && filterCondition.value;
                //return filterCondition.field && filterCondition.operator && filterCondition.value && filterCondition.condition;
            });
            if (!allFieldsFilled) {
                this.showToast('Error', 'Please complete the existing filter condition before adding a new one.', 'error');
            } else {
                this.filterConditions.push({ index: this.filterCount - 1, rowNum: this.filterCount, field: '', operator: '', value: '', showChild: 'false', fieldType: '', operatoreOptions: [] });
                //this.filterConditions.push({ rowNum: this.filterCount, field: '', operator: '', value: '', condition: '' });
                this.filterCount++;
            }
        }
    }

    removeFilter(event) {
        const indexToRemove = event.target.dataset.index;
        this.filterConditions.splice(indexToRemove, 1);
        if (this.filterConditions) {
            this.filterConditions.forEach((condition, index) => {
                condition.rowNum = index + 1;
                condition.index = index;
            });
            this.filterCount = this.filterConditions.length + 1;
        } else {
            this.filterCount = 1;
        }
        console.log('in removeFilter this.filterConditions : ' + JSON.stringify(this.filterConditions));
    }

    handleFilterChange(event) {
        const index = event.target.dataset.index;
        const field = event.target.name;
        const value = event.detail.value;
        this.filterConditions[index][field] = event.target.value;
        if (field == 'field') {
            this.inputVal = event.detail.value;
            const selectedFieldType = this.getFieldType(this.inputVal);
            console.log('this.inputVal # ' + this.inputVal);
            console.log('selectedFieldType # ' + selectedFieldType);
            console.log('index # ' + index);
            if (this.inputVal) {
                console.log('in if  this.filterConditions @ ' + JSON.stringify(this.filterConditions));
                console.log('in if  this.filterConditions[index].showChild @ ' + this.filterConditions[index].showChild);
                this.filterConditions = this.filterConditions.map(item => {
                    console.log('item.rowNum  # ' + item.rowNum);
                    console.log('index # ' + index + 1);
                    if (+item.rowNum == +index + 1) {
                        console.log('inside row Num check');
                        if (selectedFieldType == 'Date' || selectedFieldType == 'DateTime') {
                            return { ...item, showChild: 'true', fieldType: selectedFieldType, operatoreOptions: [{ label: 'Before', value: '<' }, { label: 'After', value: '>' }, { label: 'Before and Equal', value: '<=' }, { label: 'After and Equal', value: '>=' }] };
                        } else {
                            return { ...item, showChild: 'true', fieldType: selectedFieldType, operatoreOptions: [{ label: 'Equals', value: '=' }, { label: 'Not Equals', value: '!=' }] };
                        }

                    }
                    return item;
                });
            } else {
                console.log('inside else @');
                this.filterConditions = this.filterConditions.map(item => {
                    if (+item.rowNum == +index + 1) {
                        return { ...item, showChild: 'false' };
                    }
                    return item;
                });
            }

        }
        console.log('in handlefilter this.filterConditions : ' + JSON.stringify(this.filterConditions));
    }

    /*@api
    handleSubmit() {
        const allFieldsFilled = this.filterConditions.every(filterCondition => {
            return filterCondition.field && filterCondition.operator && filterCondition.value;
        });
    
        if (allFieldsFilled) {
            this.finalData = {
                objName: this.objectApiName,
                filters: this.filterConditions
            };
            const submitEvent = new CustomEvent('filtersubmit', {
                detail: this.finalData
            });
            this.dispatchEvent(submitEvent);
        } else {
            this.showToast('Error', 'Please fill all fields in Filter Conditons', 'error');
        }
    }*/
    @api
    handleSubmit() {
        const allFieldsFilled = this.filterConditions.every(filterCondition => {
            return filterCondition.field && filterCondition.operator && filterCondition.value;
        });

        if (allFieldsFilled) {
            this.finalData = this.formatFilterConditions(this.filterConditions);

            console.log('!@#$ this.finalData !@#$ ' + JSON.stringify(this.finalData));
            const submitEvent = new CustomEvent('filtersubmit', {
                detail: this.finalData
            });
            this.dispatchEvent(submitEvent);
        } else {
            this.showToast('Error', 'Please complete all mandatory fields in Filter Conditons', 'error');
        }
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }

    handleCustomEvent(event) {
        console.log("custom event called");
        const index = event.detail.index;
        const value = event.detail.value;
        console.log("index value : " + index + ' ' + value);
        console.log('in event filterConditions: before: ' + JSON.stringify(this.filterConditions));
        this.filterConditions[index].value = value;
        console.log('in event filterConditions: after: ' + JSON.stringify(this.filterConditions));
    }

    formatFilterConditions(filterConditions) {
        let newData = {
            objectName: this.objectApiName,
            conditions: ""
        };

        filterConditions.forEach(item => {
            const { field, operator, value, fieldType } = item;
            let formattedValue;
            if (fieldType === 'DateTime' || fieldType === 'Boolean' || fieldType === 'Date') {
                formattedValue = value;
            } else {
                formattedValue = `'${value}'`;
            }
            const condition = `${field} ${operator} ${formattedValue}`;
            newData.conditions += (newData.conditions ? ` and ${condition}` : condition);
        });

        console.log('!@#$ newData !@#$ ' + JSON.stringify(newData));
        return newData;
    }

}