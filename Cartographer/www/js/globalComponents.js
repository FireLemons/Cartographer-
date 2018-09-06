var loadScreen = {
    props: {
        isVisible: Boolean
    },
    template: `<transition name="fade">
                   <div id="load" v-if="isVisible">
                       <h1>Cartographer</h1>
                       <h2>is Loading <i class="medium material-icons">place</i><span></span></h2>
                   </div>
               </transition>`
};