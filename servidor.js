const session = require('express-session');
const express = require('express');
const sha1 = require('sha1');
const fs = require('fs');

const servidor = express();
var porta = 8080;

servidor.use(express.urlencoded({
    extended: true
}));

servidor.use(express.static("public"));

//  Sessão
servidor.use(session({
    secret: "supercalifragilisticexpialidocious",
    resave: false,
    saveUninitialized: true
}));

// Ligação ao servidor
servidor.listen(porta, function () {
    console.log("servidor a ser executado em http://localhost:" + porta);
});

const logging = (req, res, next) => {
    console.log("Path: ", req.session);
    console.log("Date: ", Date());
    next()
}

// Tentar abrir fichieros prinicipais
    try {
        var navbar = fs.readFileSync('html/NavBar.html', 'utf-8');
        var registo_login_popUp = fs.readFileSync('html/registo_login.html', 'utf-8');
        var footer = fs.readFileSync('html/Footer.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

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
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/home_css.css" type="text/css">\n';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

    //HTML Content
    html += home_content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
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
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

servidor.get("/voluntariado/submissao", logging, function (req, res) {
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
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
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
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

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
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
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
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
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
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/loja_css.css" type="text/css">\n';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// PAGINA PRODUTO LOJA
servidor.get("/loja/produto/ultrafood", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/produto.html', 'utf-8');
        var navbar_loja = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp_loja = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
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
    html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar_loja;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp_loja;

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});