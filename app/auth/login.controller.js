(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$state', 'AuthService'];

    function LoginController($state, AuthService) {
        var vm = this;

        vm.credentials = {
            email: '',
            senha: ''
        };
        vm.showPassword = false;
        vm.loading = false;
        vm.error = null;

        vm.login = login;
        vm.togglePassword = togglePassword;

        function login() {
            vm.error = null;
            vm.loading = true;

            AuthService.login(vm.credentials)
                .then(function () {
                    $state.go('dashboard');
                })
                .catch(function (response) {
                    if (response.status === 401 || response.status === 403) {
                        vm.error = 'E-mail ou senha inválidos.';
                    } else if (response.data && response.data.mensagem) {
                        vm.error = response.data.mensagem;
                    } else {
                        vm.error = 'Erro ao conectar. Tente novamente.';
                    }
                })
                .finally(function () {
                    vm.loading = false;
                });
        }

        function togglePassword() {
            vm.showPassword = !vm.showPassword;
        }
    }
})();
