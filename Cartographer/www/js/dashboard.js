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
        'nav-bar': navBar,
        'new-map': newMapForm
    },
    data: {
        isLoadVisible: true,
        signedInAccount: undefined
    },
    mounted: function(){
        this.$nextTick(function(){
            var dashboardInstance = this;
            
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    dashboardInstance.signedInAccount = user;
                    console.log(user);
                }
                
                dashboardInstance.isLoadVisible = false;
            });
        })
    }
});