const session = require('express-session');
const express = require('express');
const fs = require('fs');
const mysql = require("mysql2");
const sha = require('sha1');

const fileUpload = require("express-fileupload");
const { validateHeaderName } = require('http');

const servidor = express();
var porta = 8080;

servidor.use(express.urlencoded({extended: true}));
servidor.use(express.static("public"));
servidor.use(fileUpload());
//  Sessão
servidor.use(session({
    secret: "supercalifragilisticexpialidocious",
    resave: false,
    saveUninitialized: true
}));

// Ligação ao servidor
var porta = 8080;
servidor.listen(porta, function () {
    console.log("servidor a ser executado em http://localhost:" + porta);
});

// MySQL user - database
var pool = mysql.createPool({
    host: "localhost",
    user: "xtra_food",
    password: "xtra_food",
    database: "xtra_food",
    charset: "utf8",
    multipleStatements: true
});


//LOG SYSTEM
const logging = (req, res, next) => {
    console.log('================================================================================================================================================');
    console.log("Date: ", Date());
    console.log("Path: ", req.session);
    console.log('================================================================================================================================================');
    next();
};

// Tentar abrir fichieros prinicipais
try {
    var navbar = fs.readFileSync('html/NavBar.html', 'utf-8');
    var registo_login_popUp = fs.readFileSync('html/registo_login.html', 'utf-8');
    var footer = fs.readFileSync('html/Footer.html', 'utf-8');
    // var err_404 = fs.readFileSync('','utf-8');
}
// Caso nao consiga da log do erro
catch (error){
    console.error("Erro ao ler ficheiros de conteudo.")
    console.error(error)
}

// GUARDAR FORM NEWSLETTER 
servidor.post("/processa_newsletter", logging, function (req, res) {
    var query = '';

    query += 'INSERT INTO newsletter(email) VALUES("' + req.body.email + '");';
    pool.query(query, function (err, result, fields) {
        if (!err) {
            res.redirect('back')
        }
        else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        }
    });

});

// GUARDAR FORM REGISTO
servidor.post("/processa_registo", logging, function (req, res) {
    var query = '';
    if (req.body.num_tel){
        query += 'INSERT INTO cliente (nome, email, password, num_tel) VALUES ("' + req.body.nome + '", "' + req.body.email + '", "' + sha(req.body.password) + '", "' + req.body.num_tel + '");';
    }else{
        query += 'INSERT INTO cliente (nome, email, password) VALUES ("' + req.body.nome + '", "' + req.body.email + '", "' + sha(req.body.password) + '");';
    }
    console.log(query);

    pool.query(query, function (err, result, fields) {
        if (!err) {
            req.session.login_ = true
            res.redirect('back')
        }
        else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        }
    });
});

// PROCESSAR LOGIN 
servidor.post("/processa_login", logging, function (req, res) {
    var query = '';
    query += 'SELECT idCliente, nome, email, password, num_tel FROM cliente WHERE email = "' + req.body.email + '" AND password = "' + sha(req.body.password) + '";';

    pool.query(query, function (err, result, fields) {
        if (!err) {
            if (result && result.length > 0) {
                if (req.query.via_voluntariado == "true"){
                    return res.redirect("/processa_voluntariado_form?via_voluntario=true&nome=" + result[0].nome + "&email=" + result[0].email + "&num_tel=" + result[0].num_tel);
                }else{
                    console.log(result)
                    req.session.login_ = null
                    req.session.idCliente = result[0].idCliente
                    return res.redirect('back')
                };
            }else{
                console.log('Sem resultados SQL')
                return res.status(500).redirect('/InternalError');
            }
        }
        else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        }
    });
});

// LOG OUT
servidor.get("/log_out", logging, function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
            req.session.carrinho = [];
            console.log('Carrinho Limpo!');
            return res.status(500).redirect('/InternalError');
        }else{
            return res.redirect('/');
        };
    });
});

// PAGINA INICIAL
servidor.get("/", logging, function (req, res) {


    // Tentar abrir ficheiro
    try {
        var home_content = fs.readFileSync('html/home.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }
    
    var html = "";
    
    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css">\n';
    html += '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js">\n</script>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/home_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';
    
    
    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }
    
    //HTML Content
    html += home_content;

    var query ='';
    query += 'SELECT idEvento, cartaz_img FROM evento WHERE data >= "' + new Date().toISOString() + '" ORDER BY data ASC;';
    query += 'SELECT idProduto, nome, preco FROM produto;';

    pool.query(query, function (err, result, fields) {
        if (!err) {
            if (result && result.length > 0) {
                //console.log(result)
                html += '\n<script>';
                for (var index_evento in result[0]){
                    html += 'document.getElementById("cartaz_' + (parseInt(index_evento)+1).toString() + '").src = "images/eventos/' + result[0][index_evento].cartaz_img + '";\n';
                    if (index_evento > 2){
                        break;
                    }
                }
                var produto_index = 0;
                var lojaInnerHTML = '';
                for (var produto of result[1]){
                    lojaInnerHTML += '<a href="/loja/produto?id='+ produto.idProduto +'">';
                    lojaInnerHTML += '  <div class="item_loja_card flex flex_center flex_collum">';
                    lojaInnerHTML += '      <img class="item_loja_img" alt="imagem de produto em loja" src="/images/produtos/'+ produto.idProduto +'.jpg">';
                    lojaInnerHTML += '      <div class="item_loja flex flex_collum">';
                    lojaInnerHTML += '          <h1 class="nome_item">'+ produto.nome +'</h1>';
                    lojaInnerHTML += '          <div class="preco flex flex_center">';
                    lojaInnerHTML += '              <div class="preco_text">Preço:</div>';
                    lojaInnerHTML += '              <div class="preco_unitario">'+ produto.preco +'.00€</div>';
                    lojaInnerHTML += '          </div>';
                    /* Disponibilidade aqui (?) */
                    //lojaInnerHTML += '          <div class="disponibilidade flex flex_center">';
                    //lojaInnerHTML += '              <div class="disponibilidade_circle"></div>';
                    //lojaInnerHTML += '              <div class="disponibilidade_text">Disponível</div>';
                    //lojaInnerHTML += '          </div>';
                    lojaInnerHTML += '      </div>';
                    lojaInnerHTML += '  </div>';
                    lojaInnerHTML += '</a>';
                    
                    produto_index += 1;
                    if (produto_index > 2){
                        html += 'document.getElementById("loja_preview").innerHTML = ' + "'" + lojaInnerHTML + "'" + ';\n';
                        break;
                    };
                };


                html += '\n</script>\n';
            }else {
                console.log('Não foi possível obter resultados')
            };
        }
        else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        }
        html += footer;
        html += '</body>\n</html>';
        res.send(html);
    });
});

// PAGINA VOLUNTARIADO
servidor.get("/voluntariado", logging, function (req, res) {


    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/voluntariado.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Voluntariado | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/voluntariado_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
        html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    //HTML Content
    html += content;

    if (req.session.idCliente){
        var query = 'SELECT nome, email, password, num_tel FROM cliente WHERE idCliente = ' + req.session.idCliente + ';';
        pool.query(query, function (err, result, fields) {
            if (!err){
                if (result && result.length > 0) {
                    console.log(result)
                    html += '<script>document.getElementById("login_voluntariado_button").innerHTML = "SUBMETER COMO ' + (result[0].nome).toUpperCase() + '"</script>';
                    var url = "'/processa_voluntariado_form?via_voluntario=true&nome=" + result[0].nome + "&email=" + result[0].email + "&num_tel=" + result[0].num_tel + "'";
                    html += '<script>document.getElementById("login_voluntariado_button").onclick = null;</script>';
                    html += '<script>document.getElementById("login_voluntariado_button").onclick = () => window.location = ' + url + ';</script>';
                    html += footer;
                    
                    //HTML close
                    html += '\n</body>\n</html>';
                    return res.send(html);
                }else{
                    console.log('Sem resultados de Cliente');
                    return res.status(500).redirect('/InternalError');
                };
            }else {
                console.log(err);
                console.log('Erro ao executar pedido ao servidor');
                return res.status(500).redirect('/InternalError');
            };
        });
    }else{
        html += footer;

        //HTML close
        html += '\n</body>\n</html>';
        return res.send(html);
    };
});

// PROCESSAR FORMULÁRIO DE VOLUNTARIADO
servidor.get("/processa_voluntariado_form", logging, function (req, res) {
    var query ='';
    query = 'INSERT INTO voluntarios (nome, email, num_tel) VALUES ("' + req.query.nome + '", "' + req.query.email + '", "' + req.query.num_tel + '");';
    console.log (req.query);
    pool.query(query, function (err, result, fields) {
        if (!err){
            return res.status(200).redirect('/obrigado?motivo=voluntariado');
        }else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        };
    });
});

// PÁGINDA DE AGRADECIMENTOS
servidor.get("/obrigado", logging, function (req, res) {

    
    //HTML head
    var html = '';
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Obrigado! | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

        //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    console.log(req.query);

    if (req.query.motivo == 'voluntariado'){
        var pag_volta = '/voluntariado';
        var pag_volta_nome = 'Voluntariado';
        var obrigado_text = 'Obrigado pela submissão, foste registado como disponível para voluntariado! Iremos entrar em contacto assim que necessário para combinar todas as informações.';
    }else if (req.query.motivo == 'doacao') {
        var pag_volta = '/doacao';
        var pag_volta_nome = 'Doação';
        var obrigado_text = 'Obrigado pela tua doacao! Ficamos extremamente agradecidos pela tua contribuição nesta luta contra fome.';
    }else if (req.query.motivo == 'newsletter') {
        var pag_volta = '/';
        var pag_volta_nome = 'Home';
        var obrigado_text = 'Obrigado pelo teu registo na nossa newsletter! Iremos sempre enviar informações importantes sobre o que temos feito e sobre os nossos eventos.';
    }else if (req.query.motivo == 'pedido_servico') {
        var pag_volta = '/parceiros';
        var pag_volta_nome = 'Parceiros';
        var obrigado_text = 'Obrigado pelo teu pedido! Assim que possível, iremos rever a sua aplicação e entraremos em contacto caso seja aceite.';
    }else if (req.query.motivo == 'encomenda') {
        var pag_volta = '/';
        var pag_volta_nome = 'Home';
        var obrigado_text = 'Obrigado pela tua encomenda! Assim que possível, iremos processar o pedido para ser enviado o mais depressa possível.';
    };

    //HTML Content
    html += '<div class="flex flex_center flex_collum wrapper content_wrapper"><div class="flex flex_center flex_collum info_block gap75"><div class="title">OBRIGADO!</div><div class="text">'+ obrigado_text +'</div><a href="' + pag_volta + '"><button class="button1_red button1_text_red" type="button">Voltar para: ' + pag_volta_nome + '</button></a></div></div>';

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// PAGINA DOAÇÃO
servidor.get("/doacao", logging, function (req, res) {


    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/doacao.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Doação | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/doacao_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

        //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }


    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// GUARDAR FORM DOAÇAO
servidor.post("/processa_doacao", logging, function (req, res) {
    var query = '';
    query += 'INSERT INTO doacao (nome, apelido, num_tel, email, quantidade, metodo, data) VALUES ("' + req.body.nome + '", "' + req.body.apelido + '", "' + req.body.num_tel + '", "' + req.body.email + '", "' + req.body.quantidade_donativo + '", "' + req.body.metodo_pagamento + '", "' + ((new Date().toISOString()).replace('T', ' ')).replace('Z', '') + '");';
    console.log(query);

    pool.query(query, function (err, result, fields) {
        if (!err) {
            return res.status(200).redirect('/obrigado?motivo=doacao');
        } else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        };
    });
});

// PAGINA SOBRE NÓS
servidor.get("/sobre_nos", logging, function (req, res) {


    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/sobre_nos.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Sobre Nós | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/sobre_nos_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

        //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }


    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// PAGINA SERVIÇOS
servidor.get("/parceiros", logging, function (req, res) {


    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/servicos.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Serviços | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/servicos_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

        //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }


    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// GUARDAR FORM PARCEIROS
servidor.post("/processa_parceiros", logging, function (req, res) {
    var query = '';
    query += 'INSERT INTO pedidos_servicos (nome, apelido, email, num_tel, nome_empresa, num_tel_empresa, pag_web_empresa, email_empresa, parceiro_afiliado, decricao_empresa) VALUES ("' 
    + req.body.nome + '", "' 
    + req.body.apelido + '", "' 
    + req.body.email + '", "' 
    + req.body.num_tel + '", "' 
    + req.body.nome_empresa + '", "' 
    + req.body.num_tel_empresa + '", "' 
    + req.body.pag_web_empresa + '", "' 
    + req.body.email_empresa + '", "' 
    + req.body.tipo_de_servico + '", "' 
    + req.body.descricao_empresa + '");';
    console.log(query);

    pool.query(query, function (err, result, fields) {
        if (!err) {
            return res.status(200).redirect('/obrigado?motivo=pedido_servico');
        } else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        };
    });
});

// PAGINA EVENTOS
servidor.get("/eventos", logging, function (req, res) {


    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/eventos.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/eventos_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

        //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    //HTML Content
    html += content;

    var query = '';
    query += 'SELECT cartaz_img, nome, descricao, localizacao, voluntariar, data FROM evento WHERE data >= "' + new Date().toISOString() + '" ORDER BY data ASC;';

    pool.query(query, function (err, result, fields) {
        if (!err) {
            if (result && result.length > 0) {
                for (var i=0; i < result.length; i++){
                    if (i/2 == Math.floor(i/2)){
                        html += '<div class="event_cards_lines flex">';
                        html += '<div class="event_card flex"><img alt="CARTAZ" src="/images/eventos/'+ result[i].cartaz_img +'">';
                        html += '<div class="info_event_card flex flex_collum"><div class="descricao_event">' + result[i].descricao + '</div>';
                        html += '<div class="static_info flex flex_collum"><div class="localizacao_event flex"><img alt="icon" src="images/icons/Localização.png"><div class="localizacao">' + result[i].localizacao + '</div></div>';
                        if (result[i].voluntariar == 1){
                            html += '<a href="/voluntariado"><div class="vagas_event_alerta flex"><img alt="icon" src="images/icons/Alerta.png"><div class="vagas">Vagas abertas para voluntariado</div></div></a>';
                        };
                        html += '</div></div></div>';
                    }else{
                        html += '<div class="event_card flex"><img alt="CARTAZ" src="/images/eventos/'+ result[i].cartaz_img +'">';
                        html += '<div class="info_event_card flex flex_collum"><div class="descricao_event">' + result[i].descricao + '</div>';
                        html += '<div class="static_info flex flex_collum"><div class="localizacao_event flex"><img alt="icon" src="images/icons/Localização.png"><div class="localizacao">' + result[i].localizacao + '</div></div>';
                        if (result[i].voluntariar == 1){
                            html += '<a href="/voluntariado"><div class="vagas_event_alerta flex"><img alt="icon" src="images/icons/Alerta.png"><div class="vagas">Vagas abertas para voluntariado</div></div></a>';
                        };
                        html += '</div></div></div>';
                        html += '</div>';
                    };
                }
            }else {
                console.log('Não foi possível obter resultados')
            };
        }
        else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        }
    html += '</div></div></div>';
    html += footer;
    html += '</body>\n</html>';
    return res.send(html);
    });
});

// PAGINA LOJA
servidor.get("/loja", logging, function (req, res) {


    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/loja.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Loja | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/loja_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

        //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }


    //HTML Content
    html += content;

    var query ='';
    query += 'SELECT idProduto, nome, descricao, detalhes, categoria, preco, MAX(stock) as max_stock FROM produto INNER JOIN produto_tamanhoecor USING (idProduto) GROUP BY idProduto;';

    pool.query(query, function (err, result, fields) {
        if (!err) {
            if (result && result.length > 0) {
                html += '\n            <div class="loja_cards flex flex_collum">';
                html += '\n                <div class="loja_cards_line flex">';
                var produtos_na_linha = 0;
                for (const produto of result) {
                    //console.log(produto)
                    if (produtos_na_linha == 3){
                        html += '\n                </div>';
                        html += '\n                <div class="loja_cards_line flex">';
                        
                        produtos_na_linha = 0;
                    };
                    html += '\n                     <div class="item_loja_card flex flex_center flex_collum">';
                    html += '\n                        <img class="item_loja_img" alt="imagem de produto - Tote Bag" src="/images/produtos/' + produto.idProduto + '.jpg">';
                    html += '\n                        <div class="item_loja flex flex_collum">';
                    html += '\n                            <h1 class="nome_item">' + produto.nome + '</h1>';
                    if (produto.max_stock != 0) {
                        html += '\n                            <div class="preco flex flex_center">';
                        html += '\n                                <div class="preco_text">Preço:</div>';
                        html += '\n                                <div class="preco_unitario">' + produto.preco + ',00€</div>';
                        html += '\n                            </div>';
                    };
                    html += '\n                            <a href="/loja/produto?id=' + produto.idProduto + '"><div class="addicionar_carrinho">Ver Produto</div></a>';
                    html += '\n                            <div class="disponibilidade flex flex_center">';
                    if (produto.max_stock == 0) {
                        html += '\n                                <div class="disponibilidade_circle red"></div>';
                        html += '\n                                <div class="disponibilidade_text">Indisponível</div>';
                    } else {
                        html += '\n                                <div class="disponibilidade_circle"></div>';
                        html += '\n                                <div class="disponibilidade_text">Disponível</div>';
                    }
                    html += '\n                            </div>';
                    html += '\n                        </div>';
                    html += '\n                    </div>';
                    produtos_na_linha += 1;
                };
                html += '\n                </div>';

                html += '\n            </div>';
                html += '\n        </div>';
                html += '\n    </div>';
                html += '\n</div>';
            }else {
                console.log('Não foi possível obter resultados')
            };
        }
        else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        }
        html += footer;
        html += '</body>\n</html>';
        res.send(html);
    });
});

// PAGINA PRODUTO LOJA
servidor.get("/loja/produto", logging, function (req, res) {
    if (req.session.carrinho) {
        console.log(req.session.carrinho);
    }

    // Tentar abrir ficheiro
    try {
        var navbar = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Produto | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/produto_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="/images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="/images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }
    
    var query ='';
    query += 'SELECT idProduto, nome, descricao, detalhes, preco FROM produto WHERE idProduto = ' + req.query.id + ';';
    query += 'SELECT idProduto_final, idCores, idTamanhos, stock, Cor, tamanho FROM produto_tamanhoecor INNER JOIN cores USING (idCores) INNER JOIN tamanhos USING (idTamanhos) WHERE idProduto = ' + req.query.id + ';';
    query += 'SELECT max(stock) as max_stock FROM produto_tamanhoecor INNER JOIN cores USING (idCores) INNER JOIN tamanhos USING (idTamanhos) WHERE idProduto = ' + req.query.id + ';';
    console.log(query);
    
    pool.query(query, function (err, result, fields) {
        if (!err) {
            if (result && result.length > 0) {
                //console.log(result[0]);
                //console.log(result[1]);

                dict_cores = {};
                dict_tamanhos = {};

                for (const produto_final of result[1]) {
                    if (dict_cores.hasOwnProperty(produto_final.idCores) == false) {
                        dict_cores[produto_final.idCores] = produto_final.Cor;
                    } else {
                        //console.log(produto_final.idProduto_final + ' has ' + produto_final.Cor);
                    };
                    if (dict_tamanhos.hasOwnProperty(produto_final.idTamanhos) == false) {
                        dict_tamanhos[produto_final.idTamanhos] = produto_final.tamanho;
                    } else {
                        //console.log(produto_final.idProduto_final + ' has ' + produto_final.tamanho);
                    };
                };
                //console.log(dict_cores);
                //console.log(dict_tamanhos);
                html += '\n <script src="/../js/adicionar_produto_carrinho.js"></script>';
                html += '\n <div class="flex flex_collum flex_center wrapper loja_gap">';
                html += '\n    <div class="flex flex_center card_produto">';
                html += '\n        <img class="produto_img" alt="imagem de produto - Ultrafood" src="/images/produtos/' + result[0][0].idProduto + '.jpg">';
                html += '\n        <form id="form_produto" method="get" action="adicionar_carrinho" class="fill_available produto_info flex flex_collum space_between">';
                html += '\n            <div class="title2">' + result[0][0].nome + '</div>';
                html += '\n            <div class="text2_left">' + result[0][0].descricao + '</div>';
                console.log(result[2])
                
                if (result[2][0].max_stock != 0){
                    html += '\n             <div class="cores gap5">';
                    html += '\n                <div class="title4"> Cores </div>';
                    html += '\n                <div class="selecao_cores flex">';
        
                    // PREENCHIMENTO DE INPUTS PARA AS CORES DISPONÍVEIS
                    for (const cor in dict_cores) {
                        var class_color = '';
                        //console.log(cor, dict_cores[cor])
                        if (cor == 1) {
                            class_color = 'red';
                        } else if (cor == 2) {
                            class_color = 'yellow';
                        } else if (cor == 3) {
                            class_color = 'white';
                        }
                        html += '\n                    <input onclick="(() => cor_selecionada=' + cor + ')()" id="' + dict_cores[cor] + '" type="radio" name="cor" value=' + cor + '><label for="' + dict_cores[cor] + '"><span class="' + class_color + '"></span></label>';
                    };
                    html += '\n                </div>';
                    html += '\n            </div>';
                    html += '\n            <div class="tamanhos flex gap5">';
    
                    // PREENCHIMENTO DE INPUTS PARA OS TAMANHOS DISPONÍVEIS
                    for (const tamanho in dict_tamanhos) {
                        var class_color = '';
                        //console.log(tamanho, dict_tamanhos[tamanho])
                        html += '\n                <input onclick="(() => tamanho_selecionado=' + tamanho + ')()" type="radio" id="' + dict_tamanhos[tamanho] + '" name="tamanho" value=' + tamanho + '><label for="' + dict_tamanhos[tamanho] + '">' + dict_tamanhos[tamanho] + '</label>';
                    };
                    html += '\n            </div>';
                    html += '\n            <div class="preco flex">';
                    html += '\n                <div class="title4">Preço:</div>';
                    html += '\n                <div class="text2_left">' + result[0][0].preco + '€</div>';
                    html += '\n            </div>';

                    html += '\n            <div class="flex flex_collum gap5">';
                    html += '\n                <div class="disponibilidade flex">';
                    html += '\n                    <div class="disponibilidade_circle"></div>';
                    html += '\n                    <div  class="text2_left">Disponível Online</div>';
                    html += '\n                </div>';
                    html += '\n            </div>';
                    html += '\n            <div class="addicionar_carrinho pointer" onclick="adicionar_produto_carrinho(' + "'" + result[0][0].idProduto + "'" + ', cor_selecionada , tamanho_selecionado )">Adicionar ao carrinho</div>';
                }else{
                    html += '\n            <div class="preco flex">';
                    html += '\n                <div class="title4">Preço:</div>';
                    html += '\n                <div class="text2_left"></div>';
                    html += '\n            </div>';

                    html += '\n            <div class="flex flex_collum gap5">';
                    html += '\n                <div class="disponibilidade flex">';
                    html += '\n                    <div class="disponibilidade_circle red"></div>';
                    html += '\n                    <div  class="text2_left">Indisponível Online</div>';
                    html += '\n                </div>';
                    html += '\n            </div>';
                    html += '\n            <div class="addicionar_carrinho_grey">Adicionar ao carrinho</div>';
                };

                html += '\n        </form>';
                html += '\n    </div>';
                html += '\n    <div class="detalhes flex flex_collum flex_center">';
                html += '\n        <div class="title2">DETALHES</div>';
                html += '\n        <div class="separador"></div>';
                html += '\n        <div class="detalhes_info flex flex_collum flex_center">';

                // PREENCHIMENTO DE DETALHES DO PRODUTO
                for (const detalhe in result[0][0].detalhes) {
                    html += '\n            <p>' + result[0][0].detalhes[detalhe] + '</p>';
                };
                html += '\n        </div>';
                html += '\n        <div class="separador"></div>';
                html += '\n    </div>';
                html += '\n</div>';

                html += footer;
                html += '</body>\n</html>';
                return res.send(html);
            } else {
                console.log('Não foi possível obter resultados')
                return res.status(500).redirect('/ProdutoNaoEncontrado');
            };
        } else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        };
    });
});

// PROCESSAR ADIÇÃO AO CARRINHO
servidor.get("/loja/adicionar_carrinho", logging, function (req, res) {
    if (req.query) {
        console.log(req.query);
        
        var query = '';
        query += 'SELECT idProduto_final, idProduto, idCores, idTamanhos, stock, nome, preco, Cor, tamanho FROM produto_tamanhoecor INNER JOIN produto USING (idProduto) INNER JOIN cores USING (idCores) INNER JOIN tamanhos USING (idTamanhos) WHERE idProduto = ' + req.query.id + ' AND idCores = ' + req.query.cor + ' AND idTamanhos = ' + req.query.tamanho + ';';

        pool.query(query, function (err, result, fields) {
            if (!err) {
                if (result && result.length > 0) {
                    console.log(result[0].idProduto_final);
                    if (!req.session.carrinho) {
                        req.session.carrinho = new Object();
                    }
                    if (req.session.carrinho[result[0].idProduto_final]) {
                        req.session.carrinho[result[0].idProduto_final] += 1;
                    }
                    else {
                        req.session.carrinho[result[0].idProduto_final] = 1;
                    }
                    console.log("Adicionado com sucesso ao carrinho\n");
                    return res.status(200).redirect('back');
                } else {
                console.log('Não foi possível obter resultados')
                return res.status(500).redirect('/ProdutoNaoEncontrado');
                };
            } else {
                console.log(err);
                console.log('Erro ao executar pedido ao servidor');
                return res.status(500).redirect('/InternalError');
            };
        });
    } else {
        console.log('Sem artigos selecionados');
        return res.status(500).redirect('/InternalError');
    };
});

// PROCESSAR REMOÇÃO DO CARRINHO
servidor.get("/loja/remover_carrinho", logging, function (req, res) {
    if (req.query) {
        console.log(req.query);
        if (req.session.carrinho[req.query.id] > 1) {
            req.session.carrinho[req.query.id] -= 1;
        }
        else {
            req.session.carrinho[req.query.id] = null;
        }
        console.log("Removido com sucesso do carrinho\n");
        return res.status(200).redirect('/loja/carrinho');

    } else {
        console.log('Sem artigos para remover');
        return res.status(500).redirect('/InternalError');
    };
});

// CARRINHO
servidor.get("/loja/carrinho", logging, function (req, res) {

    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/carrinho_produtos.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Carrinho | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/carrinho_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/produto_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="/images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="/images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    //HTML Content
    html += content;

    if (req.session.carrinho) {
        // filtrar apenas os álbuns que, no array carrinho, têm uma quantidade associada
        var listaCarrinho = new Array();
        Object.entries(req.session.carrinho).forEach(([key, value]) => {
            console.log(key, value);
            if (value != null){
                listaCarrinho.push(parseInt(key));
            };
        });
        
        sql_string_where_clause = '(';
        sql_string_where_clause += listaCarrinho.toString();
        sql_string_where_clause += ')';
        
        
        console.log(listaCarrinho, sql_string_where_clause);
        if (sql_string_where_clause != '()'){

            var query ='';
            query += 'SELECT idProduto_final, idProduto, idCores, idTamanhos, stock, nome, preco, Cor, tamanho FROM produto_tamanhoecor INNER JOIN produto USING (idProduto) INNER JOIN cores USING (idCores) INNER JOIN tamanhos USING (idTamanhos) WHERE idProduto_final IN ' 
            + sql_string_where_clause + ';';

            var total_carrinho = 0;
            
            pool.query(query, function (err, result, fields) {
                if (!err) {
                    if (result && result.length > 0) {
                        console.log(result)
                        html += '<form method=get action="/loja/carrinho/informacao" class="flex flex_center flex_collum gap75 produtos">';
                        html += '<div class="flex flex_center flex_collum gap25 listagem_produtos">';
                        result.forEach(produto => {
                            html += '\n            <div class="flex flex_center card_produto">';
                            html += '\n                <img class="produto_img" alt="imagem de produto - Ultrafood" src="/images/produtos/' + produto.idProduto + '.jpg">';
                            html += '\n                <div class="produto_info flex flex_center">';
                            html += '\n                    <div class="flex flex_collum space_between info">';
                            html += '\n                        <div class="title2 color_red">' + produto.nome + '</div>';
                            html += '\n                        <div class="flex gap10">';
                            if (produto.idCores == 1) {
                                var class_color = 'red';
                            } else if (produto.idCores == 2) {
                                var class_color = 'yellow';
                            } else if (produto.idCores == 3) {
                                var class_color = 'white';
                            }
                            html += '\n                            <div class="title4"> Cor </div>';
                            html += '\n                            <div class="cor_selecionada '+ class_color +'"></div>';
                            html += '\n                        </div>';
                            html += '\n                        <div class="flex gap10">';
                            html += '\n                            <div class="title4"> Tamanho </div>';
                            html += '\n                            <div class="tamanho_selecionado">' + produto.tamanho + '</div>';
                            html += '\n                        </div>';
                            html += '\n                        <div class="flex gap10">';
                            html += '\n                            <div class="title4">Preço:</div>';
                            html += '\n                            <div class="text2_left">' + produto.preco + ',00€</div>';
                            html += '\n                        </div>';
                            html += '\n                        <div class="flex gap10">';
                            html += '\n                            <div class="title4">Quantidade:</div>';
                            html += '\n                            <div class="text2_left">' + req.session.carrinho[produto.idProduto_final] + '</div>';
                            html += '\n                        </div>';
                            html += '\n                        <div class="flex flex_collum gap5">';
                            if (produto.stock >= req.session.carrinho[produto.idProduto_final]) {
                                html += '\n                            <div class="disponibilidade flex">';
                                html += '\n                                <div class="disponibilidade_circle"></div>';
                                html += '\n                                <div class="text2_left">Disponível Online</div>';
                                html += '\n                            </div>';
                            } else{
                                html += '\n                            <div class="disponibilidade flex">';
                                html += '\n                                <div class="indisponibilidade_circle"></div>';
                                html += '\n                                <div class="text2_left">Indisponível Online</div>';
                                html += '\n                            </div>';
                            };
                            html += '\n                        </div>';
                            html += '\n                    </div>';
                            html += '\n                    <img onclick="(() => window.location=' + "'" + '/loja/remover_carrinho?id=' + produto.idProduto_final + "'" + ')()" class="remover_produto pointer" src="/../images/icons/fechar.svg" alt="fechar">';
                            html += '\n                </div>';
                            html += '\n            </div>';
                            total_carrinho += produto.preco * req.session.carrinho[produto.idProduto_final];
                        });
                        
                        html += '</div>';
                        
                        html += '\n        <div class="flex card_produto">';
                        html += '\n            <div class="flex gap10 doacao_card">';
                        html += '\n                <div class="flex flex_collum gap10 doacao_info">';
                        html += '\n                    <div class="title2 color_red">Doação opcional</div>';
                        html += '\n                    <div class="text2_left">O donativo é uma ajuda direta a todas as associações envolvidas e o valor é totalmente de eleição própria.</div>';
                        html += '\n                    <div class="flex gap10 escolha_doacao">';
                        html += '\n                        <div class="title4">Quantidade </div>';
                        html += '\n                        <input type="radio" id="option-zero" value=0 name="quantidade_donate" checked><label for="option-zero">0€</label>';
                        html += '\n                        <input type="radio" id="option-one" value=1 name="quantidade_donate"><label for="option-one">1€</label>';
                        html += '\n                        <input type="radio" id="option-two" value=5 name="quantidade_donate"><label for="option-two">5€</label>';
                        html += '\n                        <input type="radio" id="option-three" value=10 name="quantidade_donate"><label for="option-three">10€</label>';
                        html += '\n                        <input type="radio" id="option-for" value=25 name="quantidade_donate"><label for="option-for">25€</label>';
                        html += '\n                    </div>';
                        html += '\n                </div>';
                        html += '\n            </div>';
                        html += '\n        </div>';
                        html += '\n        <div class="flex flex_collum preco_total">';
                        html += '\n            <div class="separador"></div>';
                        html += '\n            <div class="flex space_between total">';
                        html += '\n                <div>TOTAL</div>';
                        html += '\n                <div id=total_carrinho_HTML>' + total_carrinho + ',00€</div>';
                        html += '\n                <input style="display: none;" id="total_carrinho_input" name="total_carrinho" value=' + total_carrinho + '>';
                        html += '\n            </div>';
                        html += '\n        </div>';
                        html += '\n        <div class="botoes flex flex_center space_between">';
                        html += '\n            <a>';
                        html += '\n                <div class="button4_grey button4_text_grey" onclick="javascript:history.back()">';
                        html += '\n                    Voltar';
                        html += '\n                </div>';
                        html += '\n            </a>';
                        //href="/loja/carrinho/informacao"
                        html += '\n            <a>';
                        html += '\n                <button type=submit class="button4_red button4_text_red">';
                        html += '\n                    Continuar';
                        html += '\n                </button>';
                        html += '\n            </a>';
                        html += '\n        </div>';
                        
                        html += '\n    </form>\n   </div>\n</div>';
                        html += footer_loja;
                        html += '\n</body>\n</html>';
                        return res.send(html);
                    }else {
                        console.log('Não foi possível obter resultados')
                        return res.status(500).redirect('/ProdutoNaoEncontrado');
                    };
                } else {
                    console.log(err);
                    console.log('Erro ao executar pedido ao servidor');
                    return res.status(500).redirect('/InternalError');
                };
            });
        }else{
            html += '<div class="text_left"> O seu carrinho encontra-se vazio</div>';
            html += '<div class="text_left"> Visite a nossa loja e veja todos os produtos disponíveis.</div>';
            html += '</div></div>';
            html += footer_loja;
            html += '\n</body>\n</html>';
            return res.send(html);

        };
    } else {
        html += '<div class="text_left"> O seu carrinho encontra-se vazio</div>';
        html += '<div class="text_left"> Visite a nossa loja e veja todos os produtos disponíveis.</div>';
        html += '</div></div>';
        html += footer_loja;
        html += '\n</body>\n</html>';
        return res.send(html);
    };
});

// CARRINHO
servidor.get("/loja/carrinho/informacao", logging, function (req, res) {
    console.log(req.query);
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/carrinho_informação.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/carrinho_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/produto_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="/images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="/images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    //HTML Content
    html += content;

    if (req.session.carrinho) {
        if (req.session.idCliente){
            var query ='';
            query += 'SELECT nome, email, morada, codigo_postal, distrito, num_tel FROM cliente WHERE idCliente = ' + req.session.idCliente + ';';
            
            pool.query(query, function (err, result, fields) {
                if (!err) {
                    if (result && result.length > 0) {
                        html += '        <div class="flex flex_collum preco_total">';
                        html += '            <div class="separador"></div>';
                        html += '            <div class="flex space_between total">';
                        html += '                <div>TOTAL</div>';
                        html += '                <div>' + (parseInt(req.query.total_carrinho) + parseInt(req.query.quantidade_donate)).toString() + ',00€</div>';
                        html += '            </div>';
                        html += '        </div>';
                        html += '        <div class="botoes flex flex_center space_between">';
                        html += '            <a>';
                        html += '                <div class="button4_grey button4_text_grey" onclick="javascript:history.back()">';
                        html += '                    Voltar';
                        html += '                </div>';
                        html += '            </a>';
                        html += '            <a href="/loja/carrinho/finalizacao">';
                        html += '                <button type=submit class="button4_red button4_text_red">';
                        html += '                    Continuar';
                        html += '                </button>';
                        html += '            </a>';
                        html += '        </div>';
                        html += '    </form>';
                        html += '</div>';

                        html += '<script>';

                        html += 'document.getElementById("quantidade_doacao_input").value = "' + req.query.quantidade_donate + '";';
                        html += 'document.getElementById("nome").value = "' + result[0].nome + '";';
                        html += 'document.getElementById("email").value = "' + result[0].email + '";';
                        html += 'document.getElementById("num_tel").value = "' + result[0].num_tel + '";';
                        html += 'document.getElementById("endereco").value = "' + result[0].morada + '";';
                        html += 'document.getElementById("codigo_postal_1").value = "' + (result[0].codigo_postal).split('-')[0] + '";';
                        html += 'document.getElementById("codigo_postal_2").value = "' + (result[0].codigo_postal).split('-')[1] + '";';
                        html += 'document.getElementById("cidade").value = "' + result[0].distrito + '";';

                        html += '</script>';

                        html += footer_loja;
                        html += '\n</body>\n</html>';
                        return res.send(html);
                    }else {
                        console.log('Não foi possível obter resultados')
                        return res.status(500).redirect('/ProdutoNaoEncontrado');
                    };
                } else {
                    console.log(err);
                    console.log('Erro ao executar pedido ao servidor');
                    return res.status(500).redirect('/InternalError');
                };
            });
        }else{
            html += '        <div class="flex flex_collum preco_total">';
            html += '            <div class="separador"></div>';
            html += '            <div class="flex space_between total">';
            html += '                <div>TOTAL</div>';
            html += '                <div>' + (parseInt(req.query.total_carrinho) + parseInt(req.query.quantidade_donate)).toString() + ',00€</div>';
            html += '            </div>';
            html += '        </div>';
            html += '        <div class="botoes flex flex_center space_between">';
            html += '            <a>';
            html += '                <div class="button4_grey button4_text_grey" onclick="javascript:history.back()">';
            html += '                    Voltar';
            html += '                </div>';
            html += '            </a>';
            html += '            <a href="/loja/carrinho/finalizacao">';
            html += '                <button type=submit class="button4_red button4_text_red">';
            html += '                    Continuar';
            html += '                </button>';
            html += '            </a>';
            html += '        </div>';
            html += '    </form>';
            html += '</div>';

            html += '<script>';

            html += 'document.getElementById("quantidade_doacao_input").value = "' + req.query.quantidade_donate + '";';

            html += '</script>';

            html += footer_loja;
            html += '\n</body>\n</html>';
            return res.send(html);
        };
    } else {
        return res.redirect("/loja/carrinho");
    };
});

// CARRINHO
servidor.get("/loja/carrinho/finalizacao", logging, function (req, res) {
    console.log(req.query);

    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/carrinho_finalização.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/carrinho_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/produto_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="/images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="/images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    //HTML Content
    html += content;

    if (req.session.carrinho) {
        // filtrar apenas os álbuns que, no array carrinho, têm uma quantidade associada
        var listaCarrinho = new Array();
        Object.entries(req.session.carrinho).forEach(([key, value]) => {
            console.log(key, value);
            if (value != null){
                listaCarrinho.push(parseInt(key));
            };
        });
        
        sql_string_where_clause = '(';
        sql_string_where_clause += listaCarrinho.toString();
        sql_string_where_clause += ')';
        
        
        console.log(listaCarrinho, sql_string_where_clause);
        if (sql_string_where_clause != '()'){

            var query ='';
            query += 'SELECT idProduto_final, idProduto, idCores, idTamanhos, stock, nome, preco, Cor, tamanho FROM produto_tamanhoecor INNER JOIN produto USING (idProduto) INNER JOIN cores USING (idCores) INNER JOIN tamanhos USING (idTamanhos) WHERE idProduto_final IN ' 
            + sql_string_where_clause + ';';

            var total_carrinho = 0;
            
            pool.query(query, function (err, result, fields) {
                if (!err) {
                    if (result && result.length > 0) {
                        console.log(result)
                        html += '    <form method="post" action="/loja/carrinho/finalizacao/submissao" class="flex flex_center flex_collum gap75 produtos">';
                        html += '<div class="flex flex_center flex_collum gap25 listagem_produtos">';
                        result.forEach(produto => {
                            html += '\n            <div class="flex flex_center card_produto">';
                            html += '\n                <img class="produto_img" alt="imagem de produto - Ultrafood" src="/images/produtos/' + produto.idProduto + '.jpg">';
                            html += '\n                <div class="produto_info flex flex_center">';
                            html += '\n                    <div class="flex flex_collum space_between info">';
                            html += '\n                        <div class="title2 color_red">' + produto.nome + '</div>';
                            html += '\n                        <div class="flex gap10">';
                            if (produto.idCores == 1) {
                                var class_color = 'red';
                            } else if (produto.idCores == 2) {
                                var class_color = 'yellow';
                            } else if (produto.idCores == 3) {
                                var class_color = 'white';
                            }
                            html += '\n                            <div class="title4"> Cor </div>';
                            html += '\n                            <div class="cor_selecionada '+ class_color +'"></div>';
                            html += '\n                        </div>';
                            html += '\n                        <div class="flex gap10">';
                            html += '\n                            <div class="title4"> Tamanho </div>';
                            html += '\n                            <div class="tamanho_selecionado">' + produto.tamanho + '</div>';
                            html += '\n                        </div>';
                            html += '\n                        <div class="flex gap10">';
                            html += '\n                            <div class="title4">Preço:</div>';
                            html += '\n                            <div class="text2_left">' + produto.preco + ',00€</div>';
                            html += '\n                        </div>';
                            html += '\n                        <div class="flex gap10">';
                            html += '\n                            <div class="title4">Quantidade:</div>';
                            html += '\n                            <div class="text2_left">' + req.session.carrinho[produto.idProduto_final] + '</div>';
                            html += '\n                        </div>';
                            html += '\n                        <div class="flex flex_collum gap5">';
                            if (produto.stock >= req.session.carrinho[produto.idProduto_final]) {
                                html += '\n                            <div class="disponibilidade flex">';
                                html += '\n                                <div class="disponibilidade_circle"></div>';
                                html += '\n                                <div class="text2_left">Disponível Online</div>';
                                html += '\n                            </div>';
                            } else{
                                html += '\n                            <div class="disponibilidade flex">';
                                html += '\n                                <div class="indisponibilidade_circle"></div>';
                                html += '\n                                <div class="text2_left">Indisponível Online</div>';
                                html += '\n                            </div>';
                            };
                            html += '\n                        </div>';
                            html += '\n                    </div>';
                            html += '\n                </div>';
                            html += '\n            </div>';
                            total_carrinho += produto.preco * req.session.carrinho[produto.idProduto_final];
                        });
                        total_carrinho += parseInt(req.query.quantidade_doacao);
                        
                        html += '</div>';

                        // INPUTS INVISIVEIS
                        html += '<input value="' + req.query.quantidade_doacao + '" name="quantidade_doacao" style="display: none;">';
                        html += '<input value="' + req.query.nome + '" name="nome" style="display: none;">';
                        html += '<input value="' + req.query.email + '" name="email" style="display: none;">';
                        html += '<input value="' + req.query.num_tel + '" name="num_tel" style="display: none;">';
                        html += '<input value="' + req.query.endereco + '" name="endereco" style="display: none;">';
                        html += '<input value="' + req.query.codigo_postal_1 + '" name="codigo_postal_1" style="display: none;">';
                        html += '<input value="' + req.query.codigo_postal_2 + '" name="codigo_postal_2" style="display: none;">';
                        html += '<input value="' + req.query.cidade + '" name="cidade" style="display: none;">';
                        html += '<input value="' + req.query.metodo + '" name="metodo" style="display: none;">';
                        
                        // Donation
                        html += '\n        <div class="flex card_produto">';
                        html += '\n            <div class="flex gap10 doacao_card">';
                        html += '\n                <div class="flex flex_collum gap10 doacao_info">';
                        html += '\n                    <div class="title2 color_red">Doação opcional</div>';
                        html += '\n                    <div class="text2_left">O donativo é uma ajuda direta a todas as associações envolvidas e o valor é totalmente de eleição própria.</div>';
                        html += '\n                    <div class="flex gap10 escolha_doacao">';
                        html += '\n                        <div class="title4">Quantidade </div>';
                        html += '\n                        <div class="text2_left">' + req.query.quantidade_doacao + ',00€</div>';
                        html += '\n                    </div>';
                        html += '\n                </div>';
                        html += '\n            </div>';
                        html += '\n        </div>';
                        
                        // INFO REMETENTE
                        html += '\n        <div class="revisao_morada">';
                        html += '\n            <div class="flex flex_collum gap10">';
                        html += '\n                <div class="title2 color_red">Informações de Envio</div>';
                        html += '\n                <div id="revisao_morada_nome" class="text2_left">';
                        html += '\n                    ' + req.query.nome;
                        html += '\n                </div>';
                        html += '\n                <div id="revisao_morada_numero" class="text2_left">';
                        html += '\n                    ' + req.query.num_tel;
                        html += '\n                </div>';
                        html += '\n                <div id="revisao_morada_morada" class="text2_left">';
                        html += '\n                    ' + req.query.endereco;
                        html += '\n                </div>';
                        html += '\n                <div id="revisao_morada_cod_postal_cidade" class="text2_left">';
                        html += '\n                    ' + req.query.codigo_postal_1 + '-' + req.query.codigo_postal_2 + ' ' + req.query.cidade;
                        html += '\n                </div>';
                        html += '\n                <div id="revisao_morada_metodo" class="text2_left">';
                        html += '\n                    Método: ' + req.query.metodo ;
                        html += '\n                </div>';
                        html += '\n            </div>';
                        html += '\n        </div>';

                        // TOTAL
                        html += '\n        <div class="flex flex_collum preco_total">';
                        html += '\n            <div class="separador"></div>';
                        html += '\n            <div class="flex space_between total">';
                        html += '\n                <div>TOTAL</div>';
                        html += '\n                <div id=total_carrinho_HTML>' + total_carrinho + ',00€</div>';
                        html += '\n                <input style="display: none;" id="total_carrinho_input" name="total_carrinho" value=' + total_carrinho + '>';
                        html += '\n            </div>';
                        html += '\n        </div>';

                        html += '\n        <div class="botoes flex flex_center space_between">';
                        html += '\n            <a>';
                        html += '\n                <div class="button4_grey button4_text_grey" onclick="javascript:history.back()">';
                        html += '\n                    Voltar';
                        html += '\n                </div>';
                        html += '\n            </a>';
                        html += '\n            <a>';
                        html += '\n                <button type=submit class="button4_red button4_text_red">';
                        html += '\n                    Continuar';
                        html += '\n                </button>';
                        html += '\n            </a>';
                        html += '\n        </div>';
                        
                        html += '\n    </form>\n   </div>\n</div>';
                        html += footer_loja;
                        html += '\n</body>\n</html>';
                        return res.send(html);
                    }else {
                        console.log('Não foi possível obter resultados')
                        return res.status(500).redirect('/ProdutoNaoEncontrado');
                    };
                } else {
                    console.log(err);
                    console.log('Erro ao executar pedido ao servidor');
                    return res.status(500).redirect('/InternalError');
                };
            });
        }else{
            html += '<div class="text_left"> O seu carrinho encontra-se vazio</div>';
            html += '<div class="text_left"> Visite a nossa loja e veja todos os produtos disponíveis.</div>';
            html += '</div></div>';
            html += footer_loja;
            html += '\n</body>\n</html>';
            return res.send(html);

        };
    } else {
        html += '<div class="text_left"> O seu carrinho encontra-se vazio</div>';
        html += '<div class="text_left"> Visite a nossa loja e veja todos os produtos disponíveis.</div>';
        html += '</div></div>';
        html += footer_loja;
        html += '\n</body>\n</html>';
        return res.send(html);
    };
});

//INSERT ENCOMENDA
servidor.post("/loja/carrinho/finalizacao/submissao", logging, function (req, res) {
    console.log(req.body);
    var query ='';
    if (req.session.idCliente) {
        query += 'INSERT INTO encomenda (data, morada, codigo_postal, cidade, num_tel, idCliente) VALUES ("' 
        + ((new Date().toISOString()).replace('T', ' ')).replace('Z', '') + '","' 
        + req.body.endereco + '","' 
        + req.body.codigo_postal_1 + req.body.codigo_postal_2 + '","' 
        + req.body.cidade + '","' 
        + req.body.num_tel + '","' 
        + req.session.idCliente + '");';
    } else{
        query += 'INSERT INTO encomenda (data, morada, codigo_postal, cidade, num_tel, idCliente) VALUES ("' 
        + ((new Date().toISOString()).replace('T', ' ')).replace('Z', '') + '","' 
        + req.body.endereco + '","' 
        + req.body.codigo_postal_1 + req.body.codigo_postal_2 + '","' 
        + req.body.cidade + '","' 
        + req.body.num_tel + '", null );';
    };

    if (req.body.quantidade_doacao != '0') {
        if ((req.body.nome).split(' ')[1]){
            query += 'INSERT INTO doacao (nome, apelido, num_tel, email, quantidade, metodo, data) VALUES ("' + req.body.nome + '", "' + req.body.apelido + '", "' + req.body.num_tel + '", "' + req.body.email + '", "' + req.body.quantidade_doacao + '", "' + req.body.metodo + '", "' + ((new Date().toISOString()).replace('T', ' ')).replace('Z', '') + '");';
        } else{
            query += 'INSERT INTO doacao (nome, num_tel, email, quantidade, metodo, data) VALUES ("' + req.body.nome + '", "' + req.body.num_tel + '", "' + req.body.email + '", "' + req.body.quantidade_doacao + '", "' + req.body.metodo + '", "' + ((new Date().toISOString()).replace('T', ' ')).replace('Z', '') + '");';
        };
    }

    console.log(query);
    pool.query(query, function (err, result, fields) {
        if (!err) {
            console.log('Nova encomenda!');
            return res.status(200).redirect('/loja/carrinho/finalizacao/ultima_encoenda')
        } else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        };
    });
});

//SELECT ID ENCOMENDA
servidor.get("/loja/carrinho/finalizacao/ultima_encoenda", logging, function (req, res) {
    var query ='';
    query += 'SELECT idEncomenda FROM encomenda ORDER BY idEncomenda DESC;';
    pool.query(query, function (err, result, fields) {
        if (!err) {
            console.log('Ultima encomenda!');
            return res.status(200).redirect('submissao_produtos?encomenda=' + result[0].idEncomenda)
        } else {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        };
    });
});

//INSERT PRODUTO_ENCOMENDA
servidor.get("/loja/carrinho/finalizacao/submissao_produtos", logging, function (req, res) {
    if ( req.query){
        var query ='';
    
        Object.entries(req.session.carrinho).forEach(([key, value]) => {
            if (value != null){
                query += 'INSERT INTO encomenda_produto (idEncomenda, idProduto_final, quantidade) VALUES ("' + req.query.encomenda + '", "' + parseInt(key) + '", "' + parseInt(value) + '");';
            };
        });
    
        pool.query(query, function (err, result, fields) {
            if (!err) {
                console.log('Nova encomenda_produto!');
                return res.status(200).redirect('/obrigado?motivo=encomenda')
            } else {
                console.log(err);
                console.log('Erro ao executar pedido ao servidor');
                return res.status(500).redirect('/InternalError');
            };
        });
    } else{
        console.log('Sem id se encomenda');
        return res.status(500).redirect('/InternalError');
    };
});

// USER ACCOUNT
servidor.get("/user", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/user_info.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar Loja.html', 'utf-8');
        var footer = fs.readFileSync('html/Footer Loja.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.");
        return res.status(500).send('CODE 500 ERROR: '+ error);
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Conta | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>';
        html += '</div></div></header>';

        //HTML Content
        html += content;

        var query ='';
        query += 'SELECT idCliente, nome, email, num_tel, morada, codigo_postal, distrito FROM cliente WHERE idCliente = ' + req.session.idCliente + ';';
        pool.query(query, function (err, result, fields) {
            if (!err) {
                if (result && result.length > 0) {
                    //console.log(result)
                    html += '\n<script>';
                    html += 'document.getElementById("welcome_nome").innerHTML = "Olá ' + result[0].nome + '!";\n';
                    html += 'document.getElementById("profile_pic").src = "images/profile_pic/' + result[0].idCliente + '.jpg";\n';
                    html += 'document.getElementById("nome").value = "' + result[0].nome + '";\n';
                    html += 'document.getElementById("email").value = "' + result[0].email + '";\n';
                    html += 'document.getElementById("num_tel").value = "' + result[0].num_tel + '";\n';
                    if (result[0].morada){
                        html += 'document.getElementById("linha_endereço").value = "' + result[0].morada + '";\n';
                    };
                    if(result[0].codigo_postal){
                        html += 'document.getElementById("cod_postal_1").value = "' + ((result[0].codigo_postal).split('-'))[0] + '";\n';
                        html += 'document.getElementById("cod_postal_2").value = "' + ((result[0].codigo_postal).split('-'))[1] + '";\n';
                    };
                    if(result[0].distrito){
                        html += 'document.getElementById("distrito").value = "' + result[0].distrito + '";\n';
                    };
                    
                    html += '\n</script>\n';
                }else {
                    console.log('Não foi possível obter resultados')
                };
            }
            else {
                console.log(err);
                console.log('Erro ao executar pedido ao servidor');
                return res.status(500).redirect('/InternalError');
            }
            html += footer;
            html += '</body>\n</html>';
            return res.send(html);
        });
    }else{
        return res.status(403).redirect('/login_error');
    };
});

// USER ACCOUNT
servidor.get("/user/history", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/user_history.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/carrinho_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="/images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="/images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

   if (req.session.idCliente){
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>';
        html += '</div></div></header>';

        //HTML Content
        html += content;

        var query ='';
        query += 'SELECT idCliente, nome FROM cliente WHERE idCliente = ' + req.session.idCliente + ';';
        query += 'SELECT idProduto, idEncomenda, data, nome, preco, Cor, tamanho FROM encomenda INNER JOIN encomenda_produto USING (idEncomenda) INNER JOIN produto_tamanhoecor USING (idProduto_final) INNER JOIN produto USING (idProduto) INNER JOIN cores USING (idCores) INNER JOIN tamanhos USING (idTamanhos) WHERE idCliente = ' + req.session.idCliente + ';';
        query += 'SELECT idEncomenda, data FROM encomenda WHERE idCliente = ' + req.session.idCliente + ' ORDER BY data DESC;';
        pool.query(query, function (err, result, fields) {
            if (!err) {
                if (result && result.length > 0) {
                    html += '\n<script>';

                    html += 'document.getElementById("welcome_nome").innerHTML = "Olá ' + result[0][0].nome + '!";\n';
                    html += 'document.getElementById("profile_pic").src = "/../images/profile_pic/' + result[0][0].idCliente + '.jpg";\n';

                    html += '\n</script>\n';

                    var total_encomenda = {};
                    result[2].forEach(encomenda =>{
                        var total = 0;
                        result[1].forEach(produto => {
                            if (produto.idEncomenda == encomenda.idEncomenda) {
                                total += produto.preco;
                            };
                        });
                        total_encomenda[encomenda.idEncomenda] = total;
                    });

                    console.log(total_encomenda)

                    html += '\n<div class="flex flex_center flex_collum gap75 user_historico fill_available">';
                    result[2].forEach(encomenda =>{
                        var total = 0;
                        html += '\n<div class="flex flex_collum flex_center gap25 fill_available">';
                        html += '\n<div class="flex flex_center space_between fill_available">';
                        html += '\n<div class="flex flex_collum gap10">';
                        html += '\n<div>Encomenda nº: ' + encomenda.idEncomenda + '</div>';
                        html += '\n<div>Data da encomenda: ' + (encomenda.data).toLocaleString("pt-PT") + '</div>';
                        html += '\n<div>Total: ' + total_encomenda[encomenda.idEncomenda] + ' €</div>';
                        html += '\n<div class="flex gap10 pointer" onclick="hide_show_produtos('+"'" + encomenda.idEncomenda + "'"+')"><div>Ver detalhes</div><img id="hide_show_produtos_seta_' + encomenda.idEncomenda + '" class="" src="/../images/icons/Seta_detalhes.svg" alt=""></div>';
                        html += '\n</div><div class="button4_red button4_text_red fit_content">Reencomendar</div></div>';
                        html += '\n<div id="encomenda_produtos_' + encomenda.idEncomenda + '" class="flex flex_collum encomenda_produtos fill_available gap10 hidden">';
                        //console.log("Encomenda: ", encomenda);
                        result[1].forEach(produto => {
                            if (produto.idEncomenda == encomenda.idEncomenda) {
                                //console.log("Encomenda: ", produto);
                                html += '\n<div class="flex produto_singular">';
                                html += '\n<img class="produto_img_encomenda" alt="imagem de produto" src="/../images/produtos/' + produto.idProduto + '.jpg">';
                                html += '\n<div style="flex-grow: 1;" class="flex space_between">';
                                html += '\n<div class="flex flex_collum space_between produto_card_encomenda"> ';
                                html += '\n<div class="title3">' + produto.nome + '</div>';
                                html += '\n<div class="flex gap10"><div class="title4"> Cor: </div><div class="tamanho_selecionado">' + produto.Cor + '</div></div>';
                                html += '\n<div class="flex gap10"><div class="title4"> Tamanho: </div><div class="tamanho_selecionado"> ' + produto.tamanho + ' </div></div>';
                                html += '\n<div class="flex gap10"><div class="title4"> Preço: </div><div class="tamanho_selecionado"> ' + produto.preco + ' </div></div></div>';
                                html += '\n<div style="align-items: end;justify-content: center; padding-right:50px;" class="flex flex_collum produto_card_encomenda gap10">';
                                html += '\n<a href="/loja/produto?id=' + produto.idProduto + '"><div class="button5_red button5_text_red fit_content">Ver Produto</div></a>';
                                html += '\n<div class="flex gap10 flex_center">';
                                html += '\n<div class="disponibilidade_circle green"></div>';
                                html += '\n<div class="text2_left"> disponibilidade </div>';
                                html += '\n</div></div></div></div>';
                                
                            };
                        });
                        html += '\n</div></div>';
                        html += '\n<script>var aberto_' + encomenda.idEncomenda + ' = false;</script>'
                    });
                    html += '\n</div></div></div>';
                    html += '\n<script src="/../js/open_show_produtos_encomenda.js"></script>';

                    //html += 'document.getprodutoById("nome").value = "' + result[1][0].nome + '";\n';
                    //html += 'document.getprodutoById("email").value = "' + result[1][0].email + '";\n';
                    //html += 'document.getprodutoById("num_tel").value = "' + result[1][0].num_tel + '";\n';
                    
                }else {
                    console.log('Não foi possível obter resultados')
                };
            }
            else {
                console.log(err);
                console.log('Erro ao executar pedido ao servidor');
                return res.status(500).redirect('/InternalError');
            }
            html += footer;
            html += '</body>\n</html>';
            return res.send(html);
        });
    }else{
        return res.status(403).redirect('/login_error');
    };
});

// ALTERAR INFORMAÇÕES DO UTILIZADOR
servidor.post('/alterar_info_utilizador', logging, function (req, res) {
    var query ='';
    query += 'UPDATE cliente SET ';
    if (req.body.nome, req.body.email, req.body.num_tel, req.body.morada, req.body.codigo_postal, req.body.distrito){
        query += 'nome="' + req.body.nome + '", ';
    };
    if (req.body.nome, req.body.email, req.body.num_tel, req.body.morada, req.body.codigo_postal, req.body.distrito){
        query += 'email="' + req.body.email + '", ';
    };
    if (req.body.nome, req.body.email, req.body.num_tel, req.body.morada, req.body.codigo_postal, req.body.distrito){
        query += 'num_tel="' + req.body.num_tel + '", ';
    };
    if (req.body.nome, req.body.email, req.body.num_tel, req.body.morada, req.body.codigo_postal, req.body.distrito){
        query += 'morada="' + req.body.linha_endereço + '", ';
    };
    if (req.body.nome, req.body.email, req.body.num_tel, req.body.morada, req.body.codigo_postal, req.body.distrito){
        query += 'codigo_postal="' + req.body.cod_postal_1 + '-' + req.body.cod_postal_2 + '", ';
    };
    if (req.body.nome, req.body.email, req.body.num_tel, req.body.morada, req.body.codigo_postal, req.body.distrito){
        query += 'distrito="' + req.body.distrito + '" ';
    };
    query += 'WHERE idCliente = ' + req.session.idCliente + ';';
    pool.query(query, function (err, result, fields) {
        console.log(query);
        if (err) {
            console.log(err);
            console.log('Erro ao executar pedido ao servidor');
            return res.status(500).redirect('/InternalError');
        }
        else {
            return res.redirect('/user');
        }
    });
});

// 404 NOT FOUND STATUS
servidor.use(function(req, res, next) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/err404.html', 'utf-8');
        var navbar = fs.readFileSync('html/NavBar.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer.html', 'utf-8')
        var registo_login_popUp = fs.readFileSync('html/registo_login.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>404 | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    if (req.session.idCliente){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'login_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }

    if (req.session.login_) {
        html += '<script> session_abrir("login_popUp"); </script>';
    }

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.status(404).send(html);
});