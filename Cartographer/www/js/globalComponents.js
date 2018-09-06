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

var navBar = {
    data: function(){
        return {
            isSignedIn: false
        }
    },
    mounted: function(){
        //initialize mobile menu
        this.$nextTick(function(){
            console.log(document.querySelectorAll('.sidenav'));
            var instances = M.Sidenav.init(document.querySelectorAll('.sidenav'));
        })
        
        //check for logged in status
    },
    template: `<header>
                  <nav id="siteNav" role="navigation">
                      <div class="nav-wrapper">
                          <a href="#" data-target="mobile-menu" class="sidenav-trigger"><i class="material-icons">menu</i></a>
                          <div class="col s12">
                              <a id="logo-container" href="/" class="brand-logo">Cartographer</a>
                              <ul id="nav-mobile-list" class="right hide-on-med-and-down">
                                  <li class="login-button">
                                      <a href="#">Sign {{isSignedIn ? 'Out' : 'In'}}</a>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </nav>
                  <ul class="sidenav" id="mobile-menu">
                      <li class="login-button">
                          <a href="#">Sign {{isSignedIn ? 'Out' : 'In'}}</a>
                      </li>
                  </ul>
              </header>`
};