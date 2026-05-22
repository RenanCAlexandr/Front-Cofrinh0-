(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$rootScope', 'DashboardService'];

    function DashboardController($rootScope, DashboardService) {
        var vm = this;

        var MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        vm.loading = true;
        vm.dashboard = null;
        vm.erro = null;

        // Período
        vm.periodo = inicializarPeriodo();
        vm.periodoLabel = '';
        vm.periodoRange = '';

        vm.mesAnterior = mesAnterior;
        vm.mesProximo = mesProximo;
        vm.mesAtual = mesAtual;

        init();

        function init() {
            if (!$rootScope.espacoAtual) {
                vm.loading = false;
                return;
            }
            atualizarLabels();
            carregarDashboard();
        }

        function inicializarPeriodo() {
            // Persist no rootScope para RN011
            if ($rootScope._dashboardPeriodo) {
                return angular.copy($rootScope._dashboardPeriodo);
            }
            var hoje = new Date();
            return { mes: hoje.getMonth(), ano: hoje.getFullYear() };
        }

        function atualizarLabels() {
            vm.periodoLabel = MESES[vm.periodo.mes] + ' ' + vm.periodo.ano;
            var inicio = new Date(vm.periodo.ano, vm.periodo.mes, 1);
            var fim = new Date(vm.periodo.ano, vm.periodo.mes + 1, 0);
            vm.periodoRange = formatarDataBr(inicio) + ' até ' + formatarDataBr(fim);
            // Persistir
            $rootScope._dashboardPeriodo = angular.copy(vm.periodo);
        }

        function carregarDashboard() {
            vm.loading = true;
            vm.erro = null;
            vm.dashboard = null;

            var dtInicio = formatarDataISO(new Date(vm.periodo.ano, vm.periodo.mes, 1));
            var dtFim = formatarDataISO(new Date(vm.periodo.ano, vm.periodo.mes + 1, 0));

            DashboardService.obter($rootScope.espacoAtual.id, dtInicio, dtFim)
                .then(function (data) {
                    vm.dashboard = data;
                    vm.loading = false;
                })
                .catch(function (err) {
                    if (err && err.status === -1) return;
                    vm.erro = 'Erro ao carregar dashboard.';
                    vm.loading = false;
                });
        }

        function mesAnterior() {
            vm.periodo.mes--;
            if (vm.periodo.mes < 0) {
                vm.periodo.mes = 11;
                vm.periodo.ano--;
            }
            atualizarLabels();
            carregarDashboard();
        }

        function mesProximo() {
            vm.periodo.mes++;
            if (vm.periodo.mes > 11) {
                vm.periodo.mes = 0;
                vm.periodo.ano++;
            }
            atualizarLabels();
            carregarDashboard();
        }

        function mesAtual() {
            var hoje = new Date();
            vm.periodo.mes = hoje.getMonth();
            vm.periodo.ano = hoje.getFullYear();
            atualizarLabels();
            carregarDashboard();
        }

        function formatarDataISO(date) {
            var y = date.getFullYear();
            var m = ('0' + (date.getMonth() + 1)).slice(-2);
            var d = ('0' + date.getDate()).slice(-2);
            return y + '-' + m + '-' + d;
        }

        function formatarDataBr(date) {
            var d = ('0' + date.getDate()).slice(-2);
            var m = ('0' + (date.getMonth() + 1)).slice(-2);
            return d + '/' + m + '/' + date.getFullYear();
        }

        $rootScope.$on('espacoAlterado', function () {
            if ($rootScope.espacoAtual) {
                carregarDashboard();
            }
        });
    }
})();
