var loadScreen = {
    props: {
        isVisible: Boolean
    },
    template: `<transition name="fade">
                   <div id="load" v-if="isVisible">
                       <h1>Cartographer</h1>
                       <h2><span>is</span> Loading <i class="medium material-icons">place</i><span></span></h2>
                   </div>
               </transition>`
};

var navBar = {
    data: function(){
        return {
            accounts: localStorage.getItem('cartographer.authList'),
            loginAccount: undefined
        }
    },
    props: {
        signedInAccount: Object
    },
    mounted: function(){
        this.$nextTick(function(){
            //initialize mobile menu
            var mobileMenus = M.Sidenav.init(document.querySelectorAll('.sidenav'));
            var authModals =  M.Modal.init(document.querySelectorAll('.modal'));
        })
    },
    template: `<header>
                  <nav id="siteNav" role="navigation">
                      <div class="nav-wrapper">
                          <a href="#!" data-target="mobile-menu" class="sidenav-trigger"><i class="material-icons">menu</i></a>
                          <div class="col s12">
                              <a id="logo-container" href="/" class="brand-logo">Cartographer</a>
                              <ul id="nav-mobile-list" class="right hide-on-med-and-down">
                                  <li>
                                      <a class="modal-trigger" href="#create-account">
                                          <i class="material-icons left">person_add</i>
                                          Create Account
                                      </a>
                                  </li>
                                  <li class="login-button">
                                      <a class="modal-trigger" href="#sign-in">
                                          <i class="material-icons left">{{signedInAccount ? 'person_outline' : 'person'}}</i>
                                          Sign {{signedInAccount ? 'Out' : 'In'}}
                                      </a>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </nav>
                  <ul id="saved-accounts" class="dropdown-content" v-if="accounts && accounts.length > 1">
                      <li v-for="account in accounts">
                          <a href="#!">{{account.email}}</a>
                      </li>
                  </ul>
                  <ul class="sidenav" id="mobile-menu">
                      <li class="login-button">
                          <a class="modal-trigger" href="#sign-in">
                              <i class="material-icons left">{{signedInAccount ? 'person_outline' : 'person'}}</i>
                              Sign {{signedInAccount ? 'Out' : 'In'}}
                          </a>
                      </li>
                      <li>
                          <a class="modal-trigger" href="#create-account">
                              <i class="material-icons left">person_add</i> Create Account
                          </a>
                      </li>
                  </ul>
                  <div id="sign-in" class="modal">
                      <div class="modal-content">
                          <div class="row">
                              <div class="input-field col s12" v-if="">
                                  <input id="email" type="text" class="validate">
                                  <label for="email">Email</label>
                              </div>
                              <div class="input-field col s12">
                                  <input id="password" type="password" class="validate">
                                  <label for="password">Password</label>
                              </div>
                          </div>
                          <div class="row">
                              <a href="#!" class="btn btn-flat cartographer-green col s12">Sign In</a>
                          </div>
                          <div class="row">
                              <a href="#!" class="btn btn-flat col grey lighten-2 modal-close s12">Cancel</a>
                          </div>
                      </div>
                  </div>
                  <div id="create-account" class="modal">
                      <div class="modal-content">
                          <div class="row">
                              <div class="input-field col s12">
                                  <input id="email-new" type="text" class="validate">
                                  <label for="email-new">Email</label>
                              </div>
                              <div class="input-field col s12">
                                  <input id="password-new" type="password" class="validate">
                                  <label for="password-new">Password</label>
                              </div>
                              <div class="input-field col s12">
                                  <input id="password-confirm-new" type="text" class="validate">
                                  <label for="password-confirm-new">Confirm Password</label>
                              </div>
                          </div>
                          <div class="row">
                              <a href="#!" class="btn btn-flat cartographer-green col s12">Create Account</a>
                          </div>
                          <div class="row">
                              <a href="#!" class="btn btn-flat col grey lighten-2 modal-close s12">Cancel</a>
                          </div>
                      </div>
                  </div>
              </header>`
};