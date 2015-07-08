/**
 * localstorage service which provides 2-way binding of a scope property to localstorage entry
 * @author Jan Stuhlmann
 */
app.factory('bind2localstorage', function ($timeout) {

    var watchers = {};

    /**
     * get value from localstorage under given key
     * @param {string} key
     * @returns {mixed}
     */
    function get(key) {
      if (typeof(window.localStorage) != 'undefined') {
        var val = window.localStorage.getItem(key);
        // we also unserialize objects
        if (typeof(val) == 'string' && (val.indexOf('{') === 0 || val.indexOf('[') === 0)) {
          return JSON.parse(val);
        }
        return val;
      }
      return false;
    }

  /**
   * Sets value under given key
   * @param {string} key
   * @param {mixed} val
   * @returns {bool}
   */
    function set(key, val) {
      if (typeof(window.localStorage) != 'undefined') {
        if (typeof(val) == 'object' && val !== null) {
          val = JSON.stringify(val);
        }

        return window.localStorage.setItem(key, val);
      }
      return false;
    }

    var localStorage= {
        /**
         * binds a scopes property to localstorage (2-way binding)
         * @param {$scope} scope
         * @param {string} prop
         */
        bind: function(scope, prop) {
            if (typeof(window.localStorage) == 'undefined') {
              alert('Your browser does not support localstorage!');
              return;
            }

            // we need to do this async
            $timeout(function() {
                if (typeof(scope[prop])=='undefined') {
                    scope.$apply(function() {
                        scope[prop]=get(prop);
                    });
                }

                if (typeof(scope[prop]) == 'array' ||typeof(scope[prop] == 'object')) {
                  watchers[scope.$id + ':' + prop]=scope.$watchCollection(prop, function (newVal, oldVal) {
                    set(prop, newVal);
                  });
                } else {
                  watchers[scope.$id + ':' + prop]=scope.$watch(prop, function (newVal, oldVal) {
                    set(prop, newVal);
                  });
                }
            });

        },

        /**
         * removes the binding of a scopes property
         * @param {$scope} scope
         * @param {string} prop
         */
        unbind: function (scope, prop) {
            if (typeof(window.localStorage) != 'undefined') {
                // unwatch
                if (typeof(watchers[scope.$id + ':' + prop]) != 'undefined') {
                  // call deregister function
                  watchers[scope.$id + ':' + prop]();
                }
                // remove from localstorage
                window.localStorage.removeItem(prop);
            }
        }
    };
    return localStorage;
});