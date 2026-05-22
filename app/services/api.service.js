(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .factory('authInterceptor', authInterceptor);

    authInterceptor.$inject = ['$window', '$q'];

    function authInterceptor($window, $q) {
        return {
            request: function (config) {
                var token = $window.localStorage.getItem('cofrinh0_token');
                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config;
            },
            responseError: function (response) {
                if (response.status === 401) {
                    $window.localStorage.removeItem('cofrinh0_token');
                    $window.location.href = '#!/login';
                }
                return $q.reject(response);
            }
        };
    }
})();
