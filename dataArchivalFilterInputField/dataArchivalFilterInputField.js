import { LightningElement, wire, api, track } from 'lwc';
import { getObjectInfo, getPicklistValues, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';

export default class DataArchivalFilterInputField extends LightningElement {
    @api objectName;
    @api fieldName;
    @api fieldType;
    @api index;
    dateField = false;
    booleanField = false;
    picklistField = false;
    datetimeField = false;
    multipicklistField = false;

    booleanOption = [{ label: 'True', value: 'true' }, { label: 'False', value: 'false' }];
    picklistOptions = [];

    defaultRecordTypeId;

    picklistValues;

    @wire(getObjectInfo, { objectApiName: '$objectName' })
    wireObjectInfo({ error, data }) {
        if (data) {
            this.defaultRecordTypeId = data.defaultRecordTypeId;
            //console.log(' this.defaultRecordTypeId**** ' + this.defaultRecordTypeId);
        } else if (error) {
            console.log('error****' + error);
        }
    }

    @wire(getPicklistValuesByRecordType, { objectApiName: '$objectName', recordTypeId: '$defaultRecordTypeId' })
    pickValues({ error, data }) {
        if (data) {
            this.picklistValues = data;
        } else if (error) {
            console.log('error****' + error);
        }
    }

    renderedCallback() {
        //console.log('in render *** ' + this.fieldName);
        //console.log('picklistValues :: ' + JSON.stringify(this.picklistValues));
        if (this.fieldName && (this.fieldType == 'Picklist' || this.fieldType == 'MultiPicklist')) {
            const fieldData = this.picklistValues.picklistFieldValues[this.fieldName];
            const values = fieldData.values;
            const allOptions = values.map(option => ({
                label: option.label,
                value: option.value
            }));
            if (JSON.stringify(this.picklistOptions) !== JSON.stringify(allOptions)) {
                this.picklistOptions = allOptions;
            }
        }

        const fieldTypes = ['Date', 'DateTime', 'Boolean', 'Picklist', 'MultiPicklist'];
        //console.log('this.fieldType** ' + this.fieldType);
        fieldTypes.forEach(type => {
            this[type.toLowerCase() + 'Field'] = this.fieldType == type;
        });
    }
    handleFilterChange(event) {
        console.log('inside  $$');
        const inputType = event.target.type;
        /*let value;
        console.log('inside inputType  $$ ' + inputType);
        if (inputType == 'checkbox') {
            console.log('inside if  $$ ');
            value = event.target.checked ? "true" : "false";
        } else {
            console.log('inside else  $$ ');
            console.log('inside else  $$ ' + event.detail.value);
            value = event.detail.value;
        }*/
        const value = event.detail.value;
        console.log('In field filter handleFilterChange: ' + value);
        this.dispatchEvent(new CustomEvent('selectedvalues', {
            detail: {
                index: this.index,
                value: value

            }
        }));
    }

}