(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .controller('CategoriasController', CategoriasController);

    CategoriasController.$inject = ['$rootScope', 'CategoriaService'];

    function CategoriasController($rootScope, CategoriaService) {
        var vm = this;

        vm.categorias = [];
        vm.loading = true;
        vm.salvando = false;
        vm.erro = null;
        vm.sucesso = null;
        vm.busca = '';
        vm.filtroRapido = '';
        vm.filtroTipo = '';
        vm.modal = null;
        vm.editando = {};

        vm.nova = resetNova();

        vm.abrirModal = abrirModal;
        vm.criar = criar;
        vm.iniciarEdicao = iniciarEdicao;
        vm.salvarEdicao = salvarEdicao;
        vm.cancelarEdicao = cancelarEdicao;
        vm.excluir = excluir;
        vm.aplicarFiltroRapido = aplicarFiltroRapido;
        vm.aplicarFiltroTipo = aplicarFiltroTipo;
        vm.categoriasFiltradas = categoriasFiltradas;

        init();

        function init() {
            if (!$rootScope.espacoAtual) {
                vm.loading = false;
                return;
            }
            carregarCategorias();
        }

        function carregarCategorias() {
            vm.loading = true;
            CategoriaService.listar($rootScope.espacoAtual.id)
                .then(function (categorias) {
                    vm.categorias = categorias;
                    vm.loading = false;
                })
                .catch(function () {
                    vm.erro = 'Erro ao carregar categorias.';
                    vm.loading = false;
                });
        }

        function abrirModal() {
            vm.nova = resetNova();
            vm.erro = null;
            if (!vm.modal) {
                vm.modal = new bootstrap.Modal(document.getElementById('modalCategoria'));
            }
            vm.modal.show();
        }

        function criar() {
            if (!vm.nova.nome || !vm.nova.tipo) return;
            vm.salvando = true;
            vm.erro = null;

            CategoriaService.criar($rootScope.espacoAtual.id, vm.nova)
                .then(function () {
                    vm.sucesso = 'Categoria criada com sucesso!';
                    vm.nova = resetNova();
                    vm.salvando = false;
                    if (vm.modal) vm.modal.hide();
                    carregarCategorias();
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao criar categoria.';
                    vm.salvando = false;
                });
        }

        function iniciarEdicao(cat) {
            vm.editando = { id: cat.id, nome: cat.nome, tipo: cat.tipo, ativo: cat.ativo };
        }

        function salvarEdicao() {
            if (!vm.editando.nome) return;
            CategoriaService.editar($rootScope.espacoAtual.id, vm.editando.id, vm.editando)
                .then(function () {
                    vm.sucesso = 'Categoria atualizada!';
                    vm.editando = {};
                    carregarCategorias();
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao editar categoria.';
                });
        }

        function cancelarEdicao() {
            vm.editando = {};
        }

        function excluir(cat) {
            if (!confirm('Deseja excluir a categoria "' + cat.nome + '"?')) return;
            CategoriaService.excluir($rootScope.espacoAtual.id, cat.id)
                .then(function () {
                    vm.sucesso = 'Categoria excluída!';
                    carregarCategorias();
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao excluir categoria.';
                });
        }

        function aplicarFiltroRapido(filtro) {
            vm.filtroRapido = filtro;
        }

        function aplicarFiltroTipo(tipo) {
            vm.filtroTipo = tipo;
        }

        function categoriasFiltradas() {
            var lista = vm.categorias;

            if (vm.filtroRapido === 'ativo') {
                lista = lista.filter(function (c) { return c.ativo; });
            } else if (vm.filtroRapido === 'inativo') {
                lista = lista.filter(function (c) { return !c.ativo; });
            }

            if (vm.filtroTipo) {
                lista = lista.filter(function (c) { return c.tipo === vm.filtroTipo; });
            }

            if (vm.busca) {
                var termo = vm.busca.toLowerCase();
                lista = lista.filter(function (c) {
                    return c.nome.toLowerCase().indexOf(termo) !== -1;
                });
            }

            return lista;
        }

        function resetNova() {
            return { nome: '', tipo: 'SAIDA' };
        }

        $rootScope.$on('espacoAlterado', function () {
            carregarCategorias();
        });
    }
})();
