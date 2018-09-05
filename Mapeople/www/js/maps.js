/*
 *Components
 */
var mapOptions = {};
var newMapForm = {};
var search = {};

var dashboard = new Vue({
    el: '#dashboard',
    components:{
        'map-options': mapOptions,
        'new-map': newMapForm,
        'map-search': search
    }
});