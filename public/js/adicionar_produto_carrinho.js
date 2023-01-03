var cor_selecionada = 0;
var tamanho_selecionado = 0;

function adicionar_produto_carrinho(id, idCor, idTamanho) {
    if (cor_selecionada != 0 && tamanho_selecionado != 0){
        console.log('O produto com o id: ' + id + ' , com a cor: ' + idCor + ' e com o tamanho: ' + idTamanho + ' foi adicionado com sucesso ao carrinho!')
        window.location.assign("/loja/adicionar_carrinho?id=" + id + "&cor=" + idCor + "&tamanho=" + idTamanho)
    } else{
        console.log('Produto por selecionar')
    }
};