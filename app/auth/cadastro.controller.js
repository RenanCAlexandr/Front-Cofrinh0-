(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .controller('CadastroController', CadastroController);

    CadastroController.$inject = ['$state', 'AuthService'];

    function CadastroController($state, AuthService) {
        var vm = this;

        vm.usuario = {
            nome: '',
            email: '',
            senha: ''
        };
        vm.confirmarSenha = '';
        vm.showPassword = false;
        vm.loading = false;
        vm.error = null;
        vm.success = null;

        vm.cadastrar = cadastrar;
        vm.togglePassword = togglePassword;
        vm.senhasConferem = senhasConferem;

        function cadastrar() {
            vm.error = null;
            vm.success = null;

            if (!senhasConferem()) {
                vm.error = 'As senhas não conferem.';
                return;
            }

            vm.loading = true;

            AuthService.cadastrar(vm.usuario)
                .then(function () {
                    vm.success = 'Conta criada com sucesso! Redirecionando...';
                    setTimeout(function () {
                        $state.go('login');
                    }, 1500);
                })
                .catch(function (response) {
                    if (response.status === 409) {
                        vm.error = 'Este e-mail já está cadastrado.';
                    } else if (response.data && response.data.mensagem) {
                        vm.error = response.data.mensagem;
                    } else {
                        vm.error = 'Erro ao cadastrar. Tente novamente.';
                    }
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        function togglePassword() {
            vm.showPassword = !vm.showPassword;
        }

        function senhasConferem() {
            return vm.usuario.senha === vm.confirmarSenha;
        }
    }
})();
