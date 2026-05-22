(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .factory('AuthService', AuthService);

    AuthService.$inject = ['$http', '$window', 'APP_CONFIG'];

    function AuthService($http, $window, APP_CONFIG) {
        var API_URL = APP_CONFIG.API_URL;
        var TOKEN_KEY = 'cofrinh0_token';
        var USER_KEY = 'cofrinh0_user';

        var service = {
            login: login,
            cadastrar: cadastrar,
            logout: logout,
            getToken: getToken,
            getUser: getUser,
            isAuthenticated: isAuthenticated
        };

        return service;

        function login(credentials) {
            return $http.post(API_URL + '/auth/login', credentials)
                .then(function (response) {
                    var data = response.data;
                    $window.localStorage.setItem(TOKEN_KEY, data.token);
                    return data;
                });
        }

        function cadastrar(usuario) {
            return $http.post(API_URL + '/usuarios', usuario)
                .then(function (response) {
                    return response.data;
                });
        }

        function logout() {
            $window.localStorage.removeItem(TOKEN_KEY);
            $window.localStorage.removeItem(USER_KEY);
        }

        function getToken() {
            return $window.localStorage.getItem(TOKEN_KEY);
        }

        function getUser() {
            var stored = $window.localStorage.getItem(USER_KEY);
            return stored ? JSON.parse(stored) : null;
        }

        function isAuthenticated() {
            var token = getToken();
            if (!token) {
                return false;
            }
            try {
                var payload = JSON.parse(atob(token.split('.')[1]));
                return payload.exp * 1000 > Date.now();
            } catch (e) {
                return false;
            }
        }
    }
})();
