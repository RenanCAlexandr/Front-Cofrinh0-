(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .factory('CategoriaService', CategoriaService);

    CategoriaService.$inject = ['$http', 'APP_CONFIG'];

    function CategoriaService($http, APP_CONFIG) {
        var API_URL = APP_CONFIG.API_URL;

        return {
            listar: listar,
            criar: criar,
            editar: editar,
            excluir: excluir
        };

        function listar(espacoId) {
            return $http.get(API_URL + '/espacos-financeiros/' + espacoId + '/categorias')
                .then(function (r) { return r.data; });
        }

        function criar(espacoId, categoria) {
            return $http.post(API_URL + '/espacos-financeiros/' + espacoId + '/categorias', categoria)
                .then(function (r) { return r.data; });
        }

        function editar(espacoId, categoriaId, categoria) {
            return $http.put(API_URL + '/espacos-financeiros/' + espacoId + '/categorias/' + categoriaId, categoria)
                .then(function (r) { return r.data; });
        }

        function excluir(espacoId, categoriaId) {
            return $http.delete(API_URL + '/espacos-financeiros/' + espacoId + '/categorias/' + categoriaId);
        }
    }
})();
