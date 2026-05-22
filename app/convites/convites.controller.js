(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .controller('ConvitesController', ConvitesController);

    ConvitesController.$inject = ['$rootScope', 'ConviteService', 'EspacoService'];

    function ConvitesController($rootScope, ConviteService, EspacoService) {
        var vm = this;

        vm.convitesEnviados = [];
        vm.convitesPendentes = [];
        vm.loading = true;
        vm.salvando = false;
        vm.erro = null;
        vm.sucesso = null;
        vm.novoConvite = { email: '' };

        vm.enviar = enviar;
        vm.aceitar = aceitar;
        vm.recusar = recusar;

        init();

        function init() {
            carregarDados();
        }

        function carregarDados() {
            vm.loading = true;
            ConviteService.listarPendentes()
                .then(function (pendentes) {
                    vm.convitesPendentes = pendentes;
                    if ($rootScope.espacoAtual) {
                        return ConviteService.listarPorEspaco($rootScope.espacoAtual.id);
                    }
                    return [];
                })
                .then(function (enviados) {
                    vm.convitesEnviados = enviados;
                    vm.loading = false;
                })
                .catch(function () {
                    vm.erro = 'Erro ao carregar convites.';
                    vm.loading = false;
                });
        }

        function enviar() {
            if (!vm.novoConvite.email || !$rootScope.espacoAtual) return;
            vm.salvando = true;
            vm.erro = null;

            ConviteService.enviar($rootScope.espacoAtual.id, vm.novoConvite)
                .then(function (convite) {
                    vm.convitesEnviados.push(convite);
                    vm.novoConvite = { email: '' };
                    vm.sucesso = 'Convite enviado!';
                    vm.salvando = false;
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao enviar convite.';
                    vm.salvando = false;
                });
        }

        function aceitar(convite) {
            ConviteService.aceitar(convite.id)
                .then(function () {
                    convite.status = 'ACEITO';
                    vm.sucesso = 'Convite aceito! Recarregando espaços...';
                    EspacoService.listar().then(function (espacos) {
                        $rootScope.espacos = espacos;
                    });
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao aceitar convite.';
                });
        }

        function recusar(convite) {
            if (!confirm('Recusar convite para "' + convite.espacoFinanceiroNome + '"?')) return;
            ConviteService.recusar(convite.id)
                .then(function () {
                    convite.status = 'RECUSADO';
                    vm.sucesso = 'Convite recusado.';
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao recusar convite.';
                });
        }

        $rootScope.$on('espacoAlterado', function () {
            carregarDados();
        });
    }
})();
