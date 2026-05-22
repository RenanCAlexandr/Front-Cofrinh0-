(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .factory('ConviteService', ConviteService);

    ConviteService.$inject = ['$http', 'APP_CONFIG'];

    function ConviteService($http, APP_CONFIG) {
        var API_URL = APP_CONFIG.API_URL;

        return {
            listarPorEspaco: listarPorEspaco,
            listarPendentes: listarPendentes,
            enviar: enviar,
            aceitar: aceitar,
            recusar: recusar
        };

        function listarPorEspaco(espacoId) {
            return $http.get(API_URL + '/espacos-financeiros/' + espacoId + '/convites')
                .then(function (r) { return r.data; });
        }

        function listarPendentes() {
            return $http.get(API_URL + '/convites/pendentes')
                .then(function (r) { return r.data; });
        }

        function enviar(espacoId, convite) {
            return $http.post(API_URL + '/espacos-financeiros/' + espacoId + '/convites', convite)
                .then(function (r) { return r.data; });
        }

        function aceitar(conviteId) {
            return $http.put(API_URL + '/convites/' + conviteId + '/aceitar');
        }

        function recusar(conviteId) {
            return $http.put(API_URL + '/convites/' + conviteId + '/recusar');
        }
    }
})();
