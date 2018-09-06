/*
 *Components
 */
var mapOptions = {};
var newMapForm = {};
var search = {};

var dashboard = new Vue({
    el: '#app',
    components: {
        'load-screen': loadScreen,
        'map-options': mapOptions,
        'map-search': search,
        'new-map': newMapForm
    },
    data: {
        loadVisible: true
    },
    mounted: function(){
        this.$nextTick(function(){
            this.loadVisible = false;
        })
    }
});