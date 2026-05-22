(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .factory('MovimentacaoService', MovimentacaoService);

    MovimentacaoService.$inject = ['$http', 'APP_CONFIG'];

    function MovimentacaoService($http, APP_CONFIG) {
        var API_URL = APP_CONFIG.API_URL;

        return {
            listar: listar,
            filtrar: filtrar,
            criar: criar,
            editar: editar,
            excluir: excluir
        };

        function listar(espacoId, params) {
            return $http.get(API_URL + '/espacos-financeiros/' + espacoId + '/movimentacoes', { params: params })
                .then(function (r) { return r.data; });
        }

        function filtrar(espacoId, filtro, params) {
            var queryParams = angular.extend({}, filtro, params);
            return $http.get(API_URL + '/espacos-financeiros/' + espacoId + '/movimentacoes/filtrar', { params: queryParams })
                .then(function (r) { return r.data; });
        }

        function criar(espacoId, movimentacao) {
            return $http.post(API_URL + '/espacos-financeiros/' + espacoId + '/movimentacoes', movimentacao)
                .then(function (r) { return r.data; });
        }

        function editar(espacoId, movimentacaoId, movimentacao) {
            return $http.put(API_URL + '/espacos-financeiros/' + espacoId + '/movimentacoes/' + movimentacaoId, movimentacao)
                .then(function (r) { return r.data; });
        }

        function excluir(espacoId, movimentacaoId) {
            return $http.delete(API_URL + '/espacos-financeiros/' + espacoId + '/movimentacoes/' + movimentacaoId);
        }
    }
})();
