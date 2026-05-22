(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .factory('EspacoService', EspacoService);

    EspacoService.$inject = ['$http', 'APP_CONFIG'];

    function EspacoService($http, APP_CONFIG) {
        var API_URL = APP_CONFIG.API_URL;

        return {
            listar: listar,
            criar: criar
        };

        function listar() {
            return $http.get(API_URL + '/espacos-financeiros')
                .then(function (r) { return r.data; });
        }

        function criar(espaco) {
            return $http.post(API_URL + '/espacos-financeiros', espaco)
                .then(function (r) { return r.data; });
        }
    }
})();
