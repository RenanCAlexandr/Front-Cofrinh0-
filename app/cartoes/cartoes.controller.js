(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .controller('CartoesController', CartoesController);

    CartoesController.$inject = ['$rootScope', '$state', 'CartaoService'];

    function CartoesController($rootScope, $state, CartaoService) {
        var vm = this;

        vm.cartoes = [];
        vm.loading = true;
        vm.salvando = false;
        vm.excluindo = false;
        vm.editando = false;
        vm.editandoId = null;
        vm.cartaoExcluir = null;
        vm.erro = null;
        vm.sucesso = null;
        vm.busca = '';
        vm.filtroRapido = '';
        vm.modal = null;
        vm.modalExcluir = null;

        vm.novo = resetNovo();

        vm.abrirModal = abrirModal;
        vm.salvar = salvar;
        vm.abrirEdicao = abrirEdicao;
        vm.confirmarExclusao = confirmarExclusao;
        vm.excluir = excluir;
        vm.verFatura = verFatura;
        vm.aplicarFiltroRapido = aplicarFiltroRapido;
        vm.cartoesFiltrados = cartoesFiltrados;

        init();

        function init() {
            if (!$rootScope.espacoAtual) {
                vm.loading = false;
                return;
            }
            carregarCartoes();
        }

        function carregarCartoes() {
            vm.loading = true;
            CartaoService.listar($rootScope.espacoAtual.id)
                .then(function (cartoes) {
                    vm.cartoes = cartoes;
                    vm.loading = false;
                })
                .catch(function () {
                    vm.erro = 'Erro ao carregar cartões.';
                    vm.loading = false;
                });
        }

        function abrirModal() {
            vm.novo = resetNovo();
            vm.editando = false;
            vm.editandoId = null;
            vm.erro = null;
            if (!vm.modal) {
                vm.modal = new bootstrap.Modal(document.getElementById('modalCartao'));
            }
            vm.modal.show();
        }

        function abrirEdicao(cartao) {
            vm.editando = true;
            vm.editandoId = cartao.id;
            vm.novo = {
                nome: cartao.nome,
                bandeira: cartao.bandeira || '',
                limite: cartao.limite,
                diaFechamento: cartao.diaFechamento,
                diaVencimento: cartao.diaVencimento
            };
            vm.erro = null;
            if (!vm.modal) {
                vm.modal = new bootstrap.Modal(document.getElementById('modalCartao'));
            }
            vm.modal.show();
        }

        function salvar() {
            if (!vm.novo.nome || !vm.novo.limite || !vm.novo.diaFechamento || !vm.novo.diaVencimento) return;
            vm.salvando = true;
            vm.erro = null;

            var payload = angular.copy(vm.novo);
            payload.limite = parseFloat(payload.limite);

            var promise;
            if (vm.editando) {
                promise = CartaoService.editar($rootScope.espacoAtual.id, vm.editandoId, payload);
            } else {
                promise = CartaoService.criar($rootScope.espacoAtual.id, payload);
            }

            promise
                .then(function () {
                    vm.sucesso = vm.editando ? 'Cartão atualizado com sucesso!' : 'Cartão cadastrado com sucesso!';
                    vm.novo = resetNovo();
                    vm.editando = false;
                    vm.editandoId = null;
                    vm.salvando = false;
                    if (vm.modal) vm.modal.hide();
                    carregarCartoes();
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao salvar cartão.';
                    vm.salvando = false;
                });
        }

        function confirmarExclusao(cartao) {
            vm.cartaoExcluir = cartao;
            if (!vm.modalExcluir) {
                vm.modalExcluir = new bootstrap.Modal(document.getElementById('modalExcluirCartao'));
            }
            vm.modalExcluir.show();
        }

        function excluir() {
            if (!vm.cartaoExcluir) return;
            vm.excluindo = true;

            CartaoService.excluir($rootScope.espacoAtual.id, vm.cartaoExcluir.id)
                .then(function () {
                    vm.sucesso = 'Cartão excluído com sucesso!';
                    vm.excluindo = false;
                    vm.cartaoExcluir = null;
                    if (vm.modalExcluir) vm.modalExcluir.hide();
                    carregarCartoes();
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao excluir cartão.';
                    vm.excluindo = false;
                });
        }

        function verFatura(cartao) {
            $state.go('faturas', { cartaoId: cartao.id });
        }

        function aplicarFiltroRapido(filtro) {
            vm.filtroRapido = filtro;
        }

        function cartoesFiltrados() {
            var lista = vm.cartoes;

            if (vm.filtroRapido === 'ativo') {
                lista = lista.filter(function (c) { return c.ativo; });
            } else if (vm.filtroRapido === 'inativo') {
                lista = lista.filter(function (c) { return !c.ativo; });
            }

            if (vm.busca) {
                var termo = vm.busca.toLowerCase();
                lista = lista.filter(function (c) {
                    return c.nome.toLowerCase().indexOf(termo) !== -1 ||
                           (c.bandeira && c.bandeira.toLowerCase().indexOf(termo) !== -1);
                });
            }

            return lista;
        }

        function resetNovo() {
            return { nome: '', bandeira: '', limite: null, diaFechamento: null, diaVencimento: null };
        }

        $rootScope.$on('espacoAlterado', function () {
            carregarCartoes();
        });
    }
})();
