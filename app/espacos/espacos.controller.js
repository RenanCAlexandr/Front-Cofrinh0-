(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .controller('EspacosController', EspacosController);

    EspacosController.$inject = ['$rootScope', 'EspacoService'];

    function EspacosController($rootScope, EspacoService) {
        var vm = this;

        vm.espacos = [];
        vm.novoEspaco = { nome: '' };
        vm.loading = true;
        vm.criando = false;
        vm.erro = null;
        vm.sucesso = null;

        vm.criar = criar;
        vm.selecionar = selecionar;

        init();

        function init() {
            carregarEspacos();
        }

        function carregarEspacos() {
            vm.loading = true;
            EspacoService.listar()
                .then(function (data) {
                    vm.espacos = data;
                    $rootScope.espacos = data;
                    vm.loading = false;
                })
                .catch(function () {
                    vm.erro = 'Erro ao carregar espaços financeiros.';
                    vm.loading = false;
                });
        }

        function criar() {
            if (!vm.novoEspaco.nome) return;
            vm.criando = true;
            vm.erro = null;
            vm.sucesso = null;

            EspacoService.criar(vm.novoEspaco)
                .then(function (espaco) {
                    vm.espacos.push(espaco);
                    $rootScope.espacos = vm.espacos;
                    vm.novoEspaco = { nome: '' };
                    vm.sucesso = 'Espaço criado com sucesso!';
                    vm.criando = false;

                    if (!$rootScope.espacoAtual) {
                        selecionar(espaco);
                    }
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao criar espaço.';
                    vm.criando = false;
                });
        }

        function selecionar(espaco) {
            $rootScope.espacoAtual = espaco;
            localStorage.setItem('cofrinh0_espaco', JSON.stringify(espaco));
            $rootScope.$broadcast('espacoAlterado');
        }
    }
})();
