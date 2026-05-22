(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .factory('CartaoService', CartaoService);

    CartaoService.$inject = ['$http', 'APP_CONFIG'];

    function CartaoService($http, APP_CONFIG) {
        var API_URL = APP_CONFIG.API_URL;

        return {
            listar: listar,
            criar: criar,
            editar: editar,
            excluir: excluir,
            criarCompra: criarCompra,
            obterFatura: obterFatura
        };

        function listar(espacoId) {
            return $http.get(API_URL + '/espacos-financeiros/' + espacoId + '/cartoes')
                .then(function (r) { return r.data; });
        }

        function criar(espacoId, cartao) {
            return $http.post(API_URL + '/espacos-financeiros/' + espacoId + '/cartoes', cartao)
                .then(function (r) { return r.data; });
        }

        function editar(espacoId, cartaoId, cartao) {
            return $http.put(API_URL + '/espacos-financeiros/' + espacoId + '/cartoes/' + cartaoId, cartao)
                .then(function (r) { return r.data; });
        }

        function excluir(espacoId, cartaoId) {
            return $http.delete(API_URL + '/espacos-financeiros/' + espacoId + '/cartoes/' + cartaoId);
        }

        function criarCompra(espacoId, cartaoId, compra) {
            return $http.post(API_URL + '/espacos-financeiros/' + espacoId + '/cartoes/' + cartaoId + '/compras', compra)
                .then(function (r) { return r.data; });
        }

        function obterFatura(espacoId, cartaoId, mes, ano) {
            return $http.get(API_URL + '/espacos-financeiros/' + espacoId + '/cartoes/' + cartaoId + '/faturas', {
                params: { mes: mes, ano: ano }
            }).then(function (r) { return r.data; });
        }
    }
})();
