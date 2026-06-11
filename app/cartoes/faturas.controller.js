(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .controller('FaturasController', FaturasController);

    FaturasController.$inject = ['$rootScope', '$stateParams', 'CartaoService', 'CategoriaService'];

    function FaturasController($rootScope, $stateParams, CartaoService, CategoriaService) {
        var vm = this;

        vm.cartaoId = $stateParams.cartaoId;
        vm.fatura = null;
        vm.categorias = [];
        vm.loading = true;
        vm.salvandoCompra = false;
        vm.erro = null;
        vm.sucesso = null;
        vm.mostrarFormCompra = false;

        var hoje = new Date();
        vm.mesSelecionado = hoje.getMonth() + 1;
        vm.anoSelecionado = hoje.getFullYear();

        vm.novaCompra = { categoriaId: null, valor: null, quantidadeParcelas: 1, descricao: '', dtCompra: hoje.toISOString().substring(0, 10) };

        vm.carregarFatura = carregarFatura;
        vm.criarCompra = criarCompra;
        vm.excluirCompra = excluirCompra;
        vm.toggleFormCompra = toggleFormCompra;
        vm.mesAnterior = mesAnterior;
        vm.mesProximo = mesProximo;

        init();

        function init() {
            if (!$rootScope.espacoAtual || !vm.cartaoId) {
                vm.loading = false;
                return;
            }
            CategoriaService.listar($rootScope.espacoAtual.id)
                .then(function (cats) {
                    vm.categorias = cats.filter(function (c) { return c.ativo; });
                    carregarFatura();
                });
        }

        function carregarFatura() {
            vm.loading = true;
            CartaoService.obterFatura($rootScope.espacoAtual.id, vm.cartaoId, vm.mesSelecionado, vm.anoSelecionado)
                .then(function (data) {
                    vm.fatura = data;
                    vm.loading = false;
                })
                .catch(function () {
                    vm.fatura = null;
                    vm.erro = 'Erro ao carregar fatura.';
                    vm.loading = false;
                });
        }

        function criarCompra() {
            if (!vm.novaCompra.categoriaId || !vm.novaCompra.valor || !vm.novaCompra.dtCompra) return;
            vm.salvandoCompra = true;
            vm.erro = null;

            var payload = angular.copy(vm.novaCompra);
            payload.valor = parseFloat(payload.valor);
            payload.quantidadeParcelas = parseInt(payload.quantidadeParcelas);

            CartaoService.criarCompra($rootScope.espacoAtual.id, vm.cartaoId, payload)
                .then(function () {
                    vm.sucesso = 'Compra registrada!';
                    vm.novaCompra = { categoriaId: null, valor: null, quantidadeParcelas: 1, descricao: '', dtCompra: hoje.toISOString().substring(0, 10) };
                    vm.mostrarFormCompra = false;
                    vm.salvandoCompra = false;
                    carregarFatura();
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao registrar compra.';
                    vm.salvandoCompra = false;
                });
        }

        function excluirCompra(parcela) {
            if (!confirm('Tem certeza que deseja excluir esta compra? Todas as parcelas serão removidas.')) {
                return;
            }

            CartaoService.excluirCompra($rootScope.espacoAtual.id, vm.cartaoId, parcela.compraId)
                .then(function () {
                    vm.sucesso = 'Compra excluída com sucesso!';
                    carregarFatura();
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao excluir compra.';
                });
        }

        function toggleFormCompra() {
            vm.mostrarFormCompra = !vm.mostrarFormCompra;
            // Resetar data para hoje quando abre o formulário
            if (vm.mostrarFormCompra && !vm.novaCompra.dtCompra) {
                vm.novaCompra.dtCompra = new Date().toISOString().substring(0, 10);
            }
        }

        function mesAnterior() {
            vm.mesSelecionado--;
            if (vm.mesSelecionado < 1) {
                vm.mesSelecionado = 12;
                vm.anoSelecionado--;
            }
            carregarFatura();
        }

        function mesProximo() {
            vm.mesSelecionado++;
            if (vm.mesSelecionado > 12) {
                vm.mesSelecionado = 1;
                vm.anoSelecionado++;
            }
            carregarFatura();
        }
    }
})();
